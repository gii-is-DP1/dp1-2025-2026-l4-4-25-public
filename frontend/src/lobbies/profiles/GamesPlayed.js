import React, { useEffect, useState } from "react";
import "../../App.css";
import "../../static/css/lobbies/GamesHistory.css";
import { Link } from "react-router-dom";
import tokenService from "../../services/token.service";

export default function GamesHistory() {
  const [gamesList, setGamesList] = useState([]);
  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/v1/games", {  // Esto es de pruebas
          method: "GET",
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${jwt}`,},});
        if (response.ok) {
          const data = await response.json();
          setGamesList(data);
        } else {
          alert("Error al obtener el historial");
        }
      } catch (error) {
        console.error("Error en fetch:", error);}};
    fetchGames();
  }, [jwt]);

  return (
    <div className="games-history-container">
      <div className="top-right-lobby-buttons">
        <Link to="/profile">
          <button className="button-logOut">➡️</button>
        </Link>
      </div>
      <h1 className="games-history-title">📜 Games History 📜</h1>
      <div className="games-history-list">
        {gamesList.length=== 0? (
          <p className="no-games">❌ Not matches registered yet.</p>
        ) : (
          gamesList.map((game) => (
            <div key={game.id} className="game-history-card">
              <div className="creator-section">
                <img src={game.creatorr?.avatarUrl || ""}
                  alt="Avatar creador"
                  className="creator-avatar"/>
              </div>
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
                  ⏱️ Total Time:{" "}
                  <b>{game.totalTime || "No disponible"}</b>
                </p>

                <details className="players-details">
                  <summary>🧑‍🤝‍🧑 Watch Players</summary>
                  <ul>
                    {game.players && game.players.length > 0 ? (
                      game.players.map((p, i) => (
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
