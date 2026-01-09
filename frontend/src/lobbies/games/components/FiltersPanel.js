import React from 'react';

const FiltersPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  onlyFriend,
  onToggleFriendFilter
}) => {
  return (
    <div className="filters-panel">
      <h2>Filters</h2>
      
      <div className="filter-group">
        <label>🌐Privacy:</label>
        <select 
          name="privacy" 
          value={filters.privacy} 
          onChange={onFilterChange}
        >
          <option value="">Alls</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="filter-group">
        <label>🔁Status:</label>
        <select 
          name="status" 
          value={filters.status} 
          onChange={onFilterChange}
        >
          <option value="">Alls</option>
          <option value="CREATED">Created</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      <div className="filter-group">
        <label>👤Active Players / Game:</label>
        <input
          type="number"
          name="minPlayers"
          value={filters.minPlayers}
          onChange={onFilterChange}
          placeholder="Ej: 3"
        />
      </div>

      <div className="filter-group">
        <label>🔎Find game:</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="For ID of game"
        />
      </div>

      <div>
        <button
          className={`filter-friends-btn ${onlyFriend ? "active" : ""}`}
          onClick={onToggleFriendFilter}
        >
          {onlyFriend ? "✅ Friends Games" : "👥 Show Only Friends Games"}
        </button>
      </div>

      <button
        className="filter-clear-btn"
        onClick={onClearFilters}
      >
        Clean filters
      </button>
    </div>
  );
};

export default FiltersPanel;
