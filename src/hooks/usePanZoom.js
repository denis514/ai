import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;
const WHEEL_STEP = 0.0015;

export function usePanZoom(containerRef) {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const dragState = useRef(null);
  const pinchState = useRef(null);

  // Центрируем при монтировании и при ресайзе
  const center = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTransform({ x: r.width / 2, y: r.height / 2, k: 1 });
  }, [containerRef]);

  useEffect(() => { center(); }, [center]);

  useEffect(() => {
    const onResize = () => center();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [center]);

  // Зум вокруг точки (в координатах контейнера)
  const zoomAt = useCallback((px, py, factor) => {
    setTransform(prev => {
      const newK = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.k * factor));
      const ratio = newK / prev.k;
      return {
        k: newK,
        x: px - (px - prev.x) * ratio,
        y: py - (py - prev.y) * ratio
      };
    });
  }, []);

  // Колесо мыши
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const factor = Math.exp(-e.deltaY * WHEEL_STEP);
    zoomAt(px, py, factor);
  }, [containerRef, zoomAt]);

  // Мышь — drag
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-no-pan="true"]')) return;
    dragState.current = {
      startX: e.clientX, startY: e.clientY,
      origX: transform.x, origY: transform.y
    };
  }, [transform.x, transform.y]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.current) return;
      const d = dragState.current;
      setTransform(prev => ({
        ...prev,
        x: d.origX + (e.clientX - d.startX),
        y: d.origY + (e.clientY - d.startY)
      }));
    };
    const onUp = () => { dragState.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Touch — pan + pinch
  const onTouchStart = useCallback((e) => {
    if (e.target.closest('[data-no-pan="true"]')) return;
    if (e.touches.length === 1) {
      dragState.current = {
        startX: e.touches[0].clientX, startY: e.touches[0].clientY,
        origX: transform.x, origY: transform.y
      };
      pinchState.current = null;
    } else if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const cx = (a.clientX + b.clientX) / 2;
      const cy = (a.clientY + b.clientY) / 2;
      const el = containerRef.current;
      const r = el.getBoundingClientRect();
      pinchState.current = {
        startDist: dist,
        startK: transform.k,
        cx: cx - r.left, cy: cy - r.top,
        origX: transform.x, origY: transform.y
      };
      dragState.current = null;
    }
  }, [transform, containerRef]);

  const onTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && dragState.current) {
      const d = dragState.current;
      setTransform(prev => ({
        ...prev,
        x: d.origX + (e.touches[0].clientX - d.startX),
        y: d.origY + (e.touches[0].clientY - d.startY)
      }));
    } else if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ps = pinchState.current;
      const factor = dist / ps.startDist;
      const newK = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, ps.startK * factor));
      const ratio = newK / ps.startK;
      setTransform({
        k: newK,
        x: ps.cx - (ps.cx - ps.origX) * ratio,
        y: ps.cy - (ps.cy - ps.origY) * ratio
      });
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      dragState.current = null;
      pinchState.current = null;
    } else if (e.touches.length === 1) {
      pinchState.current = null;
      dragState.current = {
        startX: e.touches[0].clientX, startY: e.touches[0].clientY,
        origX: transform.x, origY: transform.y
      };
    }
  }, [transform.x, transform.y]);

  // API кнопок
  const zoomIn  = useCallback(() => {
    const el = containerRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, 1.2);
  }, [containerRef, zoomAt]);

  const zoomOut = useCallback(() => {
    const el = containerRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, 1 / 1.2);
  }, [containerRef, zoomAt]);

  const reset = useCallback(() => { center(); }, [center]);

  const fitToScreen = useCallback((bounds, padding = 80) => {
    const el = containerRef.current;
    if (!el || !bounds) return;
    const r = el.getBoundingClientRect();

    const w = bounds.maxX - bounds.minX || 1;
    const h = bounds.maxY - bounds.minY || 1;

    // Узлы рисуются вокруг точки с запасом ~ 200x80 — добавим запас.
    const nodePad = 200;
    const sx = (r.width  - padding * 2) / (w + nodePad);
    const sy = (r.height - padding * 2) / (h + nodePad);
    const k  = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(sx, sy)));

    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;

    setTransform({
      k,
      x: r.width  / 2 - cx * k,
      y: r.height / 2 - cy * k
    });
  }, [containerRef]);

  return {
    transform,
    handlers: { onWheel, onMouseDown, onTouchStart, onTouchMove, onTouchEnd },
    zoomIn, zoomOut, reset, fitToScreen, MIN_ZOOM, MAX_ZOOM
  };
}
