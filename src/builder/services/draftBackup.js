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
