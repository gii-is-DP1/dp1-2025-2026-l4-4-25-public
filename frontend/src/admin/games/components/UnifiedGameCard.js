import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const formatGameTime = (timeString) => {
  if (!timeString) return "N/A";
  const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return timeString;
  
  const hrs = match[1] ? parseInt(match[1]): 0;
  const min = match[2] ? parseInt(match[2]): 0;
  const segs = match[3] ? parseInt(match[3]): 0;
  
  if (hrs>0) {
    return `${hrs}h ${min}mins`}
  return `${min}mins ${segs}s`};

const UnifiedGameCard = ({ game, onSpectate, onForceFinish, onExpelPlayer }) => {
  const canSpectate = game.gameStatus === "ONGOING";
  const isFinished = game.gameStatus === "FINISHED";
  const isOngoing = game.gameStatus === "ONGOING";
  const isCreated = game.gameStatus === "CREATED";
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    if (!isOngoing || !game.startTime) return;

    const updateLiveTime = () => {
      const start = new Date(game.startTime);
      const now = new Date();
      const diffMs = now - start;
      
      const hours = Math.floor(diffMs/3600000);
      const minutes = Math.floor((diffMs%3600000)/60000);
      const seconds = Math.floor((diffMs%60000)/1000);
      
      if (hours > 0) {
        setLiveTime(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setLiveTime(`${minutes}m ${seconds}s`);
      }
    };

    updateLiveTime();
    const interval = setInterval(updateLiveTime, 1000);

    return () => clearInterval(interval);
  }, [isOngoing, game.startTime]);

  const formatCreatedAt = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const getCurrentRound = () => {
    if (!game.rounds || game.rounds.length === 0) return 1;
    return game.rounds.length;
  };
  
  return (
    <div className={`unified-game-card status-${game.gameStatus.toLowerCase()}`}>
      <div className="card-header">
        <h3>🎮 Game #{game.id}</h3>
        <span className={`status-badge-large status-${game.gameStatus.toLowerCase()}`}>
          {game.gameStatus}
        </span>
      </div>
      
      <div className="card-body">
        <div className="game-info-row">
          <div className="info-item">
            <span className="info-label">👤 Creator:</span>
            <span className="info-value">{game.creator || "Unknown"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🌐 Privacy:</span>
            <span className="info-value">{game.private ? "🔒 Private" : "🔓 Public"}</span>
          </div>
        </div>

        <div className="game-info-row">
          <div className="info-item">
            <span className="info-label">👥 Players:</span>
            <span className="info-value">{game.activePlayers?.length || 0}/{game.maxPlayers}</span>
          </div>
          {isCreated && (
            <div className="info-item">
              <span className="info-label">🕐 Created:</span>
              <span className="info-value">{formatCreatedAt(game.createdAt)}</span>
            </div>
          )}
          {isOngoing && (
            <>
              <div className="info-item">
                <span className="info-label">⏱️ Live Time:</span>
                <span className="info-value live-counter">{liveTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🎯 Round:</span>
                <span className="info-value">{getCurrentRound()}/3</span>
              </div>
            </>
          )}
          {isFinished && (
            <>
              <div className="info-item">
                <span className="info-label">⭐ Winner:</span>
                <span className="info-value winner-name">{game.winner?.username || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">⏱️ Duration:</span>
                <span className="info-value">{formatGameTime(game.time)}</span>
              </div>
            </>
          )}
        </div>

        <details className="participants-details">
          <summary>🫂 View Participants ({game.activePlayers?.length || 0})</summary>
          <ul className="participants-list">
            {game.activePlayers && game.activePlayers.length > 0 ? (
              game.activePlayers.map((p, idx) => (
                <li key={idx}>
                  {typeof p === 'string' ? p : p.username || p}
                  {game.creator === (typeof p === 'string' ? p : p.username) && " 👑"}
                </li>
              ))
            ) : (
              <li>❗No players</li>
            )}
          </ul>
        </details>
      </div>

      <div className="card-footer">
        {canSpectate && (
          <button 
            className="btn-spectate"
            onClick={() => onSpectate(game)}
            title="Watch this game">
            👁️ Spectate
          </button>
        )}
        {isOngoing && onForceFinish && (
          <button 
            className="btn-force-finish"
            onClick={() => onForceFinish(game)}
            title="Force finish this game">
            🛑 Force Finish
          </button>
        )}
        {isCreated && onExpelPlayer && (
          <button 
            className="btn-expel-player"
            onClick={() => onExpelPlayer(game)}
            title="Expel a player from this game">
            🚫 Expel Player
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedGameCard;
