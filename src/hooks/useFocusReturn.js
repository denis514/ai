import { useEffect, useRef } from 'react';

/**
 * useFocusReturn — сохраняет focus на open и возвращает на element-trigger
 * при unmount/close. Критично для keyboard-навигации и accessibility.
 *
 * Использование:
 *   function MyModal({ isOpen }) {
 *     useFocusReturn(isOpen);
 *     ...
 *   }
 *
 *   // Или без условия (модал всегда mounted когда видим):
 *   function MyModal() {
 *     useFocusReturn();
 *     ...
 *   }
 *
 * Что делает:
 *  1. На mount (или active=true) запоминает document.activeElement
 *     (что было сфокусировано перед открытием модала — обычно trigger-кнопка)
 *  2. На unmount (или active=false) возвращает focus на этот element
 *  3. Если element больше не в DOM (например удалён), возврат noop
 *
 * Что НЕ делает:
 *  - НЕ устанавливает initial focus внутрь модала (это отдельная задача,
 *    обычно через autoFocus или useEffect с .focus())
 *  - НЕ управляет focus-trap (другой hook / focus-trap lib)
 *
 * @param {boolean} active — когда true, hook активен. По умолчанию true.
 */
export function useFocusReturn(active = true) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    // Snapshot trigger при первом mount активного состояния
    if (document.activeElement && document.activeElement !== document.body) {
      triggerRef.current = document.activeElement;
    }
    return () => {
      const el = triggerRef.current;
      if (!el) return;
      // Возвращаем focus только если element всё ещё в DOM и focusable
      if (document.body.contains(el) && typeof el.focus === 'function') {
        // Используем setTimeout(0) чтобы дать React-cleanup закончиться
        // прежде чем устанавливать focus (иначе trigger может быть disabled)
        setTimeout(() => {
          try { el.focus({ preventScroll: true }); } catch {}
        }, 0);
      }
      triggerRef.current = null;
    };
  }, [active]);
}
