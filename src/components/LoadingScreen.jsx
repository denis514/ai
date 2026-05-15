import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

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

      {/* Ripple rings */}
      <div className="ls__rings">
        <div className="ls__ring ls__ring--1" />
        <div className="ls__ring ls__ring--2" />
        <div className="ls__ring ls__ring--3" />
      </div>

      {/* Center logo */}
      <div className="ls__logo">
        <Icon name="sparkles" size={28} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="ls__text">
        <h1 className="ls__title">Atlas</h1>
        <p className="ls__subtitle">Your knowledge map is loading…</p>
      </div>

    </div>
  );
}
