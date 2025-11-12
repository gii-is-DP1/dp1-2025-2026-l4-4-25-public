/**
 * Filtra juegos por estado (solo CREATED o ONGOING)
 * @param {Array} games - Lista de juegos
 * @returns {Array} - Juegos filtrados
 */
export const filterActiveGames = (games) => {
  if (!games) return [];
  return games.filter(
    (g) => g.gameStatus === "CREATED" || g.gameStatus === "ONGOING"
  );
};

/**
 * Aplica filtros de búsqueda a la lista de juegos
 * @param {Array} games - Lista de juegos
 * @param {Object} filters - Objeto con filtros aplicados
 * @param {boolean} onlyFriend - Mostrar solo juegos de amigos
 * @param {Array} friendsList - Lista de amigos
 * @returns {Array} - Juegos filtrados
 */
export const applyFilters = (games, filters, onlyFriend, friendsList) => {
  let filtered = filterActiveGames(games);

  // Filtro por privacidad
  if (filters.privacy) {
    const isPrivate = filters.privacy === "private";
    filtered = filtered.filter((g) => g.private === isPrivate);
  }

  // Filtro por estado
  if (filters.status) {
    filtered = filtered.filter(
      (g) => g.gameStatus.toLowerCase() === filters.status.toLowerCase()
    );
  }

  // Filtro por número mínimo de jugadores
  if (filters.minPlayers) {
    filtered = filtered.filter(
      (g) => g.activePlayers?.length >= parseInt(filters.minPlayers)
    );
  }

  // Filtro por búsqueda (ID o creator)
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      (g) =>
        g.creator?.username?.toLowerCase().includes(term) ||
        g.id?.toString().includes(term)
    );
  }

  // Filtro por amigos
  if (onlyFriend && friendsList.length > 0) {
    const friendUsernames = friendsList.map((f) => f.username?.toLowerCase());
    filtered = filtered.filter((g) =>
      friendUsernames.includes(g.creator?.username?.toLowerCase())
    );
  }

  return filtered;
};

/**
 * Crea el objeto de solicitud para unirse a un juego
 * @param {string} username - Username del usuario
 * @param {number} gameId - ID del juego
 * @param {number} chatId - ID del chat
 * @returns {Object} - Request body
 */
export const createJoinRequest = (username, gameId, chatId) => {
  return {
    content: `REQUEST_JOIN:${username}:${gameId}`,
    activePlayer: username,
    chat: chatId
  };
};

/**
 * Verifica si un mensaje es de aceptación de solicitud
 * @param {Object} message - Mensaje del chat
 * @param {string} username - Username a verificar
 * @param {number} gameId - ID del juego
 * @returns {boolean}
 */
export const isRequestAccepted = (message, username, gameId) => {
  if (!message.content || typeof message.content !== 'string') return false;
  if (!message.content.startsWith('REQUEST_ACCEPTED:')) return false;

  const parts = message.content.split(':');
  const targetUser = parts[1];
  const targetGameId = parts[2];

  return (
    targetUser === username && 
    String(targetGameId) === String(gameId)
  );
};

/**
 * Verifica si un mensaje es de rechazo de solicitud
 * @param {Object} message - Mensaje del chat
 * @param {string} username - Username a verificar
 * @param {number} gameId - ID del juego
 * @returns {boolean}
 */
export const isRequestDenied = (message, username, gameId) => {
  if (!message.content || typeof message.content !== 'string') return false;
  if (!message.content.startsWith('REQUEST_DENIED:')) return false;

  const parts = message.content.split(':');
  const targetUser = parts[1];
  const targetGameId = parts[2];

  return (
    targetUser === username && 
    String(targetGameId) === String(gameId)
  );
};
