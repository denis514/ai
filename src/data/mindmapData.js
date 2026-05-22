// Структура mindmap: id, icon, category, children, relatedIds, minLevel, isRoot.
// Текстовый контент (title + details) — в src/locales/<lang>/nodes.json.
// Резолвинг через t() / useNodeContent() из src/i18n/.

export const CATEGORIES = {
  "foundation": {
    "label": "Foundation",
    "color": "#2563eb"
  },
  "configuration": {
    "label": "Configuration",
    "color": "#0e7490"
  },
  "prompts": {
    "label": "Prompts",
    "color": "#d97706"
  },
  "automation": {
    "label": "Automation",
    "color": "#7c3aed"
  },
  "agents": {
    "label": "Agents",
    "color": "#dc2626"
  },
  "systems": {
    "label": "Systems",
    "color": "#0891b2"
  },
  "transformation": {
    "label": "Transformation",
    "color": "#059669"
  },
  "use-cases": {
    "label": "Use Cases",
    "color": "#f59e0b"
  }
};

export const FILTER_CATEGORIES = [
  {
    "id": "all",
    "label": "Все"
  },
  {
    "id": "foundation",
    "label": "Foundation"
  },
  {
    "id": "configuration",
    "label": "Configuration"
  },
  {
    "id": "prompts",
    "label": "Prompts"
  },
  {
    "id": "automation",
    "label": "Automation"
  },
  {
    "id": "agents",
    "label": "Agents"
  },
  {
    "id": "systems",
    "label": "Systems"
  },
  {
    "id": "transformation",
    "label": "Transformation"
  },
  {
    "id": "use-cases",
    "label": "Use Cases"
  }
];

