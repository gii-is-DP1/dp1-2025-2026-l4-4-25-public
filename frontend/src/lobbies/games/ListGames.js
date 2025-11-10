import React, { useEffect, useState } from "react";
import "../../App.css";
import "../../static/css/lobbies/games/ListGames.css";
import { Link, useNavigate } from "react-router-dom";
import gamesImg from "../../static/images/games.png";
import { toast } from "react-toastify";
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
  const navigate = useNavigate();


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
          toast.error("Error al obtener la lista de juegos.");
        }
      } catch (error) {
        console.error("Error en fetch:", error);
        toast.error("No se pudo conectar con el servidor.");
      }
    };
    fetchGames();
  }, [jwt]);

    async function refreshGames() {
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
  }

  async function handleRequestJoin(game) {
    try {
      const currentUser = tokenService.getUser();
      if (!currentUser || !currentUser.username) {
        toast.error("Error to identify user.");
        return;}

      const request = {
        content: `REQUEST_JOIN:${currentUser.username}:${game.id}`,
        activePlayer: currentUser.username,
        chat: game.chat};

      const response = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(request),});

      if (response.ok) {
        toast.success("Request sent to the game creator.");
        const currentUser = tokenService.getUser();
        const headers = { Authorization: `Bearer ${jwt}` };
        const iv = setInterval(async () => {
          try {
            const res = await fetch(`/api/v1/messages/byChatId?chatId=${game.chat}`, {headers});
            if (!res.ok) return;
            const msgs = await res.json();
            for (const m of msgs) {
              if (!m.content || typeof m.content !== 'string') continue;
              if (m.content.startsWith('REQUEST_ACCEPTED:')) {
                const parts = m.content.split(':');
                const targetUser = parts[1];
                const targetGameId = parts[2];
                if (targetUser === currentUser.username && String(targetGameId) === String(game.id)) {
                  clearInterval(iv);
                  const gres = await fetch(`/api/v1/games/${game.id}`, { headers });
                  if (gres.ok) {
                    const updatedGame = await gres.json();
                    toast.success('Request accepted. Entering the Lobby...');
                    navigate(`/CreateGame/${game.id}`, {state:{ game:updatedGame}});
                    return;}}}
              if (m.content.startsWith('REQUEST_DENIED:')) {
                const parts = m.content.split(':');
                const targetUser = parts[1];
                const targetGameId = parts[2];
                if (targetUser === currentUser.username && String(targetGameId) === String(game.id)) {
                  clearInterval(iv);
                  toast.warn('Request Denied from the Creator.');
                  return;}}}
          } catch (error) { console.error( 'error del poling', error); }
        }, 2000);
      } else {
        toast.error("Error to send the request. Try Again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error to connect with the server. Try Again.");
    }
  }

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
    let filtered = gamesList.filter(
      (g) =>
        g.gameStatus === "CREATED" ||
        g.gameStatus === "ONGOING");
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
      const friendUsernames = friendLs.map((f) => f.username?.toLowerCase());
      filtered = filtered.filter((g) =>
        friendUsernames.includes(g.creator?.username?.toLowerCase()));}
    setFilteredGames(filtered);
    
    
}, [filters, gamesList, onlyFriend, friendLs,filteredGames.activePlayers]);

console.log('game.activePlayers', filteredGames.id, filteredGames.activePlayers)



  return (
    <div className="home-page-lobby-container">
      <img src={gamesImg} alt="Encabezado" className="listgames-top-image" />
      <div className="top-right-lobby-buttons">
        <button className="button-logOut" onClick={refreshGames}>🔁</button>
        <Link to="/lobby">
          <button className="button-logOut">➡️</button>
        </Link>
  
      </div>

      <div className="listgames-content">
        <div className="listgames-card">
          {filteredGames.length === 0 ? (
            <p>❌There are no games that match the filters.</p>
          ):(
            filteredGames.map((game) => {
              return (
                <div key={game.id} className="game-card">
                  <h3>🎮 Game of {game.creator || "Unknown"}</h3>
                  <p>🖥️ ID: {game.id}</p>
                  <p>🔁 Status: {game.gameStatus}</p>
                  <p>👤 Players: {game.activePlayers?.length || 0}/{game.maxPlayers}</p>
                   <div className="players-list">
                    <label>🫂 Jugadores:</label>
                      <ul>
                        {game.activePlayers.map((p, idx) => (
                          <li>{p.username ?? p}</li>
                        ))}
                      </ul>
                  </div>
                  <p>🌐 Privacy: {game.private ? "Private 🔒" : "Public 🔓"}</p>
                  <div className="game-card-footer">
                    {game.gameStatus === "CREATED" ? (
                      game.private ? (
                        <button className="button-join-game" onClick={() => handleRequestJoin(game)}>📩REQUEST JOIN</button>
                      ) : game.activePlayers?.length < game.maxPlayers ? (
                        <Link to={"/CreateGame/" + game.id} state={{ game }}>
                          <button className="button-join-game">📥JOIN</button>
                        </Link>
                      ) : (
                        <button className="button-join-game">🔴GAME IS FULL</button>
                      )
                    ) : (
                      <Link to={"/board/" + game.id}>
                        <button className="button-join-game">👁️‍🗨️SPECTATE</button> {/* Hay que poner que de el rol espectador para que tenga limitado el acceso en muchos aspectos en la partida */}
                      </Link>
                    )}
                  </div>
                </div>
              );
            }))}
        </div>

        <div className="filters-panel">
          <h2> Filters</h2>
          
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
