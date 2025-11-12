import React from 'react';
import avatar from '../../static/images/icons/1.jpeg';

export default function PlayersList({ activePlayers, CardPorPlayer }) {
  return (
    <div className="players-var">
      {activePlayers.map((player, index) => (
        <div key={index} className={`player-card player${index + 1}`}>
          <div className="player-avatar">
            <img src={player.profileImage || avatar} alt={player.username || player} />
          </div>
          <div className={`player-name player${index + 1}`}>
            {player.username || player}
          </div>
          <div className="player-lint"> 🔦 : 🟢</div>
          <div className="player-vag">🪨 : 🟢</div>
          <div className="player-pic"> ⛏️ : 🟢</div>
          <div className="player-pep"> 🪙 : 0 🎴 : {CardPorPlayer}</div>
        </div>
      ))}
    </div>
  );
}
