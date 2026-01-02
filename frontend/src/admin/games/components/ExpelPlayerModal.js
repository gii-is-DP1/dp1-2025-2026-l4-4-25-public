import React, { useState } from 'react';
import '../../../static/css/admin/AdminModals.css';

const ExpelPlayerModal = ({ game, onClose, onConfirm }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPlayer || !reason.trim()) return;
    setIsSubmitting(true);
    await onConfirm(game.id, selectedPlayer, reason);
    setIsSubmitting(false)};

  const players = game.activePlayers||[];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚫 Expel Player 🚫</h2>
          <button className="modal-close-btn" onClick={onClose}>➡️</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-info">
            <p><strong>· Game ID:</strong> #{game.id}</p>
            <p><strong>· Creator:</strong> {game.creator}</p>
            <p><strong>· Status:</strong> {game.gameStatus}</p>
          </div>

          <div className="modal-warning">
            <p>⚠️ The player will be removed from the game and notified with the reason.</p>
          </div>

          <div className="modal-field">
            <label htmlFor="player-select">· Select player to expel:</label>
            <select
              id="player-select"
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              disabled={isSubmitting}>
              <option value="">➡️ Choose a player ⬅️</option>
              {players.map((player, idx) => {
                const username = typeof player==='string'?player : player.username || player;
                return (
                  <option key={idx}value={username}>
                    {username} {username===game.creator?'👑 (Creator)':''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="reason">· Reason:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason to expel the player..."
              rows={4}
              maxLength={120}
              disabled={isSubmitting}/>
            <small>{reason.length}/120 characters</small>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-modal-cancel" 
            onClick={onClose}
            disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="btn-modal-confirm-danger" 
            onClick={handleSubmit}
            disabled={isSubmitting||!selectedPlayer||!reason.trim()}>
            {isSubmitting ? 'Processing...':'Expel Player'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpelPlayerModal;
