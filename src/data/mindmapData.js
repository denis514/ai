// Структура mindmap: id, icon, category, children, relatedIds, minLevel, isRoot.
// Текстовый контент (title + details) — в src/locales/<lang>/nodes.json.
// Резолвинг через t() / useNodeContent() из src/i18n/.

export const CATEGORIES = {
  "основы": {
    "label": "Основы",
    "color": "#2563eb"
  },
  "настройка": {
    "label": "Настройка",
    "color": "#0891b2"
  },
  "автоматизация": {
    "label": "Автоматизация",
    "color": "#7c3aed"
  },
  "промпты": {
    "label": "Промпты",
    "color": "#d97706"
  },
  "агенты": {
    "label": "Агентные сценарии",
    "color": "#dc2626"
  }
};

export const FILTER_CATEGORIES = [
  {
    "id": "all",
    "label": "Все"
  },
  {
    "id": "основы",
    "label": "Основы"
  },
  {
    "id": "настройка",
    "label": "Настройка"
  },
  {
    "id": "автоматизация",
    "label": "Автоматизация"
  },
  {
    "id": "промпты",
    "label": "Промпты"
  },
  {
    "id": "агенты",
    "label": "Агентные сценарии"
  }
];

export const mindmapData = {
  "id": "root",
  "icon": "sparkles",
  "category": "основы",
  "isRoot": true,
  "children": [
    {
      "id": "basics",
      "icon": "brain",
      "category": "основы",
      "minLevel": "beginner",
      "children": [
        {
          "id": "b-claude",
          "icon": "sparkles",
          "category": "основы"
        },
        {
          "id": "b-anthropic",
          "icon": "building",
          "category": "основы"
        },
        {
          "id": "b-models",
          "icon": "sliders",
          "category": "основы"
        },
        {
          "id": "b-context",
          "icon": "scroll",
          "category": "основы",
          "relatedIds": [
            "pr-cot",
            "projects",
            "cc-cmd-compact",
            "cc-cmd-clear"
          ]
        },
        {
          "id": "b-system",
          "icon": "mixer",
          "category": "основы",
          "relatedIds": [
            "pr-role",
            "instructions",
            "cc-md"
          ]
        },
        {
          "id": "b-safety",
          "icon": "shield",
          "category": "основы"
        },
        {
          "id": "b-prompt-injection",
          "icon": "lock",
          "category": "основы",
          "relatedIds": [
            "b-safety",
            "m-security",
            "cc-cfg-permissions"
          ]
        },
        {
          "id": "b-knowledge",
          "icon": "calendar",
          "category": "основы"
        },
        {
          "id": "b-help",
          "icon": "compass",
          "category": "основы"
        },
        {
          "id": "b-first-steps",
          "icon": "rocket",
          "category": "основы",
          "minLevel": "beginner",
          "children": [
            {
              "id": "fs-what-is-project",
              "icon": "folder",
              "category": "основы"
            },
            {
              "id": "fs-organize-disk",
              "icon": "folder",
              "category": "основы"
            },
            {
              "id": "fs-terminal",
              "icon": "terminal",
              "category": "основы",
              "relatedIds": [
                "cc-install",
                "fs-navigate"
              ]
            },
            {
              "id": "fs-folder-create",
              "icon": "folder-plus",
              "category": "основы"
            },
            {
              "id": "fs-navigate",
              "icon": "search",
              "category": "основы"
            },
            {
              "id": "fs-install-node",
              "icon": "download",
              "category": "основы",
              "relatedIds": [
                "cc-install"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "platform",
      "icon": "globe",
      "category": "основы",
      "minLevel": "beginner",
      "children": [
        {
          "id": "pl-plans",
          "icon": "tag",
          "category": "основы"
        },
        {
          "id": "pl-limits",
          "icon": "clock",
          "category": "основы"
        },
        {
          "id": "pl-models",
          "icon": "sliders",
          "category": "основы",
          "relatedIds": [
            "b-models",
            "pl-plans"
          ]
        },
        {
          "id": "pl-platforms",
          "icon": "compass",
          "category": "основы"
        },
        {
          "id": "pl-rate",
          "icon": "flash",
          "category": "основы",
          "relatedIds": [
            "cap-caching"
          ]
        },
        {
          "id": "pl-compare",
          "icon": "mixer",
          "category": "основы",
          "relatedIds": [
            "pl-platforms",
            "pl-plans",
            "cc-install"
          ]
        },
        {
          "id": "pl-web-setup",
          "icon": "globe",
          "category": "основы",
          "relatedIds": ["i-global", "projects", "pl-plans"]
        },
        {
          "id": "pl-desktop",
          "icon": "laptop",
          "category": "основы",
          "relatedIds": ["mcp", "pl-platforms", "pl-compare"]
        },
        {
          "id": "pl-cowork",
          "icon": "robot",
          "category": "основы",
          "relatedIds": ["pl-desktop", "agents", "cap-computer", "cc-subagents"]
        },
        {
          "id": "pl-integrations",
          "icon": "plug",
          "category": "основы",
          "relatedIds": ["pl-desktop", "mcp", "pl-cowork", "pl-compare"]
        },
        {
          "id": "pl-api",
          "icon": "code",
          "category": "основы",
          "relatedIds": ["cap-tools", "mcp", "ag-principles"]
        },
        {
          "id": "pl-privacy",
          "icon": "lock",
          "category": "основы"
        }
      ]
    },
    {
      "id": "instructions",
      "icon": "settings",
      "category": "настройка",
      "minLevel": "beginner",
      "relatedIds": [
        "b-system",
        "projects",
        "cc-md"
      ],
      "children": [
        {
          "id": "i-global",
          "icon": "globe",
          "category": "настройка"
        },
        {
          "id": "i-project",
          "icon": "folder",
          "category": "настройка"
        },
        {
          "id": "i-claudemd",
          "icon": "book",
          "category": "настройка"
        },
        {
          "id": "i-style",
          "icon": "edit",
          "category": "настройка"
        },
        {
          "id": "i-templates",
          "icon": "clipboard",
          "category": "настройка"
        }
      ]
    },
    {
      "id": "projects",
      "icon": "folder",
      "category": "настройка",
      "minLevel": "beginner",
      "relatedIds": [
        "instructions",
        "skills",
        "cc-md"
      ],
      "children": [
        {
          "id": "p-files",
          "icon": "attachment",
          "category": "настройка"
        },
        {
          "id": "p-instructions",
          "icon": "settings",
          "category": "настройка"
        },
        {
          "id": "p-team",
          "icon": "users",
          "category": "настройка"
        },
        {
          "id": "p-when",
          "icon": "target",
          "category": "настройка"
        }
      ]
    },
    {
      "id": "artifacts",
      "icon": "paint",
      "category": "основы",
      "minLevel": "beginner",
      "children": [
        {
          "id": "a-types",
          "icon": "puzzle",
          "category": "основы"
        },
        {
          "id": "a-trigger",
          "icon": "flash",
          "category": "основы"
        },
        {
          "id": "a-iterate",
          "icon": "repeat",
          "category": "основы"
        },
        {
          "id": "a-edit",
          "icon": "pencil",
          "category": "основы"
        }
      ]
    },
    {
      "id": "capabilities",
      "icon": "flash",
      "category": "основы",
      "minLevel": "intermediate",
      "children": [
        {
          "id": "cap-vision",
          "icon": "eye",
          "category": "основы"
        },
        {
          "id": "cap-files",
          "icon": "file",
          "category": "основы"
        },
        {
          "id": "cap-search",
          "icon": "search",
          "category": "основы",
          "relatedIds": [
            "b-knowledge"
          ]
        },
        {
          "id": "cap-memory",
          "icon": "brain",
          "category": "основы",
          "relatedIds": [
            "projects",
            "cap-tools"
          ]
        },
        {
          "id": "cap-computer",
          "icon": "laptop",
          "category": "основы"
        },
        {
          "id": "cap-tools",
          "icon": "tools",
          "category": "основы",
          "relatedIds": [
            "mcp",
            "cc-subagents"
          ]
        },
        {
          "id": "cap-caching",
          "icon": "repeat",
          "category": "основы"
        },
        {
          "id": "cap-citations",
          "icon": "quote",
          "category": "основы"
        },
        {
          "id": "cap-code-exec",
          "icon": "command",
          "category": "основы",
          "relatedIds": [
            "cap-files",
            "cap-tools"
          ]
        },
        {
          "id": "cap-thinking",
          "icon": "brain",
          "category": "основы",
          "relatedIds": [
            "b-models",
            "cap-tools"
          ]
        },
        {
          "id": "cap-limitations",
          "icon": "shield",
          "category": "основы",
          "relatedIds": [
            "b-models",
            "b-knowledge",
            "b-safety"
          ]
        }
      ]
    },
    {
      "id": "prompting",
      "icon": "note",
      "category": "промпты",
      "minLevel": "intermediate",
      "children": [
        {
          "id": "pr-4d",
          "icon": "compass",
          "category": "промпты",
          "relatedIds": ["pr-principles", "cap-limitations", "pr-iterate"]
        },
        {
          "id": "pr-principles",
          "icon": "compass",
          "category": "промпты"
        },
        {
          "id": "pr-xml",
          "icon": "tag",
          "category": "промпты"
        },
        {
          "id": "pr-fewshot",
          "icon": "target",
          "category": "промпты"
        },
        {
          "id": "pr-cot",
          "icon": "link",
          "category": "промпты"
        },
        {
          "id": "pr-role",
          "icon": "mask",
          "category": "промпты"
        },
        {
          "id": "pr-prefill",
          "icon": "pencil",
          "category": "промпты",
          "relatedIds": [
            "pr-fewshot"
          ]
        },
        {
          "id": "pr-structured",
          "icon": "puzzle",
          "category": "промпты",
          "relatedIds": [
            "pr-prefill",
            "cap-tools"
          ]
        },
        {
          "id": "pr-iterate",
          "icon": "testtube",
          "category": "промпты"
        },
        {
          "id": "ready-prompts",
          "icon": "clipboard",
          "category": "промпты",
          "children": [
            {
              "id": "rp-project",
              "icon": "folder",
              "category": "промпты"
            },
            {
              "id": "rp-artifact",
              "icon": "paint",
              "category": "промпты"
            },
            {
              "id": "rp-skill",
              "icon": "tools",
              "category": "промпты"
            },
            {
              "id": "rp-claudemd",
              "icon": "book",
              "category": "промпты"
            },
            {
              "id": "rp-audit",
              "icon": "search",
              "category": "промпты"
            }
          ]
        }
      ]
    },
    {
      "id": "skills",
      "icon": "tools",
      "category": "автоматизация",
      "minLevel": "intermediate",
      "relatedIds": [
        "cc-subagents",
        "cc-md",
        "projects"
      ],
      "children": [
        {
          "id": "s-md",
          "icon": "file",
          "category": "автоматизация"
        },
        {
          "id": "s-trigger",
          "icon": "target",
          "category": "автоматизация"
        },
        {
          "id": "s-files",
          "icon": "archive",
          "category": "автоматизация"
        },
        {
          "id": "s-ready",
          "icon": "cube",
          "category": "автоматизация"
        },
        {
          "id": "s-create",
          "icon": "sparkles",
          "category": "автоматизация"
        },
        {
          "id": "s-vs-subagents",
          "icon": "puzzle",
          "category": "автоматизация",
          "relatedIds": [
            "cc-subagents",
            "agents"
          ]
        }
      ]
    },
    {
      "id": "scenarios",
      "icon": "target",
      "category": "основы",
      "minLevel": "intermediate",
      "children": [
        {
          "id": "sc-analysis",
          "icon": "search",
          "category": "основы"
        },
        {
          "id": "sc-coding",
          "icon": "keyboard",
          "category": "основы"
        },
        {
          "id": "sc-design",
          "icon": "paint",
          "category": "основы"
        },
        {
          "id": "sc-content",
          "icon": "edit",
          "category": "основы"
        },
        {
          "id": "sc-research",
          "icon": "microscope",
          "category": "основы"
        },
        {
          "id": "sc-data",
          "icon": "chart",
          "category": "основы",
          "relatedIds": [
            "cap-files",
            "cap-code-exec"
          ]
        }
      ]
    },
    {
      "id": "claude-code",
      "icon": "laptop",
      "category": "автоматизация",
      "minLevel": "advanced",
      "children": [
        {
          "id": "cc-install",
          "icon": "inbox",
          "category": "автоматизация",
          "relatedIds": [
            "fs-install-node",
            "fs-terminal"
          ]
        },
        {
          "id": "cc-terminal",
          "icon": "keyboard",
          "category": "автоматизация",
          "children": [
            {
              "id": "cc-tty-sessions",
              "icon": "repeat",
              "category": "автоматизация"
            },
            {
              "id": "cc-tty-files",
              "icon": "file",
              "category": "автоматизация"
            },
            {
              "id": "cc-tty-modes",
              "icon": "compass",
              "category": "автоматизация"
            },
            {
              "id": "cc-tty-keys",
              "icon": "flash",
              "category": "автоматизация"
            }
          ]
        },
        {
          "id": "cc-config",
          "icon": "settings",
          "category": "автоматизация",
          "children": [
            {
              "id": "cc-cfg-settings",
              "icon": "note",
              "category": "автоматизация"
            },
            {
              "id": "cc-cfg-local",
              "icon": "lock",
              "category": "автоматизация"
            },
            {
              "id": "cc-cfg-global",
              "icon": "globe",
              "category": "автоматизация"
            },
            {
              "id": "cc-cfg-permissions",
              "icon": "shield",
              "category": "автоматизация"
            },
            {
              "id": "cc-cfg-statusline",
              "icon": "mixer",
              "category": "автоматизация"
            }
          ]
        },
        {
          "id": "cc-slash",
          "icon": "command",
          "category": "автоматизация",
          "children": [
            {
              "id": "cc-grp-session",
              "icon": "repeat",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-context",
              "icon": "folder",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-model",
              "icon": "mixer",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-ui",
              "icon": "paint",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-config",
              "icon": "settings",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-integrations",
              "icon": "plug",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-automation",
              "icon": "rocket",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-quality",
              "icon": "microscope",
              "category": "автоматизация"
            },
            {
              "id": "cc-grp-help",
              "icon": "question",
              "category": "автоматизация"
            }
          ]
        },
        {
          "id": "cc-hooks",
          "icon": "hook",
          "category": "автоматизация"
        },
        {
          "id": "cc-md",
          "icon": "book",
          "category": "автоматизация"
        },
        {
          "id": "cc-subagents",
          "icon": "robot",
          "category": "автоматизация",
          "relatedIds": [
            "skills",
            "agents",
            "mcp"
          ]
        },
        {
          "id": "cc-plan-mode",
          "icon": "clipboard",
          "category": "автоматизация",
          "relatedIds": [
            "cc-tty-modes",
            "cc-subagents"
          ]
        },
        {
          "id": "cc-ide",
          "icon": "developer",
          "category": "автоматизация",
          "relatedIds": [
            "cc-install",
            "pl-platforms"
          ]
        }
      ]
    },
    {
      "id": "mcp",
      "icon": "plug",
      "category": "автоматизация",
      "minLevel": "advanced",
      "relatedIds": [
        "cc-subagents",
        "agents"
      ],
      "children": [
        {
          "id": "m-what",
          "icon": "question",
          "category": "автоматизация"
        },
        {
          "id": "m-ready",
          "icon": "store",
          "category": "автоматизация"
        },
        {
          "id": "m-custom",
          "icon": "construction",
          "category": "автоматизация"
        },
        {
          "id": "m-security",
          "icon": "lock",
          "category": "автоматизация",
          "relatedIds": [
            "cc-cfg-permissions"
          ]
        },
        {
          "id": "m-patterns",
          "icon": "puzzle",
          "category": "автоматизация"
        },
        {
          "id": "m-debug",
          "icon": "microscope",
          "category": "автоматизация"
        }
      ]
    },
    {
      "id": "agents",
      "icon": "robot",
      "category": "агенты",
      "minLevel": "advanced",
      "relatedIds": [
        "cc-subagents",
        "skills",
        "mcp"
      ],
      "children": [
        {
          "id": "ag-principles",
          "icon": "bricks",
          "category": "агенты",
          "relatedIds": [
            "cc-subagents",
            "skills",
            "cap-tools"
          ]
        },
        {
          "id": "ag-code",
          "icon": "developer",
          "category": "агенты"
        },
        {
          "id": "ag-ux",
          "icon": "search",
          "category": "агенты"
        },
        {
          "id": "ag-research",
          "icon": "books",
          "category": "агенты"
        },
        {
          "id": "ag-designer",
          "icon": "paint",
          "category": "агенты"
        },
        {
          "id": "ag-pm",
          "icon": "chart",
          "category": "агенты"
        },
        {
          "id": "ag-managed",
          "icon": "rocket",
          "category": "агенты",
          "relatedIds": [
            "ag-principles",
            "mcp",
            "cap-tools"
          ]
        }
      ]
    }
  ]
};

/**
 * Плоский индекс id → узел (структура).
 */
function buildNodeIndex(root, acc = {}) {
  acc[root.id] = root;
  if (root.children) for (const c of root.children) buildNodeIndex(c, acc);
  return acc;
}
export const nodeIndex = buildNodeIndex(mindmapData);

/**
 * Двусторонний индекс связей.
 */
function buildRelatedIndex() {
  const map = {};
  for (const id of Object.keys(nodeIndex)) map[id] = new Set();
  for (const id of Object.keys(nodeIndex)) {
    const node = nodeIndex[id];
    const related = node.relatedIds || [];
    for (const otherId of related) {
      if (otherId === id) continue;
      if (!nodeIndex[otherId]) continue;
      map[id].add(otherId);
      map[otherId].add(id);
    }
  }
  const out = {};
  for (const [id, set] of Object.entries(map)) {
    if (set.size > 0) out[id] = Array.from(set);
  }
  return out;
}
export const relatedIndex = buildRelatedIndex();

export function getRelatedNodes(id) {
  const ids = relatedIndex[id] || [];
  return ids.map(rid => nodeIndex[rid]).filter(Boolean);
}
