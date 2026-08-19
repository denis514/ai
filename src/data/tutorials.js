// Структура tutorials: nodeId, icon, level, prerequisites, relatedPrompts, next, stepCount.
//
// Идентификаторы и порядок шагов ЖИВУТ В ЛОКАЛЯХ (src/locales/<lang>/tutorials/*.json,
// ключи объекта steps) — там же, где их тексты. Раньше они дублировались здесь
// массивом steps:[{id}] и ехали в стартовом пакете всем, кто просто открыл карту.
// Здесь остаётся только число шагов: его показывают карточки курсов до того,
// как загрузится текст.
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
    stepCount: 6,
  },
  'course-b-models': {
    nodeId: 'b-models',
    icon: 'sliders',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-context': {
    nodeId: 'b-context',
    icon: 'scroll',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-system': {
    nodeId: 'b-system',
    icon: 'mixer',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-safety': {
    nodeId: 'b-safety',
    icon: 'shield',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-prompt-injection': {
    nodeId: 'b-prompt-injection',
    icon: 'lock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-knowledge': {
    nodeId: 'b-knowledge',
    icon: 'calendar',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-b-help': {
    nodeId: 'b-help',
    icon: 'compass',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-fs-what-is-project': {
    nodeId: 'fs-what-is-project',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-fs-organize-disk': {
    nodeId: 'fs-organize-disk',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-fs-navigate': {
    nodeId: 'fs-navigate',
    icon: 'search',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-fs-install-node': {
    nodeId: 'fs-install-node',
    icon: 'download',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["basics"],
    stepCount: 6,
  },
  'course-pl-plans': {
    nodeId: 'pl-plans',
    icon: 'tag',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-limits': {
    nodeId: 'pl-limits',
    icon: 'clock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-models': {
    nodeId: 'pl-models',
    icon: 'sliders',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-platforms': {
    nodeId: 'pl-platforms',
    icon: 'compass',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-rate': {
    nodeId: 'pl-rate',
    icon: 'flash',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-compare': {
    nodeId: 'pl-compare',
    icon: 'mixer',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-web-setup': {
    nodeId: 'pl-web-setup',
    icon: 'globe',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-integrations': {
    nodeId: 'pl-integrations',
    icon: 'plug',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-pl-privacy': {
    nodeId: 'pl-privacy',
    icon: 'lock',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["pl-platforms"],
    stepCount: 6,
  },
  'course-a-types': {
    nodeId: 'a-types',
    icon: 'puzzle',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    stepCount: 6,
  },
  'course-a-trigger': {
    nodeId: 'a-trigger',
    icon: 'flash',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    stepCount: 6,
  },
  'course-a-iterate': {
    nodeId: 'a-iterate',
    icon: 'repeat',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    stepCount: 6,
  },
  'course-a-edit': {
    nodeId: 'a-edit',
    icon: 'pencil',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["artifacts"],
    stepCount: 6,
  },
  'course-sc-coding': {
    nodeId: 'sc-coding',
    icon: 'keyboard',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    stepCount: 6,
  },
  'course-sc-design': {
    nodeId: 'sc-design',
    icon: 'paint',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    stepCount: 6,
  },
  'course-sc-research': {
    nodeId: 'sc-research',
    icon: 'microscope',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    stepCount: 6,
  },
  'course-sc-data': {
    nodeId: 'sc-data',
    icon: 'chart',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["scenarios"],
    stepCount: 6,
  },
  'course-rp-project': {
    nodeId: 'rp-project',
    icon: 'folder',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    stepCount: 6,
  },
  'course-rp-artifact': {
    nodeId: 'rp-artifact',
    icon: 'paint',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    stepCount: 6,
  },
  'course-rp-skill': {
    nodeId: 'rp-skill',
    icon: 'tools',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    stepCount: 6,
  },
  'course-rp-claudemd': {
    nodeId: 'rp-claudemd',
    icon: 'book',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    stepCount: 6,
  },
  'course-rp-audit': {
    nodeId: 'rp-audit',
    icon: 'search',
    level: 'intermediate',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["ready-prompts"],
    stepCount: 6,
  },
  'course-sas-why-isolation': {
    nodeId: 'sas-why-isolation',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-docker-computer-use': {
    nodeId: 'sas-docker-computer-use',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-vm-vps': {
    nodeId: 'sas-vm-vps',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-least-privilege': {
    nodeId: 'sas-least-privilege',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-network-isolation': {
    nodeId: 'sas-network-isolation',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-secrets': {
    nodeId: 'sas-secrets',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-snapshots-killswitch': {
    nodeId: 'sas-snapshots-killswitch',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'course-sas-remote-access': {
    nodeId: 'sas-remote-access',
    icon: 'note',
    level: 'advanced',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["sys-agent-sandbox"],
    stepCount: 6,
  },
  'skill-md': {
    nodeId: 's-md',
    icon: 'note',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-trigger","s-files","skills"],
    stepCount: 6,
  },
  'skill-trigger': {
    nodeId: 's-trigger',
    icon: 'flash',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-ready","skills"],
    stepCount: 6,
  },
  'skill-files': {
    nodeId: 's-files',
    icon: 'folder',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-create","skills"],
    stepCount: 6,
  },
  'skill-ready': {
    nodeId: 's-ready',
    icon: 'books',
    level: 'beginner',
    audience: 'everyone',
    prerequisites: [], relatedPrompts: [],
    next: ["s-create","skills"],
    stepCount: 6,
  },
  'skill-create': {
    nodeId: 's-create',
    icon: 'sparkles',
    level: 'intermediate',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["s-md","s-files","s-trigger","skills"],
    stepCount: 6,
  },
  'skill-vs-subagents': {
    nodeId: 's-vs-subagents',
    icon: 'puzzle',
    level: 'intermediate',
    audience: 'developers',
    prerequisites: [], relatedPrompts: [],
    next: ["cc-subagents","s-create","skills"],
    stepCount: 6,
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
    "stepCount": 6
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
