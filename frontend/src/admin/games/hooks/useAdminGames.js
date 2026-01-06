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
      filtered = filtered.filter((g) => 
        g.creator?.toLowerCase().includes(searchTerm))}
    if (filters.participant) {
      const searchTerm = filters.participant.toLowerCase();
      filtered = filtered.filter((g) => {
        const isCreator = g.creator?.toLowerCase().includes(searchTerm);
        const isActivePlayer = g.activePlayers?.some((p) => {
          const username = typeof p === 'string' ? p : p.username || '';
          return username.toLowerCase().includes(searchTerm)});
        return isCreator || isActivePlayer})}
    if (filters.winner) {
      const searchTerm = filters.winner.toLowerCase();
      filtered = filtered.filter((g) => {
        const winnerUsername = g.winner?.username || '';
        return winnerUsername.toLowerCase().includes(searchTerm)})}
    if (filters.privacy) {
      const isPrivate = filters.privacy === "private";
      filtered = filtered.filter((g) => g.private === isPrivate)}
    if (filters.status) {
      filtered = filtered.filter(
        (g) => g.gameStatus.toLowerCase() === filters.status.toLowerCase())}
    if (filters.minPlayers) {
      filtered = filtered.filter(
        (g) => g.activePlayers?.length >= parseInt(filters.minPlayers))}
    setFilteredGames(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }))};

  const clearFilters = () => {
    setFilters({creator: "", participant: "", winner: "", privacy: "", status: "", minPlayers: ""})};

  const refreshGames = () => {
    fetchGames()};

  const handleSpectate = (game) => {
    navigate(`/board/${game.id}`, { state: { game, isSpectator: true, returnTo: '/admin/games' } });
    toast.info('Entering as spectator...');};

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
