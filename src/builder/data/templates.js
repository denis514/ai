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
      { defId: 'agent-main',    position: { x: 100, y: 180 } },
      { defId: 'tool-vision',   position: { x: -120, y: 320 } },
      { defId: 'agent-research',position: { x: 100, y: 320 } },
      { defId: 'agent-ux',      position: { x: 320, y: 320 } },
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
      { defId: 'agent-main',       position: { x: 100, y: 180 } },
      { defId: 'tool-file',        position: { x: -100, y: 320 } },
      { defId: 'agent-analytics',  position: { x: 100, y: 320 } },
      { defId: 'agent-research',   position: { x: 300, y: 320 } },
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
      { defId: 'agent-main',      position: { x: 100, y: 180 } },
      { defId: 'agent-research',  position: { x: -120, y: 320 } },
      { defId: 'tool-search',     position: { x: -120, y: 450 } },
      { defId: 'agent-ux',        position: { x: 100, y: 320 } },
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
      { defId: 'agent-main',      position: { x: 100, y: 180 } },
      { defId: 'tool-search',     position: { x: -150, y: 320 } },
      { defId: 'tool-file',       position: { x: 0, y: 320 } },
      { defId: 'agent-research',  position: { x: 150, y: 320 } },
      { defId: 'agent-analytics', position: { x: 320, y: 320 } },
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
        prompt: 'Определи тип обращения из задачи. Ответь РОВНО одним словом заглавными, без точки: СРОЧНО, ЖАЛОБА или ОБЫЧНОЕ. Больше ничего не пиши.',
        hasPrompt: true } },
      { defId: 'logic-condition', position: { x: 80, y: 300 }, dataOverride: { operator: 'equals', condValue: 'срочно' } },
      { defId: 'output-telegram', position: { x: 340, y: 300 } },
      { defId: 'logic-condition', position: { x: 80, y: 440 }, dataOverride: { operator: 'contains', condValue: 'жалоба' } },
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
        prompt: 'Внимательно изучи приложенную картинку. Опиши, что на ней, и дай разбор по сути задачи: ключевые элементы, проблемы, рекомендации. Структурируй по пунктам.',
        hasPrompt: true } },
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
        prompt: 'Напиши черновик текста по заданию. Будь конкретным и по делу.', hasPrompt: true } },
      { defId: 'agent-main', position: { x: 100, y: 320 }, dataOverride: {
        prompt: 'Проверь текст на ошибки, ясность и тон. Если есть что улучшить — перепиши лучше. Верни итоговую версию.', hasPrompt: true } },
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
        prompt: 'Открой каждый сайт из задачи. Для каждого кратко выпиши: чем занимаются, ключевые продукты, сильные стороны.', hasPrompt: true } },
      { defId: 'tool-search', position: { x: -150, y: 330 } },
      { defId: 'tool-memory', position: { x: 0, y: 330 } },
      { defId: 'agent-analytics', position: { x: 200, y: 330 }, dataOverride: {
        prompt: 'Сравни конкурентов между собой. Дай таблицу-сводку и 3 вывода: где у них преимущество, где слабее, где наша возможность.', hasPrompt: true } },
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
];

/**
 * Получить template по id, null если не найдено.
 */
export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}
