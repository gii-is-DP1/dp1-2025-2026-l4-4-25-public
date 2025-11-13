import React from 'react';

const InviteFriends = () => {
  return (
    <div className="form-group add-friends-section">
      <label>Invite friends</label>
      <div className="friends-list">
        <div className="add-friend-button">
          <button>
            <img 
              src="https://via.placeholder.com/40/DDDDDD/6D4C41?text=%2B" 
              alt="Invite more friends" 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriends;
