import React, { useState } from 'react';
import AchievementCard from './AchievementCard';

const AchievementsList = ({ achievements, username, profileImage }) => {
  const [filterMetric, setFilterMetric] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  if (!achievements || achievements.length === 0) {
    return (
      <div className="achievements-container">
        <h1 className="achievements-title">
          🏆 ACHIEVEMENTS OF {username} 🏆
        </h1>
        <p className="achievements-subtitle">No achievements available</p>
      </div>
    );
  }

  // Filtrar logros según los filtros seleccionados
  const filteredAchievements = achievements.filter(ach => {
    const matchesMetric = filterMetric === 'ALL' || ach.metric === filterMetric;
    const matchesStatus = filterStatus === 'ALL' || 
                          (filterStatus === 'UNLOCKED' && ach.unlocked) ||
                          (filterStatus === 'LOCKED' && !ach.unlocked);
    return matchesMetric && matchesStatus;
  });

  const unlockedAchievements = achievements.filter(ach => ach.unlocked);

  // Lista de métricas disponibles
  const metrics = [
    { value: 'ALL', label: 'All Metrics' },
    { value: 'GAMES_PLAYED', label: 'Games Played' },
    { value: 'VICTORIES', label: 'Victories' },
    { value: 'BUILDED_PATHS', label: 'Built Paths' },
    { value: 'DESTROYED_PATHS', label: 'Destroyed Paths' },
    { value: 'GOLD_NUGGETS', label: 'Gold Nuggets' },
    { value: 'TOOLS_DAMAGED', label: 'Tools Damaged' },
    { value: 'TOOLS_REPAIRED', label: 'Tools Repaired' }
  ];

  return (
    <div className="achievements-container">
      <h1 className="achievements-title">
        🏆 ACHIEVEMENTS OF {username} 🏆
      </h1>
      <p className="achievements-subtitle">
        {unlockedAchievements.length} / {achievements.length} Unlocked
      </p>
      
      {/* Filtros */}
      <div className="achievements-filters">
        <div className="filter-group">
          <label htmlFor="metric-filter">Metric:</label>
          <select 
            id="metric-filter"
            className="filter-select"
            value={filterMetric}
            onChange={(e) => setFilterMetric(e.target.value)}
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="UNLOCKED">Unlocked</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
      </div>
      
      <div className="achievements-grid">
        {filteredAchievements.map((ach, index) => (
          <AchievementCard 
            key={ach.id || index}
            achievement={ach}
            profileImage={profileImage}
          />
        ))}
      </div>
      
      {filteredAchievements.length === 0 && (
        <p className="no-results">No achievements match the selected filters</p>
      )}
    </div>
  );
};

export default AchievementsList;
