import React from 'react';

export default function GameControls({ 
  deckCount, 
  formatTime, 
  cont, 
  numRound, 
  handleDiscard, 
  isSpectator,
  isCreator,
  handleForceEndRound,
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

      <button
        className="n-reveal"
        onClick={handleForceEndRound}
        disabled={isSpectator || !isCreator}
        style={isSpectator || !isCreator ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        title={isCreator ? 'Reveal gold and force end of round' : 'Only the game creator can force end round'}
      >
        🔎 Reveal & End Round
      </button>
      
      <div className={`time-card ${isMyTurn ? 'timer-active' : 'timer-frozen'}`}
           title={isMyTurn ? 'Your turn - timer running' : 'Waiting for your turn'}>
        {isMyTurn ? '⏰' : '⏸️'} {formatTime(cont)}
      </div>
      <div className="round-box">🕓·ROUND {numRound}/3</div>
    </>
  );
}
