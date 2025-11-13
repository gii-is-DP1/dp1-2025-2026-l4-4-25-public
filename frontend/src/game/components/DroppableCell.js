import React, { useState } from 'react';
import { canPlaceCard } from '../cards';

export default function DroppableCell({ 
  cell, 
  row, 
  col, 
  board, 
  onDrop, 
  onClick, 
  onRightClick,
  isMyTurn,
  collapseModeActive
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isMyTurn) {
      e.dataTransfer.dropEffect = 'none';
      return;}
    
    if (!cell || cell.type === 'tunnel') {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';}};

  const handleDragLeave = () => {
    setIsDragOver(false);};

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const cardData = e.dataTransfer.getData('application/json');
      const cardIndex = e.dataTransfer.getData('cardIndex');
      console.log('Card data received:', cardData, 'index:', cardIndex);
      
      if (cardData) {
        const card = JSON.parse(cardData);
        console.log('Parsed card:', card);
        console.log('Can place card?', canPlaceCard(board, row, col, card));
        
        if (canPlaceCard(board, row, col, card)) {
          console.log('Calling onDrop');
          if (onDrop) {
            onDrop(row, col, card, parseInt(cardIndex));
          }
        } else {
          console.log('Cannot place card at this position');
        }
      } else {
        console.log('No card data found');
      }
    } catch (error) {
      console.error('Error dropping card:', error);
    }
  };

  const handleClick = () => {
    if (onClick) onClick(row, col);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (onRightClick) onRightClick(row, col);
  };

  const renderCellContent = () => {
    if (!cell) {
      return <span className="cell-placeholder">+</span>;
    }
    
    if (cell.image) {
      return <img src={cell.image} alt="Card" className="static-card-image" />;
    }
    
    return <span className="cell-coords">{row},{col}</span>;
  };

  const isDestroyable = collapseModeActive && cell && cell.type === 'tunnel';
  const cannotDestroy = collapseModeActive && cell && (cell.type === 'start' || cell.type === 'objective');

  return (
    <div
      className={`board-cell ${cell ? 'occupied' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDestroyable ? 'destroyable' : ''} ${cannotDestroy ? 'cannot-destroy' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      style={{ cursor: collapseModeActive ? (isDestroyable ? 'crosshair' : 'not-allowed') : 'default' }}
    >
      {renderCellContent()}
    </div>
  );
}
