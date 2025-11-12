import React, { useRef, useEffect } from 'react';

export default function GameLog({ gameLog, privateLog }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  return (
    <div className="game-log">
      <div className="game-log-header">💻 GAME LOG 💻</div>
      <div className="game-log-messages">
        {gameLog.length === 0 && privateLog.length === 0 ? (
          <p className="no-log">❕No actions yet...</p>
        ) : (
          <>
            {gameLog.map((log, index) => (
              <p
                key={`global-${index}`}
                className={`log-entry ${log.type}`}
                dangerouslySetInnerHTML={{ __html: log.msg }}
              />
            ))}

            {privateLog.map((log, index) => (
              <p
                key={`private-${index}`}
                className={`log-entry ${log.type}`}
                dangerouslySetInnerHTML={{ __html: log.msg }}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
