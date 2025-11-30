import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { filterFinishedGames, addMockGameData, sortGamesByDate } from '../utils/gamesHistoryHelpers';

/**
 * Custom hook para manejar el historial de juegos
 */
const useGamesHistory = () => {
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const jwt = tokenService.getLocalAccessToken();
  const currentUser = tokenService.getUser()?.username;

  useEffect(() => {
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
          let data = await response.json();
          
          // Añadir datos de prueba (temporal)
          data = addMockGameData(data);
          
          // Filtrar juegos terminados del usuario
          const finishedGames = filterFinishedGames(data, currentUser);
          
          // Ordenar por fecha (más reciente primero)
          const sortedGames = sortGamesByDate(finishedGames);
          
          setFilteredGames(sortedGames);
          setError(null);
          console.log("Games loaded:", data);
        } else {
          toast.error("Error al obtener el historial");
          setError("Failed to fetch games");
        }
      } catch (error) {
        console.error("Error en fetch:", error);
        toast.error("Error de red al cargar el historial");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (jwt && currentUser) {
      fetchGames();
    }
  }, [jwt, currentUser]);

  return {
    games: filteredGames,
    loading,
    error
  };
};

export default useGamesHistory;
