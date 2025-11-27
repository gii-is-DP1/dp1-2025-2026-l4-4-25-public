
// Lógica de finalización de rondas y de la partida general según :
import tokenService from '../../services/token.service';

import { hasPathFromStart } from './cardUtils';

const jwt = tokenService.getLocalAccessToken();

const patchActivePlayer = async (activePlayerId, data) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${activePlayerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedPlayer = await response.json();
      console.log('ActivePlayer actualizado:', updatedPlayer);
      return updatedPlayer;
    } else {
      console.error('Error al actualizar ActivePlayer');
      return null;
    }
  } catch (error) {
    console.error('Error en patchActivePlayer:', error);
    return null;
  }
};

// La ronda termina si se ha encontrado la pepita o todos los jugadores se han quedado sin cartas
export const checkRoundEnd = (boardCells, deckCount, players, objectiveCards) => {
  const goldReached = checkPathToGold(boardCells, objectiveCards);
  
  if (goldReached) {
    return {
      ended: true,
      reason: 'GOLD_REACHED',
      winnerTeam: 'MINERS', // Siempre ganan los mineros si encuentran el oro
      goldPosition: goldReached.position
    };
  }
  if (deckCount <= 0) {
    return {
      ended: true,
      reason: 'NO_CARDS',
      winnerTeam: 'SABOTEURS'
    };}

  return { ended: false };
};


const checkPathToGold = (boardCells, objectiveCards) => {
  const objectivePositions = [
    {row:2,col:9,key:'[2][9]'},
    {row:4,col:9,key:'[4][9]'},
    {row:6,col:9,key:'[6][9]'}
  ];

  for (const pos of objectivePositions) {
    // Verificar que la carta objetivo sea de oro
    if (objectiveCards[pos.key] === 'gold') {
      // Verificar si hay alguna carta de camino adyacente a la posición del objetivo
      const adjacentPositions = [
        { row: pos.row - 1, col: pos.col }, 
        { row: pos.row + 1, col: pos.col }, 
        { row: pos.row, col: pos.col - 1 }, 
        { row: pos.row, col: pos.col + 1 }  
      ];

      for (const adjPos of adjacentPositions) {
        const adjCell = boardCells[adjPos.row]?.[adjPos.col];
        
        // Verificar que hay una carta de túnel adyacente
        if (adjCell && adjCell.occupied && adjCell.type === 'tunnel') {
          if (hasPathFromStart(boardCells, adjPos.row, adjPos.col, adjCell)) {
            return { 
              reached: true, 
              position: pos.key, 
              row: pos.row, 
              col: pos.col 
            };
          }
        }
      }
    }
  }
  
  return null;
};

// Reparto de pepitas según las reglas del Saboteur
export const distributeGold = (players, winnerRol) => {
    const winners = players.filter(p => p.role === winnerRol);
    if (winnerRol === true) {
      const saboteurCount = winners.length;
      if (saboteurCount === 1) {
        patchActivePlayer(winners[0].id, { goldNugget: winners[0].goldNugget + 4 });
      } else if (saboteurCount === 2 || saboteurCount === 3) {
        winners.forEach(p => patchActivePlayer(p.id, { goldNugget: p.goldNugget + 3 })); 
      } else if (saboteurCount === 4) {
        winners.forEach(p => patchActivePlayer(p.id, { goldNugget: p.goldNugget + 2 }));
    }
  } else {
      winners.forEach(p => {
        const randomGold = Math.floor(Math.random() * 3) + 1; // 1, 2 o 3
        patchActivePlayer(p.id, { goldNugget: p.goldNugget + randomGold });
      });
  }
}

export const prepareNewRound = (currentRoundNumber) => {
  return {
    roundNumber: currentRoundNumber + 1,
    // Las pepitas se mantienen acumuladas en el backend
  };
};
