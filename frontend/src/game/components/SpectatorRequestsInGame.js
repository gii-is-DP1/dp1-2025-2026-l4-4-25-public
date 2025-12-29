import React from 'react';
import '../../static/css/game/spectatorRequests.css';

const SpectatorRequestsInGame = ({ spectatorRequests, onAccept, onDeny }) => {
  if (!spectatorRequests || spectatorRequests.length === 0) {
    return null;
  }

  return (
    <div className="spectator-requests-ingame">
      <div className="spectator-requests-header">
        <h4>👁️ Spectator Requests</h4>
      </div>
      <div className="spectator-requests-list">
        {spectatorRequests.map((rq) => (
          <div key={rq.messageId ?? rq.username} className="spectator-request-item-ingame">
            <span className="spectator-username">{rq.username}</span>
            <div className="spectator-actions">
              <button 
                className="btn-accept-spectator" 
                onClick={() => onAccept(rq.username)}
              >
                ✅
              </button>
              <button 
                className="btn-deny-spectator" 
                onClick={() => onDeny(rq.username)}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorRequestsInGame;
