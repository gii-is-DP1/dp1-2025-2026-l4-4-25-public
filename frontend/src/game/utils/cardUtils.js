export function isTunnelCard(c) {
  const res1 = c && c.image && c.image.includes('/tunnel-cards/');
  return res1;}

export function isActionCard(c) {
  const res2 = c && c.image && c.image.includes('/action-cards/') && !isCollapseCard(c) && !isMapCard(c);
  return res2;}

export function isCollapseCard(c) {
  const res3 = c && c.image && c.image.includes('/collapse_card.png');
  return res3;
}

export function isMapCard(c) {
  const res4 = c && c.image && c.image.toLowerCase().includes('/map');
  return res4;
}

function getCardConnections(card) {
  if (!card) return { arriba: false, abajo: false, izquierda: false, derecha: false, centro: false };

  if (card.type === 'start') {
    return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false }}
  if (card.type === 'objective') {
   
    if (!card.revealed) {
      return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false }}
  
    switch (card.cardType) {
      case 'gold':
      
        return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
      case 'carbon_1':
      
        return { arriba: true, abajo: false, izquierda: true, derecha: false, centro: false };
      case 'carbon_2':
   
        return { arriba: false, abajo: true, izquierda: true, derecha: false, centro: false };
      default:
        return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
    }
  }
  
  const cardData = card.card || card;

  const connections = {
    arriba: card.arriba ?? cardData.arriba ?? false,
    abajo: card.abajo ?? cardData.abajo ?? false,
    izquierda: card.izquierda ?? cardData.izquierda ?? false,
    derecha: card.derecha ?? cardData.derecha ?? false,
    centro: card.centro ?? cardData.centro ?? false
  };
  
  return connections;
}

function checkPathContinuity(card1Connections, card2Connections, direction) {
  const oppositeDirection = {'arriba': 'abajo', 'abajo': 'arriba', 'izquierda': 'derecha', 'derecha': 'izquierda'};
  
  const hasPathToNeighbor = card1Connections[direction];
  const neighborHasPathBack = card2Connections[oppositeDirection[direction]];

  return hasPathToNeighbor && neighborHasPathBack;
}

export function canExitToDirection(card, exitDirection) {
  if (!card) return false;
  
  const connections = getCardConnections(card);

  if (!connections[exitDirection]) {
    return false}
  
  if (connections.centro) {
    return false}
  
  return true;
}

/**
 * Verifica si hay un camino válido desde la carta de inicio hasta la posición objetivo
 * usando BFS (Breadth-First Search)
 */
export function hasPathFromStart(board, targetRow, targetCol, cardToPlace) {
  const start = { row: 4, col: 1 };
  if (!start) return false;

  const tempBoard = board.map(row => row.slice());
  tempBoard[targetRow][targetCol] = cardToPlace;

  const queue = [{ row: start.row, col: start.col }];
  const visited = new Set();
  visited.add(`${start.row},${start.col}`);
  
  const directions = {'arriba': [-1, 0], 'abajo': [1, 0], 'izquierda': [0, -1], 'derecha': [0, 1]};
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.row === targetRow && current.col === targetCol) {
      return true}
    
    const currentCard = tempBoard[current.row][current.col];
    if (!currentCard) continue;
    
    const currentConnections = getCardConnections(currentCard);
    
    if (currentConnections.centro) {
      continue}
    
    for (const [dirName, [dr, dc]] of Object.entries(directions)) {
      if (!currentConnections[dirName]) continue;
      
      const newRow = current.row + dr;
      const newCol = current.col + dc;
      const key = `${newRow},${newCol}`;
      
      if (newRow < 0 || newRow >= tempBoard.length || 
          newCol < 0 || newCol >= tempBoard[0].length ||
          visited.has(key)) {
        continue;
      }
      
      const neighborCard = tempBoard[newRow][newCol];
      
      if (neighborCard) {
        const neighborConnections = getCardConnections(neighborCard);
        
        if (checkPathContinuity(currentConnections, neighborConnections, dirName)) {
          visited.add(key);
          queue.push({ row: newRow, col: newCol });
        }
      }
    }
  }
  
  return false;
}

export function canPlaceCard(board, row, col, c) {
  if (!c) {
    return false}
  
  if (!isTunnelCard(c)) {
    return false}
  
  const cellOccupied = board[row] && board[row][col] !== null;
  if (cellOccupied) {
    return false}
  

  const hasValidConnection = checkAdjacentCardsWithContinuity(board, row, col, c);
  if (!hasValidConnection) {
    return false}
  
  const hasPathToStart = hasPathFromStart(board, row, col, c);
  if (!hasPathToStart) {
    return false}
  
  return true;
}

