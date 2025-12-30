import React from 'react';
import DroppableCell from './DroppableCell';
import startCardImage from '../../static/images/start.png';
import objetivecardreverse from '../../static/images/objetive_card_reverse.png';
import { useState } from 'react';

export default function GameBoard({ 
  boardCells, 
  boardGridRef, 
  handleCellClick,
  handleCellRightClick,
  handleCardDrop,
  ListCards,
  currentPlayer,
  currentUsername,
  collapseModeActive,
  revealedObjective,
  objectiveCards,
  destroyingCell
}) {

  
  const getObjectiveCardImage = (cardType) => {
    console.log('MAP REVEAL TYPE:', revealedObjective?.cardType);
    switch(cardType) {
      case 'gold': return '/images/card-images/finals/gold.png';
      //case 'coal_1':
      case 'carbon_1': return '/images/card-images/finals/carbon_1.png';
      //case 'coal_2':
      case 'carbon_2': return '/images/card-images/finals/carbon_2.png';
      default: return objetivecardreverse;
    }};

  const renderCellContent = (row, col, cell) => {
    const card = Array.isArray(ListCards) ? ListCards.find(c => c.id === 34) : null;

    if (!cell) {
      return <div className="cell-coords">{row},{col}</div>;}

    if (cell.type === 'start') {
      return <img src={startCardImage} alt="Start Card" className="static-card-image" />;}

    if (cell.type === 'objective') {
      const positionKey = `[${row}][${col}]`;
      // 1. ¿Está revelada temporalmente por carta de Mapa? (Tiene borde dorado)
      const isMapRevealed = revealedObjective && revealedObjective.position === positionKey;
      
      // 2. ¿Está revelada permanentemente por conexión? (Propiedad 'revealed' del WebSocket)
      const isPermanentlyRevealed = cell.revealed;

      // Si cualquiera de las dos es cierta, mostramos la carta real
      if (isMapRevealed || isPermanentlyRevealed) {
        
        // Priorizamos el tipo del mapa si está activo, si no, usamos el guardado en la celda
        const typeToShow = isMapRevealed ? revealedObjective.cardType : cell.cardType;
        const cardImage = getObjectiveCardImage(typeToShow);
        
        return (
          <img 
            src={cardImage} 
            alt={`Objective: ${typeToShow}`} 
            className="static-card-image revealed-objective" 
            style={{
              // Solo ponemos borde dorado si es una revelación temporal de mapa
              border: isMapRevealed ? '3px solid gold' : 'none',
              boxShadow: isMapRevealed ? '0 0 20px gold' : 'none'
            }}
          />
        );
      }
      
      // Si no está revelada de ninguna forma, mostramos el reverso
      return <img src={objetivecardreverse} alt="Objective Card" className="static-card-image" />;
    }

    if (cell.type === 'tunnel' || cell.image) {
      const imgSrc = cell.image || card?.image;
      return <img src={imgSrc} alt="Tunnel Card" className="static-card-image" />;}

    return (
      <div className="card-preview path">
        <div className="card-type">{cell.type}</div>
        <div className="card-owner small">{cell.owner}</div>
      </div>
    );
  };

  const isMyTurn = currentUsername === currentPlayer;

  return (
    <div ref={boardGridRef} className="board-grid saboteur-grid">
      {boardCells.map((row, r) => (
        <div key={`row-${r}`} className="board-row">
          {row.map((cell, c) => {
            const isSpecialCard = cell && (cell.type === 'start' || cell.type === 'objective');
            
            if (isSpecialCard) {
              return (
                <div
                  key={`cell-${r}-${c}`}
                  className={`board-cell ${cell ? 'has-card' : ''}`}
                  title={cell ? `Card: ${cell.type}` : `Empty ${r},${c}`}
                >
                  {renderCellContent(r, c, cell)}
                </div>
              );
            }
            
            return (
              <DroppableCell
                key={`cell-${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                board={boardCells}
                onDrop={handleCardDrop}
                onClick={handleCellClick}
                onRightClick={handleCellRightClick}
                isMyTurn={isMyTurn}
                collapseModeActive={collapseModeActive}
                isDestroying={destroyingCell && destroyingCell.row === r && destroyingCell.col === c}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
