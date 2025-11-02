import React, { useEffect, useState } from "react";
import "../../App.css";
import "../../static/css/lobbies/GamesHistory.css";
import { Link } from "react-router-dom";
import tokenService from "../../services/token.service";

export default function GamesHistory() {
  const [gamesList, setGamesList] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const jwt = tokenService.getLocalAccessToken();
  const currentUser = tokenService.getUser()?.username;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/v1/games", {  // Esto es de pruebas
          method: "GET",
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${jwt}`,},});
        if (response.ok) {
          let data = await response.json();

           data = data.map((g) => {
              if (g.id === 2) { // METEMOS UNA PRUEBA EN EL JUEGO ID=2 QUE ES EL FINISHED, CUANDO TENGAMOS HECHO TODO PUES DIRECTAMENTE SE HARÁ TODO SOLO :)
                return {
                  ...g,
                  activePlayers: [
                    { username: "Carlosbox2k" },
                    { username: "Bedilia" },
                    { username: "Alexby205" },
                    { username: "mantecaoHacker" }
                  ],
                  winner: { username: "Carlosbox2k" }};} // PRUEBA DE GANADOR
              return g;});
          const finishedGames = data.filter((g) => {
            const isFinished = g.gameStatus === "FINISHED"; // Comprobamos que ha acabado la partida
            const isCreator = g.creator === currentUser; // Filtramos las partidas en las cuales YO (usuario logueado) he creado o jugado (estoy en active player)
            const isPlayer = g.players?.some(
              (p) => p.username === currentUser);
            return isFinished&&(isCreator||isPlayer);
          });
          setFilteredGames(finishedGames);
          console.log(data)
        } else {
          alert("Error al obtener el historial");
        }
      } catch (error) {
        console.error("Error en fetch:", error);}};
    fetchGames();
  }, [jwt]);

  const formatTime = (s) => {
    if (!s) return "NOT AVALIABLE";
    const part = s.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!part) return s;
    const mins = part[1] ? parseInt(part[1]) : 0;
    const segs = part[2] ? parseInt(part[2]) : 0;
    return `${mins} min ${segs} s`;
  };

  return (
    <div className="games-history-container">
      <div className="top-right-lobby-buttons">
        <Link to="/profile">
          <button className="button-logOut">➡️</button>
        </Link>
      </div>
      <h1 className="games-history-title">📜 Games History 📜</h1>
      <div className="games-history-list">
        {filteredGames.length=== 0? (
          <p className="no-games">❌ Not matches registered yet.</p>
        ) : (
          filteredGames.map((game) => (
            <div key={game.id} className="game-history-card">
              <div className="game-info">
                <h2>
                  🎮 Game of {" "}
                  <span className="creator-name">
                    {game.creator || "Desconocido"}
                  </span>{" "}
                  <span className="game-id">(ID: {game.id})</span>
                </h2>

                <p>
                  👥 Players:{" "}
                  <b>
                    {game.maxPlayers || 0}
                  </b>
                </p>

                <p>
                  ⭐ Winner:{" "}
                  <b>
                    {game.winner?.username}
                  </b>
                </p>

                <p>
                  ⏱️ Total Time: <b>{formatTime(game.time)}</b>
                </p>


                <details className="players-details">
                  <summary>🧑‍🤝‍🧑 List of Players</summary>
                  <ul>
                    {game.activePlayers && game.activePlayers.length > 0 ? (
                      game.activePlayers.map((p, i) => (
                        <li key={i}>
                          {p.username || p}{" "}
                        </li>
                      ))
                    ) : (
                      <li>❌Not Players registered</li>
                    )}
                  </ul>
                </details>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
