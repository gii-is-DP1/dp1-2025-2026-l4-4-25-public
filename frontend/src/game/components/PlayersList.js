import React from 'react';
import avatar from '../../static/images/icons/1.jpeg';

export default function PlayersList({ activePlayers, playerCardsCount, playerTools }) {
  return (
    <div className="players-var">
      {activePlayers.map((player, index) => {
        const username = player.username || player;
        const tools = playerTools?.[username] || { candle: true, wagon: true, pickaxe: true };
        const cardCount = playerCardsCount?.[username] || 0;
        const goldNuggets = player.goldNugget || 0;
        
        return (
          <div key={index} className={`player-card player${index + 1}`}>
            <div className="player-avatar">
              <img src={player.profileImage || avatar} alt={username} />
            </div>
            <div className={`player-name player${index + 1}`}>
              {username}
            </div>
            <div className="player-lint"> 🔦 : {tools.candle ? '🟢' : '🔴'}</div>
            <div className="player-vag">🪨 : {tools.wagon ? '🟢' : '🔴'}</div>
            <div className="player-pic"> ⛏️ : {tools.pickaxe ? '🟢' : '🔴'}</div>
            <div className="player-pep"> 🪙 : {goldNuggets} 🎴 : {cardCount}</div>
          </div>
        );
      })}
    </div>
  );
}
