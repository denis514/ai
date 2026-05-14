import { useEffect, useState } from 'react';

/**
 * Определяет mobile-режим по ширине viewport.
 * Дефолтный breakpoint — 720px (совпадает с CSS @media).
 *
 * SSR-safe: при отсутствии window возвращает false.
 */
export function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}
