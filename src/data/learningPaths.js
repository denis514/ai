// Learning Paths — структура. Текстовый контент (title, description,
// duration, steps[].why) — в src/locales/<lang>/paths.json. Резолвинг
// через getLocalizedPath() из src/i18n/usePath.js.

export const learningPaths = [
  {
    "id": "newcomer",
    "icon": "sparkles",
    "level": "beginner",
    "audience": "everyone",
    "steps": [
      {
        "type": "node",
        "id": "b-models"
      },
      {
        "type": "node",
        "id": "b-context"
      },
      {
        "type": "node",
        "id": "b-system"
      },
      {
        "type": "tutorial",
        "id": "basics"
      },
      {
        "type": "node",
        "id": "projects"
      },
      {
        "type": "prompt",
        "id": "start-role-task"
      }
    ]
  },
  {
    "id": "engineer",
    "icon": "laptop",
    "level": "intermediate",
    "audience": "developers",
    "steps": [
      {
        "type": "node",
        "id": "claude-code"
      },
      {
        "type": "node",
        "id": "cc-md"
      },
      {
        "type": "node",
        "id": "cc-slash"
      },
      {
        "type": "node",
        "id": "cc-hooks"
      },
      {
        "type": "node",
        "id": "cc-subagents"
      },
      {
        "type": "tutorial",
        "id": "claude-code"
      },
      {
        "type": "node",
        "id": "mcp"
      },
      {
        "type": "prompt",
        "id": "code-review"
      }
    ]
  },
  {
    "id": "researcher",
    "icon": "microscope",
    "level": "intermediate",
    "audience": "business",
    "steps": [
      {
        "type": "node",
        "id": "b-context"
      },
      {
        "type": "node",
        "id": "projects"
      },
      {
        "type": "prompt",
        "id": "analysis-structure-doc"
      },
      {
        "type": "prompt",
        "id": "analysis-compare"
      },
      {
        "type": "prompt",
        "id": "analysis-deep-dive"
      },
      {
        "type": "prompt",
        "id": "analysis-first-principles"
      },
      {
        "type": "prompt",
        "id": "learn-notes"
      }
    ]
  },
  {
    "id": "automation",
    "icon": "tools",
    "level": "advanced",
    "audience": "developers",
    "steps": [
      {
        "type": "node",
        "id": "skills"
      },
      {
        "type": "node",
        "id": "s-md"
      },
      {
        "type": "node",
        "id": "s-trigger"
      },
      {
        "type": "tutorial",
        "id": "skills"
      },
      {
        "type": "node",
        "id": "mcp"
      },
      {
        "type": "node",
        "id": "m-ready"
      },
      {
        "type": "node",
        "id": "agents"
      },
      {
        "type": "node",
        "id": "cc-subagents"
      }
    ]
  },
  {
    "id": "prompting",
    "icon": "mixer",
    "level": "intermediate",
    "audience": "everyone",
    "steps": [
      {
        "type": "node",
        "id": "prompting"
      },
      {
        "type": "node",
        "id": "pr-role"
      },
      {
        "type": "node",
        "id": "pr-cot"
      },
      {
        "type": "node",
        "id": "pr-fewshot"
      },
      {
        "type": "node",
        "id": "pr-xml"
      },
      {
        "type": "prompt",
        "id": "prompting-improve"
      },
      {
        "type": "prompt",
        "id": "prompting-cot"
      },
      {
        "type": "prompt",
        "id": "prompting-few-shot"
      },
      {
        "type": "prompt",
        "id": "prompting-self-critique"
      },
      {
        "type": "prompt",
        "id": "prompting-schema"
      }
    ]
  },
  {
    "id": "zero-to-running",
    "icon": "rocket",
    "level": "beginner",
    "audience": "developers",
    "steps": [
      { "type": "tutorial", "id": "intro" },
      { "type": "node", "id": "fs-what-is-project" },
      { "type": "tutorial", "id": "terminal-tour" },
      { "type": "tutorial", "id": "folders-workshop" },
      { "type": "tutorial", "id": "first-project" },
      { "type": "tutorial", "id": "basics" }
    ]
  }
];

/** Индекс по id */
export const pathIndex = Object.fromEntries(learningPaths.map(p => [p.id, p]));
