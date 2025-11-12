import React from 'react';
import useAchievementsData from './hooks/useAchievementsData';

// Importar componentes modulares
import ProfileLogo from './components/ProfileLogo';
import TopButtons from './components/TopButtons';
import AchievementsList from './components/AchievementsList';

import '../../App.css';
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobbies/achievements.css';

export default function Achievements() {
  const { achievements, profile, loading, error } = useAchievementsData();

  if (loading && !profile) {
    return (
      <div className="home-page-container">
        <ProfileLogo />
        <TopButtons />
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-container">
        <ProfileLogo />
        <TopButtons />
        <div>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <ProfileLogo />
      <TopButtons />
      
      <AchievementsList 
        achievements={achievements}
        username={profile?.username || 'User'}
        profileImage={profile?.image}
      />
    </div>
  );
}

