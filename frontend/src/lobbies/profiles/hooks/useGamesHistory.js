import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { sortGamesByDate } from '../utils/gamesHistoryHelpers';

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
          const finishedGames = data.filter(game => game.gameStatus === "FINISHED");
          
          const sortedGames = sortGamesByDate(finishedGames);
          
          setFilteredGames(sortedGames);
          setError(null);
          console.log("Games loaded:", sortedGames);
        } else {
          toast.error("Error to obtain the historial of games");
          setError("Failed to fetch games");
        }
      } catch (error) {
        console.error("Error in fetch:", error);
        toast.error("Network error loading game history");
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
