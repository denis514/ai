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

  // Порядок прогона: по orderLevel (его считает раскладка). Инструменты идут в
  // конце (у них нет orderLevel) — они тоже проходят тест и становятся зелёными,
  // чтобы счётчик совпадал с числом узлов на холсте (а не «3 из 4»).
  const flow = [...nodes].sort((a, b) => (a.data?.orderLevel ?? 99) - (b.data?.orderLevel ?? 99));

  // Какие узлы вообще подключены (для поиска «висящих»).
  const connected = new Set();
  edges.forEach(e => { connected.add(e.source); connected.add(e.target); });

  // Узлу нужна доп. информация? (жёлтый)
  const needsInfo = (n) => {
    const kind = n.data?.kind, role = n.data?.role;
    if (kind === 'agent' && n.data?.hasPrompt === false) return true;
    if (kind === 'trigger' && n.data?.hasInput === false) return true;
    if (role === 'telegram') {
      const ok = String(n.data?.chatId || '').trim() ||
        (Array.isArray(n.data?.targets) && n.data.targets.some(x => String(x?.chatId || '').trim()));
      if (!ok) return true;
    }
    if (role === 'email' && !String(n.data?.toEmail || '').trim()) return true;
    if (role === 'condition' && !String(n.data?.condValue || '').trim()) return true;
    return false;
  };

  // Итоговый статус узла: failed (висит) → warn (нужна инфо) → completed.
  const statusOf = (n) => {
    if (nodes.length > 1 && !connected.has(n.id)) return 'failed';
    if (needsInfo(n)) return 'warn';
    return 'completed';
  };

  const statusNote = (n, st) => {
    if (st === 'failed') return tr('builder.dry.note.isolated', 'не соединён с цепочкой — до него не дойдёт очередь');
    if (st === 'warn') {
      const role = n.data?.role, kind = n.data?.kind;
      if (kind === 'agent') return tr('builder.dry.note.noPrompt', 'нужна инструкция — кликните, чтобы настроить');
      if (role === 'telegram') return tr('builder.dry.note.noChat', 'укажите, в какой чат Telegram слать');
      if (role === 'email') return tr('builder.dry.note.noEmail', 'укажите адрес почты');
      if (role === 'condition') return tr('builder.dry.note.noCond', 'задайте, что проверяем');
      return tr('builder.dry.note.needsInfo', 'нужна доп. информация');
    }
    return null;
  };

  // Что узел «сделает» — простыми словами, по типу/роли.
  const describe = (n) => {
    const kind = n.data?.kind, role = n.data?.role;
    if (kind === 'tool') return tr('builder.dry.step.tool', 'подключён к агенту как умение');
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

  let nFailed = 0, nWarn = 0;

  const finish = () => {
    if (stopped) return;
    if (nFailed) {
      onLog?.({ level: 'error', message: tr('builder.dry.failed', 'Тест выявил проблемы — почините связи и повторите.'), ts: ts() });
      onComplete?.('failed');
    } else if (nWarn) {
      onLog?.({ level: 'warn', message: tr('builder.dry.okWarn', 'Цепочка проходит. Некоторым узлам нужна доп. информация (жёлтые).'), ts: ts() });
      onComplete?.('completed');
    } else {
      onLog?.({ level: 'info', message: tr('builder.dry.ok', 'Готово: цепочка проходит без ошибок. Токены не потрачены.'), ts: ts() });
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
      const st = statusOf(n);
      if (st === 'failed') nFailed++; else if (st === 'warn') nWarn++;
      const note = statusNote(n, st);
      const level = st === 'failed' ? 'error' : st === 'warn' ? 'warn' : 'info';
      onLog?.({ level, nodeName: label(n), message: note ? `${describe(n)} — ${note}` : describe(n), ts: ts() });
      onUpdate?.(n.id, st);
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
