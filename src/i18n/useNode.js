import { useT } from './LocaleContext.jsx';

/**
 * Возвращает локализованные текстовые поля узла. Структурные поля
 * (id, icon, category, children, relatedIds, minLevel, isRoot) — из самого
 * объекта node (он остаётся source-of-truth для структуры графа).
 *
 * Использование в JSX:
 *   const { title, details } = useNodeContent(node);
 *
 * Для не-React контекста (поиск, индексы) — используй getNodeContent(t, id)
 * из этого же модуля.
 */
export function useNodeContent(node) {
  const t = useT();
  if (!node) return null;
  return {
    title: t(`nodes.${node.id}.title`),
    details: {
      what: t(`nodes.${node.id}.what`),
      why: t(`nodes.${node.id}.why`),
      when: t(`nodes.${node.id}.when`),
      impact: t(`nodes.${node.id}.impact`),
      example: t(`nodes.${node.id}.example`),
      mistakes: t(`nodes.${node.id}.mistakes`)
    }
  };
}

/**
 * Чистая функция: возвращает локализованные поля по id узла.
 * Принимает t-функцию (из useT() или замыкания).
 */
export function getNodeContent(t, nodeId) {
  return {
    title: t(`nodes.${nodeId}.title`),
    what: t(`nodes.${nodeId}.what`),
    why: t(`nodes.${nodeId}.why`),
    when: t(`nodes.${nodeId}.when`),
    impact: t(`nodes.${nodeId}.impact`),
    example: t(`nodes.${nodeId}.example`),
    mistakes: t(`nodes.${nodeId}.mistakes`)
  };
}
