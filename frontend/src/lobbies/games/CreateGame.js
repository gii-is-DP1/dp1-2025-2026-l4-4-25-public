import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tokenService from '../../services/token.service';
import '../static/css/lobbies/CreateGame.css'; 

const CreateGame = () => {
  const [numPlayers, setnumPlayers] = useState('3');
  const [isPrivate, setisPrivate] = useState(false);
  const [player, setPlayer] = useState()
  const navigate = useNavigate(); 
  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchPlayer = async () => {
          try {
            const loggedInUser = tokenService.getUser();
          if (!loggedInUser || !loggedInUser.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }
            const response = await fetch(`/api/v1/users/${loggedInUser.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
              }
            });
            console.log(response);
            if (response.ok) {
              const data = await response.json();
              setPlayer(data);
            } else {
              console.error('Respuesta no OK:', response.status);
              alert('Error al obtener la información del jugador.');
            }
          } catch (error) {
            console.error('Hubo un problema con la petición fetch:', error);
            alert('Error de red. No se pudo conectar con el servidor.');
          }
        };
        fetchPlayer()
        console.log(player)
        

  },[jwt])

  async function handleSubmit() {

    
    
    const request = {
      maxPlayers: numPlayers, 
      private: isPrivate,                 
      gameStatus: "CREATED",  
      creator: player                 
    };

    console.log('Enviando request:', request);
    

    const jwt = tokenService.getLocalAccessToken();

    try {
      const response = await fetch("/api/v1/games", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(request),
      });
      console.log(response)

      if (response.ok) {
        const newGame = await response.json();
        alert("¡Partida creada con éxito!");
        console.log(newGame)
         // navigate(`/games/${newGame.id}`); 
      } else {
        const errorData = await response.json();
        alert(`Error al crear la partida: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      alert('Error de red. No se pudo conectar con el servidor.');
    }

    
   
    
  }

  return (
    <div className="home-page-container">
      <div className="hero-div"> 
        <h1>Create Game</h1>
        <div className="creategame-card">
          <div className="form-group">
            <label>Number of players</label>
            <select
              id="num-jugadores"
              className="form-control"
              value={numPlayers}
              onChange={(e) => setnumPlayers(e.target.value)}
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          
          <div className="form-group privacy-toggle">
            <label>Privacity</label>
            <div className="toggle-switch">
              <span>Private / Public </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!isPrivate}
                  onChange={() => setisPrivate(!isPrivate)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="form-group add-friends-section">
            <label>Invite friends</label>
            <div className="friends-list">
              <div className="add-friend-button">
                <button>
                  <img src="https://via.placeholder.com/40/DDDDDD/6D4C41?text=%2B" alt="Invite more friends" />
                </button>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button onClick={handleSubmit}>
              ▶️START
            </button>
            <button>
              LINK
            </button>
            <Link to="/lobby">
              <button className="button-small">❌CANCEL</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;