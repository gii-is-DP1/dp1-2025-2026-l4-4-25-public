export const isUserAdmin = (jwt) => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.authorities?.includes("ADMIN") || false;
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return false;
  }
};

export const getMockFriends = () => {
  return [
    { username: "Alexby205", status: "A", color: "green" },
    { username: "LuisCV1", status: "B", color: "orange" },
    { username: "Julio", status: "C", color: "red" },
  ];
};

export const createGameRequest = (player, isPrivate = false, maxPlayers = 3) => {
  return {
    gameStatus: "CREATED",
    maxPlayers: maxPlayers,
    creator: player.username,
    private: isPrivate,
    activePlayers: [player.username]
  };
};
