import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAchievementsData from './hooks/useAchievementsData';

// Importar componentes modulares
import ProfileLogo from './components/ProfileLogo';
import TopButtons from './components/TopButtons';
import AchievementsList from './components/AchievementsList';

import '../../App.css';
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobbies/achievements.css';

export default function Achievements() {
  const { achievements, profile, loading, error, isAdmin } = useAchievementsData();
  const navigate = useNavigate();

  if (loading && !profile) {
    return (
      <div className="home-page-container">
        <ProfileLogo />
        <TopButtons returnTo={isAdmin ? "/lobby" : "/profile"} />
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-container">
        <ProfileLogo />
        <TopButtons returnTo={isAdmin ? "/lobby" : "/profile"} />
        <div>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <ProfileLogo />
      <TopButtons returnTo={isAdmin ? "/lobby" : "/profile"} />
      
      <div className="achievement-overlay">
        {isAdmin && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="admin-badge">⭐ ADMIN</span>
            <button 
              className="button-small"
              onClick={() => navigate('/achievements/admin', { state: { from: '/achievements' } })}
            >
              ✏️ EDIT ACHIEVEMENTS
            </button>
          </div>
        )}
        
        <AchievementsList 
          achievements={achievements}
          username={profile?.username || 'User'}
          profileImage={profile?.image}
        />
      </div>
    </div>
  );
}

