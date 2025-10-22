import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import tokenService from '../../services/token.service';
import '../../static/css/lobbies/games/CreateGame.css'; 


const CreateGame = () => {
  const location = useLocation();
  const [game, setGame] = useState(location.state?.game);
  const [chat,setchat] = useState()
  const [numPlayers, setnumPlayers] = useState('3');
  const [isPrivate, setisPrivate] = useState(false);
  const [player, setPlayer] = useState([])
  const[patchgame,setpatchgame]  = useState()
  const navigate = useNavigate(); 
  const jwt = tokenService.getLocalAccessToken();
  const loggedInUser = tokenService.getUser();
  const isCreator = game?.creator === loggedInUser?.username;


  useEffect(() => {
     if (!game) return;
    const patchchat = async () => {
          try {
            const loggedInUser = tokenService.getUser();
          if (!loggedInUser || !loggedInUser.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        } //corregido con el copy properties
           const request = {
          game : game.id
        }
            const response = await fetch(`/api/v1/chats/${game.chat}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(request),
      });
            console.log(response);
            if (response.ok) {
              const data = await response.json();
              console.log('chat del creategame ', data)
              setchat(data);
            } else {
              console.error('Respuesta no OK:', response.status);
              alert('Error al obtener la chat del jugador.');
            }
          } catch (error) {
            console.error('Hubo un problema con la petición fetch:', error);
            alert('Error de red. No se pudo conectar con el servidor.');
          }
        };
        console.log('game del navigate', game)
        console.log('chat del navigate', game.chat)
        patchchat()
        

        const fetchPlayer = async () => {
          console.log('chat del creategame ', chat)
          try {
            const loggedInUser = tokenService.getUser();
          if (!loggedInUser || !loggedInUser.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        } //necesitamos el metodo findbyusername de player bien
        //mientras tanto lo buscamos por el id con el loggedinuser
            const response = await fetch(`/api/v1/players?username=${game.creator}`, {
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
        

        console.log("este es  el player", player)
        
        

  },[jwt, game])

  async function handleSubmit() {
    //necesitamos el patch de game
    //el player  primero tiene  que esstar en la tabla activeplayers para poder meterlo en game-activeplayers
    const request = {
      gameStatus: "CREATED",
      private: isPrivate,
      maxPlayers: parseInt(numPlayers),
      //activePlayers: [player.username]
    };

    console.log('Enviando request:', request);
    

    const jwt = tokenService.getLocalAccessToken();

    try {
      const response = await fetch(`/api/v1/games/${game.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(request),
      });
      console.log(response)

      if (response.ok) {
        const newGame = await response.json();
        alert("¡Partida actualizada con éxito!");
        setpatchgame(newGame)
        console.log(newGame)
         //navigate(`/board/${newGame.id}`); 
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar la partida: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      alert('Error de red. No se pudo conectar con el servidor.');
    }
  }

  async function handleStart() {
  const request = {
    gameStatus: "ONGOING", 
  };

  try {
    const response = await fetch(`/api/v1/games/${game.id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}` 
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const newGame = await response.json();
      setpatchgame(newGame);
      alert("¡Partida iniciada con éxito!");
      navigate(`/board/${newGame.id}`, { state: { game: newGame } });
    } else {
      const errorData = await response.json();
      alert(`Error al iniciar la partida: ${errorData.message}`);
    }
  } catch (error) {
    console.error(error);
    alert('No se pudo conectar con el servidor');
  }
}

  async function handleCancel() {
    try {
    const response = await fetch(`/api/v1/games/${game.id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}` 
      },
    });

    if (response.ok) {
      const newGame = await response.json();
      alert("Partida eliminada");
      navigate("/lobby");
    } else {
      const errorData = await response.json();
      alert(`Error al eliminar la partida: ${errorData.message}`);
    }
  } catch (error) {
    console.error(error);
    alert('No se pudo conectar con el servidor');
  }

  }
  async function handleCopyLink() {
    console.log("Link", game.link)
    const linkToCopy = game.link;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      alert("¡Enlace copiado al portapapeles!");
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
      alert('No se pudo copiar el enlace.');
    }
  }
const handleExpelPlayer = (usernameToExpel) => {
  setGame(prevGame => ({
    ...prevGame,
    activePlayers: prevGame.activePlayers.filter(
      username => username !== usernameToExpel
    ),
  }));
};

  return (
    <div className="home-page-container">
      <div className="hero-div"> 
        <h1>Create Game</h1>
        <div className="creategame-card">
          {isCreator && (
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
          )}
          <div className="active-players-section">
            <h2>Players : ({game.activePlayers.length}/{game.maxPlayers})</h2>
            <div className="active-players-list">
              {game.activePlayers.map((username, index) => (
                <div key={index} className="player-card">
                  <div className="player-avatar">
                    <img
                      alt={username}
                    />
                  </div>
                  <div className="player-name">{username}</div>
                  {isCreator && username!==game.creator && (
                    <button
                      className="expel-player-btn"
                      onClick={() => handleExpelPlayer(username)}>
                      ❌ expulsar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isCreator && (
          <div className="form-group privacy-toggle">
            <label>Privacity</label>
            <div className="toggle-switch">
              <span>{isPrivate ? "Private" : "Public"}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={() => setisPrivate(!isPrivate)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
            )}

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
        {game && game.activePlayers?.length > 0 && (
          <div className="active-players-section"></div>)}
            <div className="card-footer">
              {isCreator ? (
                <>
                  <button onClick={handleSubmit}>📑 SAVE CHANGES</button>
                  <button onClick={handleStart}>▶️ START</button>
                  <button onClickCapture={handleCopyLink}>🔗 LINK</button>
                    <button onClick={handleCancel}>❌ CANCEL</button>
                  
                </>
              ) : (
                <Link to="/lobby">
                  <button className="button-small">🚪 EXIT LOBBY</button>
                </Link>
              )}
                {!isCreator && (
                    <div className="waiting-piece">
                      <div className="spinner"></div>
                      <span>WAITING ...</span>
                    </div>
                  )}
            </div>    
        </div>
      </div>
    </div>
  );
};

export default CreateGame;