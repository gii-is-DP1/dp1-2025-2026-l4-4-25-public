import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import tokenService from "../../services/token.service";
import useAdminGames from './hooks/useAdminGames';
import AdminGamesFilters from './components/AdminGamesFilters';
import UnifiedGamesGrid from './components/UnifiedGamesGrid';
import ForceFinishModal from './components/ForceFinishModal';
import ExpelPlayerModal from './components/ExpelPlayerModal';

import "../../App.css";
import "../../static/css/admin/AdminGamesUnified.css";

export default function AdminGames() {
  const {
    filteredGames,
    allUsers,
    filters,
    loading,
    handleFilterChange,
    clearFilters,
    refreshGames,
    handleSpectate,
  } = useAdminGames();

  const [showForceFinishModal, setShowForceFinishModal] = useState(false);
  const [showExpelPlayerModal, setShowExpelPlayerModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleForceFinish = async (gameId, reason) => {
    try {
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`/api/v1/admin/games/${gameId}/force-finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to force-finish game');
      }

      toast.success(`Game #${gameId} has been force-finished. Players have been notified.`);
      setShowForceFinishModal(false);
      setSelectedGame(null);
      await refreshGames();
    } catch (error) {
      console.error('Error force-finishing game:', error);
      toast.error('Failed to force-finish game. Please try again.');
    }
  };

  const handleExpelPlayer = async (gameId, username, reason) => {
    try {
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`/api/v1/admin/games/${gameId}/expel-player`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to expel player');
      }

      toast.success(`Player ${username} has been expelled from game #${gameId}.`);
      setShowExpelPlayerModal(false);
      setSelectedGame(null);
      await refreshGames();
    } catch (error) {
      console.error('Error expelling player:', error);
      toast.error('Failed to expel player. Please try again.');
    }
  };

  const openForceFinishModal = (game) => {
    setSelectedGame(game);
    setShowForceFinishModal(true);
  };

  const openExpelPlayerModal = (game) => {
    setSelectedGame(game);
    setShowExpelPlayerModal(true);
  };

  if (loading) {
    return (
      <div className="admin-games-page">
        <div className="admin-header-unified">
          <h1>🎮 Game Management Dashboard</h1>
          <Link to="/lobby">
            <button className="btn-back-unified">➡️</button>
          </Link>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading games data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-games-page">
      <div className="admin-header-unified">
        <div className="header-content">
          <h1>🎮 Game Management Dashboard</h1>
          <p className="header-subtitle">Monitor and manage all games on Saboteur Game</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh-unified" onClick={refreshGames}>
            🔁
          </button>
          <Link to="/lobby">
            <button className="btn-back-unified">➡️</button>
          </Link>
        </div>
      </div>

      <div className="admin-content-wrapper">
        <div className="filters-section">
          <AdminGamesFilters
            filters={filters}
            allUsers={allUsers}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="games-section">
          <UnifiedGamesGrid 
            games={filteredGames} 
            onSpectate={handleSpectate}
            onForceFinish={openForceFinishModal}
            onExpelPlayer={openExpelPlayerModal}
          />
        </div>
      </div>

      {showForceFinishModal && selectedGame && (
        <ForceFinishModal
          game={selectedGame}
          onClose={() => {
            setShowForceFinishModal(false);
            setSelectedGame(null);
          }}
          onConfirm={handleForceFinish}
        />
      )}

      {showExpelPlayerModal && selectedGame && (
        <ExpelPlayerModal
          game={selectedGame}
          onClose={() => {
            setShowExpelPlayerModal(false);
            setSelectedGame(null);
          }}
          onConfirm={handleExpelPlayer}
        />
      )}
    </div>
  );
}
