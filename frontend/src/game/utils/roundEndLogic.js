import tokenService from '../../services/token.service';

import { hasPathFromStart, canExitToDirection } from './cardUtils';

// Helper function to get JWT dynamically (prevents stale token issues)
const getJwt = () => tokenService.getLocalAccessToken();


  const getActivePlayerDeck = async (activePlayerId) => {
  try {
    const response = await fetch(`/api/v1/decks/byActivePlayerId?activePlayerId=${activePlayerId}`, {
      method: "GET",
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getJwt()}`,
          },
        });
        if (response.ok) {
          const activePlayer = await response.json();
          return activePlayer;
        } else {
          console.error('Response not OK to obtain the deck for activePlayerId:', response.status);
          return null;
        }
      } catch (error) {
        console.error('Network error to obtain activePlayerId:', error);
        return null;
      }
    };

const patchActivePlayer = async (activePlayerId, data) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${activePlayerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwt()}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedPlayer = await response.json();
      console.log('ActivePlayer updated:', updatedPlayer);
      return updatedPlayer;
    } else {
      console.error('Error updating ActivePlayer');
      return null;
    }
  } catch (error) {
    console.error('Error in patchActivePlayer:', error);
    return null;
  }
};

export const checkRoundEnd = async (boardCells, deckCount, players, objectiveCards, playerCardsCount) => {
  if (!players || !Array.isArray(players) || players.length === 0) {
    return { ended: false }}

  const goldReached = checkPathToGold(boardCells, objectiveCards);
  
  if (goldReached) {
    return {
      ended: true,
      reason: 'GOLD_REACHED',
      winnerTeam: 'MINERS',
      goldPosition: goldReached.position
    };
  }

  const totalCards = Object.values(playerCardsCount).reduce((sum, count) => sum + count, 0);
  console.log('🔍 checkRoundEnd - totalCards:', totalCards, 'playerCardsCount:', playerCardsCount);
  if (totalCards === 0) {
    console.log('🔍 checkRoundEnd - ALL_PLAYERS_OUT_OF_CARDS');
    return {
      ended: true,
      reason: 'ALL_PLAYERS_OUT_OF_CARDS',
      winnerTeam: 'SABOTEURS'
    };
  }

  if (deckCount <= 0) {
    try {
      const decksPromises = players.map(player => getActivePlayerDeck(player.id));
      const decks = await Promise.all(decksPromises);
      const allPlayersOutOfCards = decks.every(deck => deck.cards.length === 0);

      if (allPlayersOutOfCards) {
        return {
          ended: true,
          reason: 'NO_CARDS',
          winnerTeam: 'SABOTEURS'
        };
      }
    } catch (error) {
      console.error('Error checking player decks:', error);
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
    if (objectiveCards[pos.key] === 'gold') {
      const adjacentPositions = [
        { row: pos.row - 1, col: pos.col, directionToObjective: 'abajo' },   
        { row: pos.row + 1, col: pos.col, directionToObjective: 'arriba' }, 
        { row: pos.row, col: pos.col - 1, directionToObjective: 'derecha' }, 
        { row: pos.row, col: pos.col + 1, directionToObjective: 'izquierda' } 
      ];

      for (const adjPos of adjacentPositions) {
        const adjCell = boardCells[adjPos.row]?.[adjPos.col];
        if (adjCell && adjCell.occupied && adjCell.type === 'tunnel') {
          if (hasPathFromStart(boardCells, adjPos.row, adjPos.col, adjCell)) {
            if (canExitToDirection(adjCell, adjPos.directionToObjective)) {
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
  }
  
  return null;
};

const fetchCurrentGoldNuggets = async (playerId) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${playerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwt()}`,
      },
    });

    if (response.ok) {
      const playerData = await response.json();
      return playerData.goldNugget || 0;
    } else {
      console.error('Error to obtain goldNuggets:', response.status);
      return 0;
    }
  } catch (error) {
    console.error('Error in fetchCurrentGoldNuggets:', error);
    return 0;
  }
};

export const distributeGold = async (players, winnerRol) => {
    const goldDistribution = [];
    const winners = players.filter(p => p.rol === winnerRol);
    
    console.log('distributeGold - players:', players);
    console.log('distributeGold - winnerRol:', winnerRol);
    console.log('distributeGold - winners:', winners);
    
    if (winnerRol === true) {
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
      for (const p of players) {
        const roleName = p.rol === true ? 'SABOTEUR' : 'MINER';
        const currentGold = await fetchCurrentGoldNuggets(p.id);
        console.log(`💰 Player ${p.user?.username || p.username} current gold from backend: ${currentGold}`);
        
        if (p.rol === winnerRol) {
          const randomGold = Math.floor(Math.random() * 3) + 1; 
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
  };
};

const fetchActivePlayerById = async (playerId) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${playerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwt()}`,
      },
    });

    if (response.ok) {
      const playerData = await response.json();
      return playerData;
    } else {
      console.error('Error to obtain activePlayer:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error in fetchActivePlayerById:', error);
    return null;
  }
};

export const resetToolsForNewRound = async (players) => {
  try {
    console.log('🔧 Resetting tools for new round...');
    
    for (const player of players) {
      const currentPlayerData = await fetchActivePlayerById(player.id);
      
      if (!currentPlayerData) {
        console.error(`❌ Could not obtain updated data for player ${player.id}`);
        continue;
      }
      
      const currentGoldNuggets = currentPlayerData.goldNugget || 0;
      
      console.log(`🔧 Resetting tools for ${currentPlayerData.username || currentPlayerData.user?.username} - Current gold from backend: ${currentGoldNuggets}`);
      
      const resetData = {
        pickaxeState: true,
        cartState: true,
        candleState: true,
        goldNugget: currentGoldNuggets, 
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
