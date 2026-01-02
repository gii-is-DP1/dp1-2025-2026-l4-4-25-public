import React from 'react';
import UnifiedGameCard from './UnifiedGameCard';

const UnifiedGamesGrid = ({games, onSpectate, onForceFinish, onExpelPlayer }) => {
  if (!games||games.length === 0) {
    return (
      <div className="no-games-message">
        <h3>❌ No games found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    )}

  const createdGames = games.filter(g => g.gameStatus === "CREATED");
  const ongoingGames = games.filter(g => g.gameStatus === "ONGOING");
  const finishedGames = games.filter(g => g.gameStatus === "FINISHED");

  return (
    <div className="unified-games-container">
      <div className="games-stats">
        <div className="stat-card stat-created">
          <span className="stat-number">{createdGames.length}</span>
          <span className="stat-label">Created</span>
        </div>
        <div className="stat-card stat-ongoing">
          <span className="stat-number">{ongoingGames.length}</span>
          <span className="stat-label">Ongoing</span>
        </div>
        <div className="stat-card stat-finished">
          <span className="stat-number">{finishedGames.length}</span>
          <span className="stat-label">Finished</span>
        </div>
        <div className="stat-card stat-total">
          <span className="stat-number">{games.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <UnifiedGameCard 
            key={game.id} 
            game={game} 
            onSpectate={onSpectate}
            onForceFinish={onForceFinish}
            onExpelPlayer={onExpelPlayer}
          />
        ))}
      </div>
    </div>
  )};

export default UnifiedGamesGrid;
