import React from 'react';
import GameCard from './GameCard';

const GamesGrid = ({ games, userFriends = [], onRequestJoin, onRequestSpectator, onSpectate }) => {
  if (!games || games.length === 0) {
    return (
      <div className="listgames-card">
        <p>❌There are no games that match the filters.</p>
      </div>
    );
  }

  return (
    <div className="listgames-card">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          userFriends={userFriends}
          onRequestJoin={onRequestJoin}
          onRequestSpectator={onRequestSpectator}
          onSpectate={onSpectate}
        />
      ))}
    </div>
  );
};

export default GamesGrid;
