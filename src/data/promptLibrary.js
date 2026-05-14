// Библиотека промпт-шаблонов (структура). Текст и labels — в
// src/locales/<lang>/prompt-library.json. Резолвинг через
// getLocalizedLibraryTemplate() / getLibraryCategoryLabel().

export const PROMPT_CATEGORIES = {
  "start": {
    "icon": "sparkles"
  },
  "writing": {
    "icon": "edit"
  },
  "analysis": {
    "icon": "microscope"
  },
  "code": {
    "icon": "laptop"
  },
  "learn": {
    "icon": "graduation"
  },
  "creative": {
    "icon": "idea"
  },
  "productivity": {
    "icon": "target"
  },
  "business": {
    "icon": "chart"
  },
  "prompting": {
    "icon": "tools"
  }
};

export const PROMPT_LEVELS = {
  "beginner": {
    "color": "#16a34a"
  },
  "intermediate": {
    "color": "#2563eb"
  },
  "advanced": {
    "color": "#7c3aed"
  }
};

export const promptLibrary = [
  {
    "id": "start-role-task",
    "category": "start",
    "level": "beginner",
    "icon": "sparkles"
  },
  {
    "id": "start-explain-simple",
    "category": "start",
    "level": "beginner",
    "icon": "graduation"
  },
  {
    "id": "start-compare-two",
    "category": "start",
    "level": "beginner",
    "icon": "sliders"
  },
  {
    "id": "start-give-options",
    "category": "start",
    "level": "beginner",
    "icon": "puzzle"
  },
  {
    "id": "start-step-by-step",
    "category": "start",
    "level": "beginner",
    "icon": "clipboard"
  },
  {
    "id": "writing-shorten",
    "category": "writing",
    "level": "beginner",
    "icon": "note"
  },
  {
    "id": "writing-tone-change",
    "category": "writing",
    "level": "intermediate",
    "icon": "paint"
  },
  {
    "id": "writing-markdown",
    "category": "writing",
    "level": "intermediate",
    "icon": "file"
  },
  {
    "id": "writing-editor-review",
    "category": "writing",
    "level": "intermediate",
    "icon": "pencil"
  },
  {
    "id": "writing-slides",
    "category": "writing",
    "level": "advanced",
    "icon": "chart"
  },
  {
    "id": "analysis-structure-doc",
    "category": "analysis",
    "level": "beginner",
    "icon": "clipboard"
  },
  {
    "id": "analysis-compare",
    "category": "analysis",
    "level": "intermediate",
    "icon": "sliders"
  },
  {
    "id": "analysis-swot",
    "category": "analysis",
    "level": "intermediate",
    "icon": "shield"
  },
  {
    "id": "analysis-deep-dive",
    "category": "analysis",
    "level": "advanced",
    "icon": "microscope"
  },
  {
    "id": "analysis-first-principles",
    "category": "analysis",
    "level": "advanced",
    "icon": "brain"
  },
  {
    "id": "code-explain",
    "category": "code",
    "level": "beginner",
    "icon": "laptop"
  },
  {
    "id": "code-find-bug",
    "category": "code",
    "level": "beginner",
    "icon": "question"
  },
  {
    "id": "code-refactor",
    "category": "code",
    "level": "intermediate",
    "icon": "tools"
  },
  {
    "id": "code-review",
    "category": "code",
    "level": "intermediate",
    "icon": "shield"
  },
  {
    "id": "code-architecture",
    "category": "code",
    "level": "advanced",
    "icon": "bricks"
  },
  {
    "id": "learn-5-levels",
    "category": "learn",
    "level": "beginner",
    "icon": "graduation"
  },
  {
    "id": "learn-notes",
    "category": "learn",
    "level": "beginner",
    "icon": "note"
  },
  {
    "id": "learn-roadmap",
    "category": "learn",
    "level": "intermediate",
    "icon": "compass"
  },
  {
    "id": "learn-socratic",
    "category": "learn",
    "level": "advanced",
    "icon": "question"
  },
  {
    "id": "creative-brainstorm",
    "category": "creative",
    "level": "beginner",
    "icon": "idea"
  },
  {
    "id": "creative-naming",
    "category": "creative",
    "level": "beginner",
    "icon": "tag"
  },
  {
    "id": "creative-lateral",
    "category": "creative",
    "level": "intermediate",
    "icon": "puzzle"
  },
  {
    "id": "creative-reversed",
    "category": "creative",
    "level": "advanced",
    "icon": "flash"
  },
  {
    "id": "productivity-decompose",
    "category": "productivity",
    "level": "beginner",
    "icon": "puzzle"
  },
  {
    "id": "productivity-decision",
    "category": "productivity",
    "level": "intermediate",
    "icon": "sliders"
  },
  {
    "id": "productivity-premortem",
    "category": "productivity",
    "level": "advanced",
    "icon": "shield"
  },
  {
    "id": "business-positioning",
    "category": "business",
    "level": "beginner",
    "icon": "tag"
  },
  {
    "id": "business-persona",
    "category": "business",
    "level": "intermediate",
    "icon": "users"
  },
  {
    "id": "business-email-sequence",
    "category": "business",
    "level": "intermediate",
    "icon": "inbox"
  },
  {
    "id": "business-competition",
    "category": "business",
    "level": "advanced",
    "icon": "microscope"
  },
  {
    "id": "prompting-improve",
    "category": "prompting",
    "level": "intermediate",
    "icon": "tools"
  },
  {
    "id": "prompting-cot",
    "category": "prompting",
    "level": "intermediate",
    "icon": "flash"
  },
  {
    "id": "prompting-few-shot",
    "category": "prompting",
    "level": "intermediate",
    "icon": "puzzle"
  },
  {
    "id": "prompting-self-critique",
    "category": "prompting",
    "level": "advanced",
    "icon": "repeat"
  },
  {
    "id": "prompting-tree-of-thought",
    "category": "prompting",
    "level": "advanced",
    "icon": "compass"
  },
  {
    "id": "prompting-schema",
    "category": "prompting",
    "level": "advanced",
    "icon": "file"
  },
  {
    "id": "prompting-constraints",
    "category": "prompting",
    "level": "advanced",
    "icon": "shield"
  }
];

/** Быстрый индекс: id → структура шаблона */
export const promptIndex = Object.fromEntries(promptLibrary.map(p => [p.id, p]));

/** Считалка по категориям — для бейджей в UI */
export function countByCategory() {
  const counts = {};
  for (const key of Object.keys(PROMPT_CATEGORIES)) counts[key] = 0;
  for (const p of promptLibrary) counts[p.category] = (counts[p.category] || 0) + 1;
  return counts;
}