function checkAdjacentCardsWithContinuity(board, row, col, cardToPlace) {
  const directions = [
    { name: 'arriba', dr: -1, dc: 0 },
    { name: 'abajo', dr: 1, dc: 0 },
    { name: 'izquierda', dr: 0, dc: -1 },
    { name: 'derecha', dr: 0, dc: 1 }
  ];
  
  let hasAtLeastOneAdjacent = false;
  const cardConnections = getCardConnections(cardToPlace);
  
  console.log('========== VERIFY CONNECTIONS ==========');
  console.log('Card to place at [' + row + '][' + col + ']:', {
    id: cardToPlace.id,
    image: cardToPlace.image,
    conexiones: cardConnections
  });
  
  for (const dir of directions) {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    
    if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length) {
      continue;
    }
    
    const adjacentCard = board[newRow][newCol];
    
    if (adjacentCard) {
      hasAtLeastOneAdjacent = true;
      const adjacentConnections = getCardConnections(adjacentCard);
      
      console.log('Carta adyacente en [' + newRow + '][' + newCol + '] dirección ' + dir.name + ':', {
        id: adjacentCard.id,
        image: adjacentCard.image,
        type: adjacentCard.type,
        arriba: adjacentCard.arriba,
        abajo: adjacentCard.abajo,
        izquierda: adjacentCard.izquierda,
        derecha: adjacentCard.derecha,
        conexionesCalculadas: adjacentConnections
      });
      
      const oppositeDirection = {
        'arriba': 'abajo',
        'abajo': 'arriba',
        'izquierda': 'derecha',
        'derecha': 'izquierda'
      };
      const adjacentHasConnection = adjacentConnections[oppositeDirection[dir.name]];
      const cardHasConnection = cardConnections[dir.name];
      
      console.log('Verificando dirección ' + dir.name + ':', {
        cartaNuevaTiene: cardHasConnection,
        cartaAdyacenteTiene: adjacentHasConnection,
        direccionOpuesta: oppositeDirection[dir.name]
      });
    
      if (cardHasConnection || adjacentHasConnection) {
        if (!checkPathContinuity(cardConnections, adjacentConnections, dir.name)) {
          console.log('❌ FALLO: No hay continuidad en dirección ' + dir.name);
          return false; 
        }
      }
    }
  }
  
  return hasAtLeastOneAdjacent;
}

export function validateCardPlacement(board, row, col, c) {
  console.log('🎯 validateCardPlacement called for [' + row + '][' + col + ']');
  const directions = [{ name: 'arriba', dr: -1, dc: 0 },{ name: 'abajo', dr: 1, dc: 0 },{ name: 'izquierda', dr: 0, dc: -1 },{ name: 'derecha', dr: 0, dc: 1 }];
  if (!c) {
    console.log('❌ There are not card selected');
    return { valid:false,message:'⚠️ There are not card selected!' };}
  
  console.log('📋 Card to place:', { id: c.id, image: c.image, arriba: c.arriba, abajo: c.abajo, izquierda: c.izquierda, derecha: c.derecha });
  
  if (!isTunnelCard(c)) {
    console.log('❌ There are not tunnel card');
    return { valid:false,message:'⚠️ Only tunnel cards can be placed on the board!' };}
  
  const cellOccupied = board[row] && board[row][col] !== null;
  if (cellOccupied) {
    console.log('❌ Cell occupied');
    return { valid:false,message:'⚠️ This cell is already occupied!' };}
  
  let hasAdjacent = false;
  for (const dir of directions) {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
      if (board[newRow][newCol]) {
        hasAdjacent = true;
        break;}}}
  
  if (!hasAdjacent) {
    console.log('❌ No adjacent card');
    return { valid:false,message:'⚠️ Card must be placed adjacent to an existing path' };}
  
  console.log('✅ Passed basic validations, checking connections...');
  const hasValidConnection = checkAdjacentCardsWithContinuity(board, row, col, c);
  if (!hasValidConnection) {
    console.log('❌ No valid connection');
    return { valid:false,message:'⚠️ The paths must connect properly!' };}

  const hasPathToStart = hasPathFromStart(board, row, col, c);
  if (!hasPathToStart) {
    return { valid:false,message:'⚠️ This card must be connected to the starting path!' };}
  
  return { valid:true,message:'✅ Valid placement' };
}

