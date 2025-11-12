import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { 
  applyFilters, 
  createJoinRequest, 
  isRequestAccepted, 
  isRequestDenied 
} from '../utils/listGamesHelpers';

/**
 * Custom hook para manejar la lógica de ListGames
 */
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

  // Fetch inicial de juegos
  useEffect(() => {
    fetchGames();
  }, [jwt]);

  // Fetch de amigos
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/v1/friends", {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFriendsList(data);
        }
      } catch (error) {
        console.error("Error al obtener amigos:", error);
      }
    };
    fetchFriends();
  }, [jwt]);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    const filtered = applyFilters(gamesList, filters, onlyFriend, friendsList);
    setFilteredGames(filtered);
  }, [filters, gamesList, onlyFriend, friendsList]);

  // Función para fetch de juegos
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
        toast.error("Error al obtener la lista de juegos.");
      }
    } catch (error) {
      console.error("Error en fetch:", error);
      toast.error("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Refrescar lista de juegos
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
        toast.info('Lista de partidas actualizada');
      } else {
        toast.error('Error al actualizar la lista de partidas');
      }
    } catch (error) {
      console.error('Error refreshing games:', error);
      toast.error('No se pudo conectar con el servidor.');
    }
  };

  // Manejar entrada como espectador
  const handleSpectator = async (game) => {
    try {
      navigate(`/board/${game.id}`, { state: { game, isSpectator: true } });
      toast.info('Entering as spectator...');
    } catch (error) {
      console.error('Error entering as spectator:', error);
      toast.error('Could not connect as spectator.');
    }
  };

  // Manejar solicitud para unirse a juego privado
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

  // Polling para verificar respuesta del creador
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

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      privacy: "",
      status: "",
      minPlayers: "",
      search: "",
    });
  };

  // Toggle filtro de amigos
  const toggleFriendFilter = () => {
    setOnlyFriend((prev) => !prev);
  };

  return {
    filteredGames,
    filters,
    onlyFriend,
    loading,
    refreshGames,
    handleSpectator,
    handleRequestJoin,
    handleFilterChange,
    clearFilters,
    toggleFriendFilter
  };
};

export default useListGames;
