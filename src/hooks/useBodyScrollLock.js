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
/**
 * forceIosRepaint — лечит баг старого iOS WebKit (iPhone 12/12 Pro и др.):
 * только что смонтированный position:fixed-оверлей (модалка/bottom-sheet) НЕ
 * отрисовывается до второго касания. Симптом: «первый тап — ничего, второй —
 * появляется окно» (поле даже успевает сфокусироваться → вылезает клавиатура,
 * но окна не видно).
 *
 * Причина: оверлеи анимируются по opacity, а opacity-only entrance на новом
 * fixed-слое iOS не композитит сразу. Решение — кратко толкнуть перерисовку
 * всей страницы тогглом body.opacity (0.999 → '') в следующем кадре.
 *
 * Почему opacity, а не transform: transform на body создал бы containing-block
 * для fixed-детей и СМЕСТИЛ бы оверлей. opacity создаёт лишь stacking-context —
 * для fixed безопасно. Изменение 99.9% незаметно глазу.
 * Только тач-устройства — на десктопе бага нет.
 */
function forceIosRepaint() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!window.matchMedia || !window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  const b = document.body;
  b.style.opacity = '0.999';
  // принудительный reflow, чтобы значение применилось до следующего кадра
  void b.offsetHeight;
  requestAnimationFrame(() => { b.style.opacity = ''; });
}

export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    applyLock();
    forceIosRepaint(); // iOS: заставить новый оверлей отрисоваться с первого тапа
    return removeLock;
  }, [active]);
}
