import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobby/profile/stats.css';

// Helper function to get JWT dynamically (prevents stale token issues)
const getJwt = () => tokenService.getLocalAccessToken();

export default function Stats() {
  const [stats, setStats] = useState({
    totalMatches: 0,
    averageGameDuration: 0,
    maxGameDuration: 0,
    minGameDuration: 0,
    averagePlayersPerGame: 0,
    gamePlayersMax: 0,
    gamePlayersMin: 0,
    averageGoldNuggets: 0,
    winPercentage: 0,
    averageTurnsPerGame: 0,
    globalAverageDuration: 0,
    globalMaxDuration: 0,
    globalMinDuration: 0,
    globalAveragePlayers: 0,
    globalMaxPlayers: 0,
    globalMinPlayers: 0,});

  useEffect(() => {
    const fetchStats = async () => {
      const jwt = getJwt();
      if (!jwt) return;
      
      try {
        const [totalMatches,averageGameDuration,maxGameDuration,minGameDuration,averagePlayersPerGame,gamePlayersMax,gamePlayersMin,
          averageGoldNuggets,winPercentage,averageTurnsPerGame,globalAverageDuration,globalMaxDuration,globalMinDuration,globalAveragePlayers,
          globalMaxPlayers,globalMinPlayers,] = await Promise.all([
          fetch('/api/v1/statistics/total-matches', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/average-game-duration', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/max-game-duration', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/min-game-duration', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/average-players-per-game', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/game-players-max', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/game-players-min', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/average-gold-nuggets', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/win-percentage', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/average-turns-per-game', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-duration-average', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-max-duration', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-min-duration', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-players-average', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-players-max', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),
          fetch('/api/v1/statistics/global-game-players-min', {
            headers: { Authorization:`Bearer ${jwt}`},
          }).then(res => res.json()),]);

        setStats({totalMatches,averageGameDuration,maxGameDuration,minGameDuration,averagePlayersPerGame,gamePlayersMax,gamePlayersMin,averageGoldNuggets,
          winPercentage,averageTurnsPerGame,globalAverageDuration,globalMaxDuration,globalMinDuration,globalAveragePlayers,globalMaxPlayers,globalMinPlayers,});
      } catch (error) {
        console.error('Error fetching:', error);}};
    fetchStats();
  }, []);

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;};

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>📊 Your Statistics 📊</h1>
          <Link to="/profile">
            <button className="button-small">🏠</button>
          </Link>
        </div>

        <div className="stats-container">
          <div className="stats-section">
            <h2>🎮 Your Game Stats 🎮</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-label">Total Matches</div>
                  <div className="stat-value">{stats.totalMatches}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">{(Number(stats.winPercentage) || 0).toFixed(1)}%</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <div className="stat-label">Avg Game Duration</div>
                  <div className="stat-value">{formatDuration(stats.averageGameDuration)}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-info">
                  <div className="stat-label">Max Duration</div>
                  <div className="stat-value">{formatDuration(stats.maxGameDuration)}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <div className="stat-label">Min Duration</div>
                  <div className="stat-value">{formatDuration(stats.minGameDuration)}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-label">Avg Players</div>
                  <div className="stat-value">{(Number(stats.averagePlayersPerGame) || 0).toFixed(1)}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍👩‍👧‍👦</div>
                <div className="stat-info">
                  <div className="stat-label">Max Players</div>
                  <div className="stat-value">{stats.gamePlayersMax}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <div className="stat-label">Min Players</div>
                  <div className="stat-value">{stats.gamePlayersMin}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🪙</div>
                <div className="stat-info">
                  <div className="stat-label">Avg Gold Nuggets</div>
                  <div className="stat-value">{(Number(stats.averageGoldNuggets) || 0).toFixed(1)}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-info">
                  <div className="stat-label">Avg Turns/Game</div>
                  <div className="stat-value">{(Number(stats.averageTurnsPerGame) || 0).toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2>🌍 Global Statistics 🌍</h2>
            <div className="stats-grid">
              <div className="stat-card global">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <div className="stat-label">Global Avg Duration</div>
                  <div className="stat-value">{formatDuration(stats.globalAverageDuration)}</div>
                </div>
              </div>

              <div className="stat-card global">
                <div className="stat-icon">⏰</div>
                <div className="stat-info">
                  <div className="stat-label">Global Max Duration</div>
                  <div className="stat-value">{formatDuration(stats.globalMaxDuration)}</div>
                </div>
              </div>

              <div className="stat-card global">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <div className="stat-label">Global Min Duration</div>
                  <div className="stat-value">{formatDuration(stats.globalMinDuration)}</div>
                </div>
              </div>

              <div className="stat-card global">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-label">Global Avg Players</div>
                  <div className="stat-value">{(Number(stats.globalAveragePlayers) || 0).toFixed(1)}</div>
                </div>
              </div>

              <div className="stat-card global">
                <div className="stat-icon">👨‍👩‍👧‍👦</div>
                <div className="stat-info">
                  <div className="stat-label">Global Max Players</div>
                  <div className="stat-value">{stats.globalMaxPlayers}</div>
                </div>
              </div>

              <div className="stat-card global">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <div className="stat-label">Global Min Players</div>
                  <div className="stat-value">{stats.globalMinPlayers}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
