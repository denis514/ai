/**
 * outputTiers.js — размеры результата = рычаг контроля токенов.
 *
 *   S (Кратко)   — сжатый ответ, копируешь текст. Самый дешёвый.
 *   M (Документ) — один структурированный документ, скачиваешь .md.
 *   L (Полный)   — подробная разбивка по разделам. Дороже.
 *
 * tier управляет max_tokens на каждый агент-вызов (см. builder-execute).
 * Оценка стоимости считается локально — без вызова API (бесплатно).
 */

export const OUTPUT_TIERS = {
  s: { id: 's', maxTokens: 512,  labelKey: 'builder.tier.s.label',  descKey: 'builder.tier.s.desc' },
  m: { id: 'm', maxTokens: 2048, labelKey: 'builder.tier.m.label',  descKey: 'builder.tier.m.desc' },
  l: { id: 'l', maxTokens: 4096, labelKey: 'builder.tier.l.label',  descKey: 'builder.tier.l.desc' },
};

export const DEFAULT_TIER = 's';

// Цены Claude Sonnet 4.5 (приблизительно, на момент 2026-05): $/млн токенов.
// deprecate-watch: цены Anthropic меняются — проверять docs.anthropic.com/pricing.
const PRICE_INPUT_PER_M = 3;
const PRICE_OUTPUT_PER_M = 15;
const INPUT_EST_PER_AGENT = 400; // грубая оценка input-контекста на узел

/**
 * Грубая оценка запуска. agentCount — число агент-узлов (только они тратят токены).
 * @returns {{ outMax, inEst, totalMax, costUsd }}
 */
export function estimateRun(agentCount, tierId = DEFAULT_TIER) {
  const tier = OUTPUT_TIERS[tierId] || OUTPUT_TIERS[DEFAULT_TIER];
  const n = Math.max(0, agentCount | 0);
  const outMax = n * tier.maxTokens;
  const inEst = n * INPUT_EST_PER_AGENT;
  const costUsd = (inEst / 1e6) * PRICE_INPUT_PER_M + (outMax / 1e6) * PRICE_OUTPUT_PER_M;
  return { outMax, inEst, totalMax: outMax + inEst, costUsd };
}

/** Считает агент-узлы в React Flow nodes (только они вызывают Claude). */
export function countAgentNodes(nodes = []) {
  return nodes.filter(n => (n.data?.kind || '') === 'agent').length;
}
