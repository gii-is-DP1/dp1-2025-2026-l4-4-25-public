import React from 'react';

export default function SpectatorIndicator({ isSpectator }) {
  if (!isSpectator) return null;

  return (
    <div className="spectator-indicator">
      👁️ SPECTATOR MODE
    </div>
  );
}
