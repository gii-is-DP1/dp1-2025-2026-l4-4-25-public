import React from 'react';
import { Link } from 'react-router-dom';
import FriendsDropdown from './FriendsDropdown';

const TopRightButtons = ({ 
  isAdmin, 
  showFriends, 
  onToggleFriends, 
  friends 
}) => {
  return (
    <div className="top-right-lobby-buttons">
      {!isAdmin && (
        <div className="friends-dropdown-container">
        <Link to="/profile">
          <button className="button-logOut">📄Readme</button>
        </Link>
          <button 
            className="button-logOut" 
            onClick={onToggleFriends}
        >
              🫂Friends
            </button>
          {showFriends && (
            <FriendsDropdown 
              friends={friends}
              onRequestClick={() => console.log('Friend request clicked')}
              onFindPlayerClick={() => console.log('Find player clicked')}
            />
          )}
        </div>
      )}
      <Link to="/profile">
        <button className="button-logOut">👤Profile</button>
      </Link>
    </div>
  );
};

export default TopRightButtons;
