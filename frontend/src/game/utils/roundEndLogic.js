
// Lógica de finalización de rondas y de la partida general según :
import tokenService from '../../services/token.service';

import { hasPathFromStart } from './cardUtils';

const jwt = tokenService.getLocalAccessToken();


  const getActivePlayerDeck = async (activePlayerId) => {
  try {
    const response = await fetch(`/api/v1/decks/byActivePlayerId?activePlayerId=${activePlayerId}`, {
      method: "GET",
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (response.ok) {
          const activePlayer = await response.json();
          return activePlayer;
        } else {
          console.error('Respuesta no OK al obtener el deck del activePlayerId:', response.status);
          return null;
        }
      } catch (error) {
        console.error('Error de red al obtener el deck del activePlayerId:', error);
        return null;
      }
    };

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
export const checkRoundEnd = async (boardCells, deckCount, players, objectiveCards) => {
  // Validar que players existe y tiene elementos
  if (!players || !Array.isArray(players) || players.length === 0) {
    return { ended: false };
  }

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
    try {
      // Obtener los decks de todos los jugadores en paralelo
      const decksPromises = players.map(player => getActivePlayerDeck(player.id));
      const decks = await Promise.all(decksPromises);
      
      // Verificar si todos los decks están vacíos o no existen
      // const allPlayersOutOfCards = decks.every(deck => !deck || !deck.cards || deck.cards.length === 0);
      const allPlayersOutOfCards = decks.every(deck => deck.cards.length === 0);

      if (allPlayersOutOfCards) {
        return {
          ended: true,
          reason: 'NO_CARDS',
          winnerTeam: 'SABOTEURS'
        };
      }
    } catch (error) {
      console.error('Error al verificar decks de jugadores:', error);
    }
  }

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

// Función auxiliar para obtener pepitas actuales del backend
const fetchCurrentGoldNuggets = async (playerId) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${playerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (response.ok) {
      const playerData = await response.json();
      return playerData.goldNugget || 0;
    } else {
      console.error('Error al obtener goldNuggets del jugador:', response.status);
      return 0;
    }
  } catch (error) {
    console.error('Error en fetchCurrentGoldNuggets:', error);
    return 0;
  }
};

// Reparto de pepitas según las reglas del Saboteur
// Retorna un array con la distribución de oro para mostrar en el modal
// winnerRol: true = SABOTEURS ganan, false = MINERS ganan
export const distributeGold = async (players, winnerRol) => {
    const goldDistribution = [];
    // p.rol es booleano: true = SABOTEUR, false = MINER
    const winners = players.filter(p => p.rol === winnerRol);
    
    console.log('distributeGold - players:', players);
    console.log('distributeGold - winnerRol:', winnerRol);
    console.log('distributeGold - winners:', winners);
    
    if (winnerRol === true) {
      // Saboteurs win
      const saboteurCount = winners.length;
      let nuggetsPerSaboteur = 0;
      
      if (saboteurCount === 1) {
        nuggetsPerSaboteur = 4;
      } else if (saboteurCount === 2 || saboteurCount === 3) {
        nuggetsPerSaboteur = 3;
      } else if (saboteurCount === 4) {
        nuggetsPerSaboteur = 2;
      }
      
      for (const p of players) {
        const roleName = p.rol === true ? 'SABOTEUR' : 'MINER';
        
        // Obtener pepitas actuales desde el backend
        const currentGold = await fetchCurrentGoldNuggets(p.id);
        console.log(`💰 Player ${p.user?.username || p.username} current gold from backend: ${currentGold}`);
        
        if (p.rol === winnerRol) {
          const newTotal = currentGold + nuggetsPerSaboteur;
          await patchActivePlayer(p.id, { goldNugget: newTotal });
          console.log(`✅ Player ${p.user?.username || p.username} earned ${nuggetsPerSaboteur} gold. Total: ${newTotal}`);
          
          goldDistribution.push({
            username: p.user?.username || p.username,
            rol: roleName,
            nuggetsEarned: nuggetsPerSaboteur,
            totalNuggets: newTotal
          });
        } else {
          goldDistribution.push({
            username: p.user?.username || p.username,
            rol: roleName,
            nuggetsEarned: 0,
            totalNuggets: currentGold
          });
        }
      }
    } else {
      // Miners win
      for (const p of players) {
        const roleName = p.rol === true ? 'SABOTEUR' : 'MINER';
        
        // Obtener pepitas actuales desde el backend
        const currentGold = await fetchCurrentGoldNuggets(p.id);
        console.log(`💰 Player ${p.user?.username || p.username} current gold from backend: ${currentGold}`);
        
        if (p.rol === winnerRol) {
          const randomGold = Math.floor(Math.random() * 3) + 1; // 1, 2 o 3
          const newTotal = currentGold + randomGold;
          await patchActivePlayer(p.id, { goldNugget: newTotal });
          console.log(`✅ Player ${p.user?.username || p.username} earned ${randomGold} gold. Total: ${newTotal}`);
          
          goldDistribution.push({
            username: p.user?.username || p.username,
            rol: roleName,
            nuggetsEarned: randomGold,
            totalNuggets: newTotal
          });
        } else {
          goldDistribution.push({
            username: p.user?.username || p.username,
            rol: roleName,
            nuggetsEarned: 0,
            totalNuggets: currentGold
          });
        }
      }
    }
    
    console.log('distributeGold - goldDistribution:', goldDistribution);
    return goldDistribution;
}

export const prepareNewRound = (currentRoundNumber) => {
  return {
    roundNumber: currentRoundNumber + 1,
    // Las pepitas se mantienen acumuladas en el backend
  };
};

// Función auxiliar para obtener datos actualizados del jugador desde el backend
const fetchActivePlayerById = async (playerId) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${playerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (response.ok) {
      const playerData = await response.json();
      return playerData;
    } else {
      console.error('Error al obtener activePlayer:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error en fetchActivePlayerById:', error);
    return null;
  }
};

// Resetear herramientas de los jugadores al iniciar una nueva ronda
export const resetToolsForNewRound = async (players) => {
  try {
    console.log('🔧 Resetting tools for new round...');
    
    for (const player of players) {
      // Obtener datos actualizados del jugador desde el backend para asegurar que tenemos las pepitas más recientes
      const currentPlayerData = await fetchActivePlayerById(player.id);
      
      if (!currentPlayerData) {
        console.error(`❌ No se pudo obtener datos actualizados del jugador ${player.id}`);
        continue;
      }
      
      const currentGoldNuggets = currentPlayerData.goldNugget || 0;
      const currentRol = currentPlayerData.rol !== undefined ? currentPlayerData.rol : false;
      
      console.log(`🔧 Resetting tools for ${currentPlayerData.username || currentPlayerData.user?.username} - Current gold from backend: ${currentGoldNuggets}`);
      
      const resetData = {
        pickaxeState: true,
        cartState: true,
        candleState: true,
        goldNugget: currentGoldNuggets, // Mantener las pepitas actuales del backend
      };
      
      await patchActivePlayer(player.id, resetData);
      console.log(`✅ Tools reset for player ${currentPlayerData.username || currentPlayerData.user?.username} - Gold preserved: ${currentGoldNuggets}`);
    }
    
    console.log('✅ All tools reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Error resetting tools:', error);
    return false;
  }
};
