import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { sortGamesByDate } from '../utils/gamesHistoryHelpers';

/**
 * Custom hook para manejar el historial de juegos
 */
const useGamesHistory = () => {
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/games/myGames", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (response.ok) {
          let data = await response.json();
          
          // Filtrar juegos terminados
          const finishedGames = data.filter(game => game.gameStatus === "FINISHED");
          
          // Ordenar por fecha (más reciente primero)
          const sortedGames = sortGamesByDate(finishedGames);
          
          setFilteredGames(sortedGames);
          setError(null);
          console.log("Games loaded:", sortedGames);
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

    if (jwt) {
      fetchGames();
    }
  }, [jwt]);

  return {
    games: filteredGames,
    loading,
    error
  };
};

export default useGamesHistory;
