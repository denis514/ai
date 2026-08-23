// builder-generate — «опиши задачу → готовая схема из наших кубиков».
//
// Решение основателя 2026-08-23 (07-decisions.md): гости получают 3 спонсорские
// автосборки в день (ключ основателя ATLAS_SPONSOR_KEY, workspace с месячным
// потолком); пользователи со своим ключом собирают на своём ключе без лимита.
// Лимитируются только АВТОсборки — сборка руками безлимитна (важно для текстов).
//
// Защита кошелька (три слоя до вызова Claude):
//   1) client_id: 3/день;  2) IP: 6/день;  3) месячный потолок запросов на всех
//   (GEN_MONTHLY_CAP, по умолчанию 1500 ≈ $10-15 на Haiku при нашем max_tokens).
// Плюс внешний слой: месячный лимит расходов на workspace ключа в консоли.
//
// Ответ модели строго валидируется: только разрешённые defId, ровно один
// «Старт», есть агент и выход, ≤ 12 кубиков. Одна повторная попытка с фидбеком.
// Деплой: supabase functions deploy builder-generate

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = Deno.env.get('GEN_MODEL') || 'claude-haiku-4-5-20251001';
const SPONSOR_KEY = Deno.env.get('ATLAS_SPONSOR_KEY') || '';
const MONTHLY_CAP = Number(Deno.env.get('GEN_MONTHLY_CAP') || 1500);
const DAILY_PER_CLIENT = 3;
const DAILY_PER_IP = 6;

// Разрешённые кубики. tool-computer скрыт из палитры (движок его не исполняет) —
// в генерацию тоже не допускаем.
const ALLOWED = new Set([
  'agent-main','agent-research','agent-ux','agent-analytics','agent-code',
  'agent-designer','agent-pm','agent-content',
  'tool-search','tool-file','tool-vision','tool-memory','tool-code-exec',
  'tool-citations','tool-mcp',
  'logic-condition','logic-condition-agent','logic-loop',
  'trigger-input','output-text','output-telegram','output-email','output-calendar',
]);

const LANG = { ru: 'русском', en: 'английском', fi: 'финском' } as Record<string, string>;

function systemPrompt(locale: string): string {
  return `Ты — сборщик схем визуального конструктора AI-помощников.
Пользователь описывает задачу обычными словами. Верни СТРОГО JSON без пояснений:
{"name": "короткое имя схемы", "start": "текст задачи для блока Старт",
 "nodes": [{"defId": "...", "prompt": "инструкция блоку (только для agent-*)"}...],
 "edges": [{"from": 0, "to": 1}...]}

Правила:
- defId ТОЛЬКО из списка: ${[...ALLOWED].join(', ')}.
- Ровно один trigger-input, он ПЕРВЫЙ (индекс 0). Минимум один agent-* и один output-*.
- Всего 3-8 блоков. Простая задача = простая схема (Старт → агент → выход).
- edges: индексы nodes; from → to по потоку работы; инструменты (tool-*)
  соединяй ребром tool → agent, которому они нужны.
- output-telegram/email/calendar выбирай только если пользователь просил доставку
  туда; иначе output-text.
- "start" и "prompt" пиши на ${LANG[locale] || LANG.ru} языке, просто и конкретно,
  без жаргона. "prompt" агенту — 1-3 предложения, что именно делать.
- Если просьба не про автоматизацию/агента — верни {"error": "not_a_task"}.

ЧЕСТНОСТЬ — важнее красивой схемы. Конструктор сейчас НЕ умеет:
  • получать что-то само: читать входящую почту, сообщения Telegram, отзывы с
    Google Maps и других сайтов, строки Google-таблиц, формы, RSS — внутрь
    попадает только текст из блока Старт (руками, по расписанию или вебхуку);
  • помнить что-то между запусками («только новое», «если цена снизилась»);
  • публиковать в соцсети, писать в Google-таблицы, Notion, CRM;
  • создавать картинки;
  • спрашивать подтверждения у человека посреди работы;
  • открывать страницу по ссылке (только поиск в интернете).
Если СУТЬ задачи держится на одном из этих пунктов — схему не собирай,
верни {"error": "unsupported", "why": "одно-два предложения на ${LANG[locale] || LANG.ru} языке:
что именно не умеет и что можно вместо этого (например, вставить текст
отзыва в Старт)"}.
Если пункт второстепенный (например «и опубликуй») — собери схему без него и
добавь поле "note": одно предложение на ${LANG[locale] || LANG.ru} языке, чего
схема делать не будет.`;
}

