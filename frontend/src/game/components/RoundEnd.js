import React from 'react';

export default function RoundEndModal({ 
  winnerTeam, 
  reason,
  goldDistribution, 
  playerRoles,
  countdown,
  roundNumber
}) {
  
  const getReasonText = () => {
    if (reason === 'GOLD_REACHED') {
      return '⛏️ The miners reached the gold!';
    } else if (reason === 'NO_CARDS') {
      return '🃏 No more cards left!';
    }
    return '';
  };

  return (
    <div className="round-end-overlay">
      <div className="round-end-card">
        <h2 className="round-end-title">
          {winnerTeam === 'MINERS' ? '⛏️🏆 MINERS WIN THE ROUND 🏆⛏️' : '💣🏆 SABOTEURS WIN THE ROUND 🏆💣'}
        </h2>
        <p className="round-end-reason">{getReasonText()}</p>

        {/* Según la regla de negocio 22 para desvelar los roles al final de cada ronda */}
        <div className="round-end-section">
          <h3 className="round-end-section-title">🎭 ROLE REVELATION 🎭</h3>
          <div className="roles-grid">
            {playerRoles && playerRoles.map((player, index) => (
              <div 
                key={index} 
                className={`role-reveal-card ${player.rol === 'SABOTEUR' ? 'saboteur-role' : 'miner-role'}`}>
                <div className="role-reveal-username">{player.username}</div>
                <div className="role-reveal-role">
                  {player.rol === 'SABOTEUR' ? '💣 SABOTEUR' : '⛏️ MINER'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reparto de pepitas según la regla de negocio 23 y 24 */}
        <div className="round-end-section">
          <h3 className="round-end-section-title">🪙 GOLD NUGGETS DISTRIBUTION 🪙</h3>
          <div className="nuggets-grid">
            {goldDistribution && goldDistribution.map((player, index) => (
              <div key={index} className="nugget-row">
                <span className="nugget-username">{player.username}</span>
                <span className="nugget-role">
                  {player.rol === 'SABOTEUR' ? '💣' : '⛏️'}
                </span>
                <span className="nugget-amount">
                  {player.nuggetsEarned > 0 ? (
                    <span className="nuggets-earned">+{player.nuggetsEarned} 🪙</span>
                  ) : (
                    <span className="no-nuggets">No nuggets</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown para la nueva ronda */}
        <div className="round-end-countdown">
          <p className="countdown-text">
            {roundNumber < 3 
              ? `Next round starts in: ${countdown}s` 
              : 'Final results coming...'}
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
