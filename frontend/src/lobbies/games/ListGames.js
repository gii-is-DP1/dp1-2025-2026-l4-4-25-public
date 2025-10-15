import React, { useEffect, useState } from 'react';
import '../App.css';
import '../static/css/lobbies/ListGames.css'; 
import { Link } from 'react-router-dom';
import games from '../static/images/games.png'; 
import tokenService from '../../services/token.service';
export default function ListGames(){
   
   const [gamesList, setgamesList] = useState([])
   const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("api/v1/games", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          }
        });
        console.log(response);
        if (response.ok) {
          const data = await response.json();
          setgamesList(data);
        } else {
          console.error('Respuesta no OK:', response.status);
          alert('Error al obtener la lista de juegos.');
        }
      } catch (error) {
        console.error('Hubo un problema con la petición fetch:', error);
        alert('Error de red. No se pudo conectar con el servidor.');
      }
    };
    fetchGames();
    console.log(gamesList);
  }, [jwt]);
     return (
                <div className="home-page-lobby-container">
            <img src={games} alt="Encabezado" className="listgames-top-image" />
            <div className="top-right-lobby-buttons">
                <Link to="/lobby">
                    <button className="button-logOut"> ➡️</button>
                </Link>
            </div>
            <div className="hero-div">
                <div className="listgames-card">
                    {
                        gamesList.map(game => (
                            <div key={game.id} className="game-card">
                                <h3>Partida de {game.creator?.username || 'Creator not found'}</h3>
                                <p>Estado: {game.gameStatus}</p>
                                <p>Jugadores: {game.activePlayers?.length || 0}/{game.maxPlayers}</p>
                                <p>{game.private ? 'Private' : 'Public'}</p>
                                    <button className="button-join-game">Unirse</button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>

   )
}