type GenNode = { defId: string; prompt?: string };
type GenScheme = { name?: string; start?: string; note?: string; nodes: GenNode[]; edges: { from: number; to: number }[] };

function validate(s: unknown): { ok: true; scheme: GenScheme } | { ok: false; why: string } {
  const o = s as GenScheme;
  if (!o || !Array.isArray(o.nodes) || !Array.isArray(o.edges)) return { ok: false, why: 'no nodes/edges arrays' };
  if (o.nodes.length < 2 || o.nodes.length > 12) return { ok: false, why: 'nodes count out of range 2..12' };
  const bad = o.nodes.find(n => !ALLOWED.has(n?.defId));
  if (bad) return { ok: false, why: `defId not allowed: ${bad?.defId}` };
  const triggers = o.nodes.filter(n => n.defId === 'trigger-input');
  if (triggers.length !== 1 || o.nodes[0].defId !== 'trigger-input') return { ok: false, why: 'exactly one trigger-input at index 0 required' };
  if (!o.nodes.some(n => n.defId.startsWith('agent-'))) return { ok: false, why: 'at least one agent-* required' };
  if (!o.nodes.some(n => n.defId.startsWith('output-'))) return { ok: false, why: 'at least one output-* required' };
  for (const e of o.edges) {
    if (!Number.isInteger(e?.from) || !Number.isInteger(e?.to)) return { ok: false, why: 'edge indexes must be integers' };
    if (e.from < 0 || e.from >= o.nodes.length || e.to < 0 || e.to >= o.nodes.length || e.from === e.to) {
      return { ok: false, why: 'edge index out of range or self-loop' };
    }
  }
  if (o.note != null) o.note = String(o.note).slice(0, 200);
  return { ok: true, scheme: o };
}

