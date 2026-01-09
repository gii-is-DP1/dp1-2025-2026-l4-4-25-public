import React from 'react';
import { Link } from 'react-router-dom';

const LobbyControls = ({ 
  isCreator, 
  gameId,
  canStart,
  onSave, 
  onStart, 
  onCancel,
  onExitLobby
}) => {
  return (
    <div className="card-footer">
      {isCreator ? (
        <>
          <button onClick={onSave}>📑 SAVE CHANGES</button>
          <button 
            onClick={onStart} 
            disabled={!canStart}
            title={!canStart ? "You need at least 3 players to start" : ""}
            style={!canStart ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            ▶️ START
          </button>
          <button className="button-small">🔗 ID : {gameId}</button>
          <button onClick={onCancel}>❌ CANCEL</button>
        </>
      ) : (
        <>
          <Link to="/lobby">
            <button className="button-small" onClick={onExitLobby}>
              🚪 EXIT LOBBY
            </button>
          </Link>
          <div className="waiting-piece">
            <div className="spinner"></div>
            <span>WAITING ...</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LobbyControls;
