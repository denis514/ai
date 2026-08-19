import { useMemo } from 'react';
import { tutorials as structures } from '../data/tutorials.js';
import { STRINGS, loadTutorialAudience, isTutorialAudienceLoaded } from './strings.js';
import { FALLBACK_LOCALE } from './config.js';
import { useLocale } from './LocaleContext.jsx';

/**
 * Сливает структурный объект tutorial (id, icon, level, ids ссылок, steps:[{id}])
 * с текстовым контентом из локали. Возвращает enriched-объект, совместимый
 * с прежним shape, чтобы компоненты продолжали читать `tut.title`, `tut.steps[i].instructions`
 * и т.д. без правок логики.
 *
 * Fallback на RU (источник), если локаль не содержит ключ.
 */
function buildLocalized(structure, locale) {
  if (!structure) return null;
  const tutId = Object.keys(structures).find(k => structures[k] === structure);
  return buildById(tutId, structure, locale);
}

function buildById(id, structure, locale) {
  if (!structure) return null;
  // В памяти может лежать только индекс (title/subtitle/totalTime) — тела
  // туториалов грузятся по требованию, см. ensureTutorialBody().
  const primary = STRINGS[locale]?.tutorials?.[id];
  const fallback = STRINGS[FALLBACK_LOCALE]?.tutorials?.[id];
  const c = primary || fallback || {};
  // Порядок и id шагов берём из тела туториала: там они лежат ключами объекта
  // steps, в нужном порядке. В структуре (tutorials.js) их больше нет — иначе
  // список из 261 туториала ехал бы в стартовом пакете ради одного открытого.
  // Пока тело не загружено, шагов нет — это и показывает bodyReady ниже.
  const stepIds = Object.keys(c.steps || fallback?.steps || {});
  const steps = stepIds.map(stepId => {
    const sc = (c.steps && c.steps[stepId]) || (fallback?.steps?.[stepId]) || {};
    return {
      id: stepId,
      title: sc.title,
      time: sc.time,
      why: sc.why,
      instructions: Array.isArray(sc.instructions)
        ? sc.instructions
        : (sc.instructions && typeof sc.instructions === 'object'
            ? Object.values(sc.instructions)
            : []),
      ...(sc.prompt ? { prompt: sc.prompt } : {}),
      ...(sc.example ? { example: sc.example } : {}),
      ...(sc.validate ? { validate: sc.validate } : {}),
      ...(sc.tip ? { tip: sc.tip } : {}),
      ...(sc.troubleshoot ? { troubleshoot: sc.troubleshoot } : {}),
      ...(sc.actions
        ? { actions: Array.isArray(sc.actions) ? sc.actions : Object.values(sc.actions) }
        : {})
    };
  });
  return {
    ...structure,
    // Есть ли полный текст (шаги), или пока только строка индекса.
    bodyReady: !!(c && c.steps),
    title: c.title || '',
    subtitle: c.subtitle || '',
    totalTime: c.totalTime || '',
    whatItIs: c.whatItIs || '',
    approach: c.approach || '',
    outcomes: c.outcomes || [],
    applyIn: c.applyIn || [],
    pitfalls: c.pitfalls || [],
    exercises: c.exercises || [],
    steps
  };
}

/**
 * Подтянуть полный текст туториала (тело шагов) для локали. Идемпотентно.
 * Вызывать ТОЛЬКО там, где текст действительно показывается — модалка курса
 * и предпросмотр. Списки и поиск обходятся индексом.
 */
export function ensureTutorialBody(tutorialId, locale) {
  const structure = structures[tutorialId];
  if (!structure?.audience) return;
  if (isTutorialAudienceLoaded(locale, structure.audience)) return;
  loadTutorialAudience(locale, structure.audience).catch(() => {});
}

/**
 * Хук: получить локализованный tutorial по id.
 * Возвращает enriched-объект с теми же полями, что были в data-файле раньше.
 */
export function useTutorialContent(tutorialId) {
  const { locale, contentVersion } = useLocale();
  if (tutorialId) ensureTutorialBody(tutorialId, locale);
  // contentVersion в deps критичен: tutorials грузятся ЛЕНИВО через
  // loadLocaleContent. Без него useMemo не пересчитывается после загрузки —
  // и при deep-link открытии (#/tutorial/X) модалка рендерится с пустыми
  // полями навсегда.
  return useMemo(
    () => buildById(tutorialId, structures[tutorialId], locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tutorialId, locale, contentVersion]
  );
}

/**
 * Чистая функция: получить все туториалы как enriched-объекты в текущей локали.
 * Для CommandPalette / WorkflowsModal, где нужен полный список.
 */
export function getAllLocalizedTutorials(locale) {
  const out = {};
  for (const [id, struct] of Object.entries(structures)) {
    out[id] = buildById(id, struct, locale);
  }
  return out;
}

/**
 * Прямой доступ по id и локали (без хука).
 */
export function getLocalizedTutorial(tutorialId, locale) {
  return buildById(tutorialId, structures[tutorialId], locale);
}
