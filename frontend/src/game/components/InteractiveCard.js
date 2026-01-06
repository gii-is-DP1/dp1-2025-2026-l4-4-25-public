import React, { useState } from 'react';
import { isTunnelCard, isActionCard, isCollapseCard, isMapCard } from '../utils/cardUtils';

export default function InteractiveCard({ 
  card, 
  index,
  onTunnelCardDrop,
  onActionCardUse,
  onMapCardUse,
  playerOrder,
  currentUsername,
  isMyTurn,
  deckCount,
  isSelected,
  onToggleSelect,
  rotation = 0,
  onToggleRotation,
  allCards = [],
  onCardReplaced = null 
}) {
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  const [showObjectiveMenu, setShowObjectiveMenu] = useState(false);

  const handleDragStart = (e) => {
    if (isTunnelCard(card) && isMyTurn) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(card));
      e.dataTransfer.setData('cardIndex', index.toString());
      e.dataTransfer.setData('text/plain', card.id);
    } else {
      e.preventDefault();
    }
  };

  const handleClick = () => {
    if (!isMyTurn) return;

    if (isCollapseCard(card)) {
      if (window.activateCollapseMode) {
        window.activateCollapseMode(card, index);
      } else {
        console.error('window.activateCollapseMode is not defined!');
      }
      return;
    }
    
    if (isMapCard(card)) {
      setShowObjectiveMenu(!showObjectiveMenu);
      return;
    }
    
    if (isActionCard(card)) {
      setShowPlayerMenu(!showPlayerMenu);
    }
  };

  const handleSelectPlayer = (player) => {
    if (onActionCardUse) {
      onActionCardUse(card, player, index);}
    setShowPlayerMenu(false);};

  const handleSelectObjective = (position) => {
    if (onMapCardUse) {
      onMapCardUse(card, position, index);}
    setShowObjectiveMenu(false);};

  const handleContextMenu = (e) => { 
    e.preventDefault();
    if (isMyTurn && onToggleSelect) {
      onToggleSelect(index); }};

  const handleAuxClick = (e) => {
    if (e.button === 1 && isMyTurn && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(index);}};

  const handleDoubleClick = (e) => {
    if (isTunnelCard(card) && isMyTurn && onToggleRotation) {
      e.preventDefault();
      e.stopPropagation();
      onToggleRotation(index);
    }
  };

  const isDraggableTunnel = isTunnelCard(card);
  const isClickableAction = isActionCard(card);
  const isClickableCollapse = isCollapseCard(card);
  const isClickableMap = isMapCard(card);
  const canDrag = isDraggableTunnel && isMyTurn;

  let cardClass = 'interactive-card';
  let cardTitle = 'Not your turn';
  
  if (isMyTurn) {
    if (isDraggableTunnel) {
      cardClass += ' draggable-tunnel';
      cardTitle = 'Drag to board | 🔁Double-click to rotate 180° | Right-click to discard';
    } else if (isClickableCollapse) {
      cardClass += ' clickable-collapse';
      cardTitle = 'Click to destroy a tunnel card on the board';
    } else if (isClickableMap) {
      cardClass += ' clickable-map';
      cardTitle = 'Click to reveal an objective card or Right-click to select for discard';
    } else if (isClickableAction) {
      cardClass += ' clickable-action';
      cardTitle = 'Click to use on player or Right-click to select for discard';}
  } else {
    cardClass += ' disabled';}
  
  if (isSelected) {
    cardClass += ' selected-for-discard';}

  return (
    <div className="interactive-card-wrapper">
      <div
        className={cardClass}
        draggable={canDrag}
        onDragStart={handleDragStart}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onAuxClick={handleAuxClick}
        title={cardTitle}>
        <img 
          src={card.image} 
          alt={card.name || 'Card'} 
          className="card-image"
        />
      </div>

      {showPlayerMenu && isClickableAction && (
        <div className="player-menu">
          <div className="player-menu-header">
            Select a player
            <button 
              className="close-menu" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPlayerMenu(false);
              }}>
              ❌
            </button>
          </div>
          <div className="player-menu-list">
            {playerOrder
              .filter(player => player.username!==currentUsername)
              .map((player) => {
                const playerIndex = playerOrder.findIndex(p => p.username === player.username);
                return (
                  <button
                    key={player.username}
                    className={`player-menu-item player${playerIndex + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlayer(player);
                    }}>
                    <span className="player-avatar">👤</span>
                    <span className="player-name">{player.username}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {showObjectiveMenu && isClickableMap && (
        <div className="player-menu">
          <div className="player-menu-header">
            Select objective to reveal
            <button 
              className="close-menu" 
              onClick={(e) => {
                e.stopPropagation();
                setShowObjectiveMenu(false);
              }}>
              ❌
            </button>
          </div>
          <div className="player-menu-list">
            <button
              className="player-menu-item objective-top"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectObjective('[2][9]');
              }}>
              <span className="player-avatar">🎯</span>
              <span className="player-name">UP Objective</span>
            </button>
            <button
              className="player-menu-item objective-middle"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectObjective('[4][9]');
              }}>
              <span className="player-avatar">🎯</span>
              <span className="player-name">MIDDLE Objective</span>
            </button>
            <button
              className="player-menu-item objective-bottom"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectObjective('[6][9]');
              }}>
              <span className="player-avatar">🎯</span>
              <span className="player-name">LOW Objective</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
