/**
 * historyBridge — мост к pushHistory из компонентов, которые не имеют прямого
 * доступа к состоянию BuilderApp (например кастомный edge с кнопкой «разъединить»).
 *
 * BuilderApp присваивает .push = pushHistory; потребители вызывают
 * historyBridge.push() перед мутацией, чтобы действие попало в Undo.
 */
export const historyBridge = { push: () => {} };
