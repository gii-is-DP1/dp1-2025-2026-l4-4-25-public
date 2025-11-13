import React from 'react';
import defaultProfileAvatar from "../../../static/images/icons/default_profile_avatar.png";

const AchievementCard = ({ achievement, profileImage }) => {
  const { tittle, description } = achievement;
  
  return (
    <li className="achievement-card">
      <div className="achievement-info"> 
        <img
          className="achievement-avatar"
          src={profileImage || defaultProfileAvatar}
          alt="User Avatar"
        />
        <div className="achievement-text">
          <strong>{tittle}</strong>
          <p>{description || 'No description'}</p>
        </div>
      </div>
      <div className="achievement-progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${0}%` }}
        ></div>
      </div>
    </li>
  );
};

export default AchievementCard;
