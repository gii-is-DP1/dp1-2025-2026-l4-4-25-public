import React from 'react';

const AdminGamesFilters = ({ 
  filters, 
  allUsers = [],
  onFilterChange, 
  onClearFilters 
}) => {
  return (
    <div className="filters-panel-unified">
      <h2>🔎 Advanced Filters 🔍</h2>
      <div className="filters-grid">
        <div className="filter-section">
          <h3>👥 Find by Users 👥</h3>
          
          <div className="filter-group">
            <label>👤 Creator:</label>
            <select
              name="creator"
              value={filters.creator}
              onChange={onFilterChange}
              className="filter-select">
              <option value="">All Creators</option>
              {allUsers.map((user) => (
                <option key={`creator-${user.id}`} value={user.username}>
                  {user.username}
                </option>))}
            </select>
          </div>

          <div className="filter-group">
            <label>🫂 Participant:</label>
            <select
              name="participant"
              value={filters.participant}
              onChange={onFilterChange}
              className="filter-select">
              <option value="">All Participants</option>
              {allUsers.map((user) => (
                <option key={`participant-${user.id}`} value={user.username}>
                  {user.username}
                </option>))}
            </select>
          </div>

          <div className="filter-group">
            <label>⭐ Winner (user):</label>
            <select
              name="winner"
              value={filters.winner}
              onChange={onFilterChange}
              className="filter-select">
              <option value="">All Winners</option>
              {allUsers.map((user) => (
                <option key={`winner-${user.id}`} value={user.username}>
                  {user.username}
                </option>))}
            </select>
          </div>
        </div>

      
        <div className="filter-section">
          <h3>⚙️ Game Settings</h3>
          <div className="filter-group">
            <label>🔁 Status:</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={onFilterChange}
              className="filter-select">
              <option value="">All Status</option>
              <option value="CREATED">Created</option>
              <option value="ONGOING">OnGoing</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div className="filter-group">
            <label>🌐 Privacy:</label>
            <select 
              name="privacy" 
              value={filters.privacy} 
              onChange={onFilterChange}
              className="filter-select">
              <option value="">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="filter-group">
            <label>👥 Min Players:</label>
            <input
              type="number"
              name="minPlayers"
              value={filters.minPlayers}
              onChange={onFilterChange}
              placeholder="Minimum players"
              className="filter-input"
              min="0"
            />
          </div>
        </div>

      </div>

      <button
        className="filter-clear-btn-unified"
        onClick={onClearFilters}
      >
        🗑️ Clear All Filters
      </button>
    </div>
  );
};

export default AdminGamesFilters;
