/**
 * nodeCost.js — ориентир стоимости запуска схемы (решение основателя 2026-08-23).
 *
 * Зачем: «50 тысяч токенов» владельцу магазина ничего не говорит, «10 центов» —
 * говорит всё. Цифры — оценка по живым прогонам на проде (2026-08-23):
 *   агент без инструментов       ≈ 600–3 000 токенов
 *   агент + веб-поиск            ≈ 50 000–55 000 (результаты поиска — тяжёлый вход)
 *   агент + выполнение кода      ≈ 8 000–12 000
 *   агент + файл                 + размер файла (до 12 000 знаков ≈ 4 000 токенов)
 *   агент-условие                ≈ 300
 * Цена — по публичному прайсу модели исполнения (Sonnet 5: $2 вход / $10 выход
 * за миллион; вход доминирует → усреднённо $2.5 за миллион). Это ОРИЕНТИР:
 * точную сумму человек видит в своём кабинете Anthropic.
 *
 * Всё в одном месте, чтобы метки на кубиках, окно перед запуском и расписание
 * считали одинаково.
 */

export const USD_PER_MILLION = 2.5;

/** Базовая оценка по роли кубика (токены за один запуск). */
const BASE = {
  agent: 2000,
  'condition-agent': 300,
};

/** Надбавка за инструмент, прикреплённый к агенту. */
const TOOL_EXTRA = {
  'tool-search': 50000,
  'tool-code-exec': 10000,
  'tool-file': 4000,
  'tool-vision': 1500,
  'tool-mcp': 5000,
  'tool-citations': 1000,
  'tool-memory': 800,
};

/** Кубики, которые считаем «дорогими» — для метки в палитре и на холсте. */
export const EXPENSIVE_DEFS = new Set(['tool-search', 'tool-code-exec']);

export function toolExtraTokens(defId) {
  return TOOL_EXTRA[defId] || 0;
}

/**
 * Оценка одного запуска по узлам и связям холста (ReactFlow nodes/edges).
 * Инструмент считается один раз на каждого агента, к которому прикреплён.
 * @returns {{ tokens: number, usd: number, expensive: boolean }}
 */
export function estimateRun(nodes = [], edges = []) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  let tokens = 0;
  let expensive = false;
  for (const n of nodes) {
    const kind = n.data?.kind;
    const defId = n.data?.defId;
    if (kind === 'agent') tokens += BASE.agent;
    else if (defId === 'logic-condition-agent') tokens += BASE['condition-agent'];
  }
  for (const e of edges) {
    const src = byId.get(e.source);
    const dst = byId.get(e.target);
    if (src?.data?.kind === 'tool' && dst?.data?.kind === 'agent') {
      const extra = toolExtraTokens(src.data.defId);
      tokens += extra;
      if (EXPENSIVE_DEFS.has(src.data.defId)) expensive = true;
    }
  }
  // Цикл повторяет агентов N раз (без инструментов на повторах) — учитываем.
  for (const n of nodes) {
    if (n.data?.defId === 'logic-loop') {
      const repeats = Math.max(0, (parseInt(n.data?.maxLoops, 10) || 1) - 1);
      const agents = nodes.filter(x => x.data?.kind === 'agent').length;
      tokens += repeats * agents * BASE.agent;
    }
  }
  return { tokens, usd: (tokens / 1_000_000) * USD_PER_MILLION, expensive };
}

/** «≈ 55 тыс. токенов ≈ $0.14» — одна строка для интерфейса. */
export function formatEstimate(est, t) {
  const k = est.tokens >= 1000 ? `${Math.round(est.tokens / 1000)} ${t('builder.cost.thousand') || 'тыс.'}` : String(est.tokens);
  const usd = est.usd < 0.01 ? '<$0.01' : `$${est.usd.toFixed(2)}`;
  return `≈ ${k} ${t('builder.runInput.tokens') || 'токенов'} ≈ ${usd}`;
}
