import React from 'react';

const FriendsDropdown = ({ friends, onRequestClick, onFindPlayerClick }) => {
  return (
    <div className="friends-dropdown">
      <h4>🫂Friends Section🫂</h4>
      {friends.map((f, idx) => (
        <div key={idx} className="friend-item">
          <span>{f.username}</span>
          <span 
            className="friend-status" 
            style={{ backgroundColor: f.color }}
          ></span>
          <span>{f.status}</span>
        </div>
      ))}
      <hr />
      <button 
        className="friend-action" 
        onClick={onRequestClick}
      >
        📩Friend Request
      </button>
      <button 
        className="friend-action" 
        onClick={onFindPlayerClick}
      >
        🔎Find Player
      </button>
    </div>
  );
};

export default FriendsDropdown;
