import React, { useEffect, useState } from 'react';
import BranchLoader from './BranchLoader.jsx';

/**
 * LoadingScreen — полноэкранная стартовая заставка (бренд 105 Atlas).
 * Использует общую анимацию BranchLoader («импульс по ветвям») + текст.
 */
export default function LoadingScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Start exit animation at 2.0s, call onDone at 2.6s
    const t1 = setTimeout(() => setExiting(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`ls${exiting ? ' ls--exiting' : ''}`}>
      <BranchLoader />
      <div className="ls__text">
        <h1 className="ls__title">Atlas</h1>
        <p className="ls__subtitle">Your knowledge map is loading…</p>
      </div>
    </div>
  );
}