function extractJson(text: string): unknown {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

async function callClaude(apiKey: string, locale: string, query: string, feedback?: string) {
  const messages: { role: string; content: string }[] = [{ role: 'user', content: query.slice(0, 500) }];
  if (feedback) {
    messages[0].content += `\n\n(Предыдущая попытка отклонена валидатором: ${feedback}. Верни исправленный JSON.)`;
  }
  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: systemPrompt(locale),
      messages,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`claude_${res.status}: ${body.slice(0, 200)}`);
  }
  const out = await res.json();
  const text = (out.content || []).map((b: { text?: string }) => b.text || '').join('');
  const usage = (out.usage?.input_tokens || 0) + (out.usage?.output_tokens || 0);
  return { text, usage };
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { query?: string; locale?: string; clientId?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const query = (body.query || '').trim();
  const locale = ['ru', 'en', 'fi'].includes(body.locale || '') ? body.locale! : 'ru';
  if (query.length < 8) return json({ error: 'query_too_short' }, 400);
  if (query.length > 500) return json({ error: 'query_too_long' }, 400);

  const admin = adminClient();
  const user = await getUser(req); // может быть null — гости разрешены

  // ── Чей ключ ──────────────────────────────────────────────────────────────
  let apiKey = '';
  let sponsored = false;
  if (user) {
    const { data: conn } = await admin
      .from('builder_api_connections')
      .select('encrypted_key, is_active')
      .eq('user_id', user.id).eq('provider', 'anthropic')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1).maybeSingle();
    if (conn?.is_active) {
      try { apiKey = await decrypt(conn.encrypted_key); } catch { /* ниже спонсор */ }
    }
  }
  if (!apiKey) {
    if (!SPONSOR_KEY) return json({ error: 'generation_unavailable' }, 503);
    sponsored = true;
    apiKey = SPONSOR_KEY;
  }

  // ── Лимиты спонсорских автосборок (ДО вызова Claude) ─────────────────────
  // Последний элемент XFF дописан нашим шлюзом; первый контролирует клиент.
  const xff = (req.headers.get('x-forwarded-for') || '').split(',').map(s => s.trim()).filter(Boolean);
  const ipRaw = xff[xff.length - 1] || req.headers.get('x-real-ip') || 'unknown';
  const ipHash = await sha256hex(ipRaw);
  const clientId = String(body.clientId || '').slice(0, 64) || ipHash;
  // Резервирующая запись создаётся ДО вызова Claude: параллельный залп видит
  // «запросы в полёте» в счётчиках (закрывает гонку TOCTOU). Любая ошибка
  // БД в счётчиках или вставке = ОТКАЗ (fail-closed): без работающего
  // журнала спонсорский ключ не тратим.
  let reservationId: string | null = null;
  if (sponsored) {
    const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const [byClient, byIp, byMonth] = await Promise.all([
      admin.from('builder_generations').select('id', { count: 'exact', head: true })
        .eq('client_id', clientId).eq('sponsored', true).gte('created_at', dayStart.toISOString()),
      admin.from('builder_generations').select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash).eq('sponsored', true).gte('created_at', dayStart.toISOString()),
      admin.from('builder_generations').select('id', { count: 'exact', head: true })
        .eq('sponsored', true).gte('created_at', monthStart.toISOString()),
    ]);
    if (byClient.error || byIp.error || byMonth.error) {
      console.error('[generate] limit check failed', byClient.error?.message || byIp.error?.message || byMonth.error?.message);
      return json({ error: 'generation_unavailable' }, 503);
    }
    if ((byMonth.count ?? 0) >= MONTHLY_CAP) return json({ error: 'monthly_cap' }, 429);
    if ((byClient.count ?? 0) >= DAILY_PER_CLIENT || (byIp.count ?? 0) >= DAILY_PER_IP) {
      return json({ error: 'daily_limit', remaining: 0 }, 429);
    }
    const ins = await admin.from('builder_generations').insert({
      client_id: clientId, ip_hash: ipHash, user_id: user?.id || null,
      sponsored: true, ok: false, tokens: 0, locale,
    }).select('id').single();
    if (ins.error || !ins.data?.id) {
      console.error('[generate] reservation insert failed', ins.error?.message);
      return json({ error: 'generation_unavailable' }, 503);
    }
    reservationId = ins.data.id;
  }

  // ── Генерация (одна повторная попытка при невалидном ответе) ─────────────
  let scheme: GenScheme | null = null;
  let usage = 0;
  let lastWhy = '';
  try {
    for (let attempt = 0; attempt < 2 && !scheme; attempt++) {
      const { text, usage: u } = await callClaude(apiKey, locale, query, attempt ? lastWhy : undefined);
      usage += u;
      const parsed = extractJson(text);
      if (parsed && (parsed as { error?: string }).error === 'not_a_task') {
        return json({ error: 'not_a_task' }, 422);
      }
      // Честный отказ: задача держится на том, чего движок не умеет.
      if (parsed && (parsed as { error?: string }).error === 'unsupported') {
        const why = String((parsed as { why?: string }).why || '').slice(0, 300);
        return json({ error: 'unsupported', why }, 422);
      }
      const v = validate(parsed);
      if (v.ok) scheme = v.scheme;
      else lastWhy = v.why;
    }
  } catch (e) {
    console.error('[generate] claude error', String(e).slice(0, 200));
    return json({ error: 'generation_failed' }, 502);
  }

  // ── Журнал: спонсорская запись уже зарезервирована — дописываем итог;
  //    для своих ключей пишем строку постфактум (только статистика).
  if (reservationId) {
    const upd = await admin.from('builder_generations')
      .update({ ok: !!scheme, tokens: usage }).eq('id', reservationId);
    if (upd.error) console.error('[generate] reservation update failed', upd.error.message);
  } else {
    const ins = await admin.from('builder_generations').insert({
      client_id: clientId, ip_hash: ipHash, user_id: user?.id || null,
      sponsored: false, ok: !!scheme, tokens: usage, locale,
    });
    if (ins.error) console.error('[generate] log insert failed', ins.error.message);
  }

  if (!scheme) {
    console.error('[generate] invalid after retry:', lastWhy);
    return json({ error: 'invalid_scheme' }, 422);
  }

  // Остаток на сегодня — для честного счётчика в интерфейсе
  let remaining: number | null = null;
  if (sponsored) {
    const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
    const { count, error } = await admin.from('builder_generations')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId).eq('sponsored', true).gte('created_at', dayStart.toISOString());
    remaining = error ? null : Math.max(0, DAILY_PER_CLIENT - (count ?? 0));
  }

  return json({ ok: true, scheme, sponsored, remaining });
});
