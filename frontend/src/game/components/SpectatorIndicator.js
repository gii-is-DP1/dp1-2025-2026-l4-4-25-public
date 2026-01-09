import React from 'react';

export default function SpectatorIndicator({ isSpectator, onExit }) {
  if (!isSpectator) return null;

  return (
    <div className="spectator-indicator">
      <span>👁️ SPECTATOR MODE</span>
      {typeof onExit === 'function' && (
        <button
          type="button"
          className="btn-exit-spectator"
          onClick={onExit}
          aria-label="Exit spectator mode"
        >
          Exit
        </button>
      )}
    </div>
  );
}
