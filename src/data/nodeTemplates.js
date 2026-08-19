// Мост «узнал в Atlas → собрал в конструкторе».
//
// Индекс: id узла карты → id шаблона Agent Builder (`src/builder/data/templates.js`).
// Кнопка «Собрать в Agent Builder» в панели узла показывается ТОЛЬКО для узлов
// из этого индекса. Правило честности: демо даём там, где конструктор реально
// умеет показать тему в работе. Информативным узлам кнопку не выдаём — иначе
// человек нажмёт и увидит схему не про то.
//
// План и критерии отбора: docs/agent-builder/16-node-template-demos.md.
// Проверка целостности: npm run lint:builder (падает, если шаблон исчез или
// узла нет в карте).

export const NODE_TEMPLATES = {
  // ── Способности агента: каждая показана шаблоном, где она реально работает ──
  'cap-search':     'cited-answer',    // агент ищет свежее в интернете и показывает
                                      // ответ на экране. Схемы с доставкой в Telegram
                                      // для первого знакомства не годятся: без
                                      // подключённого бота человек не увидит результат.
  'cap-vision':     'image-review',     // агент смотрит картинку
  'cap-files':      'doc-answer',      // агент отвечает строго по вашему файлу
  'cap-memory':     'brand-voice',      // память держит тон между шагами
  'cap-code-exec':  'data-cruncher',    // агент считает кодом
  'cap-computer':   'web-actions',      // управление браузером
  'cap-citations':  'cited-answer',     // ответ со ссылками на источники
  'mcp':            'connect-service',  // свой сервис через MCP

  // ── Роли агентов ──
  'ag-code':        'code-review',     // агент-программист разбирает код
  'ag-pm':          'spec-from-wishes',// агент-продакт делает требования из пожеланий
  'ag-research':    'research',
  'ag-ux':          'ux-audit',
  'ag-designer':    'design-qa',
  'sc-analysis':    'analytics',
  'sc-content':     'content',

  // ── Паттерны схем (Systems) ──
  'sys-workflows-basics':     'client-replies', // линейная цепочка
  'sys-quality-gates':        'triage',         // условие перед выдачей
  'sys-loop-patterns':        'refine-loop',    // цикл-улучшение
  'sys-multi-agent-patterns': 'product-qa',     // условие-агент, несколько ролей
  'sys-api-patterns':         'webhook-lead',   // запуск извне + доставка

  // ── Сценарии (Use Cases) ──
  'uc-ai-customer-assistant':  'client-replies',
  'uc-ai-support-tier1':       'triage',
  'uc-ai-content-ops-launch':  'content',
  'uc-ai-reporting-launch':    'analytics',
  'uc-ai-process-automation':  'triage',
  'uc-ai-rag-launch':          'doc-answer',
  'uc-ai-multi-agent-system':  'product-qa',
  'uc-ai-product-search':          'product-pick',
  'uc-ai-personalization-launch':  'personal-offer',
  'uc-ai-conversion-optimization': 'conversion-audit',
};

/** id шаблона для узла карты, либо null если демо для узла нет. */
export function templateForNode(nodeId) {
  return (nodeId && NODE_TEMPLATES[nodeId]) || null;
}
