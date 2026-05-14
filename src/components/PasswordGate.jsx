import React, { useState, useRef, useCallback, useEffect } from 'react';
import Icon from './Icon.jsx';

const ENTER_LABELS = ['Enter', '入力', 'Syötä', 'Войти', '입력', 'Entrar', 'Entrer'];

const PASSWORD = 'clever';

const NODES = [
  { id: 'root', x: 50, y: 50, label: 'Claude',             isRoot: true },
  // original English nodes
  { id: 'n1',  x: 22, y: 26, label: 'Prompt Engineering' },
  { id: 'n2',  x: 76, y: 22, label: 'Claude Basics'      },
  { id: 'n3',  x: 15, y: 58, label: 'Skills'             },
  { id: 'n4',  x: 83, y: 54, label: 'MCP'                },
  { id: 'n5',  x: 26, y: 76, label: 'Claude Code'        },
  { id: 'n6',  x: 76, y: 76, label: 'Agents'             },
  { id: 'n7',  x: 50, y: 11, label: 'Use Cases'          },
  { id: 'n8',  x: 50, y: 89, label: 'Automation'         },
  { id: 'n1a', x:  7, y: 14, label: 'Chain of Thought'   },
  { id: 'n1b', x:  5, y: 36, label: 'Few-shot'           },
  { id: 'n2a', x: 91, y: 12, label: 'Projects'           },
  { id: 'n2b', x: 93, y: 30, label: 'Artifacts'          },
  { id: 'n3a', x:  4, y: 70, label: 'Knowledge'          },
  { id: 'n4a', x: 95, y: 64, label: 'Servers'            },
  { id: 'n4b', x: 91, y: 78, label: 'Tools'              },
  { id: 'n5a', x: 11, y: 88, label: 'Hooks'              },
  { id: 'n6a', x: 87, y: 88, label: 'Workflows'          },
  { id: 'n7a', x: 34, y:  4, label: 'Coding'             },
  { id: 'n7b', x: 64, y:  4, label: 'Research'           },
  // multilingual nodes
  { id: 'm1',  x: 20, y: 16, label: '知識'               }, // Chinese: knowledge
  { id: 'm2',  x: 36, y: 18, label: 'Zeka'               }, // Turkish: intelligence
  { id: 'm3',  x: 63, y: 16, label: 'Wissen'             }, // German: knowledge
  { id: 'm4',  x: 78, y:  8, label: '学習'               }, // Japanese: learning
  { id: 'm5',  x: 88, y: 38, label: 'Connaissance'       }, // French: knowledge
  { id: 'm6',  x: 86, y: 62, label: 'Знания'             }, // Russian: knowledge
  { id: 'm7',  x: 71, y: 86, label: '추론'               }, // Korean: reasoning
  { id: 'm8',  x: 44, y: 94, label: 'Aprendizaje'        }, // Spanish: learning
  { id: 'm9',  x: 22, y: 86, label: 'ज्ञान'              }, // Hindi: knowledge
  { id: 'm10', x:  8, y: 62, label: 'Γνώση'              }, // Greek: knowledge
  { id: 'm11', x: 10, y: 44, label: 'دانش'               }, // Persian: knowledge
  { id: 'm12', x: 18, y: 36, label: 'Kennis'             }, // Dutch: knowledge
  { id: 'm13', x: 56, y: 28, label: 'Intelligence'       }, // French: intelligence
  { id: 'm14', x: 72, y: 44, label: 'تعلم'               }, // Arabic: learning
  { id: 'm15', x: 38, y: 68, label: 'ცოდნა'              }, // Georgian: knowledge
  { id: 'm16', x: 30, y: 40, label: 'Lärande'            }, // Swedish: learning
  { id: 'm17', x: 62, y: 68, label: 'Bilgi'              }, // Turkish: knowledge
  { id: 'm18', x: 55, y:  6, label: 'அறிவு'             }, // Tamil: knowledge
  { id: 'm19', x: 42, y: 82, label: 'Taidot'             }, // Finnish: skills
  { id: 'm20', x: 16, y: 74, label: 'בינה'               }, // Hebrew: intelligence
];

