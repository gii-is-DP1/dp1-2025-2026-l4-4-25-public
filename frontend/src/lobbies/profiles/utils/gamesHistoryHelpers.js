/**
 * Formatea el tiempo de duración del juego de formato PT a legible
 * @param {string} timeString - Tiempo en formato PT (ej: "PT15M30S")
 * @returns {string} - Tiempo formateado (ej: "15 min 30 s")
 */
export const formatGameTime = (timeString) => {
  if (!timeString) return "NOT AVAILABLE";
  
  const match = timeString.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return timeString;
  
  const mins = match[1] ? parseInt(match[1]) : 0;
  const secs = match[2] ? parseInt(match[2]) : 0;
  
  return `${mins} min ${secs} s`;
};

/**
 * Filtra juegos terminados donde el usuario participó
 * @param {Array} games - Lista de todos los juegos
 * @param {string} username - Username del usuario actual
 * @returns {Array} - Juegos filtrados
 */
export const filterFinishedGames = (games, username) => {
  if (!games || !username) return [];
  
  return games.filter((game) => {
    const isFinished = game.gameStatus === "FINISHED";
    const isCreator = game.creator === username;
    const isActivePlayer = game.activePlayers?.some((p) => p.username === username);
    
    return isFinished && (isCreator || isActivePlayer);
  });
};

/**
 * Añade datos de prueba al juego (temporal para desarrollo)
 * @param {Array} games - Lista de juegos
 * @returns {Array} - Juegos con datos de prueba
 */
export const addMockGameData = (games) => {
  return games.map((g) => {
    if (g.id === 2) {
      return {
        ...g,
        activePlayers: [
          { username: "Carlosbox2k" },
          { username: "Bedilia" },
          { username: "Alexby205" },
          { username: "mantecaoHacker" }
        ],
        winner: { username: "Carlosbox2k" }
      };
    }
    return g;
  });
};

/**
 * Ordena juegos por fecha (más reciente primero)
 * @param {Array} games - Lista de juegos
 * @returns {Array} - Juegos ordenados
 */
export const sortGamesByDate = (games) => {
  if (!games) return [];
  
  return [...games].sort((a, b) => {
    // Si tienen fecha, ordenar por fecha
    if (a.endDate && b.endDate) {
      return new Date(b.endDate) - new Date(a.endDate);
    }
    // Si no, ordenar por ID (descendente)
    return b.id - a.id;
  });
};
