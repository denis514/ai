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
  "relatedIds": [
    "claude-code"
  ],
  "isRoot": true,
  "children": [
    {
      "id": "foundation",
      "icon": "brain",
      "category": "foundation",
      "relatedIds": [
            "ai-fundamentals",
            "b-claude",
            "b-context",
            "systems",
            "transformation",
            "use-cases",
            "af-embeddings"
          ],
      "minLevel": "beginner",
      "children": [
        {
          "id": "ai-fundamentals",
          "icon": "microscope",
          "category": "foundation",
          "relatedIds": [
            "af-embeddings",
            "af-vector-db"
          ],
          "minLevel": "beginner",
          "children": [
            {
              "id": "af-llm-basics",
              "icon": "cube",
              "category": "foundation",
              "relatedIds": [
            "b-claude",
            "b-models",
            "b-context",
            "cap-tools"
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
            "cap-files",
            "sys-rag-architecture"
          ]
            },
            {
              "id": "af-memory-systems",
              "icon": "book",
              "category": "foundation",
              "relatedIds": [
            "cap-memory",
            "af-rag-basics",
            "p-files",
            "af-embeddings",
            "cc-md",
            "i-claudemd"
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
            "instructions",
            "pr-fewshot",
            "b-system",
            "af-rag-basics"
          ]
            }
          ]
        },
        {
          "id": "basics",
          "icon": "brain",
          "category": "foundation",
          "relatedIds": [
            "claude-code",
            "pl-web-setup"
          ],
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
              "category": "foundation",
              "relatedIds": [
                "af-llm-basics",
                "b-claude"
              ]
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
            "cc-md",
            "claude-code"
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
            "cc-cfg-permissions",
            "cap-tools",
            "b-system"
          ]
            },
            {
              "id": "b-knowledge",
              "icon": "calendar",
              "category": "foundation",
              "relatedIds": [
                "af-rag-basics",
                "b-context",
                "sys-rag-architecture"
              ]
            },
            {
              "id": "b-help",
              "icon": "compass",
              "category": "foundation",
              "relatedIds": [
            "b-claude",
            "sys-evals-benchmarks",
            "claude-code"
          ]
            },
            {
              "id": "b-first-steps",
              "icon": "rocket",
              "category": "foundation",
              "relatedIds": [
            "claude-code",
            "pl-web-setup"
          ],
              "minLevel": "beginner",
              "children": [
                {
                  "id": "fs-what-is-project",
                  "icon": "folder",
                  "category": "foundation",
                  "relatedIds": [
            "b-first-steps",
            "projects",
            "claude-code",
            "pl-web-setup"
          ]
                },
                {
                  "id": "fs-organize-disk",
                  "icon": "folder",
                  "category": "foundation",
                  "relatedIds": [
                    "b-first-steps"
                  ]
                },
                {
                  "id": "fs-terminal",
                  "icon": "terminal",
                  "category": "foundation",
                  "relatedIds": [
            "cc-install",
            "fs-navigate",
            "claude-code",
            "pl-web-setup"
          ]
                },
                {
                  "id": "fs-folder-create",
                  "icon": "folder-plus",
                  "category": "foundation",
                  "relatedIds": [
            "b-first-steps",
            "fs-organize-disk",
            "claude-code"
          ]
                },
                {
                  "id": "fs-navigate",
                  "icon": "search",
                  "category": "foundation",
                  "relatedIds": [
            "claude-code",
            "cc-md"
          ]
                },
                {
                  "id": "fs-install-node",
                  "icon": "download",
                  "category": "foundation",
                  "relatedIds": [
            "cc-install",
            "claude-code"
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
              "category": "foundation",
              "relatedIds": [
                "pl-rate",
                "sys-cost-management"
              ]
            },
            {
              "id": "pl-models",
              "icon": "sliders",
              "category": "foundation",
              "relatedIds": [
            "b-models",
            "pl-plans",
            "pl-web-setup"
          ]
            },
            {
              "id": "pl-platforms",
              "icon": "compass",
              "category": "foundation",
              "relatedIds": [
            "pl-api",
            "pl-compare",
            "sys-api-patterns",
            "claude-code",
            "pl-web-setup"
          ]
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
            "cc-install",
            "claude-code",
            "pl-web-setup"
          ]
            },
            {
              "id": "pl-web-setup",
              "icon": "globe",
              "category": "foundation",
              "relatedIds": [
            "i-global",
            "projects",
            "pl-plans",
            "instructions"
          ]
            },
            {
              "id": "pl-desktop",
              "icon": "laptop",
              "category": "foundation",
              "relatedIds": [
            "mcp",
            "pl-platforms",
            "pl-compare",
            "pl-web-setup"
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
            "ag-principles",
            "cap-caching",
            "pl-web-setup"
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
              "category": "configuration",
              "relatedIds": [
                "p-instructions",
                "pl-web-setup"
              ]
            },
            {
              "id": "i-project",
              "icon": "folder",
              "category": "configuration",
              "relatedIds": [
                "i-claudemd",
                "instructions",
                "ops-team-workflow"
              ]
            },
            {
              "id": "i-claudemd",
              "icon": "book",
              "category": "configuration",
              "relatedIds": [
            "claude-code",
            "cc-md"
          ]
            },
            {
              "id": "i-style",
              "icon": "edit",
              "category": "configuration"
            },
            {
              "id": "i-templates",
              "icon": "clipboard",
              "category": "configuration",
              "relatedIds": [
                "i-claudemd",
                "instructions",
                "mk-content-ops"
              ]
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
            "cc-md",
            "pl-web-setup"
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
              "category": "configuration",
              "relatedIds": [
                "i-project",
                "projects"
              ]
            },
            {
              "id": "p-team",
              "icon": "users",
              "category": "configuration"
            },
            {
              "id": "p-when",
              "icon": "target",
              "category": "configuration",
              "relatedIds": [
                "projects",
                "sys-workflows-basics"
              ]
            }
          ]
        },
        {
          "id": "artifacts",
          "icon": "paint",
          "category": "foundation",
          "relatedIds": [
            "pl-web-setup"
          ],
          "minLevel": "beginner",
          "children": [
            {
              "id": "a-types",
              "icon": "puzzle",
              "category": "foundation",
              "relatedIds": [
                "artifacts",
                "mk-content-ops"
              ]
            },
            {
              "id": "a-trigger",
              "icon": "flash",
              "category": "foundation",
              "relatedIds": [
                "artifacts",
                "sys-workflows-basics"
              ]
            },
            {
              "id": "a-iterate",
              "icon": "repeat",
              "category": "foundation",
              "relatedIds": [
                "artifacts",
                "pr-iterate",
                "sys-evals-benchmarks"
              ]
            },
            {
              "id": "a-edit",
              "icon": "pencil",
              "category": "foundation",
              "relatedIds": [
                "artifacts",
                "mk-content-ops"
              ]
            }
          ]
        },
        {
          "id": "capabilities",
          "icon": "flash",
          "category": "foundation",
          "relatedIds": [
            "cap-caching",
            "cap-search",
            "cap-computer"
          ],
          "minLevel": "intermediate",
          "children": [
            {
              "id": "cap-vision",
              "icon": "eye",
              "category": "foundation",
              "minLevel": "expert"
            },
            {
              "id": "cap-files",
              "icon": "file",
              "category": "foundation",
              "minLevel": "expert"
            },
            {
              "id": "cap-search",
              "icon": "search",
              "category": "foundation",
              "minLevel": "expert",
              "relatedIds": [
            "b-knowledge",
            "pl-web-setup"
          ]
            },
            {
              "id": "cap-memory",
              "icon": "brain",
              "category": "foundation",
              "relatedIds": [
                "projects",
                "cap-tools",
                "ec-personalization",
                "cs-team-workflow"
              ]
            },
            {
              "id": "cap-computer",
              "icon": "laptop",
              "category": "foundation",
              "minLevel": "expert",
              "relatedIds": [
                "ag-managed",
                "agents",
                "cap-tools"
              ]
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
              "category": "foundation",
              "relatedIds": [
            "b-system",
            "cc-md"
          ]
            },
            {
              "id": "cap-citations",
              "icon": "quote",
              "category": "foundation",
              "minLevel": "expert"
            },
            {
              "id": "cap-code-exec",
              "icon": "command",
              "category": "foundation",
              "minLevel": "expert",
              "relatedIds": [
            "cap-files",
            "cap-tools",
            "pl-web-setup"
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
            "b-safety",
            "b-context",
            "cap-search"
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
              "category": "prompts",
              "relatedIds": [
                "pr-structured",
                "prompting"
              ]
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
                  "category": "prompts",
                  "relatedIds": [
            "projects",
            "ready-prompts",
            "uc-ai-process-automation",
            "pl-web-setup"
          ]
                },
                {
                  "id": "rp-artifact",
                  "icon": "paint",
                  "category": "prompts",
                  "relatedIds": [
                    "artifacts",
                    "mk-content-ops",
                    "ready-prompts"
                  ]
                },
                {
                  "id": "rp-skill",
                  "icon": "tools",
                  "category": "prompts",
                  "relatedIds": [
                    "ready-prompts",
                    "skills",
                    "sys-multi-agent-patterns"
                  ]
                },
                {
                  "id": "rp-claudemd",
                  "icon": "book",
                  "category": "prompts",
                  "relatedIds": [
            "i-claudemd",
            "ops-team-workflow",
            "ready-prompts",
            "claude-code",
            "cc-md"
          ]
                },
                {
                  "id": "rp-audit",
                  "icon": "search",
                  "category": "prompts",
                  "relatedIds": [
                    "ready-prompts",
                    "sc-analysis",
                    "sys-evals-benchmarks"
                  ]
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
            "projects",
            "claude-code",
            "pl-web-setup"
          ],
          "children": [
            {
              "id": "s-md",
              "icon": "file",
              "category": "automation",
              "relatedIds": [
                "i-claudemd",
                "skills",
                "sys-multi-agent-patterns"
              ]
            },
            {
              "id": "s-trigger",
              "icon": "target",
              "category": "automation",
              "relatedIds": [
            "cc-hooks",
            "skills",
            "sys-workflows-basics",
            "claude-code",
            "pl-web-setup"
          ]
            },
            {
              "id": "s-files",
              "icon": "archive",
              "category": "automation",
              "relatedIds": [
                "p-files",
                "skills"
              ]
            },
            {
              "id": "s-ready",
              "icon": "cube",
              "category": "automation",
              "relatedIds": [
            "ai-fundamentals",
            "rp-skill",
            "skills",
            "pl-web-setup"
          ]
            },
            {
              "id": "s-create",
              "icon": "sparkles",
              "category": "automation",
              "relatedIds": [
            "claude-code",
            "pl-web-setup"
          ]
            },
            {
              "id": "s-vs-subagents",
              "icon": "puzzle",
              "category": "automation",
              "relatedIds": [
            "cc-subagents",
            "agents",
            "claude-code"
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
              "category": "foundation",
              "relatedIds": [
            "ag-code",
            "claude-code",
            "pd-spec-generation",
            "cc-md"
          ]
            },
            {
              "id": "sc-design",
              "icon": "paint",
              "category": "foundation",
              "relatedIds": [
                "ag-designer",
                "mk-content-ops",
                "pd-discovery-research"
              ]
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
              "category": "foundation",
              "relatedIds": [
                "mk-content-ops",
                "pd-discovery-research"
              ]
            }
          ]
        },
        {
          "id": "claude-code",
          "icon": "laptop",
          "category": "automation",
          "relatedIds": [
            "cc-md"
          ],
          "minLevel": "advanced",
          "children": [
            {
              "id": "cc-install",
              "icon": "inbox",
              "category": "automation",
              "relatedIds": [
            "fs-install-node",
            "fs-terminal",
            "cc-md"
          ]
            },
            {
              "id": "cc-terminal",
              "icon": "keyboard",
              "category": "automation",
              "relatedIds": [
                "claude-code"
              ],
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
                  "category": "automation",
                  "relatedIds": [
                    "cc-plan-mode"
                  ]
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
                  "category": "automation",
                  "relatedIds": []
                },
                {
                  "id": "cc-cfg-local",
                  "icon": "lock",
                  "category": "automation"
                },
                {
                  "id": "cc-cfg-global",
                  "icon": "globe",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
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
              "relatedIds": [
                "pl-web-setup"
              ],
              "children": [
                {
                  "id": "cc-grp-session",
                  "icon": "repeat",
                  "category": "automation",
                  "relatedIds": [
                    "pl-desktop",
                    "pl-web-setup"
                  ]
                },
                {
                  "id": "cc-grp-context",
                  "icon": "folder",
                  "category": "automation",
                  "relatedIds": [
            "b-context",
            "cc-md"
          ]
                },
                {
                  "id": "cc-grp-model",
                  "icon": "mixer",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
                },
                {
                  "id": "cc-grp-ui",
                  "icon": "paint",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
                },
                {
                  "id": "cc-grp-config",
                  "icon": "settings",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
                },
                {
                  "id": "cc-grp-integrations",
                  "icon": "plug",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
                },
                {
                  "id": "cc-grp-automation",
                  "icon": "rocket",
                  "category": "automation",
                  "relatedIds": [
                    "cc-plan-mode"
                  ]
                },
                {
                  "id": "cc-grp-quality",
                  "icon": "microscope",
                  "category": "automation"
                },
                {
                  "id": "cc-grp-help",
                  "icon": "question",
                  "category": "automation",
                  "relatedIds": [
                    "claude-code"
                  ]
                }
              ]
            },
            {
              "id": "cc-hooks",
              "icon": "hook",
              "category": "automation",
              "relatedIds": [
                "claude-code"
              ]
            },
            {
              "id": "cc-md",
              "icon": "book",
              "category": "automation",
              "relatedIds": [
            "claude-code",
            "instructions",
            "i-claudemd",
            "p-instructions"
          ]
            },
            {
              "id": "cc-subagents",
              "icon": "robot",
              "category": "automation",
              "relatedIds": [
            "skills",
            "agents",
            "mcp",
            "claude-code"
          ]
            },
            {
              "id": "cc-plan-mode",
              "icon": "clipboard",
              "category": "automation",
              "relatedIds": [
            "cc-tty-modes",
            "cc-subagents",
            "claude-code"
          ]
            },
            {
              "id": "cc-ide",
              "icon": "developer",
              "category": "automation",
              "relatedIds": [
            "cc-install",
            "pl-platforms",
            "claude-code"
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
              "category": "automation",
              "relatedIds": [
                "cap-tools",
                "mcp",
                "sys-api-patterns"
              ]
            },
            {
              "id": "m-ready",
              "icon": "store",
              "category": "automation",
              "relatedIds": [
                "mcp",
                "pl-integrations",
                "sys-api-patterns"
              ]
            },
            {
              "id": "m-custom",
              "icon": "construction",
              "category": "automation",
              "relatedIds": [
                "ai-integration-systems",
                "mcp",
                "sys-api-patterns"
              ]
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
              "category": "automation",
              "relatedIds": [
                "mcp",
                "sys-api-patterns",
                "sys-multi-agent-patterns"
              ]
            },
            {
              "id": "m-debug",
              "icon": "microscope",
              "category": "automation",
              "relatedIds": [
            "mcp",
            "sys-evals-benchmarks",
            "claude-code"
          ]
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
              "category": "agents",
              "relatedIds": [
                "agents",
                "pd-spec-generation",
                "sys-multi-agent-patterns"
              ]
            },
            {
              "id": "ag-ux",
              "icon": "search",
              "category": "agents",
              "relatedIds": [
                "agents",
                "pd-discovery-research",
                "sys-evals-benchmarks"
              ]
            },
            {
              "id": "ag-research",
              "icon": "books",
              "category": "agents",
              "relatedIds": [
            "agents",
            "pd-discovery-research",
            "pd-feedback-synthesis",
            "cap-search"
          ]
            },
            {
              "id": "ag-designer",
              "icon": "paint",
              "category": "agents",
              "relatedIds": [
                "agents",
                "mk-content-ops",
                "pd-discovery-research"
              ]
            },
            {
              "id": "ag-pm",
              "icon": "chart",
              "category": "agents",
              "relatedIds": [
                "agents",
                "pd-roadmap-intelligence",
                "pd-spec-generation"
              ]
            },
            {
              "id": "ag-managed",
              "icon": "rocket",
              "category": "agents",
              "relatedIds": [
            "ag-principles",
            "mcp",
            "cap-tools",
            "cap-search"
          ]
            }
          ]
        }
      ]
    },
    {
      "id": "systems",
      "icon": "link",
      "category": "systems",
      "relatedIds": [
            "ai-data-systems",
            "ai-operations",
            "ai-workflows",
            "foundation",
            "sys-escalation-paths",
            "sys-multi-agent-patterns",
            "sys-quality-gates",
            "sys-evals-benchmarks",
            "sys-cost-management"
          ],
      "children": [
        {
          "id": "ai-workflows",
          "icon": "link",
          "category": "systems",
          "relatedIds": [
            "sys-linear-chain",
            "sys-workflows-basics"
          ],
          "children": [
            {
              "id": "sys-workflows-basics",
              "icon": "flash",
              "category": "systems",
              "relatedIds": [
            "skills",
            "projects",
            "ops-process-automation",
            "uc-ai-process-automation",
            "sys-linear-chain"
          ]
            },
            {
              "id": "sys-linear-chain",
              "icon": "arrow-right",
              "category": "systems",
              "relatedIds": [
            "sys-workflows-basics",
            "ops-reporting-automation",
            "uc-ai-reporting-launch",
            "sys-quality-gates"
          ]
            },
            {
              "id": "sys-quality-gates",
              "icon": "shield",
              "category": "systems",
              "relatedIds": [
            "sys-workflows-basics",
            "ops-process-automation",
            "ag-principles",
            "p-team",
            "sys-escalation-paths"
          ]
            }
          ]
        },
        {
          "id": "ai-data-systems",
          "icon": "scroll",
          "category": "systems",
          "relatedIds": [
            "sys-rag-architecture"
          ],
          "children": [
            {
              "id": "sys-rag-architecture",
              "icon": "testtube",
              "category": "systems",
              "relatedIds": [
            "af-rag-basics",
            "af-vector-db",
            "af-embeddings",
            "cap-citations",
            "ops-reporting-automation",
            "ai-data-systems"
          ]
            },
            {
              "id": "sys-context-passing",
              "icon": "hook",
              "category": "systems",
              "relatedIds": [
            "sys-workflows-basics",
            "b-context",
            "cap-caching",
            "af-memory-systems",
            "sys-linear-chain"
          ]
            }
          ]
        },
        {
          "id": "ai-orchestration",
          "icon": "command",
          "category": "systems",
          "relatedIds": [
            "sys-multi-agent-patterns"
          ],
          "children": [
            {
              "id": "sys-multi-agent-patterns",
              "icon": "puzzle",
              "category": "systems",
              "relatedIds": [
            "agents",
            "ag-principles",
            "cc-subagents",
            "ag-managed",
            "uc-ai-multi-agent-system",
            "sys-context-passing",
            "cap-search"
          ]
            }
          ]
        },
        {
          "id": "ai-human-collaboration",
          "icon": "users",
          "category": "systems",
          "relatedIds": [
            "sys-escalation-paths"
          ],
          "children": [
            {
              "id": "sys-escalation-paths",
              "icon": "send",
              "category": "systems",
              "relatedIds": [
            "cs-escalation",
            "sys-quality-gates",
            "ag-principles",
            "ops-decision-intelligence",
            "ai-human-collaboration"
          ]
            }
          ]
        },
        {
          "id": "ai-operations",
          "icon": "eye",
          "category": "systems",
          "relatedIds": [
            "sys-cost-management",
            "sys-evals-benchmarks"
          ],
          "children": [
            {
              "id": "sys-evals-benchmarks",
              "icon": "check-circle",
              "category": "systems",
              "relatedIds": [
            "cs-quality-monitoring",
            "sys-quality-gates",
            "prompting",
            "pr-iterate",
            "ai-operations",
            "i-style"
          ]
            },
            {
              "id": "sys-cost-management",
              "icon": "tag",
              "category": "systems",
              "relatedIds": [
            "cap-caching",
            "pl-api",
            "en-roi-measurement",
            "af-llm-basics",
            "af-fine-tuning",
            "ai-operations"
          ]
            }
          ]
        },
        {
          "id": "ai-integration-systems",
          "icon": "plug",
          "category": "systems",
          "relatedIds": [
            "sys-api-patterns"
          ],
          "children": [
            {
              "id": "sys-api-patterns",
              "icon": "globe",
              "category": "systems",
              "relatedIds": [
            "pl-api",
            "pl-cowork",
            "mcp",
            "cap-tools",
            "pl-integrations",
            "ai-integration-systems"
          ]
            }
          ]
        }
      ]
    },
    {
      "id": "transformation",
      "icon": "rocket",
      "category": "transformation",
      "relatedIds": [
        "ai-native-customer-support",
        "ai-native-design",
        "ai-native-ecommerce",
        "ai-native-enterprise",
        "ai-native-marketing",
        "ai-native-operations",
        "ai-native-product",
        "foundation",
        "systems"
      ],
      "children": [
        {
          "id": "ai-native-operations",
          "icon": "settings",
          "category": "transformation",
          "relatedIds": [
            "ops-decision-intelligence",
            "ops-process-automation",
            "ops-reporting-automation",
            "ops-resource-optimization",
            "ops-team-workflow"
          ],
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
            "prompting",
            "b-system"
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
            "skills",
            "b-system",
            "cc-md"
          ]
            }
          ]
        },
        {
          "id": "ai-native-marketing",
          "icon": "mask",
          "category": "transformation",
          "relatedIds": [
            "mk-brand-voice",
            "mk-campaign-intel",
            "mk-content-ops",
            "mk-performance-analytics",
            "mk-seo-optimization",
            "mk-team-workflow"
          ],
          "children": [
            {
              "id": "mk-content-ops",
              "icon": "pencil",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "b-system",
                "projects",
                "sc-content",
                "sys-linear-chain"
              ]
            },
            {
              "id": "mk-campaign-intel",
              "icon": "globe",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "sc-data",
                "sys-workflows-basics",
                "sc-analysis"
              ]
            },
            {
              "id": "mk-brand-voice",
              "icon": "quote",
              "category": "transformation",
              "relatedIds": [
            "instructions",
            "i-style",
            "b-system",
            "prompting",
            "projects",
            "pr-fewshot"
          ]
            },
            {
              "id": "mk-seo-optimization",
              "icon": "search",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "af-rag-basics",
                "sys-rag-architecture",
                "sc-content"
              ]
            },
            {
              "id": "mk-performance-analytics",
              "icon": "eye",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "ops-reporting-automation"
              ]
            },
            {
              "id": "mk-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
            "projects",
            "p-team",
            "instructions",
            "skills",
            "ops-team-workflow",
            "cc-md"
          ]
            }
          ]
        },
        {
          "id": "ai-native-customer-support",
          "icon": "inbox",
          "category": "transformation",
          "relatedIds": [
            "cs-agent-assist",
            "cs-escalation",
            "cs-knowledge-base",
            "cs-quality-monitoring",
            "cs-support-analytics",
            "cs-team-workflow",
            "cs-tier1"
          ],
          "children": [
            {
              "id": "cs-tier1",
              "icon": "robot",
              "category": "transformation",
              "relatedIds": [
                "af-rag-basics",
                "sys-rag-architecture",
                "sys-quality-gates",
                "agents"
              ]
            },
            {
              "id": "cs-agent-assist",
              "icon": "keyboard",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "agents",
                "af-llm-basics",
                "b-context"
              ]
            },
            {
              "id": "cs-knowledge-base",
              "icon": "books",
              "category": "transformation",
              "relatedIds": [
                "af-rag-basics",
                "sys-rag-architecture",
                "af-vector-db",
                "projects"
              ]
            },
            {
              "id": "cs-escalation",
              "icon": "send",
              "category": "transformation",
              "relatedIds": [
                "sys-quality-gates",
                "ops-decision-intelligence",
                "agents",
                "ag-principles"
              ]
            },
            {
              "id": "cs-quality-monitoring",
              "icon": "check-circle",
              "category": "transformation",
              "relatedIds": [
            "sys-quality-gates",
            "ops-reporting-automation",
            "sc-analysis",
            "b-system"
          ]
            },
            {
              "id": "cs-support-analytics",
              "icon": "chart",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "ops-reporting-automation",
                "mk-performance-analytics"
              ]
            },
            {
              "id": "cs-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
            "projects",
            "p-team",
            "instructions",
            "ops-team-workflow",
            "mk-team-workflow",
            "cc-md"
          ]
            }
          ]
        },
        {
          "id": "ai-native-product",
          "icon": "construction",
          "category": "transformation",
          "relatedIds": [
            "pd-discovery-research",
            "pd-experimentation",
            "pd-feedback-synthesis",
            "pd-product-analytics",
            "pd-roadmap-intelligence",
            "pd-spec-generation",
            "pd-team-workflow"
          ],
          "children": [
            {
              "id": "pd-discovery-research",
              "icon": "microscope",
              "category": "transformation",
              "relatedIds": [
                "sc-research",
                "af-rag-basics",
                "sys-context-passing",
                "prompting"
              ]
            },
            {
              "id": "pd-spec-generation",
              "icon": "file",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "b-system",
                "pr-structured",
                "projects"
              ]
            },
            {
              "id": "pd-roadmap-intelligence",
              "icon": "calendar",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "ops-decision-intelligence"
              ]
            },
            {
              "id": "pd-experimentation",
              "icon": "testtube",
              "category": "transformation",
              "relatedIds": [
                "pr-iterate",
                "sc-analysis",
                "sys-workflows-basics"
              ]
            },
            {
              "id": "pd-feedback-synthesis",
              "icon": "quote",
              "category": "transformation",
              "relatedIds": [
                "sc-research",
                "sc-data",
                "af-rag-basics",
                "cs-support-analytics"
              ]
            },
            {
              "id": "pd-product-analytics",
              "icon": "chart",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "ops-reporting-automation",
                "mk-performance-analytics",
                "cs-support-analytics"
              ]
            },
            {
              "id": "pd-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
            "projects",
            "p-team",
            "ops-team-workflow",
            "mk-team-workflow",
            "cs-team-workflow",
            "cc-md"
          ]
            }
          ]
        },
        {
          "id": "ai-native-enterprise",
          "icon": "building",
          "category": "transformation",
          "relatedIds": [
            "en-change-management",
            "en-coe",
            "en-governance",
            "en-risk-management",
            "en-roi-measurement",
            "en-talent-strategy",
            "en-transformation-strategy"
          ],
          "children": [
            {
              "id": "en-transformation-strategy",
              "icon": "expand",
              "category": "transformation",
              "relatedIds": [
                "ops-team-workflow",
                "mk-team-workflow",
                "cs-team-workflow",
                "pd-team-workflow",
                "systems"
              ]
            },
            {
              "id": "en-change-management",
              "icon": "tools",
              "category": "transformation",
              "relatedIds": [
                "projects",
                "p-team",
                "ops-team-workflow",
                "mk-team-workflow"
              ]
            },
            {
              "id": "en-governance",
              "icon": "lock",
              "category": "transformation",
              "relatedIds": [
                "b-safety",
                "b-prompt-injection",
                "sys-quality-gates",
                "m-security",
                "pl-privacy"
              ]
            },
            {
              "id": "en-coe",
              "icon": "star",
              "category": "transformation",
              "relatedIds": [
            "ops-team-workflow",
            "mk-team-workflow",
            "instructions",
            "skills",
            "cc-md"
          ]
            },
            {
              "id": "en-roi-measurement",
              "icon": "trophy",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "ops-reporting-automation",
                "mk-performance-analytics",
                "cs-support-analytics",
                "pd-product-analytics"
              ]
            },
            {
              "id": "en-risk-management",
              "icon": "warning",
              "category": "transformation",
              "relatedIds": [
            "b-safety",
            "b-prompt-injection",
            "m-security",
            "sys-quality-gates",
            "pl-privacy",
            "cap-citations"
          ]
            },
            {
              "id": "en-talent-strategy",
              "icon": "developer",
              "category": "transformation",
              "relatedIds": [
                "b-claude",
                "ai-fundamentals",
                "ops-team-workflow",
                "pd-team-workflow"
              ]
            }
          ]
        },
        {
          "id": "ai-native-design",
          "icon": "paint",
          "category": "transformation",
          "relatedIds": [
            "ds-accessibility",
            "ds-content-design",
            "ds-design-ops",
            "ds-design-research",
            "ds-design-system",
            "ds-prototype-generation",
            "ds-team-workflow"
          ],
          "children": [
            {
              "id": "ds-design-research",
              "icon": "microscope",
              "category": "transformation",
              "relatedIds": [
                "pd-discovery-research",
                "sc-design",
                "af-multimodal",
                "cap-vision"
              ]
            },
            {
              "id": "ds-prototype-generation",
              "icon": "bricks",
              "category": "transformation",
              "relatedIds": [
                "cap-vision",
                "cap-files",
                "pd-spec-generation",
                "artifacts"
              ]
            },
            {
              "id": "ds-design-ops",
              "icon": "tools",
              "category": "transformation",
              "relatedIds": [
                "projects",
                "instructions",
                "en-coe",
                "skills"
              ]
            },
            {
              "id": "ds-accessibility",
              "icon": "shield",
              "category": "transformation",
              "relatedIds": [
                "cap-vision",
                "prompting",
                "sys-evals-benchmarks"
              ]
            },
            {
              "id": "ds-design-system",
              "icon": "puzzle",
              "category": "transformation",
              "relatedIds": [
                "skills",
                "instructions",
                "mk-brand-voice",
                "i-templates"
              ]
            },
            {
              "id": "ds-content-design",
              "icon": "quote",
              "category": "transformation",
              "relatedIds": [
                "mk-brand-voice",
                "mk-content-ops",
                "sc-content",
                "prompting"
              ]
            },
            {
              "id": "ds-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
            "projects",
            "p-team",
            "ops-team-workflow",
            "mk-team-workflow",
            "cs-team-workflow",
            "pd-team-workflow",
            "cc-md"
          ]
            }
          ]
        },
        {
          "id": "ai-native-ecommerce",
          "icon": "store",
          "category": "transformation",
          "relatedIds": [
            "ec-pdp-gen",
            "ec-search-opt",
            "ec-personalization",
            "ec-merchandising",
            "ec-cro",
            "ec-recommendations",
            "ec-support",
            "ec-pricing",
            "ec-analytics",
            "ec-segmentation",
            "ec-inventory",
            "ec-loyalty",
            "ec-checkout-opt",
            "ec-experimentation",
            "ec-team-workflow",
            "mk-content-ops",
            "cs-tier1-automation"
          ],
          "children": [
            {
              "id": "ec-pdp-gen",
              "icon": "tag",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "b-system",
                "cap-files",
                "sys-linear-chain",
                "sys-quality-gates",
                "mk-content-ops",
                "ec-search-opt"
              ]
            },
            {
              "id": "ec-search-opt",
              "icon": "search",
              "category": "transformation",
              "relatedIds": [
                "af-embeddings",
                "af-vector-db",
                "sys-rag-architecture",
                "prompting",
                "ec-recommendations",
                "ec-personalization"
              ]
            },
            {
              "id": "ec-personalization",
              "icon": "target",
              "category": "transformation",
              "relatedIds": [
                "af-memory-systems",
                "af-embeddings",
                "cap-memory",
                "sys-rag-architecture",
                "sys-context-passing",
                "ec-recommendations",
                "ec-segmentation"
              ]
            },
            {
              "id": "ec-merchandising",
              "icon": "store",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "cap-files",
                "sys-quality-gates",
                "ec-pdp-gen",
                "ec-search-opt"
              ]
            },
            {
              "id": "ec-cro",
              "icon": "sliders",
              "category": "transformation",
              "relatedIds": [
                "prompting",
                "pr-iterate",
                "sys-evals-benchmarks",
                "ec-experimentation",
                "mk-campaign-intel"
              ]
            },
            {
              "id": "ec-experimentation",
              "icon": "testtube",
              "category": "transformation",
              "relatedIds": [
                "sc-analysis",
                "sys-quality-gates",
                "sys-evals-benchmarks",
                "ec-cro",
                "pd-experimentation"
              ]
            },
            {
              "id": "ec-checkout-opt",
              "icon": "check",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "cap-tools",
                "sys-evals-benchmarks",
                "ec-experimentation"
              ]
            },
            {
              "id": "ec-recommendations",
              "icon": "sparkles",
              "category": "transformation",
              "relatedIds": [
                "af-embeddings",
                "af-vector-db",
                "sys-rag-architecture",
                "ec-personalization",
                "ec-search-opt"
              ]
            },
            {
              "id": "ec-support",
              "icon": "robot",
              "category": "transformation",
              "relatedIds": [
                "agents",
                "sc-content",
                "sys-multi-agent-patterns",
                "sys-escalation-paths",
                "cs-tier1-automation",
                "cs-agent-assist"
              ]
            },
            {
              "id": "ec-loyalty",
              "icon": "trophy",
              "category": "transformation",
              "relatedIds": [
                "af-memory-systems",
                "sc-data",
                "ec-segmentation",
                "ec-personalization"
              ]
            },
            {
              "id": "ec-analytics",
              "icon": "chart",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "mk-performance-analytics",
                "ec-team-workflow",
                "sys-cost-management"
              ]
            },
            {
              "id": "ec-pricing",
              "icon": "mixer",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "sys-context-passing",
                "ec-experimentation"
              ]
            },
            {
              "id": "ec-inventory",
              "icon": "cube",
              "category": "transformation",
              "relatedIds": [
                "sc-data",
                "sc-analysis",
                "ops-resource-optimization"
              ]
            },
            {
              "id": "ec-segmentation",
              "icon": "puzzle",
              "category": "transformation",
              "relatedIds": [
                "af-embeddings",
                "sc-data",
                "sys-rag-architecture",
                "ec-personalization",
                "ec-loyalty"
              ]
            },
            {
              "id": "ec-team-workflow",
              "icon": "users",
              "category": "transformation",
              "relatedIds": [
                "projects",
                "p-team",
                "instructions",
                "ops-team-workflow",
                "mk-team-workflow",
                "cs-team-workflow",
                "cc-md"
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
      "relatedIds": [
        "foundation",
        "systems",
        "transformation",
        "uc-ai-content-ops-launch",
        "uc-ai-conversion-optimization",
        "uc-ai-multi-agent-system",
        "uc-ai-personalization-launch",
        "uc-ai-pilot-to-production",
        "uc-ai-product-search",
        "uc-ai-rag-launch",
        "uc-ai-reporting-launch",
        "uc-ai-roi-estimation",
        "uc-ai-support-tier1",
        "uc-ai-transformation-roadmap",
        "uc-ai-vendor-selection"
      ],
      "children": [
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
            "sc-data",
            "ai-fundamentals",
            "b-system",
            "cc-md"
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
        },
        {
          "id": "uc-ai-content-ops-launch",
          "icon": "note",
          "category": "use-cases",
          "relatedIds": [
            "mk-content-ops",
            "mk-brand-voice",
            "prompting",
            "projects",
            "i-claudemd",
            "sc-content",
            "sys-linear-chain",
            "instructions",
            "b-system",
            "cc-md"
          ]
        },
        {
          "id": "uc-ai-support-tier1",
          "icon": "command",
          "category": "use-cases",
          "relatedIds": [
            "cs-tier1",
            "cs-knowledge-base",
            "cs-escalation",
            "af-rag-basics",
            "sys-rag-architecture",
            "prompting",
            "projects",
            "ai-fundamentals",
            "b-system"
          ]
        },
        {
          "id": "uc-ai-discovery-launch",
          "icon": "search",
          "category": "use-cases",
          "relatedIds": [
            "pd-discovery-research",
            "pd-feedback-synthesis",
            "sys-context-passing",
            "af-rag-basics",
            "prompting",
            "projects"
          ]
        },
        {
          "id": "uc-ai-transformation-roadmap",
          "icon": "folder-plus",
          "category": "use-cases",
          "relatedIds": [
            "en-transformation-strategy",
            "en-change-management",
            "en-coe",
            "en-roi-measurement",
            "ai-native-operations",
            "ai-native-marketing",
            "ai-native-customer-support",
            "ai-native-product"
          ]
        },
        {
          "id": "uc-ai-rag-launch",
          "icon": "attachment",
          "category": "use-cases",
          "relatedIds": [
            "af-rag-basics",
            "af-vector-db",
            "af-embeddings",
            "sys-rag-architecture",
            "projects",
            "sys-context-passing",
            "ai-fundamentals",
            "cap-citations"
          ]
        },
        {
          "id": "uc-ai-pilot-to-production",
          "icon": "download",
          "category": "use-cases",
          "relatedIds": [
            "sys-quality-gates",
            "en-governance",
            "en-risk-management",
            "sys-workflows-basics",
            "prompting"
          ]
        },
        {
          "id": "uc-ai-roi-estimation",
          "icon": "tag",
          "category": "use-cases",
          "relatedIds": [
            "en-roi-measurement",
            "sc-data",
            "ops-reporting-automation",
            "mk-performance-analytics",
            "cs-support-analytics",
            "pd-product-analytics"
          ]
        },
        {
          "id": "uc-ai-vendor-selection",
          "icon": "store",
          "category": "use-cases",
          "relatedIds": [
            "en-governance",
            "en-risk-management",
            "pl-compare",
            "pl-api",
            "m-security",
            "af-llm-basics",
            "pl-web-setup"
          ]
        },
        {
          "id": "uc-ai-multi-agent-system",
          "icon": "plug",
          "category": "use-cases",
          "relatedIds": [
            "agents",
            "ag-principles",
            "cc-subagents",
            "sys-workflows-basics",
            "sys-context-passing",
            "ag-managed",
            "claude-code"
          ]
        },
        {
          "id": "uc-ai-design-research-launch",
          "icon": "eye",
          "category": "use-cases",
          "relatedIds": [
            "ds-design-research",
            "pd-discovery-research",
            "af-rag-basics",
            "projects",
            "prompting",
            "sys-context-passing"
          ]
        },
        {
          "id": "uc-ai-personalization-launch",
          "icon": "target",
          "category": "use-cases",
          "relatedIds": [
            "ec-personalization",
            "ec-recommendations",
            "ec-segmentation",
            "af-embeddings",
            "af-memory-systems",
            "sys-rag-architecture",
            "sys-context-passing"
          ]
        },
        {
          "id": "uc-ai-product-search",
          "icon": "search",
          "category": "use-cases",
          "relatedIds": [
            "ec-search-opt",
            "ec-recommendations",
            "af-embeddings",
            "af-vector-db",
            "sys-rag-architecture",
            "prompting"
          ]
        },
        {
          "id": "uc-ai-conversion-optimization",
          "icon": "flash",
          "category": "use-cases",
          "relatedIds": [
            "ec-cro",
            "ec-experimentation",
            "ec-checkout-opt",
            "sc-analysis",
            "sys-evals-benchmarks",
            "prompting",
            "pr-iterate"
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
