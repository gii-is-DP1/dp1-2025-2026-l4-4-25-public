import React from 'react';
import { toast } from 'react-toastify';
// Hacer el css de RoundEnd

export default function RoundEndModal({ 
  gameResult, 
  nuggetDistribution, 
  playerRoles,
  onStartNewRound,
  onEndGame 
}) {
  
  const { winnerRole, reason } = gameResult;
  
  const getReasonText = () => {
    if (reason === 'GOLD_REACHED') {
      return toast.success('The miners reached the gold!');
    } else if (reason === 'NO_CARDS') {
      return toast.info('🃏 No more cards left!');}
    return '';
  };

  return (
    <div className="">
          <h2 className="">
            {winnerRole === 'MINERS' ? '⛏️🏆 MINERS WIN THE ROUND 🏆⛏️' : '💣🏆 SABOTEURS WIN THE ROUND 🏆💣'}
          </h2>
          <p className="">{getReasonText()}</p>

        {/* Según la regla de negocio 22 para desvelar los roles al final de cada ronda */}
        <div className="">
          <h3>🎭💣 ¡ROLE REVELATION! ⛏️🎭</h3>
          <div className="">
            {playerRoles.map((player, index) => (
              <div 
                key={index} 
                className={`role-card ${player.role === 'SABOTEUR' ? 'saboteur-role' : 'miner-role'}`}>
                <div className="">{player.username}</div>
                <div className="">
                  {player.role === 'SABOTEUR' ? '💣 SABOTEUR 💣' : '⛏️ MINER ⛏️'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reparto de pepitas según la regla de negocio 23 y 24 */}
        <div className="">
          <h3>🪙 DISTRIBUTIONS OF GOLDS NUGGETS 🪙</h3>
          <div className="">
            {nuggetDistribution.map((player, index) => (
              <div key={index} className="">
                <span className="">{player.username}</span>
                <span className="">
                  {player.role === 'SABOTEUR' ? '💣' : '⛏️'}
                </span>
                <span className="">
                  {player.nuggets > 0 ? (
                    <>
                      +{player.nuggets} 🪙
                    </>
                  ) : (
                    <span className="no-nuggets">No nuggets❗</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Según la H26 tiene que haber un botón para empezar la nueva ronda (podriamos poner que sino empeiza sola a los 30 s con un 
          contador o que finalice el juego¿?, carece de sentido pero pondremos que lo haga el creador, AUN POR DETERMINAR) */}
        <div className="">
          <button 
            className=""
            onClick={onStartNewRound}>
            🟢 Start New Round
          </button>
          <button 
            className=""
            onClick={onEndGame}>
            🏁 End Game
          </button>
        </div>
    </div>
  );  
}
