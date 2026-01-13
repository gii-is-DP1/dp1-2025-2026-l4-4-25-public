import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FriendsDropdown from './FriendsDropdown';

const TopRightButtons = ({ 
  isAdmin, 
  showFriends, 
  onToggleFriends, 
  friends 
}) => {
  const [readmeSeen, setReadmeSeen] = useState(true);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('readmeSeen');
      setReadmeSeen(!!seen);
    } catch (e) { setReadmeSeen(true); }
  }, []);
  return (
    <div className="top-right-lobby-buttons">
      {!isAdmin && (
        <>
          <Link to="/ReadMe" className={`readme-button-container ${!readmeSeen ? 'readme-highlight' : ''}`}>
            <button className="button-logOut" onClick={() => { try { localStorage.setItem('readmeSeen', 'true'); setReadmeSeen(true); } catch (e){} }}>📄 Readme</button>
            {!readmeSeen && <span className="orbit" aria-hidden="true"></span>}
          </Link>
          <div className="friends-dropdown-container">
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
        </>
      )}
      <Link to="/profile">
        <button className="button-logOut">👤Profile</button>
      </Link>
    </div>
  );
};

export default TopRightButtons;
