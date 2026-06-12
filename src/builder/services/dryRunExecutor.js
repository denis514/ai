/**
 * dryRunExecutor.js — «Тестовый прогон» (dry-run), как Execute Workflow в n8n.
 *
 * Проходит по цепочке узлов ЧИСТО НА КЛИЕНТЕ: подсвечивает узлы по очереди,
 * человеческим языком пишет, что каждый узел сделает, и в конце сообщает, всё ли
 * соединено правильно. НИКАКИХ вызовов ИИ/сервера — токены НЕ тратятся.
 *
 * API зеркалит реальный исполнитель: { onUpdate(nodeId,status), onLog(entry),
 * onComplete(finalStatus) }. Возвращает контроллер со stop().
 */
import { validateGraph } from './connectionRules.js';

export function createDryRun({ nodes, edges, t, onUpdate, onLog, onComplete }) {
  let stopped = false;
  const timers = [];
  const t0 = Date.now();
  const tr = (k, fb) => { const v = t?.(k); return v && v !== k ? v : fb; };
  const ts = () => Date.now() - t0;
  const label = (n) => {
    const l = n?.data?.label;
    const tx = l ? tr(l, l) : null;
    return tx || n?.data?.role || n?.data?.kind || 'узел';
  };

  // Инструменты прикрепляются к агенту сбоку (ATTACH) — это не шаг потока.
  const toolIds = new Set(nodes.filter(n => n.data?.kind === 'tool').map(n => n.id));
  const attachedTo = {}; // agentId -> [toolLabel]
  edges.forEach(e => {
    if (toolIds.has(e.source)) {
      (attachedTo[e.target] ||= []).push(label(nodes.find(n => n.id === e.source)));
    }
  });

  // Порядок потока: по orderLevel (его уже считает раскладка), инструменты — мимо.
  const flow = nodes
    .filter(n => n.data?.kind !== 'tool')
    .sort((a, b) => (a.data?.orderLevel ?? 99) - (b.data?.orderLevel ?? 99));

  // Что узел «сделает» — простыми словами, по типу/роли.
  const describe = (n) => {
    const kind = n.data?.kind, role = n.data?.role;
    if (kind === 'trigger') return tr('builder.dry.step.start', 'принимает задачу и запускает цепочку');
    if (kind === 'agent') {
      const tools = attachedTo[n.id];
      const base = tr('builder.dry.step.agent', 'обработает задачу и подготовит ответ');
      return tools?.length
        ? `${base} (${tr('builder.dry.step.withTools', 'умения')}: ${tools.join(', ')})`
        : base;
    }
    if (role === 'condition') return tr('builder.dry.step.condition', 'проверит условие и выберет путь «Да» или «Нет»');
    if (role === 'condition-agent') return tr('builder.dry.step.conditionAgent', 'сам решит, по какому пути идти');
    if (role === 'loop') return tr('builder.dry.step.loop', 'повторит шаги несколько раз');
    if (role === 'telegram') return tr('builder.dry.step.telegram', 'отправит результат в Telegram');
    if (role === 'email') return tr('builder.dry.step.email', 'отправит результат на почту');
    if (role === 'calendar') return tr('builder.dry.step.calendar', 'добавит событие в календарь');
    if (kind === 'output') return tr('builder.dry.step.output', 'покажет готовый результат');
    return tr('builder.dry.step.generic', 'передаст данные дальше по цепочке');
  };

  const finish = () => {
    if (stopped) return;
    const v = validateGraph(nodes, edges);
    const reason = (code) => tr(code === 'no-agent' ? 'builder.validation.noAgent' : `builder.validation.${code}`, code);
    v.warnings.forEach(w => onLog?.({ level: 'warn', message: '⚠ ' + reason(w.type), ts: ts() }));
    v.errors.forEach(e => onLog?.({ level: 'error', message: '✕ ' + reason(e), ts: ts() }));
    if (v.errors.length) {
      onLog?.({ level: 'error', message: tr('builder.dry.failed', 'Тест выявил проблемы — почините связи и повторите.'), ts: ts() });
      onComplete?.('failed');
    } else {
      const tail = v.warnings.length ? tr('builder.dry.okWarn', 'Цепочка проходит. Есть замечания — посмотрите выше.') : tr('builder.dry.ok', 'Готово: цепочка проходит без ошибок. Токены не потрачены.');
      onLog?.({ level: 'info', message: '✓ ' + tail, ts: ts() });
      onComplete?.('completed');
    }
  };

  let i = 0;
  const step = () => {
    if (stopped) return;
    if (i >= flow.length) { finish(); return; }
    const n = flow[i++];
    onUpdate?.(n.id, 'running');
    timers.push(setTimeout(() => {
      if (stopped) return;
      onLog?.({ level: 'info', nodeName: label(n), message: describe(n), ts: ts() });
      onUpdate?.(n.id, 'completed');
      timers.push(setTimeout(step, 90));
    }, 200));
  };

  onLog?.({ level: 'info', message: tr('builder.dry.start', 'Тестовый прогон (без токенов): проверяю, как проходит цепочка…'), ts: ts() });
  step();

  return {
    stop() {
      stopped = true;
      timers.forEach(clearTimeout);
      onComplete?.('stopped');
    },
  };
}
