import React from 'react';

const SpectatorRequestsPanel = ({ spectatorRequests, onAccept, onDeny }) => {
  if (!spectatorRequests || spectatorRequests.length === 0) {
    return null;
  }

  return (
    <div className="spectator-requests-panel">
      <h3>👁️ Request Spectator 👁️</h3>
      {spectatorRequests.map((rq) => (
        <div key={rq.messageId ?? rq.username} className="spectator-request-item">
          <span>{rq.username}</span>
          <div>
            <button onClick={() => onAccept(rq.username)}>ACCEPT✅</button>
            <button onClick={() => onDeny(rq.username)}>DENY❌</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpectatorRequestsPanel;
