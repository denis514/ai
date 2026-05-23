import { useEffect } from 'react';
import { playSound } from '../sound/soundEngine.js';

/**
 * useGlobalHoverSfx — глобальный делегат: проигрывает `ui.hover` на любой
 * наведённой <button> (один раз при входе в элемент).
 *
 * Защиты:
 *  • `disabled`-кнопки игнорятся.
 *  • Кнопка с `data-sfx-hover="off"` или внутри элемента с этим атрибутом — игнорится.
 *  • Узлы mindmap (`.mm-node`) исключены: их слишком много, hover-чирп раздражает.
 *  • Throttle 40 мс между срабатываниями (защита от случайных перепрыгиваний).
 *  • Один и тот же элемент не озвучивается повторно, пока курсор не уйдёт с него.
 */
export function useGlobalHoverSfx() {
  useEffect(() => {
    let lastBtn = null;
    let lastTs = 0;

    const onOver = (e) => {
      const btn = e.target?.closest?.('button');
      if (!btn || btn.disabled) { lastBtn = null; return; }
      // Уже на этой же кнопке — ничего
      if (btn === lastBtn) return;
      // Opt-out: data-sfx-hover="off" на кнопке или предке
      if (btn.closest('[data-sfx-hover="off"]')) { lastBtn = btn; return; }
      // Узлы mindmap — спам при панорамировании по карте
      if (btn.closest('.mm-node, .mm-canvas')) { lastBtn = btn; return; }

      const now = performance.now();
      if (now - lastTs < 40) { lastBtn = btn; return; }
      lastBtn = btn;
      lastTs = now;
      playSound('ui.hover');
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    return () => document.removeEventListener('mouseover', onOver);
  }, []);
}
