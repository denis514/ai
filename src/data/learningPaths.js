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
      {
        "type": "tutorial",
        "id": "intro"
      },
      {
        "type": "node",
        "id": "fs-what-is-project"
      },
      {
        "type": "tutorial",
        "id": "terminal-tour"
      },
      {
        "type": "tutorial",
        "id": "folders-workshop"
      },
      {
        "type": "tutorial",
        "id": "first-project"
      },
      {
        "type": "tutorial",
        "id": "basics"
      }
    ]
  },
  {
    "id": "ops-team",
    "icon": "settings",
    "level": "intermediate",
    "audience": "business",
    "steps": [
      {
        "type": "tutorial",
        "id": "ai-fluency"
      },
      {
        "type": "node",
        "id": "af-rag-basics"
      },
      {
        "type": "node",
        "id": "sys-workflows-basics"
      },
      {
        "type": "node",
        "id": "ai-native-operations"
      },
      {
        "type": "node",
        "id": "ops-process-automation"
      },
      {
        "type": "node",
        "id": "ops-reporting-automation"
      },
      {
        "type": "node",
        "id": "uc-ai-reporting-launch"
      },
      {
        "type": "tutorial",
        "id": "workflow-automation"
      }
    ]
  },
  {
    "id": "marketing-team",
    "icon": "mask",
    "level": "intermediate",
    "audience": "business",
    "steps": [
      {
        "type": "tutorial",
        "id": "claude-for-business"
      },
      {
        "type": "node",
        "id": "af-rag-basics"
      },
      {
        "type": "node",
        "id": "sys-rag-architecture"
      },
      {
        "type": "node",
        "id": "ai-native-marketing"
      },
      {
        "type": "node",
        "id": "mk-content-ops"
      },
      {
        "type": "node",
        "id": "mk-brand-voice"
      },
      {
        "type": "node",
        "id": "uc-ai-content-ops-launch"
      },
      {
        "type": "tutorial",
        "id": "role-use-cases"
      }
    ]
  },
  {
    "id": "support-team",
    "icon": "inbox",
    "level": "intermediate",
    "audience": "business",
    "steps": [
      {
        "type": "tutorial",
        "id": "ai-fluency"
      },
      {
        "type": "node",
        "id": "af-rag-basics"
      },
      {
        "type": "node",
        "id": "af-vector-db"
      },
      {
        "type": "node",
        "id": "sys-rag-architecture"
      },
      {
        "type": "node",
        "id": "sys-escalation-paths"
      },
      {
        "type": "node",
        "id": "ai-native-customer-support"
      },
      {
        "type": "node",
        "id": "cs-tier1"
      },
      {
        "type": "node",
        "id": "cs-knowledge-base"
      },
      {
        "type": "node",
        "id": "uc-ai-support-tier1"
      }
    ]
  },
  {
    "id": "product-team",
    "icon": "construction",
    "level": "intermediate",
    "audience": "business",
    "steps": [
      {
        "type": "tutorial",
        "id": "ai-fluency"
      },
      {
        "type": "node",
        "id": "af-rag-basics"
      },
      {
        "type": "node",
        "id": "sys-context-passing"
      },
      {
        "type": "node",
        "id": "ai-native-product"
      },
      {
        "type": "node",
        "id": "pd-discovery-research"
      },
      {
        "type": "node",
        "id": "pd-spec-generation"
      },
      {
        "type": "node",
        "id": "pd-feedback-synthesis"
      },
      {
        "type": "node",
        "id": "uc-ai-discovery-launch"
      }
    ]
  },
  {
    "id": "enterprise-transformation",
    "icon": "building",
    "level": "advanced",
    "audience": "business",
    "steps": [
      {
        "type": "tutorial",
        "id": "claude-for-business"
      },
      {
        "type": "node",
        "id": "ai-native-enterprise"
      },
      {
        "type": "node",
        "id": "en-transformation-strategy"
      },
      {
        "type": "node",
        "id": "en-coe"
      },
      {
        "type": "node",
        "id": "en-governance"
      },
      {
        "type": "node",
        "id": "en-roi-measurement"
      },
      {
        "type": "node",
        "id": "uc-ai-transformation-roadmap"
      },
      {
        "type": "node",
        "id": "uc-ai-roi-estimation"
      }
    ]
  },
  {
    "id": "design-team",
    "icon": "paint",
    "level": "intermediate",
    "audience": "everyone",
    "steps": [
      {
        "type": "tutorial",
        "id": "ai-fluency"
      },
      {
        "type": "node",
        "id": "af-multimodal"
      },
      {
        "type": "node",
        "id": "cap-vision"
      },
      {
        "type": "node",
        "id": "ai-native-design"
      },
      {
        "type": "node",
        "id": "ds-design-research"
      },
      {
        "type": "node",
        "id": "ds-prototype-generation"
      },
      {
        "type": "node",
        "id": "ds-content-design"
      },
      {
        "type": "node",
        "id": "uc-ai-design-research-launch"
      }
    ]
  },
  {
    "id": "secure-agent",
    "icon": "shield",
    "level": "advanced",
    "audience": "developers",
    "steps": [
      { "type": "node", "id": "cap-computer" },
      { "type": "node", "id": "sys-agent-sandbox" },
      { "type": "node", "id": "sas-why-isolation" },
      { "type": "node", "id": "sas-docker-computer-use" },
      { "type": "node", "id": "sas-vm-vps" },
      { "type": "node", "id": "sas-least-privilege" },
      { "type": "node", "id": "sas-network-isolation" },
      { "type": "node", "id": "sas-secrets" },
      { "type": "node", "id": "sas-snapshots-killswitch" },
      { "type": "node", "id": "sas-remote-access" },
      { "type": "tutorial", "id": "remote-computer-for-claude" }
    ]
  }
];

/** Индекс по id */
export const pathIndex = Object.fromEntries(learningPaths.map(p => [p.id, p]));
