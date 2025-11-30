import React from 'react';
import GameHistoryCard from './GameHistoryCard';
import EmptyGamesState from './EmptyGamesState';

const GamesHistoryList = ({ games }) => {
  if (!games || games.length === 0) {
    return (
      <div className="games-history-list">
        <EmptyGamesState />
      </div>
    );
  }

  return (
    <div className="games-history-list">
      {games.map((game) => (
        <GameHistoryCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GamesHistoryList;
