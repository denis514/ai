/**
 * draftBackup.js — L1-страховка от потери работы (см. docs/agent-builder/13).
 *
 * Непрерывно держит ЧЕРНОВИК текущего холста в localStorage. Переживает
 * перезагрузку/краш вкладки ДО того, как пользователь сохранил схему в облако.
 *
 * Полностью аддитивно: отдельный ключ, не трогает DB-слой save/load. Любая
 * ошибка localStorage (приватный режим, переполнение) — тихо игнорируется.
 */

const KEY = 'atlas:builder:draft';

export function saveDraft({ workflowId, name, nodes, edges }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ts: Date.now(),
      workflowId: workflowId || null,
      name: name || '',
      nodes: nodes || [],
      edges: edges || [],
    }));
  } catch { /* localStorage недоступен — не критично */ }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.nodes)) return null;
    return d;
  } catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}

// Флаг «пользователь ушёл на вход прямо из билдера». Ставится ПЕРЕД редиректом
// на OAuth (полная перезагрузка теряет state). После возврата и успешного входа
// билдер видит флаг → авто-восстанавливает черновик на холст и сохраняет его как
// «Без названия» (вместо ручного баннера «сохранить/сбросить»).
const RESUME_FLAG = 'atlas:builder:resume-after-auth';

export function setResumeAfterAuth() {
  try { localStorage.setItem(RESUME_FLAG, '1'); } catch { /* noop */ }
}

export function hasResumeAfterAuth() {
  try { return localStorage.getItem(RESUME_FLAG) === '1'; } catch { return false; }
}

export function clearResumeAfterAuth() {
  try { localStorage.removeItem(RESUME_FLAG); } catch { /* noop */ }
}
