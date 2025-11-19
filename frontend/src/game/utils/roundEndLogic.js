// Lógica de finalización de rondas y de la partida general según :

// La ronda termina si se ha encontrado la pepita o todos los jugadores se han quedado sin cartas
import { hasPathFromStart } from '../game/cards';

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
    {row:6,col:9,key:'[6][9]'}]; // hay que ver cual es la pepita en cada partida

  for (const pos of objectivePositions) {
    if (objectiveCards[pos.key] === 'gold') {
      if (hasPathFromStart(boardCells, 4, 1, pos.row, pos.col)) {
        return { reached: true, position: pos.key, row: pos.row, col: pos.col };}}}
  return null;
};

// ¿Reparto de pepitas? ¿cantidad o por igual? Hay que definirlo.


export const prepareNewRound = (currentRoundNumber) => {
  return {
    roundNumber: currentRoundNumber + 1,
    // HAY QUE SUMAR LAS PEPITAS EN EL BACKEND
  };
};
