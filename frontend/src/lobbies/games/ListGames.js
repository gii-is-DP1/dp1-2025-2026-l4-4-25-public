import React, { useEffect, useState } from "react";
import "../../App.css";
import "../../static/css/lobbies/games/ListGames.css";
import { Link } from "react-router-dom";
import gamesImg from "../../static/images/games.png";
import tokenService from "../../services/token.service";

export default function ListGames() {
  const [gamesList, setGamesList] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filters, setFilters] = useState({
    privacy: "",
    status: "",
    minPlayers: "",
    search: "",
  });
  const [friendLs, setFriendLs] = useState([]); 
  const [onlyFriend, setOnlyFriend] = useState(false);

  const jwt = tokenService.getLocalAccessToken();


  useEffect(() => {
    const fetchGames = async () => {
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
        } else {
          alert("Error al obtener la lista de juegos.");
        }
      } catch (error) {
        console.error("Error en fetch:", error);
        alert("No se pudo conectar con el servidor.");
      }
    };
    fetchGames();
  }, [jwt]);

   useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/v1/friends", {
          headers: { Authorization: `Bearer ${jwt}` },});
        if (response.ok) {
          const data = await response.json();
          setFriendLs(data);}
      } catch (error) {
        console.error("Error al obtener amigos:",error);}};
    fetchFriends();
  }, [jwt]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));};

  useEffect(() => {
    let filtered = gamesList;
    if (filters.privacy) {
      const isPrivate = filters.privacy === "private";
      filtered = filtered.filter((g) => g.private === isPrivate);}
    if (filters.status) {
      filtered = filtered.filter(
        (g) => g.gameStatus.toLowerCase() === filters.status.toLowerCase());}
    if (filters.minPlayers) {
      filtered = filtered.filter(
        (g) => g.activePlayers?.length >= parseInt(filters.minPlayers));}
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.creator?.username?.toLowerCase().includes(term) ||
          g.id?.toString().includes(term));}
    if (onlyFriend && friendLs.length > 0) {
      const friendUsernames = friendLs.map((f) =>
        f.username?.toLowerCase());
      filtered = filtered.filter((g) =>
        friendUsernames.includes(g.creator?.username?.toLowerCase()));}
    setFilteredGames(filtered);
  }, [filters, gamesList, onlyFriend, friendLs]);

  return (
    <div className="home-page-lobby-container">
      <img src={gamesImg} alt="Encabezado" className="listgames-top-image" />
      <div className="top-right-lobby-buttons">
        <Link to="/lobby">
          <button className="button-logOut">➡️</button>
        </Link>
      </div>

      <div className="listgames-content">
        <div className="listgames-card">
          {filteredGames.length === 0 ? (
            <p>❌There are no games that match the filters.</p>
          ):(
            filteredGames.map((game) => (
              <div key={game.id} className="game-card">
                <h3>🎮 Game of {game.creator || "Unknown"}</h3>
                <p>🖥️ ID: {game.id}</p>
                <p>🔁 Status: {game.gameStatus}</p>
                <p>👤 Players: {game.activePlayers?.length || 0}/{game.maxPlayers}</p> 
                <p>🌐 Privacy: {game.private ? "Private 🔒" : "Public 🔓"}</p>
                <div className="game-card-footer">
                  {game.gameStatus === "CREATED" ? (
                    game.private ? (
                     <Link to={"/board/" + game.id}>
                      <button className="button-join-game">📩REQUEST JOIN</button>
                      </Link>
                    ):(
                      <Link to="/CreateGame" 
                      state={{ game }}>
                      <button className="button-join-game">📥JOIN</button>
                      </Link>
                      )
                    ):(
                      <Link to={"/board/" + game.id}>
                      <button className="button-join-game">👁️‍🗨️SPECTATE</button> {/* Hay que poner que de el rol espectador para que tenga limitado el acceso en muchos aspectos en la partida */}
                      </Link>
                    )}               
                  </div>
              </div>
              )))}
        </div>

        <div className="filters-panel">
          <h2>Filters</h2>
          <div className="filter-group">
            <label>🌐Privacy:</label>
            <select name="privacy" value={filters.privacy} onChange={handleFilter}>
              <option value="">Alls</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="filter-group">
            <label>🔁Status:</label>
            <select name="status" value={filters.status} onChange={handleFilter}>
              <option value="">Alls</option>
              <option value="CREATED">Created</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div className="filter-group">
            <label>👤Active Players / Game:</label>
            <input
              type="number"
              name="minPlayers"
              value={filters.minPlayers}
              onChange={handleFilter}
              placeholder="Ej: 3"/>
          </div>

          <div className="filter-group">
            <label>🔎Find game:</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilter}
              placeholder="For ID of game"/>
          </div>
          <div>
            <button
              className={`filter-friends-btn ${onlyFriend ? "active" : ""}`}
              onClick={() => setOnlyFriend((prev) => !prev)}>
              {onlyFriend ? "✅ Friends Games" : "👥 Show Only Friends Games"}
            </button>
          </div>
            <button
              className="filter-clear-btn"
              onClick={() =>
                setFilters({privacy:"", status:"", minPlayers:"", search:"" })}>
              Limpiar filtros
            </button>
        </div>
      </div>
    </div>
  );
}
