import React from 'react';

export default function GameControls({ 
  deckCount, 
  formatTime, 
  cont, 
  numRound, 
  handleDiscard, 
  isSpectator,
  isCreator,
  isMyTurn
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

      {/* Botón de revelar y forzar fin de ronda eliminado */}
      
      <div className={`time-card ${isMyTurn ? 'timer-active' : 'timer-frozen'}`}
           title={isMyTurn ? 'Your turn - timer running' : 'Waiting for your turn'}>
        {isMyTurn ? '⏰' : '⏸️'} {formatTime(cont)}
      </div>
      <div className="round-box">🕓·ROUND {numRound}/3</div>
    </>
  );
}
