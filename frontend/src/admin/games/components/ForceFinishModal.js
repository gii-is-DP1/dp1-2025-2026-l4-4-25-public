import React, { useState } from 'react';
import '../../../static/css/admin/AdminModals.css';

const ForceFinishModal = ({ game, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onConfirm(game.id, reason);
    setIsSubmitting(false)};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🛑 Force Finish Game 🛑</h2>
          <button className="modal-close-btn" onClick={onClose}>➡️</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-info">
            <p><strong>· Game ID:</strong> #{game.id}</p>
            <p><strong>· Creator:</strong> {game.creator}</p>
            <p><strong>· Players:</strong> {game.activePlayers?.length||0}</p>
            <p><strong>· Status:</strong> ONGOING</p>
          </div>

          <div className="modal-warning">
            <p>⚠️ This action will immediately end the game and put it as FINISHED. All players will be notified and rediriged to the Lobby.</p>
          </div>

          <div className="modal-field">
            <label htmlFor="reason">· Reason:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason to force-finish the game..."
              rows={4}
              maxLength={150}
              disabled={isSubmitting}/>
            <small>{reason.length}/150 characters</small>
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
            disabled={isSubmitting || !reason.trim()}>
            {isSubmitting?'Processing...':'Force Finish'}
          </button>
        </div>
      </div>
    </div>
  )};

export default ForceFinishModal;
