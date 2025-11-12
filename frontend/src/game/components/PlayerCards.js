import React from 'react';

export default function PlayerCards({ CardPorPlayer, isSpectator }) {
  if (isSpectator) return null;

  const cards = [...Array(CardPorPlayer)].map((_, i) => (
    <button key={i} className="card-slot">Cards {i + 1}</button>
  ));

  return (
    <div className="player-cards">
      <div className="cards-label">MY CARDS</div>
      <div className="cards-list">
        {cards}
      </div>
    </div>
  );
}
