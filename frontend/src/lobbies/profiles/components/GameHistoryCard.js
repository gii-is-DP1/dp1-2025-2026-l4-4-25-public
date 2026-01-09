import React from 'react';
import PlayersListDetail from './PlayersListDetail';
import { formatGameTime } from '../utils/gamesHistoryHelpers';

const GameHistoryCard = ({ game }) => {

  const getWinnerUsername = () => {
    if (!game.winner) return "N/A";
    if (typeof game.winner === 'string') return game.winner;
    if (game.winner.username) return game.winner.username;
    const winnerId = typeof game.winner === 'object' ? game.winner.id : game.winner;
    const winnerPlayer = game.activePlayers?.find(p => p.id === winnerId);
    
    return winnerPlayer?.username || "N/A"};

  return (
    <div className="game-history-card">
      <div className="game-info">
        <h2>
          🎮 Game of{" "}
          <span className="creator-name">
            {game.creator || "Desconocido"}
          </span>{" "}
          <span className="game-id">(ID: {game.id})</span>
        </h2>

        <p>
          👥 Players:{" "}
          <b>{game.activePlayers?.length || 0}</b>
        </p>

        <p>
          ⭐ Winner:{" "}
          <b>{getWinnerUsername()}</b>
        </p>

        <p>
          ⏱️ Total Time: <b>{formatGameTime(game.time)}</b>
        </p>

        <PlayersListDetail players={game.activePlayers} />
      </div>
    </div>
  );
};

export default GameHistoryCard;
