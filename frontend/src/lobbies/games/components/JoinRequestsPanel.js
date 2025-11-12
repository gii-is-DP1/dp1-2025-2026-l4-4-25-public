import React from 'react';

const JoinRequestsPanel = ({ joinRequests, onAccept, onDeny }) => {
  if (!joinRequests || joinRequests.length === 0) {
    return null;
  }

  return (
    <div className="join-requests-panel">
      <h3>📥Request Join📥</h3>
      {joinRequests.map((rq) => (
        <div key={rq.messageId ?? rq.username} className="join-request-item">
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

export default JoinRequestsPanel;
