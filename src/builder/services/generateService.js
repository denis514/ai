/**
 * generateService.js — клиент автосборки «опиши задачу → схема».
 *
 * Зовёт edge-функцию builder-generate. Гость получает 3 спонсорские
 * автосборки в день (лимит держит сервер); пользователь со своим ключом
 * собирает на своём ключе. ВАЖНО про тексты: лимитируются только
 * АВТОсборки — сборка руками безлимитна (решение основателя 2026-08-23).
 */

import { supabase } from '../../lib/supabaseClient.js';

const FN_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

const CLIENT_ID_KEY = 'atlas:builder:gen-client:v1';

function clientId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return ''; // без хранилища не шлём id — сервер посчитает по IP
  }
}

/**
 * @returns {Promise<{ok:true, scheme:object, sponsored:boolean, remaining:number|null}>}
 * Бросает Error с .code: 'daily_limit' | 'monthly_cap' | 'not_a_task' |
 * 'invalid_scheme' | 'generation_failed' | 'backend_unavailable' | …
 */
export async function generateScheme(query, locale) {
  if (!FN_BASE) { const e = new Error('backend_unavailable'); e.code = 'backend_unavailable'; throw e; }
  const headers = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  // Если вошёл — передаём токен: со своим ключом лимит 3/день не действует.
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
  } catch { /* гость */ }

  const res = await fetch(`${FN_BASE}/builder-generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, locale, ...(clientId() ? { clientId: clientId() } : {}) }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) {
    const e = new Error(out.error || `http_${res.status}`);
    e.code = out.error || `http_${res.status}`;
    e.remaining = out.remaining;
    e.why = typeof out.why === 'string' ? out.why : ''; // честный отказ: причина словами
    throw e;
  }
  return out;
}

/**
 * Схема из генерации → формат шаблона для buildTemplateGraph:
 * авто-раскладка по уровням (Старт сверху, дальше по рёбрам), prompt → dataOverride.
 */
export function schemeToTemplate(scheme) {
  const n = scheme.nodes.length;
  // Уровень = длина пути от Старта (BFS по рёбрам from→to).
  const level = new Array(n).fill(0);
  const out = new Map();
  for (const e of scheme.edges) {
    if (!out.has(e.from)) out.set(e.from, []);
    out.get(e.from).push(e.to);
  }
  const queue = [0];
  const seen = new Set([0]);
  while (queue.length) {
    const cur = queue.shift();
    for (const nx of out.get(cur) || []) {
      if (seen.has(nx)) continue;
      seen.add(nx);
      level[nx] = level[cur] + 1;
      queue.push(nx);
    }
  }
  // Кубик без пути от Старта — вниз, чтобы был виден и его можно было доввязать.
  const maxL = Math.max(...level, 0);
  for (let i = 1; i < n; i++) if (!seen.has(i)) level[i] = maxL + 1;

  const byLevel = new Map();
  for (let i = 0; i < n; i++) {
    if (!byLevel.has(level[i])) byLevel.set(level[i], []);
    byLevel.get(level[i]).push(i);
  }
  const positions = new Array(n);
  for (const [lvl, ids] of byLevel) {
    const w = (ids.length - 1) * 220;
    ids.forEach((idx, k) => {
      positions[idx] = { x: 100 + k * 220 - w / 2, y: 50 + lvl * 150 };
    });
  }

  return {
    id: null,
    name: (scheme.name || '').slice(0, 60),
    start: scheme.start || '',
    nodes: scheme.nodes.map((nd, i) => ({
      defId: nd.defId,
      position: positions[i],
      ...(nd.prompt ? { dataOverride: { prompt: nd.prompt, hasPrompt: true } } : {}),
    })),
    edges: scheme.edges.map(e => ({ from: e.from, to: e.to })),
  };
}
