import React from 'react';

const PlayersListLobby = ({ 
  activePlayers = [], 
  maxPlayers = 0, 
  creatorUsername,
  isCreator, 
  onExpelPlayer 
}) => {
  return (
    <div className="active-players-section">
      <h2>Players : ({activePlayers.length}/{maxPlayers})</h2>
      <div className="active-players-list">
        {activePlayers.map((username, index) => (
          <div key={username ?? index} className="player-card2">
            <div className="player-avatar" title={username}></div>
            <div className="player-name">{username}</div>
            {isCreator && username !== creatorUsername && (
              <button
                className="expel-player-btn"
                onClick={() => onExpelPlayer(username)}
              >
                ❌ EXPEL
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersListLobby;
