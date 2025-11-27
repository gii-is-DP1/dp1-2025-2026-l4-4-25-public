// PARA SABER QUE TIPO DE CARTA ES Y SI PODEMOS COLOCARLA EN EL TABLERO (HAY QUE COMPLETYARLO BASTANTE)

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
  
  // Si la carta es start u objective, tienen conexión en todas las direcciones
  if (card.type === 'start' || card.type === 'objective') {
    return { arriba: true, abajo: true, izquierda: true, derecha: true };
  }
  
  const rotation = card.rotation || false;
  let connections = {
    arriba: card.arriba || false,
    abajo: card.abajo || false,
    izquierda: card.izquierda || false,
    derecha: card.derecha || false
  };
  
  // Aplicar rotación de 180 grados si existe
  if (rotation === true) {
    connections = {
      arriba: card.abajo || false,
      abajo: card.arriba || false,
      izquierda: card.derecha || false,
      derecha: card.izquierda || false
    };
  }
  
  return connections;
}

function checkPathContinuity(card1Connections, card2Connections, direction) {
  const oppositeDirection = {
    'arriba': 'abajo',
    'abajo': 'arriba',
    'izquierda': 'derecha',
    'derecha': 'izquierda'
  };
  
  // La carta que se quiere colocar debe tener camino en la dirección hacia la carta adyacente
  const hasPathToNeighbor = card1Connections[direction]; //
  // La carta adyacente debe tener camino en la dirección opuesta hacia la carta que se coloca
  const neighborHasPathBack = card2Connections[oppositeDirection[direction]];
  
  return hasPathToNeighbor && neighborHasPathBack;
}

/**
 * Verifica si hay un camino válido desde la carta de inicio hasta la posición objetivo
 * usando BFS (Breadth-First Search)
 */
export function hasPathFromStart(board, targetRow, targetCol, cardToPlace) {
  const start = { row: 4, col: 1 };
  if (!start) return false;
  
  // Crear un tablero temporal con la carta a colocar
  const tempBoard = board.map(row => row.slice());
  tempBoard[targetRow][targetCol] = cardToPlace;
  
  // BFS
  const queue = [{ row: start.row, col: start.col }];
  const visited = new Set();
  visited.add(`${start.row},${start.col}`);
  
  const directions = {
    'arriba': [-1, 0],
    'abajo': [1, 0],
    'izquierda': [0, -1],
    'derecha': [0, 1]
  };
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Si llegamos a la posición objetivo, hay camino
    if (current.row === targetRow && current.col === targetCol) {
      return true;
    }
    
    const currentCard = tempBoard[current.row][current.col];
    if (!currentCard) continue;
    
    const currentConnections = getCardConnections(currentCard);
    
    // Explorar vecinos
    for (const [dirName, [dr, dc]] of Object.entries(directions)) {
      // Verificar si la carta actual tiene camino en esta dirección
      if (!currentConnections[dirName]) continue;
      
      const newRow = current.row + dr;
      const newCol = current.col + dc;
      const key = `${newRow},${newCol}`;
      
      // Verificar límites y si ya fue visitado
      if (newRow < 0 || newRow >= tempBoard.length || 
          newCol < 0 || newCol >= tempBoard[0].length ||
          visited.has(key)) {
        continue;
      }
      
      const neighborCard = tempBoard[newRow][newCol];
      
      // Solo continuar si hay una carta y hay continuidad de camino
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

// VALIDACIONES DE LAS CARTAS EN EL TABLERO
export function canPlaceCard(board, row, col, c) {
  if (!c) {
    return false;
  }
  
  if (!isTunnelCard(c)) {
    return false;
  }
  
  const cellOccupied = board[row] && board[row][col] !== null;
  if (cellOccupied) {
    return false;
  }
  
  // Verificar que haya al menos una carta adyacente Y que tenga continuidad de camino
  const hasValidConnection = checkAdjacentCardsWithContinuity(board, row, col, c);
  if (!hasValidConnection) {
    return false;
  }
  
  // NUEVA VALIDACIÓN: Verificar que exista un camino desde la carta de inicio
  const hasPathToStart = hasPathFromStart(board, row, col, c);
  if (!hasPathToStart) {
    return false;
  }
  
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
  
  for (const dir of directions) {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    
    // Verificar límites del tablero
    if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length) {
      continue;
    }
    
    const adjacentCard = board[newRow][newCol];
    
    if (adjacentCard) {
      hasAtLeastOneAdjacent = true;
      const adjacentConnections = getCardConnections(adjacentCard);
      
      // Si hay una carta adyacente, DEBE haber continuidad de camino
      if (!checkPathContinuity(cardConnections, adjacentConnections, dir.name)) {
        return false; // No hay continuidad, la colocación es inválida
      }
    }
  }
  
  return hasAtLeastOneAdjacent;
}

// VALIDACIONES DE LAS CARTAS (HISTORIA DE USUARIO SOBRE LOS AVISOS SOBRE LAS RESTRICCIONES AL COLOCARLAS)
// Lo exportamos como función para poder usarlo en el dropableCell
export function validateCardPlacement(board, row, col, c) {
  const directions = [{ name: 'arriba', dr: -1, dc: 0 },{ name: 'abajo', dr: 1, dc: 0 },{ name: 'izquierda', dr: 0, dc: -1 },{ name: 'derecha', dr: 0, dc: 1 }];
  if (!c) {
    return { valid:false,message:'⚠️ There are not card selected!' };}
  
  if (!isTunnelCard(c)) {
    return { valid:false,message:'⚠️ Only tunnel cards can be placed on the board!' };}
  
  const cellOccupied = board[row] && board[row][col] !== null;
  if (cellOccupied) {
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
    return { valid:false,message:'⚠️ Card must be placed adjacent to an existing path' };}
  
  const hasValidConnection = checkAdjacentCardsWithContinuity(board, row, col, c);
  if (!hasValidConnection) {
    return { valid:false,message:'⚠️ The paths must connect properly!' };}

  const hasPathToStart = hasPathFromStart(board, row, col, c);
  if (!hasPathToStart) {
    return { valid:false,message:'⚠️ This card must be connected to the starting path!' };}
  
  return { valid:true,message:'✅ Valid placement' };
}

