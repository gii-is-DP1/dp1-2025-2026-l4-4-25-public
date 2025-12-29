export const canStartGame = (currentPlayers, minPlayers = 1) => {
  return currentPlayers >= minPlayers};

export const extractJoinRequests = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages
    .filter(m => typeof m.content === 'string' && m.content.startsWith('REQUEST_JOIN:'))
    .map(m => {
      const parts = m.content.split(":");
      return { username: parts[1], messageId: m.id };
    })};


export const extractSpectatorRequests = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages
    .filter(m => typeof m.content === 'string' && m.content.startsWith('REQUEST_SPECTATOR:'))
    .map(m => {
      const parts = m.content.split(":");
      return { username: parts[1], messageId: m.id };
    })};

export const getUniqueActivePlayers = (activePlayers) => {
  return Array.from(new Set(activePlayers ?? []))};

export const isPlayerInLobby = (activePlayers, username) => {
  return (activePlayers ?? []).includes(username)};

export const removePlayerFromLobby = (activePlayers, usernameToRemove) => {
  return activePlayers.filter(p => p !== usernameToRemove)};
