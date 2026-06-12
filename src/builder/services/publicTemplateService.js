/**
 * publicTemplateService.js — публичная галерея «От сообщества» (Фаза 2).
 *
 * Таблица builder_public_templates (миграция 009). Хранит ОБЕЗЛИЧЕННЫЙ снимок
 * схемы (toShareGraph — без личных данных и ключей). Видимость:
 *   • approved=true — всем (RLS);
 *   • свои (на модерации) — автору.
 * Публикация всегда создаёт строку approved=false → ручная модерация владельцем.
 */
import { supabase } from '../../lib/supabaseClient.js';
import { toShareGraph } from './shareGraph.js';

/**
 * Опубликовать текущую схему в галерею сообщества (на модерацию).
 * @param {object} p
 *   nodes, edges — React Flow граф (обезличивается перед сохранением)
 *   title — название карточки
 *   industry — категория-индустрия (необязательно)
 *   difficulty — 'beginner'|'intermediate'|'advanced' (необязательно)
 *   authorName — отображаемое имя автора (необязательно)
 * @returns {Promise<object>} созданная строка
 */
export async function publishTemplate({ nodes, edges, title, industry, difficulty, authorName }) {
  if (!supabase) throw new Error('backend_unavailable');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not_authenticated');

  const graph = toShareGraph(nodes, edges); // обезличивание — критично
  if (!graph.nodes.length) throw new Error('empty_graph');

  const row = {
    author_id: user.id,
    author_name: (authorName || '').slice(0, 60) || null,
    title: String(title || '').trim().slice(0, 80) || 'Без названия',
    industry: industry || null,
    difficulty: difficulty || null,
    graph,
    approved: false,
  };
  const { data, error } = await supabase
    .from('builder_public_templates')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Список одобренных публичных шаблонов (для галереи). */
export async function listPublicTemplates({ industry = null, limit = 60 } = {}) {
  if (!supabase) return [];
  let q = supabase
    .from('builder_public_templates')
    .select('id, title, industry, difficulty, graph, author_name, use_count, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (industry) q = q.eq('industry', industry);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

/** Мои публикации (включая ещё не одобренные) — для управления. */
export async function listMyPublicTemplates() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('builder_public_templates')
    .select('id, title, industry, approved, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

/** Удалить свою публикацию. */
export async function deleteMyPublicTemplate(id) {
  if (!supabase) throw new Error('backend_unavailable');
  const { error } = await supabase.from('builder_public_templates').delete().eq('id', id);
  if (error) throw error;
}