const EDGES = [
  // original tree
  ['root','n1'],['root','n2'],['root','n3'],['root','n4'],
  ['root','n5'],['root','n6'],['root','n7'],['root','n8'],
  ['n1','n1a'],['n1','n1b'],
  ['n2','n2a'],['n2','n2b'],
  ['n3','n3a'],
  ['n4','n4a'],['n4','n4b'],
  ['n5','n5a'],
  ['n6','n6a'],
  ['n7','n7a'],['n7','n7b'],
  // multilingual nodes connected to nearest originals
  ['n1','m1'],['n7a','m1'],
  ['n7','m2'],['n1','m2'],
  ['n7b','m3'],['n2','m3'],
  ['n2','m4'],['n2a','m4'],
  ['n2','m5'],['n4','m5'],
  ['n4','m6'],['n4a','m6'],
  ['n6','m7'],['n6a','m7'],
  ['n8','m8'],['n6','m8'],
  ['n5','m9'],['n5a','m9'],
  ['n3','m10'],['n3a','m10'],
  ['n3','m11'],['n1b','m11'],
  ['n1','m12'],['n1b','m12'],
  ['root','m13'],['n2','m13'],
  ['n4','m14'],['n6','m14'],
  ['n5','m15'],['n8','m15'],
  ['n1','m16'],['n3','m16'],
  ['n6','m17'],['n4','m17'],
  ['n7','m18'],['n7b','m18'],
  ['n8','m19'],['n5','m19'],
  ['n3','m20'],['n5','m20'],
];

export default function PasswordGate({ onUnlock }) {
  const [value, setValue]         = useState('');
  const [error, setError]         = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [mouse, setMouse]         = useState({ x: 50, y: 50 });
  const [labelIdx, setLabelIdx]   = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLabelIdx(i => (i + 1) % ENTER_LABELS.length), 1800);
    return () => clearInterval(id);
  }, []);
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === PASSWORD) {
      setUnlocking(true);
      setTimeout(() => onUnlock(), 1600);
    } else {
      setError(true);
      setValue('');
      setTimeout(() => setError(false), 600);
    }
  };

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div
      ref={containerRef}
      className={`pg${unlocking ? ' pg--unlocking' : ''}`}
      onMouseMove={handleMouseMove}
      style={{ '--mx': `${mouse.x}%`, '--my': `${mouse.y}%` }}
    >
      {/* Decorative background mindmap */}
      <div className="pg__bg">
        <svg className="pg__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {EDGES.map(([a, b]) => {
            const f = nodeMap[a], t = nodeMap[b];
            return (
              <line
                key={`${a}-${b}`}
                x1={f.x} y1={f.y}
                x2={t.x} y2={t.y}
                stroke="#d97757"
                strokeWidth="2"
                strokeOpacity="0.45"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {NODES.map(node => (
          <div
            key={node.id}
            className={`pg__node${node.isRoot ? ' pg__node--root' : ''}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.label}
          </div>
        ))}
      </div>

      {/* Blur with spotlight hole */}
      <div className="pg__blur" />

      {/* Blue glow following cursor */}
      <div className="pg__glow" />

      {/* Login card */}
      <form
        className={`pg__card${error ? ' pg__card--error' : ''}`}
        onSubmit={handleSubmit}
      >
        <div className="pg__logo">
          <Icon name="sparkles" size={22} strokeWidth={1.5} />
        </div>

        <h1 className="pg__title">Claude Atlas</h1>
        <p className="pg__subtitle">Enter password to continue</p>

        {unlocking ? (
          <div className="pg__spinner">
            <svg className="pg__inf-svg" viewBox="-68 -30 136 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="inf-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#d97757" floodOpacity="0.55" />
                </filter>
              </defs>
              {/* Track */}
              <path
                d="M0,0 C14,-24 52,-24 52,0 C52,24 14,24 0,0 C-14,-24 -52,-24 -52,0 C-52,24 -14,24 0,0"
                fill="none"
                stroke="#d97757"
                strokeWidth="2.5"
                strokeOpacity="0.18"
                strokeLinecap="round"
              />
              {/* Rolling dot */}
              <circle r="7" fill="white" stroke="#d97757" strokeWidth="2" filter="url(#inf-glow)">
                <animateMotion
                  dur="2.2s"
                  repeatCount="indefinite"
                  path="M0,0 C14,-24 52,-24 52,0 C52,24 14,24 0,0 C-14,-24 -52,-24 -52,0 C-52,24 -14,24 0,0"
                />
              </circle>
            </svg>
          </div>
        ) : (
          <>
            <input
              type="password"
              className="pg__input"
              placeholder="Password"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            <button type="submit" className="pg__btn">
              {ENTER_LABELS[labelIdx]} →
            </button>
          </>
        )}
      </form>
    </div>
  );
}
