import React from 'react';
import PlayersListDetail from './PlayersListDetail';
import { formatGameTime } from '../utils/gamesHistoryHelpers';

const GameHistoryCard = ({ game }) => {
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
          <b>{game.maxPlayers || 0}</b>
        </p>

        <p>
          ⭐ Winner:{" "}
          <b>{game.winner?.username || "N/A"}</b>
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
