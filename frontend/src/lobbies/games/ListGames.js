import React from "react";
import useListGames from './hooks/useListGames';

// Importar componentes modulares
import ListGamesHeader from './components/ListGamesHeader';
import GamesGrid from './components/GamesGrid';
import FiltersPanel from './components/FiltersPanel';

import "../../App.css";
import "../../static/css/lobbies/games/ListGames.css";

export default function ListGames() {
  const {
    filteredGames,
    filters,
    onlyFriend,
    loading,
    refreshGames,
    handleSpectator,
    handleRequestJoin,
    handleFilterChange,
    clearFilters,
    toggleFriendFilter
  } = useListGames();

  if (loading) {
    return (
      <div className="home-page-lobby-container">
        <ListGamesHeader onRefresh={refreshGames} />
        <div className="listgames-content">
          <div className="listgames-card">
            <p>Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-lobby-container">
      <ListGamesHeader onRefresh={refreshGames} />

      <div className="listgames-content">
        <GamesGrid
          games={filteredGames}
          onRequestJoin={handleRequestJoin}
          onSpectate={handleSpectator}
        />

        <FiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onlyFriend={onlyFriend}
          onToggleFriendFilter={toggleFriendFilter}
        />
      </div>
    </div>
  );
}

