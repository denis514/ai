import { mergeTutorials, mergeNodes, mergeBookmarks } from '../src/services/progressMerge.js';

let fails = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fails++; console.log(`✗ ${name}\n   получили: ${JSON.stringify(got)}\n   ждали:    ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
};

// 1. Курс: локально начат, в облаке завершён — завершение НЕ теряем
eq('курс: облачное завершение переживает локальный откат',
  mergeTutorials(
    { c1: { completedSteps: ['s1','s2'], lastStepIndex: 1, completedAt: null } },
    [{ tutorial_id: 'c1', completed_steps: ['s1','s2','s3'], last_step_index: 2, completed_at: '2026-07-01T00:00:00Z' }]
  ),
  { c1: { completedSteps: ['s1','s2','s3'], lastStepIndex: 2, completedAt: '2026-07-01T00:00:00Z' } });

// 2. Курс: локально дальше, чем в облаке — локальное не откатывается
eq('курс: локальный прогресс впереди — сохраняется',
  mergeTutorials(
    { c2: { completedSteps: ['s1','s2','s3'], lastStepIndex: 4, completedAt: null } },
    [{ tutorial_id: 'c2', completed_steps: ['s1'], last_step_index: 0, completed_at: null }]
  ),
  { c2: { completedSteps: ['s1','s2','s3'], lastStepIndex: 4, completedAt: null } });

// 3. Курс, которого нет локально (прошёл на другом устройстве) — появляется
eq('курс с другого устройства подтягивается',
  mergeTutorials({}, [{ tutorial_id: 'c3', completed_steps: ['a'], last_step_index: 0, completed_at: null }]),
  { c3: { completedSteps: ['a'], lastStepIndex: 0, completedAt: null } });

// 4. Темы: «на повторение» сильнее «просмотрено», с любой стороны
eq('тема: review сильнее viewed (локально review)',
  mergeNodes({ n1: 'review' }, [{ node_id: 'n1', status: 'viewed' }]), { n1: 'review' });
eq('тема: review сильнее viewed (в облаке review)',
  mergeNodes({ n2: 'viewed' }, [{ node_id: 'n2', status: 'review' }]), { n2: 'review' });
eq('тема только в облаке — подтягивается',
  mergeNodes({}, [{ node_id: 'n3', status: 'viewed' }]), { n3: 'viewed' });
eq('тема только локально — не теряется',
  mergeNodes({ n4: 'viewed' }, []), { n4: 'viewed' });

// 5. Закладки: объединение, ранняя дата, без дублей
eq('закладки: объединяются, дубль не плодится, дата ранняя',
  mergeBookmarks(
    [{ type:'node', id:'a', addedAt:'2026-08-01T00:00:00Z' }, { type:'prompt', id:'p', addedAt:'2026-08-05T00:00:00Z' }],
    [{ item_type:'node', item_id:'a', added_at:'2026-08-03T00:00:00Z' }, { item_type:'node', item_id:'b', added_at:'2026-08-02T00:00:00Z' }]
  ),
  [
    { type:'node', id:'a', addedAt:'2026-08-01T00:00:00Z' },
    { type:'prompt', id:'p', addedAt:'2026-08-05T00:00:00Z' },
    { type:'node', id:'b', addedAt:'2026-08-02T00:00:00Z' },
  ]);

// 6. Пустое облако ничего не стирает
eq('пустое облако не стирает локальное',
  mergeBookmarks([{ type:'node', id:'x', addedAt:'2026-08-01T00:00:00Z' }], []),
  [{ type:'node', id:'x', addedAt:'2026-08-01T00:00:00Z' }]);

console.log(fails ? `\n${fails} проверок не прошли` : '\nвсе проверки слияния прошли');
process.exit(fails ? 1 : 0);
