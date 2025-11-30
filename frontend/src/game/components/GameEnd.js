import React from 'react';

export default function GameEndModal({ 
  playerRankings,
  countdown
}) {
  
  // Ordenar por total de pepitas (de mayor a menor)
  const sortedRankings = [...(playerRankings || [])].sort((a, b) => b.totalNuggets - a.totalNuggets);
  
  // El ganador es el primero del ranking
  const winner = sortedRankings[0];
  
  // Función para obtener el emoji del podio
  const getPodiumEmoji = (position) => {
    switch(position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${position + 1}`;
    }
  };

  return (
    <div className="round-end-overlay">
      <div className="round-end-card game-end-card">
        <h2 className="game-end-title">
          🎮🏆 GAME OVER 🏆🎮
        </h2>
        
        {/* Ganador */}
        {winner && (
          <div className="game-winner-section">
            <h3 className="winner-announcement">👑 WINNER 👑</h3>
            <div className="winner-card">
              <span className="winner-emoji">🏆</span>
              <span className="winner-name">{winner.username}</span>
              <span className="winner-nuggets">{winner.totalNuggets} 🪙</span>
            </div>
          </div>
        )}

        {/* Ranking completo */}
        <div className="round-end-section">
          <h3 className="round-end-section-title">📊 FINAL RANKINGS 📊</h3>
          <div className="rankings-grid">
            {sortedRankings.map((player, index) => (
              <div 
                key={index} 
                className={`ranking-row ${index === 0 ? 'ranking-first' : ''} ${index === 1 ? 'ranking-second' : ''} ${index === 2 ? 'ranking-third' : ''}`}
              >
                <span className="ranking-position">{getPodiumEmoji(index)}</span>
                <span className="ranking-username">{player.username}</span>
                <span className="ranking-nuggets">{player.totalNuggets} 🪙</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown para volver al lobby */}
        <div className="round-end-countdown">
          <p className="countdown-text">
            Returning to lobby in: {countdown}s
          </p>
          <div className="countdown-bar">
            <div 
              className="countdown-progress" 
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );  
}
