// Структура tutorials: nodeId, icon, level, prerequisites, relatedPrompts, next, steps:[{id}].
// Текстовый контент (title, subtitle, whatItIs, approach, outcomes, applyIn,
// pitfalls, exercises, totalTime, steps[].*) — в src/locales/<lang>/tutorials.json.
// Резолвинг через useTutorialContent() из src/i18n/.

export const tutorials = {
  'course-b-anthropic': {
    nodeId: 'b-anthropic',
    icon: 'building',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-anthropic-1' }, { id: 'b-anthropic-2' }, { id: 'b-anthropic-3' }, { id: 'b-anthropic-4' }, { id: 'b-anthropic-5' }, { id: 'b-anthropic-6' }],
  },
  'course-b-models': {
    nodeId: 'b-models',
    icon: 'sliders',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-models-1' }, { id: 'b-models-2' }, { id: 'b-models-3' }, { id: 'b-models-4' }, { id: 'b-models-5' }, { id: 'b-models-6' }],
  },
  'course-b-context': {
    nodeId: 'b-context',
    icon: 'scroll',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-context-1' }, { id: 'b-context-2' }, { id: 'b-context-3' }, { id: 'b-context-4' }, { id: 'b-context-5' }, { id: 'b-context-6' }],
  },
  'course-b-system': {
    nodeId: 'b-system',
    icon: 'mixer',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-system-1' }, { id: 'b-system-2' }, { id: 'b-system-3' }, { id: 'b-system-4' }, { id: 'b-system-5' }, { id: 'b-system-6' }],
  },
  'course-b-safety': {
    nodeId: 'b-safety',
    icon: 'shield',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-safety-1' }, { id: 'b-safety-2' }, { id: 'b-safety-3' }, { id: 'b-safety-4' }, { id: 'b-safety-5' }, { id: 'b-safety-6' }],
  },
  'course-b-prompt-injection': {
    nodeId: 'b-prompt-injection',
    icon: 'lock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-prompt-injection-1' }, { id: 'b-prompt-injection-2' }, { id: 'b-prompt-injection-3' }, { id: 'b-prompt-injection-4' }, { id: 'b-prompt-injection-5' }, { id: 'b-prompt-injection-6' }],
  },
  'course-b-knowledge': {
    nodeId: 'b-knowledge',
    icon: 'calendar',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-knowledge-1' }, { id: 'b-knowledge-2' }, { id: 'b-knowledge-3' }, { id: 'b-knowledge-4' }, { id: 'b-knowledge-5' }, { id: 'b-knowledge-6' }],
  },
  'course-b-help': {
    nodeId: 'b-help',
    icon: 'compass',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'b-help-1' }, { id: 'b-help-2' }, { id: 'b-help-3' }, { id: 'b-help-4' }, { id: 'b-help-5' }, { id: 'b-help-6' }],
  },
  'course-fs-what-is-project': {
    nodeId: 'fs-what-is-project',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'fs-what-is-project-1' }, { id: 'fs-what-is-project-2' }, { id: 'fs-what-is-project-3' }, { id: 'fs-what-is-project-4' }, { id: 'fs-what-is-project-5' }, { id: 'fs-what-is-project-6' }],
  },
  'course-fs-organize-disk': {
    nodeId: 'fs-organize-disk',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'fs-organize-disk-1' }, { id: 'fs-organize-disk-2' }, { id: 'fs-organize-disk-3' }, { id: 'fs-organize-disk-4' }, { id: 'fs-organize-disk-5' }, { id: 'fs-organize-disk-6' }],
  },
  'course-fs-navigate': {
    nodeId: 'fs-navigate',
    icon: 'search',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'fs-navigate-1' }, { id: 'fs-navigate-2' }, { id: 'fs-navigate-3' }, { id: 'fs-navigate-4' }, { id: 'fs-navigate-5' }, { id: 'fs-navigate-6' }],
  },
  'course-fs-install-node': {
    nodeId: 'fs-install-node',
    icon: 'download',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    steps: [{ id: 'fs-install-node-1' }, { id: 'fs-install-node-2' }, { id: 'fs-install-node-3' }, { id: 'fs-install-node-4' }, { id: 'fs-install-node-5' }, { id: 'fs-install-node-6' }],
  },
  'course-pl-plans': {
    nodeId: 'pl-plans',
    icon: 'tag',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-plans-1' }, { id: 'pl-plans-2' }, { id: 'pl-plans-3' }, { id: 'pl-plans-4' }, { id: 'pl-plans-5' }, { id: 'pl-plans-6' }],
  },
  'course-pl-limits': {
    nodeId: 'pl-limits',
    icon: 'clock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-limits-1' }, { id: 'pl-limits-2' }, { id: 'pl-limits-3' }, { id: 'pl-limits-4' }, { id: 'pl-limits-5' }, { id: 'pl-limits-6' }],
  },
  'course-pl-models': {
    nodeId: 'pl-models',
    icon: 'sliders',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-models-1' }, { id: 'pl-models-2' }, { id: 'pl-models-3' }, { id: 'pl-models-4' }, { id: 'pl-models-5' }, { id: 'pl-models-6' }],
  },
  'course-pl-platforms': {
    nodeId: 'pl-platforms',
    icon: 'compass',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-platforms-1' }, { id: 'pl-platforms-2' }, { id: 'pl-platforms-3' }, { id: 'pl-platforms-4' }, { id: 'pl-platforms-5' }, { id: 'pl-platforms-6' }],
  },
  'course-pl-rate': {
    nodeId: 'pl-rate',
    icon: 'flash',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-rate-1' }, { id: 'pl-rate-2' }, { id: 'pl-rate-3' }, { id: 'pl-rate-4' }, { id: 'pl-rate-5' }, { id: 'pl-rate-6' }],
  },
  'course-pl-compare': {
    nodeId: 'pl-compare',
    icon: 'mixer',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-compare-1' }, { id: 'pl-compare-2' }, { id: 'pl-compare-3' }, { id: 'pl-compare-4' }, { id: 'pl-compare-5' }, { id: 'pl-compare-6' }],
  },
  'course-pl-web-setup': {
    nodeId: 'pl-web-setup',
    icon: 'globe',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-web-setup-1' }, { id: 'pl-web-setup-2' }, { id: 'pl-web-setup-3' }, { id: 'pl-web-setup-4' }, { id: 'pl-web-setup-5' }, { id: 'pl-web-setup-6' }],
  },
  'course-pl-integrations': {
    nodeId: 'pl-integrations',
    icon: 'plug',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-integrations-1' }, { id: 'pl-integrations-2' }, { id: 'pl-integrations-3' }, { id: 'pl-integrations-4' }, { id: 'pl-integrations-5' }, { id: 'pl-integrations-6' }],
  },
  'course-pl-privacy': {
    nodeId: 'pl-privacy',
    icon: 'lock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    steps: [{ id: 'pl-privacy-1' }, { id: 'pl-privacy-2' }, { id: 'pl-privacy-3' }, { id: 'pl-privacy-4' }, { id: 'pl-privacy-5' }, { id: 'pl-privacy-6' }],
  },
  'course-a-types': {
    nodeId: 'a-types',
    icon: 'puzzle',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    steps: [{ id: 'a-types-1' }, { id: 'a-types-2' }, { id: 'a-types-3' }, { id: 'a-types-4' }, { id: 'a-types-5' }, { id: 'a-types-6' }],
  },
  'course-a-trigger': {
    nodeId: 'a-trigger',
    icon: 'flash',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    steps: [{ id: 'a-trigger-1' }, { id: 'a-trigger-2' }, { id: 'a-trigger-3' }, { id: 'a-trigger-4' }, { id: 'a-trigger-5' }, { id: 'a-trigger-6' }],
  },
  'course-a-iterate': {
    nodeId: 'a-iterate',
    icon: 'repeat',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    steps: [{ id: 'a-iterate-1' }, { id: 'a-iterate-2' }, { id: 'a-iterate-3' }, { id: 'a-iterate-4' }, { id: 'a-iterate-5' }, { id: 'a-iterate-6' }],
  },
  'course-a-edit': {
    nodeId: 'a-edit',
    icon: 'pencil',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    steps: [{ id: 'a-edit-1' }, { id: 'a-edit-2' }, { id: 'a-edit-3' }, { id: 'a-edit-4' }, { id: 'a-edit-5' }, { id: 'a-edit-6' }],
  },
  'course-sc-coding': {
    nodeId: 'sc-coding',
    icon: 'keyboard',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    steps: [{ id: 'sc-coding-1' }, { id: 'sc-coding-2' }, { id: 'sc-coding-3' }, { id: 'sc-coding-4' }, { id: 'sc-coding-5' }, { id: 'sc-coding-6' }],
  },
  'course-sc-design': {
    nodeId: 'sc-design',
    icon: 'paint',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    steps: [{ id: 'sc-design-1' }, { id: 'sc-design-2' }, { id: 'sc-design-3' }, { id: 'sc-design-4' }, { id: 'sc-design-5' }, { id: 'sc-design-6' }],
  },
  'course-sc-research': {
    nodeId: 'sc-research',
    icon: 'microscope',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    steps: [{ id: 'sc-research-1' }, { id: 'sc-research-2' }, { id: 'sc-research-3' }, { id: 'sc-research-4' }, { id: 'sc-research-5' }, { id: 'sc-research-6' }],
  },
  'course-sc-data': {
    nodeId: 'sc-data',
    icon: 'chart',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    steps: [{ id: 'sc-data-1' }, { id: 'sc-data-2' }, { id: 'sc-data-3' }, { id: 'sc-data-4' }, { id: 'sc-data-5' }, { id: 'sc-data-6' }],
  },
  'course-rp-project': {
    nodeId: 'rp-project',
    icon: 'folder',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    steps: [{ id: 'rp-project-1' }, { id: 'rp-project-2' }, { id: 'rp-project-3' }, { id: 'rp-project-4' }, { id: 'rp-project-5' }, { id: 'rp-project-6' }],
  },
  'course-rp-artifact': {
    nodeId: 'rp-artifact',
    icon: 'paint',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    steps: [{ id: 'rp-artifact-1' }, { id: 'rp-artifact-2' }, { id: 'rp-artifact-3' }, { id: 'rp-artifact-4' }, { id: 'rp-artifact-5' }, { id: 'rp-artifact-6' }],
  },
  'course-rp-skill': {
    nodeId: 'rp-skill',
    icon: 'tools',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    steps: [{ id: 'rp-skill-1' }, { id: 'rp-skill-2' }, { id: 'rp-skill-3' }, { id: 'rp-skill-4' }, { id: 'rp-skill-5' }, { id: 'rp-skill-6' }],
  },
  'course-rp-claudemd': {
    nodeId: 'rp-claudemd',
    icon: 'book',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    steps: [{ id: 'rp-claudemd-1' }, { id: 'rp-claudemd-2' }, { id: 'rp-claudemd-3' }, { id: 'rp-claudemd-4' }, { id: 'rp-claudemd-5' }, { id: 'rp-claudemd-6' }],
  },
  'course-rp-audit': {
    nodeId: 'rp-audit',
    icon: 'search',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    steps: [{ id: 'rp-audit-1' }, { id: 'rp-audit-2' }, { id: 'rp-audit-3' }, { id: 'rp-audit-4' }, { id: 'rp-audit-5' }, { id: 'rp-audit-6' }],
  },
  'course-sas-why-isolation': {
    nodeId: 'sas-why-isolation',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-why-isolation-1' }, { id: 'sas-why-isolation-2' }, { id: 'sas-why-isolation-3' }, { id: 'sas-why-isolation-4' }, { id: 'sas-why-isolation-5' }, { id: 'sas-why-isolation-6' }],
  },
  'course-sas-docker-computer-use': {
    nodeId: 'sas-docker-computer-use',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-docker-computer-use-1' }, { id: 'sas-docker-computer-use-2' }, { id: 'sas-docker-computer-use-3' }, { id: 'sas-docker-computer-use-4' }, { id: 'sas-docker-computer-use-5' }, { id: 'sas-docker-computer-use-6' }],
  },
  'course-sas-vm-vps': {
    nodeId: 'sas-vm-vps',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-vm-vps-1' }, { id: 'sas-vm-vps-2' }, { id: 'sas-vm-vps-3' }, { id: 'sas-vm-vps-4' }, { id: 'sas-vm-vps-5' }, { id: 'sas-vm-vps-6' }],
  },
  'course-sas-least-privilege': {
    nodeId: 'sas-least-privilege',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-least-privilege-1' }, { id: 'sas-least-privilege-2' }, { id: 'sas-least-privilege-3' }, { id: 'sas-least-privilege-4' }, { id: 'sas-least-privilege-5' }, { id: 'sas-least-privilege-6' }],
  },
  'course-sas-network-isolation': {
    nodeId: 'sas-network-isolation',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-network-isolation-1' }, { id: 'sas-network-isolation-2' }, { id: 'sas-network-isolation-3' }, { id: 'sas-network-isolation-4' }, { id: 'sas-network-isolation-5' }, { id: 'sas-network-isolation-6' }],
  },
  'course-sas-secrets': {
    nodeId: 'sas-secrets',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-secrets-1' }, { id: 'sas-secrets-2' }, { id: 'sas-secrets-3' }, { id: 'sas-secrets-4' }, { id: 'sas-secrets-5' }, { id: 'sas-secrets-6' }],
  },
  'course-sas-snapshots-killswitch': {
    nodeId: 'sas-snapshots-killswitch',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-snapshots-killswitch-1' }, { id: 'sas-snapshots-killswitch-2' }, { id: 'sas-snapshots-killswitch-3' }, { id: 'sas-snapshots-killswitch-4' }, { id: 'sas-snapshots-killswitch-5' }, { id: 'sas-snapshots-killswitch-6' }],
  },
  'course-sas-remote-access': {
    nodeId: 'sas-remote-access',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    steps: [{ id: 'sas-remote-access-1' }, { id: 'sas-remote-access-2' }, { id: 'sas-remote-access-3' }, { id: 'sas-remote-access-4' }, { id: 'sas-remote-access-5' }, { id: 'sas-remote-access-6' }],
  },
  'skill-md': {
    nodeId: 's-md',
    icon: 'note',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-trigger","s-files","skills"],
    steps: [{ id: 'smd-1' }, { id: 'smd-2' }, { id: 'smd-3' }, { id: 'smd-4' }, { id: 'smd-5' }, { id: 'smd-6' }],
  },
  'skill-trigger': {
    nodeId: 's-trigger',
    icon: 'flash',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-ready","skills"],
    steps: [{ id: 'strg-1' }, { id: 'strg-2' }, { id: 'strg-3' }, { id: 'strg-4' }, { id: 'strg-5' }, { id: 'strg-6' }],
  },
  'skill-files': {
    nodeId: 's-files',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-create","skills"],
    steps: [{ id: 'sfl-1' }, { id: 'sfl-2' }, { id: 'sfl-3' }, { id: 'sfl-4' }, { id: 'sfl-5' }, { id: 'sfl-6' }],
  },
  'skill-ready': {
    nodeId: 's-ready',
    icon: 'books',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-create","skills"],
    steps: [{ id: 'srd-1' }, { id: 'srd-2' }, { id: 'srd-3' }, { id: 'srd-4' }, { id: 'srd-5' }, { id: 'srd-6' }],
  },
  'skill-create': {
    nodeId: 's-create',
    icon: 'sparkles',
    level: 'intermediate',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-files","s-trigger","skills"],
    steps: [{ id: 'scr-1' }, { id: 'scr-2' }, { id: 'scr-3' }, { id: 'scr-4' }, { id: 'scr-5' }, { id: 'scr-6' }],
  },
  'skill-vs-subagents': {
    nodeId: 's-vs-subagents',
    icon: 'puzzle',
    level: 'intermediate',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["cc-subagents","s-create","skills"],
    steps: [{ id: 'svs-1' }, { id: 'svs-2' }, { id: 'svs-3' }, { id: 'svs-4' }, { id: 'svs-5' }, { id: 'svs-6' }],
  },
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
  },
  "ops-process-automation": {
    "nodeId": "ops-process-automation",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-operations"
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
  "ops-decision-intelligence": {
    "nodeId": "ops-decision-intelligence",
    "icon": "idea",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-operations"
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
  "ops-reporting-automation": {
    "nodeId": "ops-reporting-automation",
    "icon": "chart",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-operations"
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
  "ops-resource-optimization": {
    "nodeId": "ops-resource-optimization",
    "icon": "sliders",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-operations"
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
  "ops-team-workflow": {
    "nodeId": "ops-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-operations"
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
  "mk-content-ops": {
    "nodeId": "mk-content-ops",
    "icon": "pencil",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "mk-campaign-intel": {
    "nodeId": "mk-campaign-intel",
    "icon": "globe",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "mk-brand-voice": {
    "nodeId": "mk-brand-voice",
    "icon": "quote",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "mk-seo-optimization": {
    "nodeId": "mk-seo-optimization",
    "icon": "search",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "mk-performance-analytics": {
    "nodeId": "mk-performance-analytics",
    "icon": "eye",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "mk-team-workflow": {
    "nodeId": "mk-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-marketing"
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
  "cs-tier1": {
    "nodeId": "cs-tier1",
    "icon": "robot",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-agent-assist": {
    "nodeId": "cs-agent-assist",
    "icon": "keyboard",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-knowledge-base": {
    "nodeId": "cs-knowledge-base",
    "icon": "books",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-escalation": {
    "nodeId": "cs-escalation",
    "icon": "send",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-quality-monitoring": {
    "nodeId": "cs-quality-monitoring",
    "icon": "check-circle",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-support-analytics": {
    "nodeId": "cs-support-analytics",
    "icon": "chart",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "cs-team-workflow": {
    "nodeId": "cs-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-customer-support"
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
  "pd-discovery-research": {
    "nodeId": "pd-discovery-research",
    "icon": "microscope",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-spec-generation": {
    "nodeId": "pd-spec-generation",
    "icon": "file",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-roadmap-intelligence": {
    "nodeId": "pd-roadmap-intelligence",
    "icon": "calendar",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-experimentation": {
    "nodeId": "pd-experimentation",
    "icon": "testtube",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-feedback-synthesis": {
    "nodeId": "pd-feedback-synthesis",
    "icon": "quote",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-product-analytics": {
    "nodeId": "pd-product-analytics",
    "icon": "chart",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "pd-team-workflow": {
    "nodeId": "pd-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-product"
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
  "en-transformation-strategy": {
    "nodeId": "en-transformation-strategy",
    "icon": "expand",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-change-management": {
    "nodeId": "en-change-management",
    "icon": "tools",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-governance": {
    "nodeId": "en-governance",
    "icon": "lock",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-coe": {
    "nodeId": "en-coe",
    "icon": "star",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-roi-measurement": {
    "nodeId": "en-roi-measurement",
    "icon": "trophy",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-risk-management": {
    "nodeId": "en-risk-management",
    "icon": "warning",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "en-talent-strategy": {
    "nodeId": "en-talent-strategy",
    "icon": "developer",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-enterprise"
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
  "ds-design-research": {
    "nodeId": "ds-design-research",
    "icon": "microscope",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-prototype-generation": {
    "nodeId": "ds-prototype-generation",
    "icon": "bricks",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-design-ops": {
    "nodeId": "ds-design-ops",
    "icon": "tools",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-accessibility": {
    "nodeId": "ds-accessibility",
    "icon": "shield",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-design-system": {
    "nodeId": "ds-design-system",
    "icon": "puzzle",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-content-design": {
    "nodeId": "ds-content-design",
    "icon": "quote",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ds-team-workflow": {
    "nodeId": "ds-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-design"
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
  "ec-pdp-gen": {
    "nodeId": "ec-pdp-gen",
    "icon": "tag",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-search-opt": {
    "nodeId": "ec-search-opt",
    "icon": "search",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-personalization": {
    "nodeId": "ec-personalization",
    "icon": "target",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-merchandising": {
    "nodeId": "ec-merchandising",
    "icon": "store",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-cro": {
    "nodeId": "ec-cro",
    "icon": "sliders",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-experimentation": {
    "nodeId": "ec-experimentation",
    "icon": "testtube",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-checkout-opt": {
    "nodeId": "ec-checkout-opt",
    "icon": "check",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-recommendations": {
    "nodeId": "ec-recommendations",
    "icon": "sparkles",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-support": {
    "nodeId": "ec-support",
    "icon": "robot",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-loyalty": {
    "nodeId": "ec-loyalty",
    "icon": "trophy",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-analytics": {
    "nodeId": "ec-analytics",
    "icon": "chart",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-pricing": {
    "nodeId": "ec-pricing",
    "icon": "mixer",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-inventory": {
    "nodeId": "ec-inventory",
    "icon": "cube",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-segmentation": {
    "nodeId": "ec-segmentation",
    "icon": "puzzle",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "ec-team-workflow": {
    "nodeId": "ec-team-workflow",
    "icon": "users",
    "level": "intermediate",
    "audience": "business",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "ai-native-ecommerce"
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
  "cc-tty-sessions": {
    "nodeId": "cc-tty-sessions",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-terminal"
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
  "cc-tty-files": {
    "nodeId": "cc-tty-files",
    "icon": "file",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-terminal"
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
  "cc-tty-modes": {
    "nodeId": "cc-tty-modes",
    "icon": "compass",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-terminal"
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
  "cc-tty-keys": {
    "nodeId": "cc-tty-keys",
    "icon": "flash",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-terminal"
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
  "cc-cfg-settings": {
    "nodeId": "cc-cfg-settings",
    "icon": "note",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-config"
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
  "cc-cfg-local": {
    "nodeId": "cc-cfg-local",
    "icon": "lock",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-config"
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
  "cc-cfg-global": {
    "nodeId": "cc-cfg-global",
    "icon": "globe",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-config"
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
  "cc-cfg-statusline": {
    "nodeId": "cc-cfg-statusline",
    "icon": "mixer",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-config"
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
  "cc-grp-session": {
    "nodeId": "cc-grp-session",
    "icon": "repeat",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-context": {
    "nodeId": "cc-grp-context",
    "icon": "folder",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-model": {
    "nodeId": "cc-grp-model",
    "icon": "mixer",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-ui": {
    "nodeId": "cc-grp-ui",
    "icon": "paint",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-config": {
    "nodeId": "cc-grp-config",
    "icon": "settings",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-integrations": {
    "nodeId": "cc-grp-integrations",
    "icon": "plug",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-automation": {
    "nodeId": "cc-grp-automation",
    "icon": "rocket",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-quality": {
    "nodeId": "cc-grp-quality",
    "icon": "microscope",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
  "cc-grp-help": {
    "nodeId": "cc-grp-help",
    "icon": "question",
    "level": "intermediate",
    "audience": "developers",
    "prerequisites": [],
    "relatedPrompts": [],
    "next": [
      "cc-slash"
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
