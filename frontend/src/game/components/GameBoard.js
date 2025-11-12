import React from 'react';
import startCardImage from '../../static/images/start.png';
import objetivecardreverse from '../../static/images/objetive_card_reverse.png';

export default function GameBoard({ 
  boardCells, 
  boardGridRef, 
  handleCellClick, 
  handleCellRightClick,
  ListCards 
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

    if (cell.type === 'tunnel') {
      return <img src={card?.image} alt="Tunnel Card" className="static-card-image" />;
    }

    return (
      <div className="card-preview path">
        <div className="card-type">{cell.type}</div>
        <div className="card-owner small">{cell.owner}</div>
      </div>
    );
  };

  return (
    <div ref={boardGridRef} className="board-grid saboteur-grid">
      {boardCells.map((row, r) => (
        <div key={`row-${r}`} className="board-row">
          {row.map((cell, c) => (
            <div
              key={`cell-${r}-${c}`}
              className={`board-cell ${cell ? 'has-card' : ''}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => { e.preventDefault(); handleCellRightClick(r, c); }}
              title={cell ? `Card: ${cell.type} (by ${cell.owner})` : `Empty ${r},${c}`}
            >
              {renderCellContent(r, c, cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
