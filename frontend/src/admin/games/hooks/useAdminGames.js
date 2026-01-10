import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';


const useAdminGames = () => {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({creator: "", participant: "", winner: "", privacy: "", status: "", minPlayers: ""});
  
  const jwt = tokenService.getLocalAccessToken();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
    fetchUsers();
  }, [jwt]);

  useEffect(() => {
    applyFilters();
  }, [filters, allGames]);

  const getUsername = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value.username || '';
    return '';
  };

  const getGameStatus = (game) => {
    const status = game?.gameStatus ?? game?.status;
    return typeof status === 'string' ? status : '';
  };

  const getIsPrivate = (game) => {
    if (typeof game?.private === 'boolean') return game.private;
    if (typeof game?.isPrivate === 'boolean') return game.isPrivate;
    return false;
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`}});

      if (response.ok) {
        const data = await response.json();
        const sortedGames = data.sort((a, b) => b.id - a.id);
        setAllGames(sortedGames);
        console.log("All games loaded:", sortedGames);
      } else {
        toast.error("Error to fetch games data");
      }
    } catch (error) {
      console.error("Error en fetch:", error);
      toast.error("Errror to fetch games data");
    } finally {
      setLoading(false)}};

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/v1/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`}});

      if (response.ok) {
        const data = await response.json();
        const sortedUsers = data
          .filter(user => user.username)
          .sort((a, b) => a.username.localeCompare(b.username));
        setAllUsers(sortedUsers)}
    } catch (error) {
      console.error("Error loading users:", error)}};

  const applyFilters = () => {
    let filtered = [...allGames];

    if (filters.creator) {
      const searchTerm = filters.creator.toLowerCase();
      filtered = filtered.filter((g) => {
        const creatorUsername = getUsername(g.creator).toLowerCase();
        return creatorUsername.includes(searchTerm);
      })}
    if (filters.participant) {
      const searchTerm = filters.participant.toLowerCase();
      filtered = filtered.filter((g) => {
        const isCreator = getUsername(g.creator).toLowerCase().includes(searchTerm);
        const isActivePlayer = g.activePlayers?.some((p) => {
          const username = typeof p === 'string' ? p : p.username || '';
          return username.toLowerCase().includes(searchTerm)});
        return isCreator || isActivePlayer})}
    if (filters.winner) {
      const searchTerm = filters.winner.toLowerCase();
      filtered = filtered.filter((g) => {
        const winnerUsername = getUsername(g.winner).toLowerCase();
        return winnerUsername.toLowerCase().includes(searchTerm)})}
    if (filters.privacy) {
      const isPrivate = filters.privacy === "private";
      filtered = filtered.filter((g) => getIsPrivate(g) === isPrivate)}
    if (filters.status) {
      const searchTerm = filters.status.toLowerCase();
      filtered = filtered.filter(
        (g) => getGameStatus(g).toLowerCase() === searchTerm)}
    if (filters.minPlayers) {
      const minPlayers = parseInt(filters.minPlayers, 10);
      if (Number.isFinite(minPlayers)) {
      filtered = filtered.filter(
          (g) => (g.activePlayers?.length || 0) >= minPlayers)}
    }
    setFilteredGames(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }))};

  const clearFilters = () => {
    setFilters({creator: "", participant: "", winner: "", privacy: "", status: "", minPlayers: ""})};

  const refreshGames = () => {
    fetchGames()};

  const handleSpectate = async (game) => {
    try {
      const jwt = tokenService.getLocalAccessToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      };

      const gameRes = await fetch(`/api/v1/games/${game.id}`, { method: 'GET', headers });
      const fullGame = gameRes.ok ? await gameRes.json() : game;

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
        state: { game: fullGame, round: currentRound, isSpectator: true, returnTo: '/admin/games' }
      });
      toast.info('Entering as spectator...');
    } catch (error) {
      console.error('Error entering as spectator:', error);
      toast.error('Could not connect as spectator.');
    }
  };

  return {
    filteredGames,
    allUsers,
    filters,
    loading,
    handleFilterChange,
    clearFilters,
    refreshGames,
    handleSpectate
}};

export default useAdminGames;
