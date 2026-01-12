export const filterActiveGames = (games) => {
  if (!games) return [];
  return games.filter(
    (g) => g.gameStatus === "CREATED" || g.gameStatus === "ONGOING"
  );
};

export const applyFilters = (games, filters, onlyFriend, friendsList) => {
  let filtered = filterActiveGames(games);

  if (filters.privacy) {
    const isPrivate = filters.privacy === "private";
    filtered = filtered.filter((g) => g.private === isPrivate);
  }

  if (filters.status) {
    filtered = filtered.filter(
      (g) => g.gameStatus.toLowerCase() === filters.status.toLowerCase()
    );
  }

  if (filters.minPlayers) {
    filtered = filtered.filter(
      (g) => g.activePlayers?.length >= parseInt(filters.minPlayers)
    );
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      (g) =>
        g.creator?.username?.toLowerCase().includes(term) ||
        g.id?.toString().includes(term)
    );
  }

  if (onlyFriend) {
    if (friendsList.length === 0) {
      return [];
    }
    
    const friendUsernames = friendsList.map((f) => 
      typeof f === 'string' ? f.toLowerCase() : f.username?.toLowerCase()
    ).filter(Boolean);
    
    filtered = filtered.filter((g) => {
      const creatorUsername = g.creator?.username?.toLowerCase() || g.creator?.toLowerCase();
      return creatorUsername && friendUsernames.includes(creatorUsername);
    });
  }

  return filtered;
};

export const createJoinRequest = (username, gameId, chatId) => {
  return {
    content: `REQUEST_JOIN:${username}:${gameId}`,
    activePlayer: username,
    chat: chatId
  };
};

export const createSpectatorRequest = (username, gameId, chatId) => {
  return {
    content: `REQUEST_SPECTATOR:${username}:${gameId}`,
    activePlayer: username,
    chat: chatId
  };
};

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

export const isSpectatorRequestAccepted = (message, username, gameId) => {
  if (!message.content || typeof message.content !== 'string') return false;
  if (!message.content.startsWith('SPECTATOR_ACCEPTED:')) return false;

  const parts = message.content.split(':');
  const targetUser = parts[1];
  const targetGameId = parts[2];

  return (
    targetUser === username && 
    String(targetGameId) === String(gameId)
  );
};

export const isSpectatorRequestDenied = (message, username, gameId) => {
  if (!message.content || typeof message.content !== 'string') return false;
  if (!message.content.startsWith('SPECTATOR_DENIED:')) return false;

  const parts = message.content.split(':');
  const targetUser = parts[1];
  const targetGameId = parts[2];

  return (
    targetUser === username && 
    String(targetGameId) === String(gameId)
  );
};

export const isSpectatorRequestAcceptedFor = (message, username, gameId, requestId) => {
  if (!isSpectatorRequestAccepted(message, username, gameId)) return false;
  if (requestId === null || requestId === undefined) return true;

  const parts = String(message.content).split(':');
  const targetRequestId = parts[3];
  if (targetRequestId !== undefined && targetRequestId !== null && String(targetRequestId).length > 0) {
    return String(targetRequestId) === String(requestId);
  }

  const responseMsgId = message?.id;
  const req = Number(requestId);
  const resp = Number(responseMsgId);
  if (Number.isFinite(req) && Number.isFinite(resp)) {
    return resp > req;
  }
  return false;
};

export const isSpectatorRequestDeniedFor = (message, username, gameId, requestId) => {
  if (!isSpectatorRequestDenied(message, username, gameId)) return false;
  if (requestId === null || requestId === undefined) return true;

  const parts = String(message.content).split(':');
  const targetRequestId = parts[3];
  if (targetRequestId !== undefined && targetRequestId !== null && String(targetRequestId).length > 0) {
    return String(targetRequestId) === String(requestId);
  }

  const responseMsgId = message?.id;
  const req = Number(requestId);
  const resp = Number(responseMsgId);
  if (Number.isFinite(req) && Number.isFinite(resp)) {
    return resp > req;
  }
  return false;
};
