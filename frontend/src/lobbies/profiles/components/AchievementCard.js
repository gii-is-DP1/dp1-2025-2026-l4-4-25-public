import React from 'react';
import defaultProfileAvatar from "../../../static/images/icons/default_profile_avatar.png";

const AchievementCard = ({ achievement, profileImage }) => {
  const { tittle, description, unlocked, progress, badgeImage } = achievement;
  
  return (
    <li className={`achievement-card ${!unlocked ? 'locked' : ''}`}>
      <div className="achievement-info"> 
        <img
          className="achievement-avatar"
          src={badgeImage || defaultProfileAvatar}
          alt={tittle}
          style={{ 
            filter: !unlocked ? 'grayscale(100%) brightness(0.6)' : 'none',
            opacity: !unlocked ? 0.5 : 1
          }}
        />
        <div className="achievement-text">
          <strong>
            {unlocked ? '🏆 ' : '🔒 '}{tittle}
          </strong>
          <p>
            {description || 'No description'}
          </p>
        </div>
      </div>
      {!unlocked && (
        <div className="achievement-progress-text">
          {progress || '0/0'}
        </div>
      )}
    </li>
  );
};

export default AchievementCard;
