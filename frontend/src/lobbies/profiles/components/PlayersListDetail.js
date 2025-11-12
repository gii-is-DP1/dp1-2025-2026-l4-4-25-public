import React from 'react';

const PlayersListDetail = ({ players }) => {
  if (!players || players.length === 0) {
    return (
      <details className="players-details">
        <summary>🧑‍🤝‍🧑 List of Players</summary>
        <ul>
          <li>❌Not Players registered</li>
        </ul>
      </details>
    );
  }

  return (
    <details className="players-details">
      <summary>🧑‍🤝‍🧑 List of Players</summary>
      <ul>
        {players.map((p, i) => (
          <li key={i}>
            {p.username || p}
          </li>
        ))}
      </ul>
    </details>
  );
};

export default PlayersListDetail;
