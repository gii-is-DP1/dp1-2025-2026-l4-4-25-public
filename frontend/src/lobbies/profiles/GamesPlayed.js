import React from "react";
import useGamesHistory from './hooks/useGamesHistory';

// Importar componentes modulares
import TopButtons from './components/TopButtons';
import GamesHistoryHeader from './components/GamesHistoryHeader';
import GamesHistoryList from './components/GamesHistoryList';

import "../../App.css";
import "../../static/css/lobbies/GamesHistory.css";

export default function GamesHistory() {
  const { games, loading, error } = useGamesHistory();

  if (loading) {
    return (
      <div className="games-history-container">
        <TopButtons showLogout={false} returnTo="/profile" />
        <GamesHistoryHeader />
        <div className="games-history-list">
          <p>Loading games history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="games-history-container">
        <TopButtons showLogout={false} returnTo="/profile" />
        <GamesHistoryHeader />
        <div className="games-history-list">
          <p className="no-games">Error loading games: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="games-history-container">
      <TopButtons showLogout={false} returnTo="/profile" />
      <GamesHistoryHeader />
      <GamesHistoryList games={games} />
    </div>
  );
}
