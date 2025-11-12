import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ 
  game, 
  onRequestJoin, 
  onSpectate 
}) => {
  const isFull = game.activePlayers.length >= game.maxPlayers;
  const isCreated = game.gameStatus === "CREATED";

  const renderActionButton = () => {
    if (!isCreated) {
      return (
        <button 
          className="button-join-game" 
          onClick={() => onSpectate(game)}
        >
          👁️‍🗨️SPECTATE
        </button>
      );
    }

    if (isFull) {
      return (
        <button className="button-join-game" disabled>
          🔴GAME IS FULL
        </button>
      );
    }

    if (game.private) {
      return (
        <button 
          className="button-join-game" 
          onClick={() => onRequestJoin(game)}
        >
          📩REQUEST JOIN
        </button>
      );
    }

    return (
      <Link to={`/CreateGame/${game.id}`} state={{ game }}>
        <button className="button-join-game">📥JOIN</button>
      </Link>
    );
  };

  return (
    <div className="game-card">
      <h3>🎮 Game of {game.creator || "Unknown"}</h3>
      <p>🖥️ ID: {game.id}</p>
      <p>🔁 Status: {game.gameStatus}</p>
      <p>
        👤 Players: {game.activePlayers?.length || 0}/{game.maxPlayers}
      </p>
      <div className="players-list">
        <label>🫂 Jugadores:</label>
        <ul>
          {game.activePlayers.map((p, idx) => (
            <li key={idx}>{p.username ?? p}</li>
          ))}
        </ul>
      </div>
      <p>🌐 Privacy: {game.private ? "Private 🔒" : "Public 🔓"}</p>
      <div className="game-card-footer">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default GameCard;
