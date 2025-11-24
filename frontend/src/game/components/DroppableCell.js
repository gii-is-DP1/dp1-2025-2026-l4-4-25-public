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
  collapseModeActive,
  isDestroying
}) {
  const [isDragOver, setIsDragOver] = useState(false); // resaltar la celda cuando se ha arrastrado sobre la misma

  const handleDragOver = (e) => { // Cuando se arrastra una carta x una celda
    e.preventDefault();
    if (!isMyTurn) {
      e.dataTransfer.dropEffect = 'none';
      return;}
    
    if (!cell || cell.type === 'tunnel') {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';}};

  const handleDragLeave = () => { // cuando quitamos el cursor de la celda
    setIsDragOver(false);};

  const handleDrop = (e) => { // Cuando dropea la carta en la celda con row y col
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
        
        if (canPlaceCard(board, row, col, card)) { // verificamos si se puede colocar en dicha posición
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

  const renderCellContent = () => { // El redenrizado de la celda (carta, teniendo en cuenta que se puede rotar)
    // Hay que ver que cuando se rota al arrastrar la carta no se ve correctamente ¡OJO!
    if (!cell) {
      return <span className="cell-placeholder">+</span>;
    }
    
    if (cell.image) {
      return (
        <img 
          src={cell.image} 
          alt="Card" 
          className="static-card-image"
          style={{ 
            transform: cell.rotation ? `rotate(${cell.rotation}deg)` : 'none',
            transition: 'transform 0.3s ease'
          }}
        />
      );
    }
    
    return <span className="cell-coords">{row},{col}</span>;
  };

  const isDestroyable = collapseModeActive && cell && cell.type === 'tunnel';
  const cannotDestroy = collapseModeActive && cell && (cell.type === 'start' || cell.type === 'objective');

  return (
    <div
      className={`board-cell ${cell ? 'occupied' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDestroyable ? 'destroyable' : ''} ${cannotDestroy ? 'cannot-destroy' : ''} ${isDestroying ? 'cell-destroying' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      style={{ cursor: collapseModeActive ? (isDestroyable ? 'crosshair' : 'not-allowed') : 'default' }}>
      {renderCellContent()}
    </div>
  );
}
