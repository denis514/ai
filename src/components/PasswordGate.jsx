import React, { useState, useRef, useCallback } from 'react';

const PASSWORD = 'clever';

const NODES = [
  { id: 'root', x: 50, y: 50, label: 'Claude', isRoot: true },
  { id: 'n1',  x: 22, y: 26, label: 'Prompt Engineering' },
  { id: 'n2',  x: 76, y: 22, label: 'Claude Basics' },
  { id: 'n3',  x: 15, y: 58, label: 'Skills' },
  { id: 'n4',  x: 83, y: 54, label: 'MCP' },
  { id: 'n5',  x: 26, y: 76, label: 'Claude Code' },
  { id: 'n6',  x: 76, y: 76, label: 'Agents' },
  { id: 'n7',  x: 50, y: 11, label: 'Use Cases' },
  { id: 'n8',  x: 50, y: 89, label: 'Automation' },
  { id: 'n1a', x:  7, y: 14, label: 'Chain of Thought' },
  { id: 'n1b', x:  5, y: 36, label: 'Few-shot' },
  { id: 'n2a', x: 91, y: 12, label: 'Projects' },
  { id: 'n2b', x: 93, y: 30, label: 'Artifacts' },
  { id: 'n3a', x:  4, y: 70, label: 'Knowledge' },
  { id: 'n4a', x: 95, y: 64, label: 'Servers' },
  { id: 'n4b', x: 91, y: 78, label: 'Tools' },
  { id: 'n5a', x: 11, y: 88, label: 'Hooks' },
  { id: 'n6a', x: 87, y: 88, label: 'Workflows' },
  { id: 'n7a', x: 34, y:  4, label: 'Coding' },
  { id: 'n7b', x: 64, y:  4, label: 'Research' },
];

const EDGES = [
  ['root','n1'],['root','n2'],['root','n3'],['root','n4'],
  ['root','n5'],['root','n6'],['root','n7'],['root','n8'],
  ['n1','n1a'],['n1','n1b'],
  ['n2','n2a'],['n2','n2b'],
  ['n3','n3a'],
  ['n4','n4a'],['n4','n4b'],
  ['n5','n5a'],
  ['n6','n6a'],
  ['n7','n7a'],['n7','n7b'],
];

export default function PasswordGate({ onUnlock }) {
  const [value, setValue]       = useState('');
  const [error, setError]       = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [mouse, setMouse]       = useState({ x: 50, y: 50 });
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
      setTimeout(() => onUnlock(), 900);
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
            const from = nodeMap[a];
            const to   = nodeMap[b];
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke="#2f6fea"
                strokeWidth="0.25"
                strokeOpacity="0.5"
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

      {/* Blur layer with spotlight hole */}
      <div className="pg__blur" />

      {/* Blue glow that follows cursor */}
      <div className="pg__glow" />

      {/* Login card */}
      <form
        className={`pg__card${error ? ' pg__card--error' : ''}`}
        onSubmit={handleSubmit}
      >
        <div className="pg__logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3.5" fill="#d97757"/>
            <circle cx="4"  cy="6"  r="2.2" fill="#2f6fea" opacity="0.7"/>
            <circle cx="20" cy="6"  r="2.2" fill="#2f6fea" opacity="0.7"/>
            <circle cx="4"  cy="18" r="2.2" fill="#2f6fea" opacity="0.5"/>
            <circle cx="20" cy="18" r="2.2" fill="#2f6fea" opacity="0.5"/>
            <line x1="12" y1="12" x2="4"  y2="6"  stroke="#2f6fea" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="12" x2="20" y2="6"  stroke="#2f6fea" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="12" x2="4"  y2="18" stroke="#2f6fea" strokeWidth="1" opacity="0.4"/>
            <line x1="12" y1="12" x2="20" y2="18" stroke="#2f6fea" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>

        <h1 className="pg__title">Claude Atlas</h1>
        <p className="pg__subtitle">Enter password to continue</p>

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
          Enter →
        </button>
      </form>
    </div>
  );
}
