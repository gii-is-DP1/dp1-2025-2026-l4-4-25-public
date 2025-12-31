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
  
  // Si la carta es start, tiene conexión en todas las direcciones
  if (card.type === 'start') {
    return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
  }
  
  // Si la carta es objective
  if (card.type === 'objective') {
    // Si no está revelada, tiene conexiones en todas las direcciones (como antes)
    if (!card.revealed) {
      return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
    }
    // Si está revelada, las conexiones dependen del tipo de carta objetivo
    switch (card.cardType) {
      case 'gold':
        // El oro tiene todas las direcciones abiertas
        return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
      case 'carbon_1':
        // Carbon 1: esquina izquierda-arriba
        return { arriba: true, abajo: false, izquierda: true, derecha: false, centro: false };
      case 'carbon_2':
        // Carbon 2: esquina izquierda-abajo
        return { arriba: false, abajo: true, izquierda: true, derecha: false, centro: false };
      default:
        return { arriba: true, abajo: true, izquierda: true, derecha: true, centro: false };
    }
  }
  
  const rotacion = card.rotacion || false;
  let connections = {
    arriba: card.arriba || false,
    abajo: card.abajo || false,
    izquierda: card.izquierda || false,
    derecha: card.derecha || false,
    centro: card.centro || false  // true = centro cerrado, false = centro abierto
  };
  
  // Aplicar rotación de 180 grados si existe
  if (rotacion === true) {
    connections = {
      arriba: card.abajo || false,
      abajo: card.arriba || false,
      izquierda: card.derecha || false,
      derecha: card.izquierda || false,
      centro: card.centro || false
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
  const hasPathToNeighbor = card1Connections[direction];
  // La carta adyacente debe tener camino en la dirección opuesta hacia la carta que se coloca
  const neighborHasPathBack = card2Connections[oppositeDirection[direction]];
  
  // Para que haya continuidad: debe haber caminos en ambas direcciones
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
    
    // Si el centro está bloqueado (centro=true), no se puede atravesar esta carta
    if (currentConnections.centro) {
      continue;
    }
    
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
      
      // Solo validar continuidad si alguna de las dos cartas tiene conexión en esa dirección
      const cardHasConnection = cardConnections[dir.name];
      const oppositeDirection = {
        'arriba': 'abajo',
        'abajo': 'arriba',
        'izquierda': 'derecha',
        'derecha': 'izquierda'
      };
      const adjacentHasConnection = adjacentConnections[oppositeDirection[dir.name]];
      
      // Si alguna tiene conexión pero no hay continuidad válida, es inválido
      if (cardHasConnection || adjacentHasConnection) {
        if (!checkPathContinuity(cardConnections, adjacentConnections, dir.name)) {
          return false; // Una de las cartas tiene conexión pero no hay continuidad
        }
      }
      // Si ninguna tiene conexión en esa dirección, está bien (no se conectan por ese lado)
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

