import { useEffect } from 'react';
import { playSound } from '../sound/soundEngine.js';

/**
 * useGlobalHoverSfx — проигрывает `ui.hover` при наведении курсора на узел
 * mindmap (`.mm-node`). Один звук на «вход» в узел — повторно не срабатывает,
 * пока курсор не уйдёт.
 *
 * Защиты:
 *  • Throttle 80 мс между срабатываниями (защита от случайных быстрых
 *    перепрыгиваний по соседним узлам).
 *  • Один и тот же узел не озвучивается повторно, пока курсор не покинет его.
 *  • `data-sfx-hover="off"` на узле или предке отключает звук точечно.
 */
export function useGlobalHoverSfx() {
  useEffect(() => {
    let lastNode = null;

    const onOver = (e) => {
      const node = e.target?.closest?.('.mm-node');
      if (!node) { lastNode = null; return; }
      // Один и тот же узел — пропускаем (mouseover спамит на каждом ребёнке)
      if (node === lastNode) return;
      if (node.closest('[data-sfx-hover="off"]')) { lastNode = node; return; }
      lastNode = node;
      // Никакого throttle: дедуп по `lastNode` уже даёт ровно один звук
      // на «вход» в узел. Throttle создавал ощущение лага при быстром
      // перемещении между соседними узлами.
      playSound('ui.hover');
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    return () => document.removeEventListener('mouseover', onOver);
  }, []);
}
