import React, { useState, useEffect, useRef } from 'react';
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


  useEffect(() => {
    if (!isMyTurn) {
      setShowPlayerMenu(false);
      setShowObjectiveMenu(false);
      setShowToolMenu(false);
      setSelectedPlayer(null);
    }
  }, [isMyTurn]);

  useEffect(() => {
    if (!isSelected) {
      setShowPlayerMenu(false);
      setShowObjectiveMenu(false);
      setShowToolMenu(false);
      setSelectedPlayer(null);
    }
  }, [isSelected]);

  useEffect(() => {
    setShowPlayerMenu(false);
    setShowObjectiveMenu(false);
    setShowToolMenu(false);
    setSelectedPlayer(null);
  }, [card.id]);

  // arrastre basado en puntero para reemplazar DnD nativo y permitir que el cursor personalizado siga el puntero
  const previewRef = useRef(null);
  const draggingRef = useRef({ active: false, hoveredEl: null });

  const startPointerDrag = (e) => {
    if (!isDraggableTunnel || !isMyTurn) return;
    // responder solo al botón primario
    if (e.button && e.button !== 0) return;
    e.preventDefault();

    const cardIndexStr = index.toString();

    // coordenadas iniciales para detectar umbral de movimiento (evita crear preview en clicks/doble-clicks)
    const startX = e.clientX;
    const startY = e.clientY;
    const MOVE_THRESHOLD = 8; // pixels

    let previewCreated = false;
    let lastHover = null;

    const createPreview = (ev) => {
      const preview = document.createElement('div');
      preview.className = 'card-drag-preview';
      preview.style.position = 'fixed';
      preview.style.left = `${ev.clientX}px`;
      preview.style.top = `${ev.clientY}px`;
      preview.style.pointerEvents = 'none';
      preview.style.zIndex = 200000;
      preview.innerHTML = `<img src="${card.image}" style="width:64px; height:auto; display:block; transform: rotate(${rotation}deg); box-shadow:0 8px 20px rgba(0,0,0,0.4); border-radius:6px;"/>`;
      document.body.appendChild(preview);
      previewRef.current = preview;
      draggingRef.current.active = true;
      previewCreated = true;

      // dispatch global start event
      document.body.dispatchEvent(new CustomEvent('saboteur-dragstart', { detail: { card: card, cardIndex: index } }));
    };

    const onPointerMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const dist = Math.hypot(dx, dy);

      // Crear el preview solo cuando el usuario se haya movido más allá del umbral (evita que clicks/doble-clicks activen el arrastre)
      if (!previewCreated) {
        if (dist < MOVE_THRESHOLD) return;
        createPreview(ev);
      }

      if (!previewRef.current) return;
      previewRef.current.style.left = `${ev.clientX + 8}px`;
      previewRef.current.style.top = `${ev.clientY + 8}px`;

      // encontrar el elemento bajo el puntero y despachar enter/leave
      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      const cell = under && under.closest && under.closest('.board-cell');
      if (cell !== lastHover) {
        if (lastHover) lastHover.dispatchEvent(new CustomEvent('saboteur-dragleave'));
        if (cell) cell.dispatchEvent(new CustomEvent('saboteur-dragenter'));
        lastHover = cell;
        draggingRef.current.hoveredEl = cell;
      }
    };

    const endPointerDrag = (ev) => {
      if (previewCreated) {
        draggingRef.current.active = false;
        document.body.dispatchEvent(new CustomEvent('saboteur-dragend'));
        // realizar el drop sobre el elemento resaltado si existe
        const target = draggingRef.current.hoveredEl;
        if (target) {
          const detail = { card: card, cardIndex: cardIndexStr };
          target.dispatchEvent(new CustomEvent('saboteur-drop', { detail }));
        }
      }

      // limpieza
      try { document.removeEventListener('pointermove', onPointerMove); } catch (e) {}
      try { document.removeEventListener('pointerup', endPointerDrag); } catch (e) {}
      if (previewRef.current) {
        try { previewRef.current.remove(); } catch (e) {}
        previewRef.current = null;
      }
      if (lastHover) lastHover.dispatchEvent(new CustomEvent('saboteur-dragleave'));
      draggingRef.current.hoveredEl = null;
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', endPointerDrag, { once: true });
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
        draggable={false}
        onPointerDown={startPointerDrag}
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
