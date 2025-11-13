import React from 'react';
import DroppableCell from './DroppableCell';
import startCardImage from '../../static/images/start.png';
import objetivecardreverse from '../../static/images/objetive_card_reverse.png';

export default function GameBoard({ 
  boardCells, 
  boardGridRef, 
  handleCellClick,
  handleCellRightClick,
  handleCardDrop,
  ListCards,
  currentPlayer,
  currentUsername,
  collapseModeActive
}) {
  
  const renderCellContent = (row, col, cell) => {
    const card = ListCards.find(c => c.id === 34);

    if (!cell) {
      return <div className="cell-coords">{row},{col}</div>;
    }

    if (cell.type === 'start') {
      return <img src={startCardImage} alt="Start Card" className="static-card-image" />;
    }

    if (cell.type === 'objective') {
      return <img src={objetivecardreverse} alt="Objective Card" className="static-card-image" />;
    }

    if (cell.type === 'tunnel' || cell.image) {
      const imgSrc = cell.image || card?.image;
      return <img src={imgSrc} alt="Tunnel Card" className="static-card-image" />;
    }

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
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
