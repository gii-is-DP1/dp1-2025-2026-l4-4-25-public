// PARA SABER QUE TIPO DE CARTA ES Y SI PODEMOS COLOCARLA EN EL TABLERO (HAY QUE COMPLETYARLO BASTANTE)


// Ruta de las catras tuneles /images/card-images/tunnel-cards/
export function isTunnelCard(c) {
  const res1 = c && c.image && c.image.includes('/tunnel-cards/');
  console.log('Funcion isTunnelCard:', c?.id, c?.image, res1);
  return res1;}

// Ruta d las cartas de accion /images/card-images/action-cards/
export function isActionCard(c) {
  const res2 = c && c.image && c.image.includes('/action-cards/') && !isCollapseCard(c);
  console.log('Funcion isActionCard:', c?.id, c?.image, res2);
  return res2;}

// Carta para destruir caminos (tuneles)
export function isCollapseCard(c) {
  const res3 = c && c.image && c.image.includes('/collapse_card.png');
  console.log('Funcion isCollapseCard:', c?.id, c?.image, res3);
  return res3;
}

// VALIDACIONES DE LAS CARTAS EN EL TABLERO, ¡OJO! HAY QUE PONER TODAS Y LAS RESTRICCIONES SI ES TRUE-FALSE Y TAL
export function canPlaceCard(board, row, col, c) {
  console.log('Funcion canPlaceCard:', { row, col, c, isTunnel: isTunnelCard(c) });
  if (!c) {
    console.log('No hay carta');
    return false;}
  
  if (!isTunnelCard(c)) {
    console.log('No es una carta de tunel');
    return false;}
  
  const cellOccupied = board[row] && board[row][col] !== null;
  if (cellOccupied) {
    console.log('Celda Ocupada');
    return false;}
  
  const hasAdjacentCard = checkAdjacentCards(board, row, col);
  console.log('Hay carta conectada:', hasAdjacentCard); // Esto hay que mejorarlo porque solo comprueba los 4 lados, hay que ver la compatsabilidad según el camino
  return hasAdjacentCard;
}

// Cartas contiguas unidas a los cuatros lados de la misma que se quiere colocar
export function checkAdjacentCards(board, row, col) {
  const directions = [[-1, 0],[1, 0],[0, -1],[0, 1]];

  for (const [dr, dc] of directions) {
    const newR = row + dr;
    const newC = col + dc;
    const inBounds = newR >= 0 && newR < board.length && newC >= 0 && newC < board[0].length;
    
    if (inBounds) {
      const hasC = board[newR][newC]!== null; // Diff de null porque no peude estar la celda vacia
      console.log(`DIRECCIÓN CARTA [${dr},${dc}]---->[${newR},${newC}]:`, hasC);
      
      if (hasC) {
        return true;}}}
  return false;
}
