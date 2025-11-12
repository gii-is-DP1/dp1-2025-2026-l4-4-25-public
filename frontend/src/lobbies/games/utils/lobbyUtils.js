/**
 * Verifica si el juego puede comenzar basado en el número mínimo de jugadores
 * @param {number} currentPlayers - Número actual de jugadores
 * @param {number} minPlayers - Número mínimo requerido (por defecto 1)
 * @returns {boolean}
 */
export const canStartGame = (currentPlayers, minPlayers = 1) => {
  return currentPlayers >= minPlayers;
};

/**
 * Filtra las solicitudes de unión del chat
 * @param {Array} messages - Lista de mensajes del chat
 * @returns {Array} - Lista de solicitudes pendientes con username y messageId
 */
export const extractJoinRequests = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages
    .filter(m => typeof m.content === 'string' && m.content.startsWith('REQUEST_JOIN:'))
    .map(m => {
      const parts = m.content.split(":");
      return { username: parts[1], messageId: m.id };
    });
};

/**
 * Crea un array único de jugadores activos
 * @param {Array} activePlayers - Lista de jugadores activos
 * @returns {Array} - Array sin duplicados
 */
export const getUniqueActivePlayers = (activePlayers) => {
  return Array.from(new Set(activePlayers ?? []));
};

/**
 * Verifica si un jugador ya está en el lobby
 * @param {Array} activePlayers - Lista de jugadores activos
 * @param {string} username - Nombre del usuario a verificar
 * @returns {boolean}
 */
export const isPlayerInLobby = (activePlayers, username) => {
  return (activePlayers ?? []).includes(username);
};

/**
 * Elimina un jugador de la lista de activos
 * @param {Array} activePlayers - Lista de jugadores activos
 * @param {string} usernameToRemove - Nombre del jugador a eliminar
 * @returns {Array} - Nueva lista sin el jugador eliminado
 */
export const removePlayerFromLobby = (activePlayers, usernameToRemove) => {
  return activePlayers.filter(p => p !== usernameToRemove);
};
