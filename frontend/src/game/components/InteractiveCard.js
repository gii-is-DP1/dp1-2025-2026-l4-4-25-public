import React, { useState } from 'react';
import { isTunnelCard, isActionCard, isCollapseCard, isMapCard } from '../utils/cardUtils';

// Función para verificar si es una carta de reparación doble
const isDoubleRepairCard = (card) => {
  const doubleRepairEffects = ['REPAIR_PICKAXE_LAMP', 'REPAIR_PICKAXE_CART', 'REPAIR_CART_LAMP'];
  return card?.effectValue && doubleRepairEffects.includes(card.effectValue);
};

// Obtener las opciones de herramientas para una carta de reparación doble
const getToolOptionsForCard = (effectValue) => {
  switch (effectValue) {
    case 'REPAIR_PICKAXE_LAMP':
      return [
        { key: 'pickaxe', label: 'Pickaxe', emoji: '⛏️' },
        { key: 'candle', label: 'Candle', emoji: '🔦' }
      ];
    case 'REPAIR_PICKAXE_CART':
      return [
        { key: 'pickaxe', label: 'Pickaxe', emoji: '⛏️' },
        { key: 'wagon', label: 'Wagon', emoji: '🪨' }
      ];
    case 'REPAIR_CART_LAMP':
      return [
        { key: 'wagon', label: 'Wagon', emoji: '🪨' },
        { key: 'candle', label: 'Candle', emoji: '🔦' }
      ];
    default:
      return [];
  }
};

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
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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
    // Si es una carta de reparación doble, mostrar menú de selección de herramienta
    if (isDoubleRepairCard(card)) {
      setSelectedPlayer(player);
      setShowPlayerMenu(false);
      setShowToolMenu(true);
      return;
    }
    if (onActionCardUse) {
      onActionCardUse(card, player, index);}
    setShowPlayerMenu(false);};

  const handleSelectTool = (toolKey) => {
    if (onActionCardUse && selectedPlayer) {
      // Pasar la herramienta seleccionada como cuarto parámetro
      onActionCardUse(card, selectedPlayer, index, toolKey);
    }
    setShowToolMenu(false);
    setSelectedPlayer(null);
  };

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
              .filter(player => {
                // Las cartas de reparación pueden usarse sobre uno mismo
                const isRepairCard = card.effectValue && card.effectValue.includes('REPAIR');
                if (isRepairCard) return true;
                // Las cartas de destrucción no pueden usarse sobre uno mismo
                return player.username !== currentUsername;
              })
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

      {showToolMenu && selectedPlayer && (
        <div className="player-menu">
          <div className="player-menu-header">
            Select tool to repair for {selectedPlayer.username}
            <button 
              className="close-menu" 
              onClick={(e) => {
                e.stopPropagation();
                setShowToolMenu(false);
                setSelectedPlayer(null);
              }}>
              ❌
            </button>
          </div>
          <div className="player-menu-list">
            {getToolOptionsForCard(card.effectValue).map((tool) => (
              <button
                key={tool.key}
                className="player-menu-item tool-option"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTool(tool.key);
                }}>
                <span className="player-avatar">{tool.emoji}</span>
                <span className="player-name">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
