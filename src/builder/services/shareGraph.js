/**
 * shareGraph.js — обезличенный экспорт схемы для обмена.
 *
 * Превращает React Flow nodes/edges в компактный код { nodes, edges } БЕЗ личных
 * данных и секретов. Используется и «Поделиться кодом» (CodePanel), и публикацией
 * в галерею сообщества (publicTemplateService). Структуру и инструкции
 * (prompt/task/vars/условия) — оставляем; контакты и ключи — вырезаем.
 */
import { serializeForLocal, deserializeFromDb } from './workflowSerializer.js';
import { getNodeDef } from '../data/nodeTypes.js';

// БЕЛЫЙ СПИСОК (закрыт по умолчанию): публикуем ТОЛЬКО структурные и обучающие
// поля. Любое новое/неизвестное поле config НЕ попадёт в обмен, пока его явно не
// добавят сюда — это защищает от утечки личных данных и ссылок на подключения
// (chatId, toEmail, connectionId, apiKeyId, …), даже если такое поле появится позже.
export const SHARE_KEEP = new Set([
  'prompt',      // инструкция агента
  'task',        // задача «Старта»
  'vars',        // переменные-примеры
  'operator',    // условие: содержит/равно
  'condValue',   // условие: значение
  'question',    // условие-агент: вопрос
  'loopBackTo',  // цикл: к какому узлу
  'maxLoops',    // цикл: сколько раз
  'tier',        // размер ответа (S/M/L)
  'format',      // формат вывода
  'returnValue', // настройка вывода
]);

function stripConfig(config) {
  const clean = {};
  for (const k of Object.keys(config || {})) if (SHARE_KEEP.has(k)) clean[k] = config[k];
  return clean;
}

/** Холст → обезличенный код { nodes, edges } (для обмена/публикации). */
export function toShareGraph(nodes, edges) {
  const { nodes: dn, edges: de } = serializeForLocal(nodes, edges);
  return {
    nodes: dn.map(n => {
      const o = { id: n.client_id, type: n.def_id, x: Math.round(n.position_x), y: Math.round(n.position_y) };
      const cfg = stripConfig(n.config);
      if (Object.keys(cfg).length) o.config = cfg;
      return o;
    }),
    edges: de.map(e => {
      const o = { from: e.source_client_id, to: e.target_client_id };
      if (e.label) o.label = e.label;
      if (e.config && Object.keys(e.config).length) o.config = e.config;
      return o;
    }),
  };
}

/**
 * Обезличенный код { nodes, edges } → React Flow nodes/edges (с валидацией).
 * Бросает понятную ошибку при некорректном формате/неизвестном типе/битых связях.
 */
export function fromShareGraph(obj, edgeStyle) {
  if (!obj || typeof obj !== 'object') throw new Error('Нужен объект { nodes: [...], edges: [...] }');
  if (!Array.isArray(obj.nodes)) throw new Error('Поле "nodes" должно быть массивом');
  const dbNodes = obj.nodes.map((n, i) => {
    if (!n || !n.type) throw new Error(`Узел #${i + 1}: нет поля "type"`);
    if (!getNodeDef(n.type)) throw new Error(`Узел #${i + 1}: неизвестный тип "${n.type}"`);
    return {
      client_id: String(n.id || `n${i + 1}`),
      def_id: n.type,
      position_x: Number(n.x) || 0,
      position_y: Number(n.y) || 0,
      config: n.config || {},
    };
  });
  const ids = new Set(dbNodes.map(n => n.client_id));
  if (ids.size !== dbNodes.length) throw new Error('Повторяющиеся id узлов');
  const edgesArr = Array.isArray(obj.edges) ? obj.edges : [];
  const dbEdges = edgesArr.map((e, i) => {
    if (!e || e.from == null || e.to == null) throw new Error(`Связь #${i + 1}: нужны "from" и "to"`);
    if (String(e.from) === String(e.to)) throw new Error(`Связь #${i + 1}: узел связан сам с собой`);
    if (!ids.has(String(e.from))) throw new Error(`Связь #${i + 1}: узел "${e.from}" не найден`);
    if (!ids.has(String(e.to))) throw new Error(`Связь #${i + 1}: узел "${e.to}" не найден`);
    return {
      client_id: String(e.id || `e${i + 1}`),
      source_client_id: String(e.from),
      target_client_id: String(e.to),
      label: e.label || null,
      config: e.config || {},
    };
  });
  return deserializeFromDb(dbNodes, dbEdges, edgeStyle);
}
