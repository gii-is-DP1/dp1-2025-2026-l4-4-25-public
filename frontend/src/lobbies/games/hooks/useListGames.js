import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { 
  applyFilters, 
  createJoinRequest,
  createSpectatorRequest,
  isRequestAccepted, 
  isRequestDenied,
  isSpectatorRequestAccepted,
  isSpectatorRequestDenied,
  isSpectatorRequestAcceptedFor,
  isSpectatorRequestDeniedFor
} from '../utils/listGamesHelpers';

const useListGames = () => {
  const [gamesList, setGamesList] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [filters, setFilters] = useState({
    privacy: "",
    status: "",
    minPlayers: "",
    search: "",
  });
  const [onlyFriend, setOnlyFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  const jwt = tokenService.getLocalAccessToken();
  const navigate = useNavigate();
  useEffect(() => {
    fetchGames();
  }, [jwt]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUser = tokenService.getUser();
        if (!currentUser?.username) return;
        
        const response = await fetch(`/api/v1/players/byUsername?username=${currentUser.username}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (response.ok) {
          const playerData = await response.json();
          
          if (playerData.friends && playerData.friends.length > 0) {
            if (typeof playerData.friends[0] === 'string') {
              const friendsData = await Promise.all(
                playerData.friends.map(async (username) => {
                  const friendResponse = await fetch(`/api/v1/players/byUsername?username=${username}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                  });
                  if (friendResponse.ok) {
                    return await friendResponse.json();
                  }
                  return null;
                })
              );
              setFriendsList(friendsData.filter(f => f !== null));
            } else {
              setFriendsList(playerData.friends);
            }
          }
        }
      } catch (error) {
        console.error("Error to obtain friends:", error);
      }
    };
    fetchFriends();
  }, [jwt]);

  useEffect(() => {
    const filtered = applyFilters(gamesList, filters, onlyFriend, friendsList);
    setFilteredGames(filtered);
  }, [filters, gamesList, onlyFriend, friendsList]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGamesList(data);
        setFilteredGames(data);
      } else {
        toast.error("Error to obtain the games listº.");
      }
    } catch (error) {
      console.error("Error to fetch:", error);
      toast.error("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const refreshGames = async () => {
    try {
      const response = await fetch("/api/v1/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGamesList(data);
        setFilteredGames(data);
        toast.info('Games list updated');
      } else {
        toast.error('Error updating the games list');
      }
    } catch (error) {
      console.error('Error refreshing games:', error);
      toast.error('Could not connect to the server.');
    }
  };

  const handleSpectator = async (game) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      };

      // Obtener el juego completo (incluye activePlayers, chat, etc.)
      const gameRes = await fetch(`/api/v1/games/${game.id}`, { method: 'GET', headers });
      const fullGame = gameRes.ok ? await gameRes.json() : game;

      // Resolver la ronda actual para entrar al board correcto
      const roundsRes = await fetch(`/api/v1/rounds/byGameId?gameId=${game.id}`, { method: 'GET', headers });
      const rounds = roundsRes.ok ? await roundsRes.json() : [];
      const currentRound = Array.isArray(rounds)
        ? [...rounds].sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0)).at(-1)
        : null;

      const boardId = typeof currentRound?.board === 'number'
        ? currentRound.board
        : currentRound?.board?.id;

      if (!boardId) {
        toast.error('Could not resolve the current board for this game.');
        return;
      }

      navigate(`/board/${boardId}`, {
        state: { game: fullGame, round: currentRound, isSpectator: true, returnTo: '/ListGames' }
      });
      toast.info('Entering as spectator...');
    } catch (error) {
      console.error('Error entering as spectator:', error);
      toast.error('Could not connect as spectator.');
    }
  };

  const handleRequestSpectator = async (game) => {
    try {
      const currentUser = tokenService.getUser();
      if (!currentUser || !currentUser.username) {
        toast.error("Error to identify user.");
        return;
      }

      const request = createSpectatorRequest(
        currentUser.username, 
        game.id, 
        game.chat
      );

      const response = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        toast.success("Spectator request sent to the game creator.");
        let createdMessageId = null;
        try {
          const created = await response.json();
          createdMessageId = created?.id ?? null;
        } catch (_) {
          createdMessageId = null;
        }
        startPollingForSpectatorResponse(game, currentUser.username, createdMessageId);
      } else {
        toast.error("Error to send the spectator request. Try Again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error to connect with the server. Try Again.");
    }
  };

  // Polling para verificar respuesta del creador (espectador)
  const startPollingForSpectatorResponse = (game, username, requestMessageId) => {
    const headers = { Authorization: `Bearer ${jwt}` };
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/messages/byChatId?chatId=${game.chat}`, 
          { headers }
        );
        if (!res.ok) return;

        const msgs = await res.json();
        for (const m of msgs) {
          const accepted = requestMessageId !== null && requestMessageId !== undefined
            ? isSpectatorRequestAcceptedFor(m, username, game.id, requestMessageId)
            : isSpectatorRequestAccepted(m, username, game.id);
          if (accepted) {
            clearInterval(interval);
            toast.success('Spectator request accepted. Entering the game...');

            const headers2 = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            };

            const gameRes = await fetch(`/api/v1/games/${game.id}`, { method: 'GET', headers: headers2 });
            const fullGame = gameRes.ok ? await gameRes.json() : game;

            const roundsRes = await fetch(`/api/v1/rounds/byGameId?gameId=${game.id}`, { method: 'GET', headers: headers2 });
            const rounds = roundsRes.ok ? await roundsRes.json() : [];
            const currentRound = Array.isArray(rounds)
              ? [...rounds].sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0)).at(-1)
              : null;

            const boardId = typeof currentRound?.board === 'number'
              ? currentRound.board
              : currentRound?.board?.id;

            if (!boardId) {
              toast.error('Could not resolve the current board for this game.');
              return;
            }

            navigate(`/board/${boardId}`, {
              state: { game: fullGame, round: currentRound, isSpectator: true, returnTo: '/ListGames' }
            });
            return;
          }

          const denied = requestMessageId !== null && requestMessageId !== undefined
            ? isSpectatorRequestDeniedFor(m, username, game.id, requestMessageId)
            : isSpectatorRequestDenied(m, username, game.id);
          if (denied) {
            clearInterval(interval);
            toast.warn('Spectator request denied by the Creator.');
            return;
          }
        }
      } catch (error) {
        console.error('polling error', error);
      }
    }, 2000);
  };

  const handleRequestJoin = async (game) => {
    try {
      const currentUser = tokenService.getUser();
      if (!currentUser || !currentUser.username) {
        toast.error("Error to identify user.");
        return;
      }

      const request = createJoinRequest(
        currentUser.username, 
        game.id, 
        game.chat
      );

      const response = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        toast.success("Request sent to the game creator.");
        startPollingForResponse(game, currentUser.username);
      } else {
        toast.error("Error to send the request. Try Again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error to connect with the server. Try Again.");
    }
  };

  const startPollingForResponse = (game, username) => {
    const headers = { Authorization: `Bearer ${jwt}` };
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/messages/byChatId?chatId=${game.chat}`, 
          { headers }
        );
        if (!res.ok) return;

        const msgs = await res.json();
        for (const m of msgs) {
          if (isRequestAccepted(m, username, game.id)) {
            clearInterval(interval);
            const gres = await fetch(`/api/v1/games/${game.id}`, { headers });
            if (gres.ok) {
              const updatedGame = await gres.json();
              toast.success('Request accepted. Entering the Lobby...');
              navigate(`/CreateGame/${game.id}`, { state: { game: updatedGame } });
              return;
            }
          }

          if (isRequestDenied(m, username, game.id)) {
            clearInterval(interval);
            toast.warn('Request Denied from the Creator.');
            return;
          }
        }
      } catch (error) {
        console.error('error del polling', error);
      }
    }, 2000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      privacy: "",
      status: "",
      minPlayers: "",
      search: "",
    });
  };

  const toggleFriendFilter = () => {
    setOnlyFriend((prev) => !prev);
  };

  return {
    filteredGames,
    friendsList,
    filters,
    onlyFriend,
    loading,
    refreshGames,
    handleSpectator,
    handleRequestSpectator,
    handleRequestJoin,
    handleFilterChange,
    clearFilters,
    toggleFriendFilter
  };
};

export default useListGames;