export const mindmapData = {
  "id": "root",
  "icon": "sparkles",
  "category": "foundation",
  "isRoot": true,
  "children": [
    {
      "id": "foundation",
      "icon": "brain",
      "category": "foundation",
      "minLevel": "beginner",
      "children": [
        {
          "id": "ai-fundamentals",
          "icon": "microscope",
          "category": "foundation",
          "minLevel": "beginner",
          "children": [
            {
              "id": "af-llm-basics",
              "icon": "cube",
              "category": "foundation",
              "relatedIds": [
                "b-claude",
                "b-models",
                "b-context"
              ]
            },
            {
              "id": "af-embeddings",
              "icon": "compass",
              "category": "foundation",
              "relatedIds": [
                "cap-search",
                "af-rag-basics",
                "af-vector-db"
              ]
            },
            {
              "id": "af-vector-db",
              "icon": "bricks",
              "category": "foundation",
              "relatedIds": [
                "af-embeddings",
                "af-rag-basics"
              ]
            },
            {
              "id": "af-rag-basics",
              "icon": "archive",
              "category": "foundation",
              "relatedIds": [
                "af-embeddings",
                "af-vector-db",
                "cap-citations",
                "cap-files"
              ]
            },
            {
              "id": "af-memory-systems",
              "icon": "book",
              "category": "foundation",
              "relatedIds": [
                "cap-memory",
                "af-rag-basics",
                "p-files"
              ]
            },
            {
              "id": "af-multimodal",
              "icon": "paint",
              "category": "foundation",
              "relatedIds": [
                "cap-vision",
                "cap-files",
                "af-llm-basics"
              ]
            },
            {
              "id": "af-fine-tuning",
              "icon": "mixer",
              "category": "foundation",
              "relatedIds": [
                "prompting",
                "af-llm-basics",
                "instructions"
              ]
            }
          ]
        },
        {
          "id": "basics",
          "icon": "brain",
          "category": "foundation",
          "minLevel": "beginner",
          "children": [
            {
              "id": "b-claude",
              "icon": "sparkles",
              "category": "foundation"
            },
            {
              "id": "b-anthropic",
              "icon": "building",
              "category": "foundation"
            },
            {
              "id": "b-models",
              "icon": "sliders",
              "category": "foundation"
            },
            {
              "id": "b-context",
              "icon": "scroll",
              "category": "foundation",
              "relatedIds": [
                "pr-cot",
                "projects"
              ]
            },
            {
              "id": "b-system",
              "icon": "mixer",
              "category": "foundation",
              "relatedIds": [
                "pr-role",
                "instructions",
                "cc-md"
              ]
            },
            {
              "id": "b-safety",
              "icon": "shield",
              "category": "foundation"
            },
            {
              "id": "b-prompt-injection",
              "icon": "lock",
              "category": "foundation",
              "relatedIds": [
                "b-safety",
                "m-security",
                "cc-cfg-permissions"
              ]
            },
            {
              "id": "b-knowledge",
              "icon": "calendar",
              "category": "foundation"
            },
            {
              "id": "b-help",
              "icon": "compass",
              "category": "foundation"
            },
            {
              "id": "b-first-steps",
              "icon": "rocket",
              "category": "foundation",
              "minLevel": "beginner",
              "children": [
                {
                  "id": "fs-what-is-project",
                  "icon": "folder",
                  "category": "foundation"
                },
                {
                  "id": "fs-organize-disk",
                  "icon": "folder",
                  "category": "foundation"
                },
                {
                  "id": "fs-terminal",
                  "icon": "terminal",
                  "category": "foundation",
                  "relatedIds": [
                    "cc-install",
                    "fs-navigate"
                  ]
                },
                {
                  "id": "fs-folder-create",
                  "icon": "folder-plus",
                  "category": "foundation"
                },
                {
                  "id": "fs-navigate",
                  "icon": "search",
                  "category": "foundation"
                },
                {
                  "id": "fs-install-node",
                  "icon": "download",
                  "category": "foundation",
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
          "category": "foundation",
          "minLevel": "beginner",
          "children": [
            {
              "id": "pl-plans",
              "icon": "tag",
              "category": "foundation"
            },
            {
              "id": "pl-limits",
              "icon": "clock",
              "category": "foundation"
            },
            {
              "id": "pl-models",
              "icon": "sliders",
              "category": "foundation",
              "relatedIds": [
                "b-models",
                "pl-plans"
              ]
            },
            {
              "id": "pl-platforms",
              "icon": "compass",
              "category": "foundation"
            },
            {
              "id": "pl-rate",
              "icon": "flash",
              "category": "foundation",
              "relatedIds": [
                "cap-caching"
              ]
            },
            {
              "id": "pl-compare",
              "icon": "mixer",
              "category": "foundation",
              "relatedIds": [
                "pl-platforms",
                "pl-plans",
                "cc-install"
              ]
            },
            {
              "id": "pl-web-setup",
              "icon": "globe",
              "category": "foundation",
              "relatedIds": [
                "i-global",
                "projects",
                "pl-plans"
              ]
            },
            {
              "id": "pl-desktop",
              "icon": "laptop",
              "category": "foundation",
              "relatedIds": [
                "mcp",
                "pl-platforms",
                "pl-compare"
              ]
            },
            {
              "id": "pl-cowork",
              "icon": "robot",
              "category": "foundation",
              "relatedIds": [
                "pl-desktop",
                "agents",
                "cap-computer",
                "cc-subagents"
              ]
            },
            {
              "id": "pl-integrations",
              "icon": "plug",
              "category": "foundation",
              "relatedIds": [
                "pl-desktop",
                "mcp",
                "pl-cowork",
                "pl-compare"
              ]
            },
            {
              "id": "pl-api",
              "icon": "terminal",
              "category": "foundation",
              "relatedIds": [
                "cap-tools",
                "mcp",
                "ag-principles"
              ]
            },
            {
              "id": "pl-privacy",
              "icon": "lock",
              "category": "foundation"
            }
          ]
        },
        {
          "id": "instructions",
          "icon": "settings",
          "category": "configuration",
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
              "category": "configuration"
            },
            {
              "id": "i-project",
              "icon": "folder",
              "category": "configuration"
            },
            {
              "id": "i-claudemd",
              "icon": "book",
              "category": "configuration"
            },
            {
              "id": "i-style",
              "icon": "edit",
              "category": "configuration"
            },
            {
              "id": "i-templates",
              "icon": "clipboard",
              "category": "configuration"
            }
          ]
        },
        {
          "id": "projects",
          "icon": "folder",
          "category": "configuration",
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
              "category": "configuration"
            },
            {
              "id": "p-instructions",
              "icon": "settings",
              "category": "configuration"
            },
            {
              "id": "p-team",
              "icon": "users",
              "category": "configuration"
            },
            {
              "id": "p-when",
              "icon": "target",
              "category": "configuration"
            }
          ]
        },
        {
          "id": "artifacts",
          "icon": "paint",
          "category": "foundation",
          "minLevel": "beginner",
          "children": [
            {
              "id": "a-types",
              "icon": "puzzle",
              "category": "foundation"
            },
            {
              "id": "a-trigger",
              "icon": "flash",
              "category": "foundation"
            },
            {
              "id": "a-iterate",
              "icon": "repeat",
              "category": "foundation"
            },
            {
              "id": "a-edit",
              "icon": "pencil",
              "category": "foundation"
            }
          ]
        },
        {
          "id": "capabilities",
          "icon": "flash",
          "category": "foundation",
          "minLevel": "intermediate",
          "children": [
            {
              "id": "cap-vision",
              "icon": "eye",
              "category": "foundation"
            },
            {
              "id": "cap-files",
              "icon": "file",
              "category": "foundation"
            },
            {
              "id": "cap-search",
              "icon": "search",
              "category": "foundation",
              "relatedIds": [
                "b-knowledge"
              ]
            },
            {
              "id": "cap-memory",
              "icon": "brain",
              "category": "foundation",
              "relatedIds": [
                "projects",
                "cap-tools"
              ]
            },
            {
              "id": "cap-computer",
              "icon": "laptop",
              "category": "foundation"
            },
            {
              "id": "cap-tools",
              "icon": "tools",
              "category": "foundation",
              "relatedIds": [
                "mcp",
                "cc-subagents"
              ]
            },
            {
              "id": "cap-caching",
              "icon": "repeat",
              "category": "foundation"
            },
            {
              "id": "cap-citations",
              "icon": "quote",
              "category": "foundation"
            },
            {
              "id": "cap-code-exec",
              "icon": "command",
              "category": "foundation",
              "relatedIds": [
                "cap-files",
                "cap-tools"
              ]
            },
            {
              "id": "cap-thinking",
              "icon": "brain",
              "category": "foundation",
              "relatedIds": [
                "b-models",
                "cap-tools"
              ]
            },
            {
              "id": "cap-limitations",
              "icon": "shield",
              "category": "foundation",
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
          "category": "prompts",
          "minLevel": "intermediate",
          "children": [
            {
              "id": "pr-4d",
              "icon": "compass",
              "category": "prompts",
              "relatedIds": [
                "pr-principles",
                "cap-limitations",
                "pr-iterate"
              ]
            },
            {
              "id": "pr-principles",
              "icon": "compass",
              "category": "prompts"
            },
            {
              "id": "pr-xml",
              "icon": "tag",
              "category": "prompts"
            },
            {
              "id": "pr-fewshot",
              "icon": "target",
              "category": "prompts"
            },
            {
              "id": "pr-cot",
              "icon": "link",
              "category": "prompts"
            },
            {
              "id": "pr-role",
              "icon": "mask",
              "category": "prompts"
            },
            {
              "id": "pr-prefill",
              "icon": "pencil",
              "category": "prompts",
              "relatedIds": [
                "pr-fewshot"
              ]
            },
            {
              "id": "pr-structured",
              "icon": "puzzle",
              "category": "prompts",
              "relatedIds": [
                "pr-prefill",
                "cap-tools"
              ]
            },
            {
              "id": "pr-iterate",
              "icon": "testtube",
              "category": "prompts"
            },
            {
              "id": "ready-prompts",
              "icon": "clipboard",
              "category": "prompts",
              "children": [
                {
                  "id": "rp-project",
                  "icon": "folder",
                  "category": "prompts"
                },
                {
                  "id": "rp-artifact",
                  "icon": "paint",
                  "category": "prompts"
                },
                {
                  "id": "rp-skill",
                  "icon": "tools",
                  "category": "prompts"
                },
                {
                  "id": "rp-claudemd",
                  "icon": "book",
                  "category": "prompts"
                },
                {
                  "id": "rp-audit",
                  "icon": "search",
                  "category": "prompts"
                }
              ]
            }
          ]
        },
        {
          "id": "skills",
          "icon": "tools",
          "category": "automation",
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
              "category": "automation"
            },
            {
              "id": "s-trigger",
              "icon": "target",
              "category": "automation"
            },
            {
              "id": "s-files",
              "icon": "archive",
              "category": "automation"
            },
            {
              "id": "s-ready",
              "icon": "cube",
              "category": "automation"
            },
            {
              "id": "s-create",
              "icon": "sparkles",
              "category": "automation"
            },
            {
              "id": "s-vs-subagents",
              "icon": "puzzle",
              "category": "automation",
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
          "category": "foundation",
          "minLevel": "intermediate",
          "children": [
            {
              "id": "sc-analysis",
              "icon": "search",
              "category": "foundation"
            },
            {
              "id": "sc-coding",
              "icon": "keyboard",
              "category": "foundation"
            },
            {
              "id": "sc-design",
              "icon": "paint",
              "category": "foundation"
            },
            {
              "id": "sc-content",
              "icon": "edit",
              "category": "foundation"
            },
            {
              "id": "sc-research",
              "icon": "microscope",
              "category": "foundation"
            },
            {
              "id": "sc-data",
              "icon": "chart",
              "category": "foundation",
              "relatedIds": [
                "cap-files",
                "cap-code-exec"
              ]
            },
            {
              "id": "b-educators",
              "icon": "graduation",
              "category": "foundation"
            }
          ]
        },
        {
          "id": "claude-code",
          "icon": "laptop",
          "category": "automation",
          "minLevel": "advanced",
          "children": [
            {
              "id": "cc-install",
              "icon": "inbox",
              "category": "automation",
              "relatedIds": [
                "fs-install-node",
                "fs-terminal"
              ]
            },
            {
              "id": "cc-terminal",
              "icon": "keyboard",
              "category": "automation",
              "children": [
                {
                  "id": "cc-tty-sessions",
                  "icon": "repeat",
                  "category": "automation"
                },
                {
                  "id": "cc-tty-files",
                  "icon": "file",
                  "category": "automation"
                },
                {
                  "id": "cc-tty-modes",
                  "icon": "compass",
                  "category": "automation"
                },
                {
                  "id": "cc-tty-keys",
                  "icon": "flash",
                  "category": "automation"
                }
              ]
            },
            {
              "id": "cc-config",
              "icon": "settings",
              "category": "automation",
              "children": [
                {
                  "id": "cc-cfg-settings",
                  "icon": "note",
                  "category": "automation"
                },
                {
                  "id": "cc-cfg-local",
                  "icon": "lock",
                  "category": "automation"
                },
                {
                  "id": "cc-cfg-global",
                  "icon": "globe",
                  "category": "automation"
                },
                {
                  "id": "cc-cfg-permissions",
                  "icon": "shield",
                  "category": "automation"
                },
                {
                  "id": "cc-cfg-statusline",
                  "icon": "mixer",
                  "category": "automation"
                }
              ]
            },
            {
              "id": "cc-slash",
              "icon": "command",
              "category": "automation",
              "children": [
                {
                  "id": "cc-grp-session",
                  "icon": "repeat",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-context",
                  "icon": "folder",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-model",
                  "icon": "mixer",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-ui",
                  "icon": "paint",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-config",
                  "icon": "settings",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-integrations",
                  "icon": "plug",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-automation",
                  "icon": "rocket",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-quality",
                  "icon": "microscope",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-help",
                  "icon": "question",
                  "category": "automation"
                }
              ]
            },
            {
              "id": "cc-hooks",
              "icon": "hook",
              "category": "automation"
            },
            {
              "id": "cc-md",
              "icon": "book",
              "category": "automation"
            },
            {
              "id": "cc-subagents",
              "icon": "robot",
              "category": "automation",
              "relatedIds": [
                "skills",
                "agents",
                "mcp"
              ]
            },
            {
              "id": "cc-plan-mode",
              "icon": "clipboard",
              "category": "automation",
              "relatedIds": [
                "cc-tty-modes",
                "cc-subagents"
              ]
            },
            {
              "id": "cc-ide",
              "icon": "developer",
              "category": "automation",
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
          "category": "automation",
          "minLevel": "advanced",
          "relatedIds": [
            "cc-subagents",
            "agents"
          ],
          "children": [
            {
              "id": "m-what",
              "icon": "question",
              "category": "automation"
            },
            {
              "id": "m-ready",
              "icon": "store",
              "category": "automation"
            },
            {
              "id": "m-custom",
              "icon": "construction",
              "category": "automation"
            },
            {
              "id": "m-security",
              "icon": "lock",
              "category": "automation",
              "relatedIds": [
                "cc-cfg-permissions"
              ]
            },
            {
              "id": "m-patterns",
              "icon": "puzzle",
              "category": "automation"
            },
            {
              "id": "m-debug",
              "icon": "microscope",
              "category": "automation"
            }
          ]
        },
        {
          "id": "agents",
          "icon": "robot",
          "category": "agents",
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
              "category": "agents",
              "relatedIds": [
                "cc-subagents",
                "skills",
                "cap-tools"
              ]
            },
            {
              "id": "ag-code",
              "icon": "developer",
              "category": "agents"
            },
            {
              "id": "ag-ux",
              "icon": "search",
              "category": "agents"
            },
            {
              "id": "ag-research",
              "icon": "books",
              "category": "agents"
            },
            {
              "id": "ag-designer",
              "icon": "paint",
              "category": "agents"
            },
            {
              "id": "ag-pm",
              "icon": "chart",
              "category": "agents"
            },
            {
              "id": "ag-managed",
              "icon": "rocket",
              "category": "agents",
              "relatedIds": [
                "ag-principles",
                "mcp",
                "cap-tools"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "systems",
      "icon": "network",
      "category": "systems",
      "children": [
        {
          "id": "sys-overview",
          "icon": "sparkles",
          "category": "systems"
        }
      ]
    },
    {
      "id": "transformation",
      "icon": "rocket",
      "category": "transformation",
      "children": [
        {
          "id": "tf-overview",
          "icon": "sparkles",
          "category": "transformation"
        },
        {
          "id": "ai-native-operations",
          "icon": "settings",
          "category": "transformation",
          "children": [
            {
              "id": "ops-process-automation",
              "icon": "repeat",
              "category": "transformation",
              "relatedIds": [
                "skills",
                "cc-hooks",
                "ai-fundamentals",
                "af-rag-basics"
              ]
            },
            {
              "id": "ops-decision-intelligence",
              "icon": "idea",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "af-llm-basics",
                "prompting"
              ]
            },
            {
              "id": "ops-reporting-automation",
              "icon": "chart",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "projects",
                "af-rag-basics",
                "prompting"
              ]
            },
            {
              "id": "ops-resource-optimization",
              "icon": "sliders",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "af-llm-basics",
                "cap-caching"
              ]
            },
            {
              "id": "ops-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
                "projects",
                "p-team",
                "instructions",
                "skills"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "use-cases",
      "icon": "target",
      "category": "use-cases",
      "children": [
        {
          "id": "uc-overview",
          "icon": "sparkles",
          "category": "use-cases"
        },
        {
          "id": "uc-ai-reporting-launch",
          "icon": "clipboard",
          "category": "use-cases",
          "relatedIds": [
            "ops-reporting-automation",
            "af-rag-basics",
            "prompting",
            "projects",
            "i-claudemd",
            "sc-data"
          ]
        },
        {
          "id": "uc-ai-process-automation",
          "icon": "puzzle",
          "category": "use-cases",
          "relatedIds": [
            "ops-process-automation",
            "skills",
            "s-create",
            "cc-hooks",
            "mcp",
            "prompting"
          ]
        },
        {
          "id": "uc-ai-decision-support",
          "icon": "compass",
          "category": "use-cases",
          "relatedIds": [
            "ops-decision-intelligence",
            "sc-data",
            "sc-analysis",
            "af-llm-basics",
            "prompting",
            "pr-cot"
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
