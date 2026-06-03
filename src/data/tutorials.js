// Структура tutorials: nodeId, icon, level, prerequisites, relatedPrompts, next, steps:[{id}].
// Текстовый контент (title, subtitle, whatItIs, approach, outcomes, applyIn,
// pitfalls, exercises, totalTime, steps[].*) — в src/locales/<lang>/tutorials.json.
// Резолвинг через useTutorialContent() из src/i18n/.

export const tutorials = {
  "api-basics": {
    "nodeId": "pl-api",
    "icon": "terminal",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "mcp",
      "uc-ai-vendor-selection",
      "uc-ai-multi-agent-system"
    ],
    "steps": [
      {
        "id": "ab-1"
      },
      {
        "id": "ab-2"
      },
      {
        "id": "ab-3"
      },
      {
        "id": "ab-4"
      },
      {
        "id": "ab-5"
      },
      {
        "id": "ab-6"
      }
    ]
  },
  "ai-limitations": {
    "nodeId": "cap-limitations",
    "icon": "shield",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "prompting",
      "claude-setup",
      "uc-ai-pilot-to-production"
    ],
    "steps": [
      {
        "id": "al-1"
      },
      {
        "id": "al-2"
      },
      {
        "id": "al-3"
      },
      {
        "id": "al-4"
      },
      {
        "id": "al-5"
      }
    ]
  },
  "claude-cowork": {
    "nodeId": "pl-cowork",
    "icon": "robot",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "subagents",
      "uc-ai-reporting-launch"
    ],
    "steps": [
      {
        "id": "cw-1"
      },
      {
        "id": "cw-2"
      },
      {
        "id": "cw-3"
      },
      {
        "id": "cw-4"
      },
      {
        "id": "cw-5"
      }
    ]
  },
  "claude-setup": {
    "nodeId": "platform",
    "icon": "sparkles",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task"
    ],
    "next": [
      "projects",
      "instructions",
      "basics",
      "uc-ai-vendor-selection"
    ],
    "steps": [
      {
        "id": "cs-1"
      },
      {
        "id": "cs-2"
      },
      {
        "id": "cs-3"
      },
      {
        "id": "cs-4"
      },
      {
        "id": "cs-5"
      },
      {
        "id": "cs-6"
      }
    ]
  },
  "basics": {
    "nodeId": "basics",
    "icon": "brain",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "start-step-by-step",
      "prompting-improve"
    ],
    "next": [
      "prompting",
      "projects",
      "uc-ai-reporting-launch"
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
    "audience": "everyone",
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
      "artifacts",
      "uc-ai-content-ops-launch",
      "uc-ai-reporting-launch"
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
    "audience": "everyone",
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
      "scenarios",
      "uc-ai-content-ops-launch"
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
    "audience": "developers",
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
      "agents",
      "uc-ai-process-automation",
      "uc-ai-multi-agent-system"
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
    "audience": "developers",
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
      "agents",
      "uc-ai-process-automation"
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
    "audience": "developers",
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
      "agents",
      "uc-ai-multi-agent-system",
      "uc-ai-vendor-selection"
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
    "audience": "everyone",
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
      "prompting",
      "uc-ai-content-ops-launch"
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
    "audience": "everyone",
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
      "scenarios",
      "uc-ai-rag-launch"
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
    "audience": "business",
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
      "agents",
      "uc-ai-process-automation"
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
    "audience": "developers",
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
      "skills",
      "uc-ai-multi-agent-system"
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
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "expert-audit",
      "consistency-audit"
    ],
    "next": [
      "prompting",
      "projects",
      "uc-ai-content-ops-launch",
      "uc-ai-process-automation"
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
    "audience": "everyone",
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
    "audience": "everyone",
    "prerequisites": [
      "intro"
    ],
    "relatedPrompts": [
      "start-give-options",
      "business-positioning"
    ],
    "next": [
      "intro",
      "basics",
      "uc-ai-vendor-selection"
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
    "audience": "everyone",
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
      "projects",
      "uc-ai-rag-launch"
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
    "audience": "everyone",
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
      "pr-iterate",
      "uc-ai-rag-launch",
      "uc-ai-decision-support"
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
    "audience": "developers",
    "prerequisites": [
      "skills"
    ],
    "relatedPrompts": [
      "create-skill"
    ],
    "next": [
      "agents",
      "s-vs-subagents",
      "uc-ai-multi-agent-system"
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
    "audience": "developers",
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
      "agents",
      "uc-ai-multi-agent-system"
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
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [
      "code-review"
    ],
    "next": [
      "cc-hooks",
      "cc-cfg-permissions",
      "uc-ai-process-automation"
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
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task"
    ],
    "next": [
      "basics",
      "claude-code",
      "uc-ai-content-ops-launch"
    ],
    "steps": [
      {
        "id": "fp-1"
      },
      {
        "id": "fp-2"
      },
      {
        "id": "fp-3"
      },
      {
        "id": "fp-4"
      },
      {
        "id": "fp-5"
      },
      {
        "id": "fp-6"
      },
      {
        "id": "fp-7"
      },
      {
        "id": "fp-8"
      },
      {
        "id": "fp-9"
      },
      {
        "id": "fp-10"
      }
    ]
  },
  "terminal-tour": {
    "nodeId": "fs-terminal",
    "icon": "terminal",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "folders-workshop",
      "first-project"
    ],
    "steps": [
      {
        "id": "tt-1"
      },
      {
        "id": "tt-2"
      },
      {
        "id": "tt-3"
      },
      {
        "id": "tt-4"
      },
      {
        "id": "tt-5"
      }
    ]
  },
  "folders-workshop": {
    "nodeId": "fs-folder-create",
    "icon": "folder-plus",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "terminal-tour"
    ],
    "relatedPrompts": [],
    "next": [
      "first-project"
    ],
    "steps": [
      {
        "id": "fw-1"
      },
      {
        "id": "fw-2"
      },
      {
        "id": "fw-3"
      },
      {
        "id": "fw-4"
      },
      {
        "id": "fw-5"
      }
    ]
  },
  "welcome": {
    "nodeId": "b-claude",
    "icon": "rocket",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "instructions",
      "projects",
      "first-project"
    ],
    "steps": [
      {
        "id": "w-1"
      },
      {
        "id": "w-2"
      },
      {
        "id": "w-3"
      },
      {
        "id": "w-4"
      },
      {
        "id": "w-5"
      },
      {
        "id": "w-6"
      },
      {
        "id": "w-7"
      },
      {
        "id": "w-8"
      }
    ]
  },
  "claude-project-architecture": {
    "nodeId": "i-claudemd",
    "icon": "folder",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics",
      "projects"
    ],
    "relatedPrompts": [
      "start-role-task",
      "create-claudemd"
    ],
    "next": [
      "instructions",
      "skills",
      "claude-for-business",
      "uc-ai-reporting-launch",
      "uc-ai-process-automation"
    ],
    "steps": [
      {
        "id": "cpa-1"
      },
      {
        "id": "cpa-2"
      },
      {
        "id": "cpa-3"
      },
      {
        "id": "cpa-4"
      },
      {
        "id": "cpa-5"
      },
      {
        "id": "cpa-6"
      }
    ]
  },
  "claude-for-business": {
    "nodeId": "scenarios",
    "icon": "building",
    "level": "beginner",
    "audience": "business",
    "prerequisites": [
      "ai-fluency"
    ],
    "relatedPrompts": [
      "business-positioning",
      "analysis-deep-dive",
      "start-role-task"
    ],
    "next": [
      "scenarios",
      "projects",
      "claude-for-educators",
      "uc-ai-reporting-launch",
      "uc-ai-decision-support",
      "uc-ai-roi-estimation"
    ],
    "steps": [
      {
        "id": "cb-1"
      },
      {
        "id": "cb-2"
      },
      {
        "id": "cb-3"
      },
      {
        "id": "cb-4"
      },
      {
        "id": "cb-5"
      },
      {
        "id": "cb-6"
      }
    ]
  },
  "claude-for-educators": {
    "nodeId": "b-educators",
    "icon": "graduation",
    "level": "beginner",
    "audience": "business",
    "prerequisites": [
      "ai-fluency"
    ],
    "relatedPrompts": [
      "start-role-task",
      "prompting-improve"
    ],
    "next": [
      "scenarios",
      "projects",
      "claude-for-business",
      "uc-ai-content-ops-launch"
    ],
    "steps": [
      {
        "id": "ce-1"
      },
      {
        "id": "ce-2"
      },
      {
        "id": "ce-3"
      },
      {
        "id": "ce-4"
      },
      {
        "id": "ce-5"
      },
      {
        "id": "ce-6"
      }
    ]
  },
  "ai-fluency": {
    "nodeId": "b-claude",
    "icon": "brain",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [
      "start-role-task",
      "prompting-improve"
    ],
    "next": [
      "basics",
      "claude-for-business",
      "claude-for-educators",
      "uc-ai-rag-launch"
    ],
    "steps": [
      {
        "id": "af-1"
      },
      {
        "id": "af-2"
      },
      {
        "id": "af-3"
      },
      {
        "id": "af-4"
      },
      {
        "id": "af-5"
      },
      {
        "id": "af-6"
      }
    ]
  },
  "workflow-automation": {
    "nodeId": "sc-analysis",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "ai-fluency",
      "projects"
    ],
    "relatedPrompts": [
      "start-role-task",
      "analysis-deep-dive"
    ],
    "next": [
      "skills",
      "scenarios",
      "role-use-cases",
      "uc-ai-process-automation",
      "uc-ai-pilot-to-production"
    ],
    "steps": [
      {
        "id": "wa-1"
      },
      {
        "id": "wa-2"
      },
      {
        "id": "wa-3"
      },
      {
        "id": "wa-4"
      },
      {
        "id": "wa-5"
      },
      {
        "id": "wa-6"
      }
    ]
  },
  "role-use-cases": {
    "nodeId": "sc-content",
    "icon": "user",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "ai-fluency",
      "claude-for-business"
    ],
    "relatedPrompts": [
      "start-role-task",
      "business-positioning"
    ],
    "next": [
      "workflow-automation",
      "claude-for-educators",
      "scenarios",
      "uc-ai-content-ops-launch",
      "uc-ai-support-tier1",
      "uc-ai-discovery-launch"
    ],
    "steps": [
      {
        "id": "ruc-1"
      },
      {
        "id": "ruc-2"
      },
      {
        "id": "ruc-3"
      },
      {
        "id": "ruc-4"
      },
      {
        "id": "ruc-5"
      },
      {
        "id": "ruc-6"
      }
    ]
  },
  "mcp-advanced": {
    "nodeId": "mcp",
    "icon": "plug",
    "level": "advanced",
    "audience": "developers",
    "prerequisites": [
      "mcp",
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "subagents"
    ],
    "steps": [
      {
        "id": "ma-1"
      },
      {
        "id": "ma-2"
      },
      {
        "id": "ma-3"
      },
      {
        "id": "ma-4"
      },
      {
        "id": "ma-5"
      },
      {
        "id": "ma-6"
      },
      {
        "id": "ma-7"
      }
    ]
  },
  "claude-code-project": {
    "nodeId": "claude-code",
    "icon": "terminal",
    "level": "advanced",
    "audience": "developers",
    "prerequisites": [
      "claude-code",
      "first-project"
    ],
    "relatedPrompts": [],
    "next": [
      "mcp-advanced",
      "subagents",
      "hooks"
    ],
    "steps": [
      {
        "id": "ccp-1"
      },
      {
        "id": "ccp-2"
      },
      {
        "id": "ccp-3"
      },
      {
        "id": "ccp-4"
      },
      {
        "id": "ccp-5"
      },
      {
        "id": "ccp-6"
      },
      {
        "id": "ccp-7"
      }
    ]
  },
  "building-evaluations": {
    "nodeId": "sys-evals-benchmarks",
    "icon": "microscope",
    "level": "advanced",
    "audience": "developers",
    "prerequisites": [
      "api-basics",
      "prompting-techniques"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "mcp-advanced"
    ],
    "steps": [
      {
        "id": "be-1"
      },
      {
        "id": "be-2"
      },
      {
        "id": "be-3"
      },
      {
        "id": "be-4"
      },
      {
        "id": "be-5"
      },
      {
        "id": "be-6"
      }
    ]
  },
  "remote-computer-for-claude": {
    "nodeId": "sys-agent-sandbox",
    "icon": "laptop",
    "level": "advanced",
    "audience": "developers",
    "prerequisites": [
      "api-basics"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "mcp"
    ],
    "steps": [
      { "id": "rcc-1" },
      { "id": "rcc-2" },
      { "id": "rcc-3" },
      { "id": "rcc-4" },
      { "id": "rcc-5" },
      { "id": "rcc-6" },
      { "id": "rcc-7" },
      { "id": "rcc-8" },
      { "id": "rcc-9" },
      { "id": "rcc-10" },
      { "id": "rcc-11" },
      { "id": "rcc-12" },
      { "id": "rcc-13" },
      { "id": "rcc-14" },
      { "id": "rcc-15" },
      { "id": "rcc-16" }
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
