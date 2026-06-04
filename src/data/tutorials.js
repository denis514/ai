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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
  "claude-workspace": {
    "nodeId": "pl-desktop",
    "icon": "laptop",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "claude-cowork",
      "projects",
      "mcp",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "project-files": {
    "nodeId": "p-files",
    "icon": "attachment",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "projects",
      "p-instructions",
      "instructions"
    ],
    "steps": [
      {
        "id": "pf-1"
      },
      {
        "id": "pf-2"
      },
      {
        "id": "pf-3"
      },
      {
        "id": "pf-4"
      },
      {
        "id": "pf-5"
      },
      {
        "id": "pf-6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
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
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "project-instructions": {
    "nodeId": "p-instructions",
    "icon": "settings",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "projects"
    ],
    "relatedPrompts": [],
    "next": [
      "project-files",
      "instructions",
      "projects"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "project-team": {
    "nodeId": "p-team",
    "icon": "users",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "projects"
    ],
    "relatedPrompts": [],
    "next": [
      "project-instructions",
      "projects"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "project-when": {
    "nodeId": "p-when",
    "icon": "idea",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "projects"
    ],
    "relatedPrompts": [],
    "next": [
      "projects",
      "project-files",
      "project-instructions"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-4d": {
    "nodeId": "pr-4d",
    "icon": "target",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-principles",
      "prompt-role",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-principles": {
    "nodeId": "pr-principles",
    "icon": "compass",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-role",
      "prompt-xml",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-xml": {
    "nodeId": "pr-xml",
    "icon": "command",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-fewshot",
      "prompt-structured",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-fewshot": {
    "nodeId": "pr-fewshot",
    "icon": "books",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-cot",
      "prompt-xml",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-cot": {
    "nodeId": "pr-cot",
    "icon": "brain",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-xml",
      "prompting",
      "cap-thinking"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-role": {
    "nodeId": "pr-role",
    "icon": "mask",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-principles",
      "instructions",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-prefill": {
    "nodeId": "pr-prefill",
    "icon": "pencil",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-structured",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-structured": {
    "nodeId": "pr-structured",
    "icon": "clipboard",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-prefill",
      "prompt-xml",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "prompt-iterate": {
    "nodeId": "pr-iterate",
    "icon": "repeat",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "prompting"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-fewshot",
      "ready-prompts",
      "prompting"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-principles": {
    "nodeId": "ag-principles",
    "icon": "compass",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agents",
      "agent-code-reviewer",
      "agent-researcher"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-code-reviewer": {
    "nodeId": "ag-code",
    "icon": "developer",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "claude-code",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-audit": {
    "nodeId": "ag-ux",
    "icon": "eye",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-researcher": {
    "nodeId": "ag-research",
    "icon": "microscope",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-designer": {
    "nodeId": "ag-designer",
    "icon": "paint",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-pm": {
    "nodeId": "ag-pm",
    "icon": "clipboard",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "agent-managed": {
    "nodeId": "ag-managed",
    "icon": "robot",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "agents"
    ],
    "relatedPrompts": [],
    "next": [
      "agent-principles",
      "pl-api",
      "agents"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-input-modalities": {
    "nodeId": "cap-input-modalities",
    "icon": "inbox",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-vision",
      "cap-files",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-vision": {
    "nodeId": "cap-vision",
    "icon": "eye",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-input-modalities",
      "cap-files",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-files": {
    "nodeId": "cap-files",
    "icon": "file",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "p-files",
      "cap-input-modalities",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-search": {
    "nodeId": "cap-search",
    "icon": "search",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "capabilities",
      "agent-researcher"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-memory": {
    "nodeId": "cap-memory",
    "icon": "book",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "capabilities",
      "projects",
      "instructions"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-computer": {
    "nodeId": "cap-computer",
    "icon": "laptop",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "pl-desktop",
      "sys-agent-sandbox",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-caching": {
    "nodeId": "cap-caching",
    "icon": "tag",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "pl-api",
      "sys-cost-management",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-citations": {
    "nodeId": "cap-citations",
    "icon": "quote",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-files",
      "sys-rag-architecture",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-code-exec": {
    "nodeId": "cap-code-exec",
    "icon": "terminal",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-files",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cap-thinking": {
    "nodeId": "cap-thinking",
    "icon": "brain",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "capabilities"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-cot",
      "capabilities"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "i-global": {
    "nodeId": "i-global",
    "icon": "globe",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "instructions"
    ],
    "relatedPrompts": [],
    "next": [
      "instructions",
      "i-project",
      "i-style"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "i-project": {
    "nodeId": "i-project",
    "icon": "folder",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "instructions"
    ],
    "relatedPrompts": [],
    "next": [
      "i-global",
      "projects",
      "p-instructions"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "i-style": {
    "nodeId": "i-style",
    "icon": "paint",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "instructions"
    ],
    "relatedPrompts": [],
    "next": [
      "i-global",
      "instructions"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "i-templates": {
    "nodeId": "i-templates",
    "icon": "clipboard",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "instructions"
    ],
    "relatedPrompts": [],
    "next": [
      "prompt-structured",
      "i-project",
      "instructions"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-what": {
    "nodeId": "m-what",
    "icon": "puzzle",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "mcp",
      "m-ready",
      "m-custom"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-ready": {
    "nodeId": "m-ready",
    "icon": "plug",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "m-what",
      "m-security",
      "mcp"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-custom": {
    "nodeId": "m-custom",
    "icon": "tools",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "m-debug",
      "m-patterns",
      "m-security"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-security": {
    "nodeId": "m-security",
    "icon": "shield",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "m-custom",
      "sys-agent-sandbox",
      "mcp"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-patterns": {
    "nodeId": "m-patterns",
    "icon": "compass",
    "level": "advanced",
    "audience": "developers",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "m-custom",
      "m-security",
      "m-debug"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "m-debug": {
    "nodeId": "m-debug",
    "icon": "testtube",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "mcp"
    ],
    "relatedPrompts": [],
    "next": [
      "m-custom",
      "m-patterns",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-install": {
    "nodeId": "cc-install",
    "icon": "download",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-terminal",
      "cc-config",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-terminal": {
    "nodeId": "cc-terminal",
    "icon": "terminal",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-plan-mode",
      "cc-slash",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-config": {
    "nodeId": "cc-config",
    "icon": "settings",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-cfg-permissions",
      "cc-md",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-cfg-permissions": {
    "nodeId": "cc-cfg-permissions",
    "icon": "lock",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-config",
      "sys-agent-sandbox",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-slash": {
    "nodeId": "cc-slash",
    "icon": "command",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-terminal",
      "cc-subagents",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-plan-mode": {
    "nodeId": "cc-plan-mode",
    "icon": "compass",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-terminal",
      "cc-cfg-permissions",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-ide": {
    "nodeId": "cc-ide",
    "icon": "laptop",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-install",
      "cc-terminal",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-llm-basics": {
    "nodeId": "af-llm-basics",
    "icon": "cube",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "af-embeddings",
      "cap-limitations",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-embeddings": {
    "nodeId": "af-embeddings",
    "icon": "compass",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "af-vector-db",
      "af-rag-basics",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-vector-db": {
    "nodeId": "af-vector-db",
    "icon": "bricks",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "af-rag-basics",
      "af-embeddings",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-rag-basics": {
    "nodeId": "af-rag-basics",
    "icon": "archive",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "af-vector-db",
      "sys-rag-architecture",
      "cap-files"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-memory-systems": {
    "nodeId": "af-memory-systems",
    "icon": "book",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-memory",
      "af-rag-basics",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-multimodal": {
    "nodeId": "af-multimodal",
    "icon": "paint",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "cap-vision",
      "cap-input-modalities",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "af-fine-tuning": {
    "nodeId": "af-fine-tuning",
    "icon": "mixer",
    "level": "intermediate",
    "audience": "everyone",
    "prerequisites": [
      "basics"
    ],
    "relatedPrompts": [],
    "next": [
      "prompting",
      "af-rag-basics",
      "ai-fundamentals"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "cc-md": {
    "nodeId": "cc-md",
    "icon": "note",
    "level": "beginner",
    "audience": "developers",
    "prerequisites": [
      "claude-code"
    ],
    "relatedPrompts": [],
    "next": [
      "cc-config",
      "cc-install",
      "claude-code"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-reporting-launch": {
    "nodeId": "uc-ai-reporting-launch",
    "icon": "clipboard",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-process-automation": {
    "nodeId": "uc-ai-process-automation",
    "icon": "puzzle",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-decision-support": {
    "nodeId": "uc-ai-decision-support",
    "icon": "compass",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-content-ops-launch": {
    "nodeId": "uc-ai-content-ops-launch",
    "icon": "note",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-support-tier1": {
    "nodeId": "uc-ai-support-tier1",
    "icon": "command",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-discovery-launch": {
    "nodeId": "uc-ai-discovery-launch",
    "icon": "search",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-transformation-roadmap": {
    "nodeId": "uc-ai-transformation-roadmap",
    "icon": "folder-plus",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-rag-launch": {
    "nodeId": "uc-ai-rag-launch",
    "icon": "attachment",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-pilot-to-production": {
    "nodeId": "uc-ai-pilot-to-production",
    "icon": "download",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-roi-estimation": {
    "nodeId": "uc-ai-roi-estimation",
    "icon": "tag",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-vendor-selection": {
    "nodeId": "uc-ai-vendor-selection",
    "icon": "store",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-multi-agent-system": {
    "nodeId": "uc-ai-multi-agent-system",
    "icon": "plug",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-design-research-launch": {
    "nodeId": "uc-ai-design-research-launch",
    "icon": "eye",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-personalization-launch": {
    "nodeId": "uc-ai-personalization-launch",
    "icon": "target",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-product-search": {
    "nodeId": "uc-ai-product-search",
    "icon": "search",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "uc-ai-conversion-optimization": {
    "nodeId": "uc-ai-conversion-optimization",
    "icon": "flash",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [
      "claude-setup"
    ],
    "relatedPrompts": [],
    "next": [
      "use-cases"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-workflows-basics": {
    "nodeId": "sys-workflows-basics",
    "icon": "flash",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-linear-chain": {
    "nodeId": "sys-linear-chain",
    "icon": "arrow-right",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-quality-gates": {
    "nodeId": "sys-quality-gates",
    "icon": "shield",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-branching-logic": {
    "nodeId": "sys-branching-logic",
    "icon": "puzzle",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-loop-patterns": {
    "nodeId": "sys-loop-patterns",
    "icon": "repeat",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-prompt-chaining": {
    "nodeId": "sys-prompt-chaining",
    "icon": "link",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-rag-architecture": {
    "nodeId": "sys-rag-architecture",
    "icon": "testtube",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-context-passing": {
    "nodeId": "sys-context-passing",
    "icon": "hook",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-vector-stores": {
    "nodeId": "sys-vector-stores",
    "icon": "archive",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-chunking-strategies": {
    "nodeId": "sys-chunking-strategies",
    "icon": "cube",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-hybrid-search": {
    "nodeId": "sys-hybrid-search",
    "icon": "search",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-document-pipelines": {
    "nodeId": "sys-document-pipelines",
    "icon": "file",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-multi-agent-patterns": {
    "nodeId": "sys-multi-agent-patterns",
    "icon": "puzzle",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-supervisor-worker": {
    "nodeId": "sys-supervisor-worker",
    "icon": "users",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-parallel-fan-out": {
    "nodeId": "sys-parallel-fan-out",
    "icon": "sparkles",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-handoff-protocols": {
    "nodeId": "sys-handoff-protocols",
    "icon": "link",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-tool-orchestration": {
    "nodeId": "sys-tool-orchestration",
    "icon": "tools",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-escalation-paths": {
    "nodeId": "sys-escalation-paths",
    "icon": "send",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-approval-flows": {
    "nodeId": "sys-approval-flows",
    "icon": "shield",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-feedback-collection": {
    "nodeId": "sys-feedback-collection",
    "icon": "inbox",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-confidence-thresholds": {
    "nodeId": "sys-confidence-thresholds",
    "icon": "target",
    "level": "beginner",
    "audience": "everyone",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-cost-management": {
    "nodeId": "sys-cost-management",
    "icon": "tag",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-monitoring": {
    "nodeId": "sys-monitoring",
    "icon": "chart",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-logging-patterns": {
    "nodeId": "sys-logging-patterns",
    "icon": "scroll",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-versioning": {
    "nodeId": "sys-versioning",
    "icon": "tag",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-rollback-strategies": {
    "nodeId": "sys-rollback-strategies",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-rate-limiting": {
    "nodeId": "sys-rate-limiting",
    "icon": "shield",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-semantic-cache": {
    "nodeId": "sys-semantic-cache",
    "icon": "archive",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-api-patterns": {
    "nodeId": "sys-api-patterns",
    "icon": "globe",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-event-driven": {
    "nodeId": "sys-event-driven",
    "icon": "flash",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-batch-vs-realtime": {
    "nodeId": "sys-batch-vs-realtime",
    "icon": "compass",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-data-sync": {
    "nodeId": "sys-data-sync",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-auth-patterns": {
    "nodeId": "sys-auth-patterns",
    "icon": "lock",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
    ]
  },
  "sys-error-handling": {
    "nodeId": "sys-error-handling",
    "icon": "question",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "systems"
    ],
    "steps": [
      {
        "id": "s1"
      },
      {
        "id": "s2"
      },
      {
        "id": "s3"
      },
      {
        "id": "s4"
      },
      {
        "id": "s5"
      },
      {
        "id": "s6"
      }
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
