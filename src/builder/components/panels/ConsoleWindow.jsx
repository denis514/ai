import React from 'react';
import Icon from '../../../components/Icon.jsx';

/**
 * ConsoleWindow — единое окно «Консоль» для Agent Builder.
 *
 * Один постоянный контейнер (рамка + шапка с вкладками + кнопки окна), внутрь
 * которого подставляется содержимое активной вкладки (Код / Запуск). Благодаря
 * этому позиция, размер и режим окна (док / плавающее / на весь экран) — общие
 * для обеих вкладок и не сбрасываются при переключении.
 *
 * Props:
 *  • tabs       — JSX переключателя вкладок (рендерится слева в шапке)
 *  • floating, maximized, pos — режим окна (поднят в BuilderApp)
 *  • onToggleFloat, onToggleMax — переключатели режима
 *  • onHeaderPointerDown — перетаскивание за шапку (только floating)
 *  • onClose    — закрыть окно
 *  • wrapperStyle, wrapperClass, onResizeStart — ресайз левой кромкой в доке
 *  • t          — функция перевода
 *  • children   — содержимое активной вкладки
 */
export default function ConsoleWindow({
  tabs,
  floating,
  maximized,
  pos,
  onToggleFloat,
  onToggleMax,
  onHeaderPointerDown,
  onClose,
  wrapperStyle,
  wrapperClass = '',
  onResizeStart,
  t,
  children,
}) {
  const tr = t || ((_, fallback) => fallback);
  const style = floating
    ? (maximized ? undefined : { transform: `translate(${pos.x}px, ${pos.y}px)` })
    : wrapperStyle;

  return (
    <section
      className={[
        'builder-console-window',
        floating ? 'is-floating' : '',
        floating && maximized ? 'is-max' : '',
        !floating ? wrapperClass : '',
      ].filter(Boolean).join(' ')}
      style={style}
      aria-label={tr('builder.console.openBtn') || 'Консоль'}
    >
      {/* Ресайз левой кромкой — только в доке (как у прежней панели запуска). */}
      {!floating && onResizeStart && (
        <div
          className="builder-console-window__resize-handle builder-resize builder-resize--left"
          onMouseDown={onResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label={tr('builder.exec.resize') || 'Изменить размер'}
        >
          <span className="builder-resize__grip" aria-hidden="true" />
          <span className="builder-resize__label" aria-hidden="true">{tr('builder.exec.resize') || 'Изменить размер'}</span>
        </div>
      )}

      <div
        className={`builder-console-window__header ${floating && !maximized ? 'is-drag' : ''}`}
        onPointerDown={onHeaderPointerDown}
      >
        {tabs}
        <div className="builder-console-window__controls">
          <button
            type="button"
            className="builder-console-window__ctrl"
            onClick={onToggleFloat}
            title={floating ? (tr('builder.exec.dock') || 'Закрепить') : (tr('builder.exec.popout') || 'Открыть окном')}
            aria-pressed={floating}
          >
            <Icon name={floating ? 'dock' : 'window'} size={14} strokeWidth={1.75} />
          </button>
          {floating && (
            <button
              type="button"
              className="builder-console-window__ctrl"
              onClick={onToggleMax}
              title={maximized ? (tr('builder.exec.restore') || 'Свернуть') : (tr('builder.exec.fullscreen') || 'На весь экран')}
              aria-pressed={maximized}
            >
              <Icon name={maximized ? 'restore' : 'fullscreen'} size={14} strokeWidth={1.75} />
            </button>
          )}
          <button
            type="button"
            className="builder-console-window__ctrl"
            onClick={onClose}
            aria-label={tr('builder.exec.close') || 'Закрыть'}
          >
            <Icon name="close" size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="builder-console-window__body">
        {children}
      </div>
    </section>
  );
}
