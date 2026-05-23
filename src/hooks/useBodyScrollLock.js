import { useEffect } from 'react';

// Счётчик активных lock'ов: несколько модалов могут стэкаться,
// и нам нужно НЕ снимать lock пока хотя бы один активен.
// Без счётчика: открыл modal A (lock), открыл modal B (lock),
// закрыл B (unlock!) — а modal A ещё открыт. Body начинает скроллиться.
let lockCount = 0;
let savedOverflow = null;
let savedPaddingRight = null;

function applyLock() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    // Запоминаем оригинальные значения чтобы корректно восстановить
    savedOverflow = document.body.style.overflow;
    savedPaddingRight = document.body.style.paddingRight;
    // Компенсация исчезновения scrollbar — чтобы не было shift'а контента
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPad = parseInt(getComputedStyle(document.body).paddingRight, 10) || 0;
      document.body.style.paddingRight = `${currentPad + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function removeLock() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow || '';
    document.body.style.paddingRight = savedPaddingRight || '';
    savedOverflow = null;
    savedPaddingRight = null;
  }
}

/**
 * useBodyScrollLock — блокирует body-scroll пока модал открыт.
 *
 * Использование:
 *   function MyModal({ isOpen }) {
 *     useBodyScrollLock(isOpen);
 *     ...
 *   }
 *
 *   // Или без условия (модал mounted=показан):
 *   function MyModal() {
 *     useBodyScrollLock();
 *     ...
 *   }
 *
 * Что делает:
 *  1. На mount (или active=true) — устанавливает body.overflow='hidden'
 *  2. На unmount (или active=false) — восстанавливает исходное значение
 *  3. Reference counter — несколько модалов могут lockать одновременно,
 *     unlock происходит только когда ВСЕ закрылись
 *  4. Компенсирует scrollbar чтобы контент не дёргался при lock
 *
 * Что НЕ делает:
 *  - НЕ блокирует touch-scroll на iOS (требует overflow:hidden на html
 *    + position:fixed на body — более сложное решение)
 *
 * @param {boolean} active — когда true, lock активен. По умолчанию true.
 */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    applyLock();
    return removeLock;
  }, [active]);
}
