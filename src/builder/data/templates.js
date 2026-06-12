/**
 * templates.js — pre-built workflows готовые к загрузке в canvas.
 *
 * Каждый template имеет:
 *  • id, nameKey, descKey, iconName, difficulty, category
 *  • nodes: array { defId, position: {x,y}, dataOverride? }
 *  • edges: array { from, to } — индексы в nodes array
 *  • author: 'builtin' (later: user templates)
 *
 * defId должен быть валидным ключом из NODE_DEFS.
 *
 * Эти 4 templates — анкор MVP (см. docs/agent-builder/03-mvp-30day.md Day 15-16).
 * Расширение templates — Phase B-2+.
 */

export const TEMPLATES = [
  /* ──────────────────────────────────────────────────────── */
  /* 1. UX Audit Agent                                        */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'ux-audit',
    nameKey: 'builder.template.uxAudit.name',
    descKey: 'builder.template.uxAudit.desc',
    inputKey: 'builder.template.uxAudit.input',
    outputKey: 'builder.template.uxAudit.output',
    iconName: 'paint',
    difficulty: 'beginner',
    category: 'design',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main',    position: { x: 100, y: 180 }, dataOverride: { promptKey: 'builder.template.uxAudit.promptMain' } },
      { defId: 'tool-vision',   position: { x: -120, y: 320 } },
      { defId: 'agent-research',position: { x: 100, y: 320 }, dataOverride: { promptKey: 'builder.template.uxAudit.promptResearch' } },
      { defId: 'agent-ux',      position: { x: 320, y: 320 }, dataOverride: { promptKey: 'builder.template.uxAudit.promptUx' } },
      { defId: 'output-text',   position: { x: 100, y: 480 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 2, to: 1 }, // vision tool ⇒ прикреплён к main (attach)
      { from: 1, to: 3 }, // main → research
      { from: 1, to: 4 }, // main → ux
      { from: 3, to: 5 }, // research → output
      { from: 4, to: 5 }, // ux → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 2. Analytics Agent                                       */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'analytics',
    nameKey: 'builder.template.analytics.name',
    descKey: 'builder.template.analytics.desc',
    inputKey: 'builder.template.analytics.input',
    outputKey: 'builder.template.analytics.output',
    iconName: 'chart',
    difficulty: 'beginner',
    category: 'data',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',    position: { x: 100, y: 50 } },
      { defId: 'agent-main',       position: { x: 100, y: 180 }, dataOverride: { promptKey: 'builder.template.analytics.promptMain' } },
      { defId: 'tool-file',        position: { x: -100, y: 320 } },
      { defId: 'agent-analytics',  position: { x: 100, y: 320 }, dataOverride: { promptKey: 'builder.template.analytics.promptAnalyze' } },
      { defId: 'agent-research',   position: { x: 300, y: 320 }, dataOverride: { promptKey: 'builder.template.analytics.promptResearch' } },
      { defId: 'output-text',      position: { x: 100, y: 480 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 2, to: 1 }, // file tool ⇒ прикреплён к main (attach)
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 3. Content Agent                                         */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'content',
    nameKey: 'builder.template.content.name',
    descKey: 'builder.template.content.desc',
    inputKey: 'builder.template.content.input',
    outputKey: 'builder.template.content.output',
    iconName: 'pencil',
    difficulty: 'intermediate',
    category: 'marketing',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',   position: { x: 100, y: 50 } },
      { defId: 'agent-main',      position: { x: 100, y: 180 }, dataOverride: { promptKey: 'builder.template.content.promptMain' } },
      { defId: 'agent-research',  position: { x: -120, y: 320 }, dataOverride: { promptKey: 'builder.template.content.promptResearch' } },
      { defId: 'tool-search',     position: { x: -120, y: 450 } },
      { defId: 'agent-ux',        position: { x: 100, y: 320 }, dataOverride: { promptKey: 'builder.template.content.promptWrite' } },
      { defId: 'tool-memory',     position: { x: 320, y: 320 } },
      { defId: 'output-text',     position: { x: 100, y: 600 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 1, to: 2 }, // main → research
      { from: 3, to: 2 }, // search tool ⇒ прикреплён к research (attach)
      { from: 1, to: 4 }, // main → ux
      { from: 5, to: 1 }, // memory tool ⇒ прикреплён к main (attach)
      { from: 2, to: 6 }, // research → output
      { from: 4, to: 6 }, // ux → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 4. Research Agent                                        */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'research',
    nameKey: 'builder.template.research.name',
    descKey: 'builder.template.research.desc',
    inputKey: 'builder.template.research.input',
    outputKey: 'builder.template.research.output',
    iconName: 'compass',
    difficulty: 'intermediate',
    category: 'research',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',   position: { x: 100, y: 50 } },
      { defId: 'agent-main',      position: { x: 100, y: 180 }, dataOverride: { promptKey: 'builder.template.research.promptMain' } },
      { defId: 'tool-search',     position: { x: -150, y: 320 } },
      { defId: 'tool-file',       position: { x: 0, y: 320 } },
      { defId: 'agent-research',  position: { x: 150, y: 320 }, dataOverride: { promptKey: 'builder.template.research.promptResearch' } },
      { defId: 'agent-analytics', position: { x: 320, y: 320 }, dataOverride: { promptKey: 'builder.template.research.promptAnalyze' } },
      { defId: 'output-text',     position: { x: 100, y: 500 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 2, to: 1 }, // search tool ⇒ прикреплён к main (attach)
      { from: 3, to: 1 }, // file tool ⇒ прикреплён к main (attach)
      { from: 1, to: 4 }, // main → research
      { from: 4, to: 5 }, // research → analytics
      { from: 5, to: 6 }, // analytics → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 5. Triage — сортировка обращений на 3 типа (логика)      */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'triage',
    nameKey: 'builder.template.triage.name',
    descKey: 'builder.template.triage.desc',
    inputKey: 'builder.template.triage.input',
    outputKey: 'builder.template.triage.output',
    iconName: 'branch',
    difficulty: 'intermediate',
    category: 'logic',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 80, y: 40 } },
      { defId: 'agent-main', position: { x: 80, y: 170 }, dataOverride: {
        promptKey: 'builder.template.triage.prompt' } },
      { defId: 'logic-condition', position: { x: 80, y: 300 }, dataOverride: { operator: 'equals', condValue: 'URGENT' } },
      { defId: 'output-telegram', position: { x: 340, y: 300 } },
      { defId: 'logic-condition', position: { x: 80, y: 440 }, dataOverride: { operator: 'contains', condValue: 'COMPLAINT' } },
      { defId: 'output-text', position: { x: 340, y: 440 } },
      { defId: 'output-text', position: { x: 80, y: 580 } },
    ],
    edges: [
      { from: 0, to: 1 },                          // input → классификатор
      { from: 1, to: 2 },                          // классификатор → Условие 1
      { from: 2, to: 3, sourceHandle: 'true' },    // равно «срочно» → Telegram
      { from: 2, to: 4, sourceHandle: 'false' },   // иначе → Условие 2
      { from: 4, to: 5, sourceHandle: 'true' },    // содержит «жалоба» → Markdown
      { from: 4, to: 6, sourceHandle: 'false' },   // иначе → Markdown (обычное)
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 6. Разбор картинки (Vision)                              */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'image-review',
    nameKey: 'builder.template.imageReview.name',
    descKey: 'builder.template.imageReview.desc',
    inputKey: 'builder.template.imageReview.input',
    outputKey: 'builder.template.imageReview.output',
    iconName: 'eye',
    difficulty: 'beginner',
    category: 'design',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'tool-vision', position: { x: -120, y: 200 } },
      { defId: 'agent-main', position: { x: 100, y: 200 }, dataOverride: {
        promptKey: 'builder.template.imageReview.prompt' } },
      { defId: 'output-text', position: { x: 100, y: 350 } },
    ],
    edges: [
      { from: 0, to: 2 },  // input → agent
      { from: 1, to: 2 },  // vision ⇒ attach к agent
      { from: 2, to: 3 },  // agent → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 7. Черновик с самопроверкой (Цикл)                       */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'refine-loop',
    nameKey: 'builder.template.refineLoop.name',
    descKey: 'builder.template.refineLoop.desc',
    inputKey: 'builder.template.refineLoop.input',
    outputKey: 'builder.template.refineLoop.output',
    iconName: 'loop',
    difficulty: 'intermediate',
    category: 'marketing',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-content', position: { x: 100, y: 180 }, dataOverride: {
        promptKey: 'builder.template.refineLoop.promptDraft' } },
      { defId: 'agent-main', position: { x: 100, y: 320 }, dataOverride: {
        promptKey: 'builder.template.refineLoop.promptReview' } },
      // Цикл возвращает поток к проверяющему агенту (индекс 2), до 3 раз.
      { defId: 'logic-loop', position: { x: 100, y: 460 }, dataOverride: { loopBackToIndex: 2, maxLoops: 3 } },
      { defId: 'output-text', position: { x: 340, y: 320 } },
    ],
    edges: [
      { from: 0, to: 1 },  // input → автор
      { from: 1, to: 2 },  // автор → проверяющий
      { from: 2, to: 3 },  // проверяющий → Цикл
      { from: 2, to: 4 },  // проверяющий → output (итог)
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 8. Конкурент-радар в Telegram (Web + Память)             */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'competitor-radar',
    nameKey: 'builder.template.radar.name',
    descKey: 'builder.template.radar.desc',
    inputKey: 'builder.template.radar.input',
    outputKey: 'builder.template.radar.output',
    iconName: 'compass',
    difficulty: 'advanced',
    category: 'research',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-research', position: { x: 100, y: 190 }, dataOverride: {
        promptKey: 'builder.template.radar.promptResearch' } },
      { defId: 'tool-search', position: { x: -150, y: 330 } },
      { defId: 'tool-memory', position: { x: 0, y: 330 } },
      { defId: 'agent-analytics', position: { x: 200, y: 330 }, dataOverride: {
        promptKey: 'builder.template.radar.promptCompare' } },
      { defId: 'output-telegram', position: { x: 150, y: 480 } },
    ],
    edges: [
      { from: 0, to: 1 },  // input → research
      { from: 2, to: 1 },  // web search ⇒ attach к research
      { from: 3, to: 4 },  // memory ⇒ attach к analytics
      { from: 1, to: 4 },  // research → analytics
      { from: 4, to: 5 },  // analytics → Telegram
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 9. Вебхук: лид с сайта → квалификация → Telegram         */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'webhook-lead',
    nameKey: 'builder.template.webhookLead.name',
    descKey: 'builder.template.webhookLead.desc',
    inputKey: 'builder.template.webhookLead.input',
    outputKey: 'builder.template.webhookLead.output',
    iconName: 'inbox',
    difficulty: 'beginner',
    category: 'logic',
    trigger: 'webhook',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: {
        promptKey: 'builder.template.webhookLead.prompt' } },
      { defId: 'output-telegram', position: { x: 100, y: 340 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 10. Вебхук: оплата → письмо-подтверждение клиенту        */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'webhook-payment',
    nameKey: 'builder.template.webhookPayment.name',
    descKey: 'builder.template.webhookPayment.desc',
    inputKey: 'builder.template.webhookPayment.input',
    outputKey: 'builder.template.webhookPayment.output',
    iconName: 'mail',
    difficulty: 'beginner',
    category: 'marketing',
    trigger: 'webhook',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-content', position: { x: 100, y: 190 }, dataOverride: {
        promptKey: 'builder.template.webhookPayment.prompt' } },
      { defId: 'output-email', position: { x: 100, y: 340 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 11. Вебхук: новый отзыв → тон → сигнал если негатив       */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'webhook-review',
    nameKey: 'builder.template.webhookReview.name',
    descKey: 'builder.template.webhookReview.desc',
    inputKey: 'builder.template.webhookReview.input',
    outputKey: 'builder.template.webhookReview.output',
    iconName: 'star',
    difficulty: 'intermediate',
    category: 'logic',
    trigger: 'webhook',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 80, y: 50 } },
      { defId: 'agent-main', position: { x: 80, y: 180 }, dataOverride: {
        promptKey: 'builder.template.webhookReview.prompt' } },
      { defId: 'logic-condition', position: { x: 80, y: 320 }, dataOverride: { operator: 'contains', condValue: 'NEGATIVE' } },
      { defId: 'output-telegram', position: { x: 340, y: 320 } },
      { defId: 'output-text', position: { x: 80, y: 460 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3, sourceHandle: 'true' },  // негатив → Telegram-сигнал
      { from: 2, to: 4, sourceHandle: 'false' }, // иначе → просто записать
    ],
  },

  /* ════════════════════════════════════════════════════════════ */
  /*  «Для всех» — повседневные шаблоны (doc 10). Нетехнические     */
  /*  люди: малый бизнес, блогеры, мастера, услуги.                 */
  /* ════════════════════════════════════════════════════════════ */

  /* Ответы клиентам — черновик вежливого ответа на сообщение */
  {
    id: 'client-replies',
    nameKey: 'builder.template.clientReplies.name',
    descKey: 'builder.template.clientReplies.desc',
    inputKey: 'builder.template.clientReplies.input',
    outputKey: 'builder.template.clientReplies.output',
    iconName: 'users', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.clientReplies.prompt' } },
      { defId: 'output-text', position: { x: 100, y: 330 } },
    ],
    edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },

  /* Напоминание о записи — текст напоминания → в Telegram */
  {
    id: 'booking-reminder',
    nameKey: 'builder.template.bookingReminder.name',
    descKey: 'builder.template.bookingReminder.desc',
    inputKey: 'builder.template.bookingReminder.input',
    outputKey: 'builder.template.bookingReminder.output',
    iconName: 'calendar', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.bookingReminder.prompt' } },
      { defId: 'output-telegram', position: { x: 100, y: 330 } },
    ],
    edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },

  /* Ответ на отзыв — тон + черновик ответа */
  {
    id: 'review-reply',
    nameKey: 'builder.template.reviewReply.name',
    descKey: 'builder.template.reviewReply.desc',
    inputKey: 'builder.template.reviewReply.input',
    outputKey: 'builder.template.reviewReply.output',
    iconName: 'quote', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.reviewReply.prompt' } },
      { defId: 'output-text', position: { x: 100, y: 330 } },
    ],
    edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },

  /* Идеи для блога — веб-поиск трендов → план постов */
  {
    id: 'content-ideas',
    nameKey: 'builder.template.contentIdeas.name',
    descKey: 'builder.template.contentIdeas.desc',
    inputKey: 'builder.template.contentIdeas.input',
    outputKey: 'builder.template.contentIdeas.output',
    iconName: 'paint', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'tool-search', position: { x: -130, y: 190 } },
      { defId: 'agent-content', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.contentIdeas.prompt' } },
      { defId: 'output-text', position: { x: 100, y: 340 } },
    ],
    edges: [{ from: 0, to: 2 }, { from: 1, to: 2 }, { from: 2, to: 3 }],
  },

  /* Дайджест по теме — веб-поиск свежего → краткий обзор в Telegram */
  {
    id: 'topic-digest',
    nameKey: 'builder.template.topicDigest.name',
    descKey: 'builder.template.topicDigest.desc',
    inputKey: 'builder.template.topicDigest.input',
    outputKey: 'builder.template.topicDigest.output',
    iconName: 'globe', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'tool-search', position: { x: -130, y: 190 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.topicDigest.prompt' } },
      { defId: 'output-telegram', position: { x: 100, y: 340 } },
    ],
    edges: [{ from: 0, to: 2 }, { from: 1, to: 2 }, { from: 2, to: 3 }],
  },

  /* ════════════════════════════════════════════════════════════ */
  /*  Батч «по индустриям» — с переменными в «Старт» (≥2) и логикой  */
  /*  (Условие / Условие-агент / Цикл). См.                         */
  /*  docs/agent-builder/template-catalog-and-sharing.md            */
  /* ════════════════════════════════════════════════════════════ */

  /* Магазин: ответы на вопросы о заказе — Условие + 2 переменные */
  {
    id: 'order-replies',
    nameKey: 'builder.template.orderReplies.name',
    descKey: 'builder.template.orderReplies.desc',
    inputKey: 'builder.template.orderReplies.input',
    outputKey: 'builder.template.orderReplies.output',
    iconName: 'inbox', difficulty: 'beginner', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.orderReplies.promptMain' } },
      { defId: 'logic-condition', position: { x: 100, y: 330 }, dataOverride: { operator: 'contains', condValue: 'СРОЧНО' } },
      { defId: 'output-telegram', position: { x: 360, y: 330 } },
      { defId: 'output-text', position: { x: 100, y: 470 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3, sourceHandle: 'true' },   // срочно → сигнал в Telegram
      { from: 2, to: 4, sourceHandle: 'false' },  // иначе → готовый ответ
    ],
  },

  /* Отзывы: тон решает агент (Условие-агент) + 2 переменные */
  {
    id: 'review-sentiment',
    nameKey: 'builder.template.reviewSentiment.name',
    descKey: 'builder.template.reviewSentiment.desc',
    inputKey: 'builder.template.reviewSentiment.input',
    outputKey: 'builder.template.reviewSentiment.output',
    iconName: 'quote', difficulty: 'intermediate', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main', position: { x: 100, y: 190 }, dataOverride: { promptKey: 'builder.template.reviewSentiment.prompt' } },
      { defId: 'logic-condition-agent', position: { x: 100, y: 330 }, dataOverride: { question: 'Помечен ли этот текст словом НЕГАТИВ?' } },
      { defId: 'output-telegram', position: { x: 360, y: 330 } },
      { defId: 'output-text', position: { x: 100, y: 470 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3, sourceHandle: 'true' },   // негатив → сигнал в Telegram
      { from: 2, to: 4, sourceHandle: 'false' },  // позитив → просто записать
    ],
  },

  /* Контент-план с улучшением — Цикл + 2 переменные */
  {
    id: 'content-plan',
    nameKey: 'builder.template.contentPlan.name',
    descKey: 'builder.template.contentPlan.desc',
    inputKey: 'builder.template.contentPlan.input',
    outputKey: 'builder.template.contentPlan.output',
    iconName: 'pencil', difficulty: 'intermediate', category: 'everyday', author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-content', position: { x: 100, y: 180 }, dataOverride: { promptKey: 'builder.template.contentPlan.promptDraft' } },
      { defId: 'agent-main', position: { x: 100, y: 320 }, dataOverride: { promptKey: 'builder.template.contentPlan.promptReview' } },
      { defId: 'logic-loop', position: { x: 100, y: 460 }, dataOverride: { loopBackToIndex: 2, maxLoops: 2 } },
      { defId: 'output-text', position: { x: 360, y: 320 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },   // проверяющий → Цикл (назад к улучшению)
      { from: 2, to: 4 },   // проверяющий → итог
    ],
  },
];

/**
 * Получить template по id, null если не найдено.
 */
export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}
