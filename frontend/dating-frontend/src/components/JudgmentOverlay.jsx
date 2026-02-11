import React from 'react';
import '../JudgmentOverlay.css';

export default function JudgmentOverlay({ decision, reason, onClose }) {
  if (!decision) return null;

  const isRight = decision === "SWIPE RIGHT";

  return (
    <div className="judgment-overlay" onClick={onClose}>
      <div className="judgment-card" onClick={(e) => e.stopPropagation()}>
        <div className={`judgment-icon ${isRight ? 'right' : 'left'}`}>
          {isRight ? '✅' : '❌'}
        </div>
        <h2 className={`judgment-decision ${isRight ? 'right' : 'left'}`}>
          {decision}
        </h2>
        <p className="judgment-reason">{reason}</p>
        <button className="judgment-close-btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
