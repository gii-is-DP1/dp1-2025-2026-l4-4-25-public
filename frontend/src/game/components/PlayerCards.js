import React, { useEffect, useState } from 'react';
import { getNonRotatedCards, shuffleInPlace } from '../utils/gameUtils';

export default function PlayerCards({ game, ListCards, activePlayers, postDeck, findActivePlayerId }) {
  const [hand, setHand] = useState([]);

  const pickRandomNonRotated = (cards, count = 5) => {
    const pool = getNonRotatedCards(cards).slice();
    shuffleInPlace(pool);
    return pool.slice(0, Math.min(count, pool.length));
  };

  // Cuando tengamos cartas y jugadores, genera mano y súbela
  useEffect(() => {
    console.log('useEffect ejecutado');
    console.log('ListCards:', ListCards);
    console.log('activePlayers:', activePlayers);
    
    if (Array.isArray(ListCards) && ListCards.length > 0 && Array.isArray(activePlayers) && activePlayers.length > 0) {
      const id = findActivePlayerId(activePlayers);
      console.log('Active Player ID:', id);
      if (!id) return;

      const newHand = pickRandomNonRotated(ListCards, 5);
      console.log('Generando mano:', newHand);
      setHand(newHand);
      postDeck(id, newHand);
    }
  }, [ListCards, activePlayers]);

  return (
    <div className="player-cards">
      <div className="cards-label">MY CARDS</div>
      <div className="cards-list">
        {hand.map((card, i) => (
          <div key={card.id ?? `${card.image}-${i}`} className="card-slot">
            <img src={card.image} alt={card.name ?? card.image} className="static-card-image" />
          </div>
        ))}
      </div>
    </div>
  );
}
