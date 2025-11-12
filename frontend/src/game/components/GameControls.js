import React from 'react';

export default function GameControls({ 
  deckCount, 
  formatTime, 
  cont, 
  numRound, 
  handleDiscard, 
  isSpectator 
}) {
  return (
    <>
      <div className="n-deck">🎴{deckCount}</div>
      
      <button 
        className="n-discard" 
        onClick={handleDiscard} 
        disabled={isSpectator}
        style={isSpectator ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        📥 Discard
      </button>
      
      <div className="time-card">⏰ {formatTime(cont)}</div>
      <div className="round-box">🕓·ROUND {numRound}/3</div>
    </>
  );
}
