// Структура tutorials: nodeId, icon, level, prerequisites, relatedPrompts, next, steps:[{id}].
// Текстовый контент (title, subtitle, whatItIs, approach, outcomes, applyIn,
// pitfalls, exercises, totalTime, steps[].*) — в src/locales/<lang>/tutorials.json.
// Резолвинг через useTutorialContent() из src/i18n/.

export const tutorials = {
  "api-basics": {
    "nodeId": "pl-api",
    "icon": "code",
    "level": "intermediate",
    "prerequisites": ["claude-setup"],
    "relatedPrompts": [],
    "next": ["agents", "mcp"],
    "steps": [
      { "id": "ab-1" },
      { "id": "ab-2" },
      { "id": "ab-3" },
      { "id": "ab-4" },
      { "id": "ab-5" },
      { "id": "ab-6" }
    ]
  },
  "ai-limitations": {
    "nodeId": "cap-limitations",
    "icon": "shield",
    "level": "beginner",
    "prerequisites": ["basics"],
    "relatedPrompts": [],
    "next": ["prompting", "claude-setup"],
    "steps": [
      { "id": "al-1" },
      { "id": "al-2" },
      { "id": "al-3" },
      { "id": "al-4" },
      { "id": "al-5" }
    ]
  },
  "claude-cowork": {
    "nodeId": "pl-cowork",
    "icon": "robot",
    "level": "beginner",
    "prerequisites": ["claude-setup"],
    "relatedPrompts": [],
    "next": ["agents", "subagents"],
    "steps": [
      { "id": "cw-1" },
      { "id": "cw-2" },
      { "id": "cw-3" },
      { "id": "cw-4" },
      { "id": "cw-5" }
    ]
  },
  "claude-setup": {
    "nodeId": "platform",
    "icon": "sparkles",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": ["start-role-task"],
    "next": ["projects", "instructions", "basics"],
    "steps": [
      { "id": "cs-1" },
      { "id": "cs-2" },
      { "id": "cs-3" },
      { "id": "cs-4" },
      { "id": "cs-5" },
      { "id": "cs-6" }
    ]
  },
  "basics": {
    "nodeId": "basics",
    "icon": "brain",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "start-step-by-step",
      "prompting-improve"
    ],
    "next": [
      "prompting",
      "projects"
    ],
    "steps": [
      {
        "id": "b-1"
      },
      {
        "id": "b-2"
      },
      {
        "id": "b-3"
      },
      {
        "id": "b-4"
      },
      {
        "id": "b-5"
      }
    ]
  },
  "projects": {
    "nodeId": "projects",
    "icon": "folder",
    "level": "beginner",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [
      "start-role-task",
      "business-positioning",
      "analysis-deep-dive"
    ],
    "next": [
      "instructions",
      "artifacts"
    ],
    "steps": [
      {
        "id": "p-1"
      },
      {
        "id": "p-2"
      },
      {
        "id": "p-3"
      },
      {
        "id": "p-4"
      },
      {
        "id": "p-5"
      },
      {
        "id": "p-6"
      },
      {
        "id": "p-7"
      }
    ]
  },
  "artifacts": {
    "nodeId": "artifacts",
    "icon": "paint",
    "level": "beginner",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [
      "create-artifact",
      "html-prototype",
      "consistency-audit"
    ],
    "next": [
      "prompting",
      "scenarios"
    ],
    "steps": [
      {
        "id": "a-1"
      },
      {
        "id": "a-2"
      },
      {
        "id": "a-3"
      },
      {
        "id": "a-4"
      },
      {
        "id": "a-5"
      }
    ]
  },
  "skills": {
    "nodeId": "skills",
    "icon": "tools",
    "level": "intermediate",
    "prerequisites": [
      "basics",
      "projects"
    ],
    "relatedPrompts": [
      "create-skill",
      "prompting-improve",
      "prompting-constraints"
    ],
    "next": [
      "claude-code",
      "agents"
    ],
    "steps": [
      {
        "id": "s-1"
      },
      {
        "id": "s-2"
      },
      {
        "id": "s-3"
      },
      {
        "id": "s-4"
      },
      {
        "id": "s-5"
      },
      {
        "id": "s-6"
      },
      {
        "id": "s-7"
      }
    ]
  },
  "claude-code": {
    "nodeId": "claude-code",
    "icon": "laptop",
    "level": "intermediate",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [
      "create-claudemd",
      "code-review",
      "code-refactor"
    ],
    "next": [
      "mcp",
      "agents"
    ],
    "steps": [
      {
        "id": "cc-1"
      },
      {
        "id": "cc-2"
      },
      {
        "id": "cc-3"
      },
      {
        "id": "cc-4"
      },
      {
        "id": "cc-5"
      },
      {
        "id": "cc-6"
      },
      {
        "id": "cc-7"
      },
      {
        "id": "cc-8"
      }
    ]
  },
  "mcp": {
    "nodeId": "mcp",
    "icon": "plug",
    "level": "intermediate",
    "prerequisites": [
      "basics",
      "claude-code"
    ],
    "relatedPrompts": [
      "code-review",
      "business-positioning",
      "analysis-compare"
    ],
    "next": [
      "claude-code",
      "agents"
    ],
    "steps": [
      {
        "id": "m-1"
      },
      {
        "id": "m-2"
      },
      {
        "id": "m-3"
      },
      {
        "id": "m-4"
      },
      {
        "id": "m-5"
      },
      {
        "id": "m-6"
      },
      {
        "id": "m-7"
      }
    ]
  },
  "instructions": {
    "nodeId": "instructions",
    "icon": "settings",
    "level": "beginner",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [
      "prompting-improve",
      "prompting-constraints",
      "start-role-task"
    ],
    "next": [
      "projects",
      "prompting"
    ],
    "steps": [
      {
        "id": "i-1"
      },
      {
        "id": "i-2"
      },
      {
        "id": "i-3"
      },
      {
        "id": "i-4"
      },
      {
        "id": "i-5"
      }
    ]
  },
  "prompting": {
    "nodeId": "prompting",
    "icon": "note",
    "level": "intermediate",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [
      "prompting-improve",
      "prompting-cot",
      "prompting-few-shot",
      "prompting-self-critique"
    ],
    "next": [
      "ready-prompts",
      "scenarios"
    ],
    "steps": [
      {
        "id": "pr-1"
      },
      {
        "id": "pr-2"
      },
      {
        "id": "pr-3"
      },
      {
        "id": "pr-4"
      },
      {
        "id": "pr-5"
      },
      {
        "id": "pr-6"
      },
      {
        "id": "pr-7"
      }
    ]
  },
  "scenarios": {
    "nodeId": "scenarios",
    "icon": "target",
    "level": "intermediate",
    "prerequisites": [
      "basics",
      "projects"
    ],
    "relatedPrompts": [
      "business-positioning",
      "analysis-deep-dive",
      "creative-lateral"
    ],
    "next": [
      "projects",
      "agents"
    ],
    "steps": [
      {
        "id": "sc-1"
      },
      {
        "id": "sc-2"
      },
      {
        "id": "sc-3"
      },
      {
        "id": "sc-4"
      },
      {
        "id": "sc-5"
      }
    ]
  },
  "agents": {
    "nodeId": "agents",
    "icon": "robot",
    "level": "advanced",
    "prerequisites": [
      "basics",
      "claude-code",
      "skills"
    ],
    "relatedPrompts": [
      "create-agent",
      "create-skill",
      "prompting-constraints"
    ],
    "next": [
      "claude-code",
      "skills"
    ],
    "steps": [
      {
        "id": "ag-1"
      },
      {
        "id": "ag-2"
      },
      {
        "id": "ag-3"
      },
      {
        "id": "ag-4"
      },
      {
        "id": "ag-5"
      },
      {
        "id": "ag-6"
      }
    ]
  },
  "ready-prompts": {
    "nodeId": "ready-prompts",
    "icon": "clipboard",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "expert-audit",
      "consistency-audit"
    ],
    "next": [
      "prompting",
      "projects"
    ],
    "steps": [
      {
        "id": "rp-1"
      },
      {
        "id": "rp-2"
      },
      {
        "id": "rp-3"
      },
      {
        "id": "rp-4"
      }
    ]
  },
  "intro": {
    "nodeId": "b-claude",
    "icon": "sparkles",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "start-explain-simple"
    ],
    "next": [
      "first-project",
      "basics",
      "platform"
    ],
    "steps": [
      {
        "id": "in-1"
      },
      {
        "id": "in-2"
      },
      {
        "id": "in-3"
      },
      {
        "id": "in-4"
      },
      {
        "id": "in-5"
      }
    ]
  },
  "platform": {
    "nodeId": "platform",
    "icon": "tag",
    "level": "beginner",
    "prerequisites": [
      "intro"
    ],
    "relatedPrompts": [
      "start-give-options",
      "business-positioning"
    ],
    "next": [
      "intro",
      "basics"
    ],
    "steps": [
      {
        "id": "pl-1"
      },
      {
        "id": "pl-2"
      },
      {
        "id": "pl-3"
      },
      {
        "id": "pl-4"
      },
      {
        "id": "pl-5"
      }
    ]
  },
  "capabilities": {
    "nodeId": "capabilities",
    "icon": "eye",
    "level": "beginner",
    "prerequisites": [
      "intro"
    ],
    "relatedPrompts": [
      "analysis-structure-doc",
      "expert-audit",
      "consistency-audit"
    ],
    "next": [
      "intro",
      "projects"
    ],
    "steps": [
      {
        "id": "cap-1"
      },
      {
        "id": "cap-2"
      },
      {
        "id": "cap-3"
      },
      {
        "id": "cap-4"
      },
      {
        "id": "cap-5"
      },
      {
        "id": "cap-6"
      }
    ]
  },
  "prompting-techniques": {
    "nodeId": "prompting",
    "icon": "testtube",
    "level": "intermediate",
    "prerequisites": [
      "basics",
      "prompting"
    ],
    "relatedPrompts": [
      "prompting-improve",
      "start-step-by-step",
      "start-role-task"
    ],
    "next": [
      "ready-prompts",
      "pr-iterate"
    ],
    "steps": [
      {
        "id": "pt-1"
      },
      {
        "id": "pt-2"
      },
      {
        "id": "pt-3"
      },
      {
        "id": "pt-4"
      },
      {
        "id": "pt-5"
      },
      {
        "id": "pt-6"
      },
      {
        "id": "pt-7"
      }
    ]
  },
  "subagents": {
    "nodeId": "cc-subagents",
    "icon": "robot",
    "level": "advanced",
    "prerequisites": [
      "skills"
    ],
    "relatedPrompts": [
      "create-skill"
    ],
    "next": [
      "agents",
      "s-vs-subagents"
    ],
    "steps": [
      {
        "id": "sa-1"
      },
      {
        "id": "sa-2"
      },
      {
        "id": "sa-3"
      },
      {
        "id": "sa-4"
      },
      {
        "id": "sa-5"
      },
      {
        "id": "sa-6"
      }
    ]
  },
  "tool-use": {
    "nodeId": "cap-tools",
    "icon": "tools",
    "level": "advanced",
    "prerequisites": [
      "capabilities",
      "prompting-techniques"
    ],
    "relatedPrompts": [
      "prompting-schema",
      "prompting-constraints"
    ],
    "next": [
      "cap-tools",
      "mcp",
      "agents"
    ],
    "steps": [
      {
        "id": "tu-1"
      },
      {
        "id": "tu-2"
      },
      {
        "id": "tu-3"
      },
      {
        "id": "tu-4"
      },
      {
        "id": "tu-5"
      },
      {
        "id": "tu-6"
      }
    ]
  },
  "hooks": {
    "nodeId": "cc-hooks",
    "icon": "hook",
    "level": "advanced",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [
      "code-review"
    ],
    "next": [
      "cc-hooks",
      "cc-cfg-permissions"
    ],
    "steps": [
      {
        "id": "hk-1"
      },
      {
        "id": "hk-2"
      },
      {
        "id": "hk-3"
      },
      {
        "id": "hk-4"
      },
      {
        "id": "hk-5"
      },
      {
        "id": "hk-6"
      }
    ]
  },
  "first-project": {
    "nodeId": "b-first-steps",
    "icon": "rocket",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task"
    ],
    "next": [
      "basics",
      "claude-code"
    ],
    "steps": [
      { "id": "fp-1" },
      { "id": "fp-2" },
      { "id": "fp-3" },
      { "id": "fp-4" },
      { "id": "fp-5" },
      { "id": "fp-6" },
      { "id": "fp-7" },
      { "id": "fp-8" },
      { "id": "fp-9" },
      { "id": "fp-10" }
    ]
  },
  "terminal-tour": {
    "nodeId": "fs-terminal",
    "icon": "terminal",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "folders-workshop",
      "first-project"
    ],
    "steps": [
      { "id": "tt-1" },
      { "id": "tt-2" },
      { "id": "tt-3" },
      { "id": "tt-4" },
      { "id": "tt-5" }
    ]
  },
  "folders-workshop": {
    "nodeId": "fs-folder-create",
    "icon": "folder-plus",
    "level": "beginner",
    "prerequisites": [
      "terminal-tour"
    ],
    "relatedPrompts": [],
    "next": [
      "first-project"
    ],
    "steps": [
      { "id": "fw-1" },
      { "id": "fw-2" },
      { "id": "fw-3" },
      { "id": "fw-4" },
      { "id": "fw-5" }
    ]
  },
  "welcome": {
    "nodeId": "b-claude",
    "icon": "rocket",
    "level": "beginner",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "instructions",
      "projects",
      "first-project"
    ],
    "steps": [
      { "id": "w-1" },
      { "id": "w-2" },
      { "id": "w-3" },
      { "id": "w-4" },
      { "id": "w-5" },
      { "id": "w-6" },
      { "id": "w-7" },
      { "id": "w-8" }
    ]
  }
};

// Список ID всех туториалов для подсчёта прогресса.
export const tutorialIds = Object.keys(tutorials);

/**
 * Обратный индекс: nodeId → tutorial key.
 * Приоритет: ключ, совпадающий с nodeId (точное совпадение), иначе последний в списке.
 * Используется в DetailPanel, tutorialState и onStartTutorial.
 */
export const tutorialByNodeId = Object.entries(tutorials).reduce((acc, [key, t]) => {
  // Exact match (key === nodeId) always wins.
  // If no exact match yet, last processed wins (allows 'welcome' to overwrite 'intro' for b-claude).
  if (!acc[t.nodeId] || key === t.nodeId || acc[t.nodeId] !== t.nodeId) {
    acc[t.nodeId] = key;
  }
  return acc;
}, {});
