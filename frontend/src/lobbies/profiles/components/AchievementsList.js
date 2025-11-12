import React from 'react';
import AchievementCard from './AchievementCard';

const AchievementsList = ({ achievements, username, profileImage }) => {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="achievements-list">
        <h1 className="achievement-text">
          🏆 ACHIEVEMENTS OF {username}🏆
        </h1>
        <p className="achievement-text">No achievements yet</p>
      </div>
    );
  }

  return (
    <ul className="achievements-list">
      <h1 className="achievement-text">
        🏆 ACHIEVEMENTS OF {username}🏆
      </h1>
      {achievements.map((ach, index) => (
        <AchievementCard 
          key={ach.id || index}
          achievement={ach}
          profileImage={profileImage}
        />
      ))}
    </ul>
  );
};

export default AchievementsList;
