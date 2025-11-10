import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import tokenService from '../../services/token.service';
import '../../static/css/lobbies/games/CreateGame.css'; 
import { toast } from 'react-toastify';


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
  const [joinRequests, setJoinRequests] = useState([]);

  


  useEffect(() => {
    console.log("Entrando al useEffect. Valor de game:", game);
      if (!game || isCreator) return;
      // Función para unirse a la partida
      const joinGame = async () => {
      console.log("Intentando unirse a la partida como invitado...");
      try {
        //Obtenemos el username del usuario actual
        const currentUser = tokenService.getUser();
        if(!currentUser || !currentUser.username) {
          toast.error("No se pudo identificar al usuario para unirse")
          navigate("/lobby");
          return;
        }
        // Traemos la última versión de la partida
        const gameResponse = await fetch(`/api/v1/games/${game.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        if(!gameResponse.ok){
          toast.error("Error al cargar los datos de la partida");
          navigate("/ListGames");
          return;
        }

        const currentGame = await gameResponse.json();
        // Obtenemos la lista de players de la partida
        const activePlayerList = currentGame.activePlayers || [];
        // Evaluamos si el usuario actual está en la partida
        const amIAlreadyIn = activePlayerList.includes(currentUser.username);

        
        if(amIAlreadyIn){
          console.log("Ya estás en la partida");
          setGame(currentGame);
          return;
        }

        const updatedActivePlayerList = Array.from(
        new Set([...(activePlayerList ?? []), currentUser.username])
);

        // Hacemos el PATCH al Game con la lista ya actualizada
        const patchResponse = await fetch(`/api/v1/games/${game.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          },
          body: JSON.stringify({activePlayers: updatedActivePlayerList}),
        });

        if(patchResponse.ok){
          const updatedGame = await patchResponse.json();
          setGame(updatedGame)    
          console.log("Unido a la partida con éxito")
        }else{
          toast.error("Error al intentar unirse a la partida");
          navigate("/ListGames");
        }
      } catch(error){
        console.error("Error en el proceso de unirse:", error);
        toast.error(error.message);
        navigate("/ListGames");
      }
    }; 
    
      
        if(!isCreator){
          joinGame(); // Solo si no es el creador de la partida se ejecuta la lógica de unirse
        }


  },[game?.id])
  
  useEffect(()=>{
    const postFirstMessage = async () => {
        try {
          const loggedInUser = tokenService.getUser();
        if (!loggedInUser || !loggedInUser.id) {
          console.error("No se encontró el ID del usuario.");
          return;
        } 
        const msg = "Bienvenido a Saboteur"
          const request = {
            content: msg,
            activePlayer: game.creator,
            chat:game.chat
        }
          const response = await fetch(`/api/v1/messages`, {
        method: "POST",
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
            toast.error('Error al obtener el mensaje del jugador.');
          }
        } catch (error) {
          console.error('Hubo un problema con la petición fetch:', error);
          toast.error('Error de red. No se pudo conectar con el servidor.');
        }
      };

      console.log('game del navigate', game)
      console.log('chat del navigate', game.chat)
      
      const fetchPlayer = async () => {
        try {
          const loggedInUser = tokenService.getUser();
        if (!loggedInUser || !loggedInUser.id) {
          console.error("No se encontró el ID del usuario.");
          return;
        } 
       
        
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
            toast.error('Error al obtener la información del jugador.');
          }
        } catch (error) {
          console.error('Hubo un problema con la petición fetch:', error);
          toast.error('Error de red. No se pudo conectar con el servidor.');
        }
      };
      
      postFirstMessage();
      fetchPlayer();
  },[game?.creator, game?.chat])
  
  
  useEffect(() => {
    if (!isCreator || !game?.chat) return;
    let cancelled = false;
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/v1/messages/byChatId?chatId=${game.chat}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) return;
        const msgs = await res.json();
        const requests = msgs
          .filter(m => typeof m.content === 'string' && m.content.startsWith('REQUEST_JOIN:'))
          .map(m => {
            const parts = m.content.split(":");
            return { username: parts[1], messageId: m.id };
          });
        if (!cancelled) setJoinRequests(requests);
      } catch (error) {
        console.error('Error fetching the requests', error);}};
    fetchRequests();
    const iv = setInterval(fetchRequests, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [isCreator, game?.chat, jwt]);

  
  const handleAcceptRequest = async (username) => {
    try {
      const currentActivePlayers = Array.from(new Set(game.activePlayers ?? []));
      if (currentActivePlayers.includes(username)) {
        toast.info(`${username} is already in the lobby`);
        setJoinRequests(prev => prev.filter(p => p.username !== username));
        return;}
      const newActive = [...currentActivePlayers, username];
      const res = await fetch(`/api/v1/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ activePlayers: newActive }),});
      if (res.ok) {
        const updated = await res.json();
        setGame(updated);
        toast.success(`${username} acceepted to the game`);
        await fetch(`/api/v1/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ content: `REQUEST_ACCEPTED:${username}:${game.id}`, activePlayer: game.creator, chat: game.chat }) });
        const msgsToDelete = joinRequests.filter(j => j.username === username).map(j => j.messageId);
        for (const mid of msgsToDelete) {
          try { await fetch(`/api/v1/messages/${mid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } }); } catch (e) { console.warn('Failed deleting message', mid, e); }
        }
        setJoinRequests(prev => prev.filter(p => p.username !== username));
      } else {
        toast.error('Error to accept the request. Try Again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error to connect with the server. Try Again.');
    }
  };

  const handleDenyRequest = async (username) => {
    try {
      await fetch(`/api/v1/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ content: `REQUEST_DENIED:${username}:${game.id}`, activePlayer: game.creator, chat: game.chat }) });
      const msgsToDelete = joinRequests.filter(j => j.username === username).map(j => j.messageId);
      for (const mid of msgsToDelete) {
        try { await fetch(`/api/v1/messages/${mid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } }); } catch (e) { console.warn('Failed deleting message', mid, e); }
      }
      toast.info(`${username} has been denied`);
      setJoinRequests(prev => prev.filter(p => p.username !== username));
    } catch (err) {
      console.error(err);
      toast.error('Error to connect with the server. Try Again.');
    }
  };
//para refrescar los activeplayers
  useEffect(() => {
    if (!game?.id) return;

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/v1/games/${game.id}`, {
          headers: { "Authorization": `Bearer ${jwt}` },
        });
        if (!res.ok) return;
        /*
        const latestgame = await res.json();
        setGame({ ...(game || {}), activePlayers: latestgame.activePlayers, maxPlayers:latestgame.maxPlayers });
        */
        const latestgame = await res.json();
  setGame(prev => ({
    ...prev,
    ...latestgame,
    activePlayers: Array.from(new Set(latestgame.activePlayers ?? [])),
    maxPlayers: latestgame.maxPlayers,
  }));
      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };

    fetchGame();
    const iv = setInterval(fetchGame, 3000);
    return () => clearInterval(iv);
  }, [game?.id, jwt]);

  const [lobbyIn, SetLobbyIn] = useState(() => {
    try {
      return (game?.activePlayers ?? []).includes(loggedInUser?.username);
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (!game || !game.id) return;
    const currentUsername = loggedInUser?.username;
    if (!currentUsername) return;
    const currentIn = (game.activePlayers ?? []).includes(currentUsername);
    if (lobbyIn && !currentIn) {
      toast.error('Has sido expulsado de la partida'); // tmb toast.success, info y warn
      navigate('/lobby');
    }
    SetLobbyIn(currentIn);
  }, [game?.activePlayers]);
  

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
        toast.success("¡Partida actualizada con éxito!");
        setpatchgame(newGame)
        console.log(newGame)
        //navigate(`/board/${newGame.id}`); 
      } else {
        const errorData = await response.json();
        toast.warn(`Error al actualizar la partida: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error de red. No se pudo conectar con el servidor.');
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
      toast.success("¡Partida iniciada con éxito!");
      navigate(`/board/${newGame.id}`, { state: { game: newGame } });
    } else {
      const errorData = await response.json();
      toast.error(`Error al iniciar la partida: ${errorData.message}`);
    }
  } catch (error) {
    console.error(error);
    toast.error('No se pudo conectar con el servidor');
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
      toast.error("Partida eliminada");
      navigate("/lobby");
    } else {
      const errorData = await response.json();
      toast.error(`Error al eliminar la partida: ${errorData.message}`);
    }
  } catch (error) {
    console.error(error);
    toast.error('No se pudo conectar con el servidor');
  }

  }
  async function handleCopyLink() {
    console.log("Link", game.link)
    const linkToCopy = game.link;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      toast.info("¡Enlace copiado al portapapeles!");
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
      toast.error('No se pudo copiar el enlace.');
    }
  }
async function handleExpelPlayer(usernameToExpel) {
  const currentActivePlayers = game.activePlayers;
  const newActivePlayers = currentActivePlayers.filter(p => p !== usernameToExpel);

  try {
    const response = await fetch(`/api/v1/games/${game.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({ activePlayers: newActivePlayers }),
    });

    if (response.ok) {
      const updatedGame = await response.json();
      
      setGame(updatedGame); 
    } else {
      toast.error("Error al expulsar al jugador");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("No se pudo conectar con el servidor");
  }
};

async function handleExitLobby() {
  const currentPlayer = tokenService.getUser();
  const currentActivePlayers = game.activePlayers;
  const newActivePlayers = currentActivePlayers.filter(p => p !== currentPlayer.username);

  try {
    const response = await fetch(`/api/v1/games/${game.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({ activePlayers: newActivePlayers }),
    });

    if (response.ok) {
      const updatedGame = await response.json();
      setGame(updatedGame);
      navigate("/lobby");
    } else {
      toast.error("Error al salir de la partida");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("No se pudo conectar con el servidor");
  }
}

  return (
    <div className="home-page-container">
      <div className="hero-div"> 
        <h1>Create Game - ID: {game.id}</h1>
        <div className="creategame-card">
          {isCreator && joinRequests && joinRequests.length > 0 && (
            <div className="join-requests-panel">
              <h3>📥Request Join📥</h3>
              {joinRequests.map((rq) => (
                <div key={rq.messageId ?? rq.username} className="join-request-item">
                  <span>{rq.username}</span>
                  <div>
                    <button onClick={() => handleAcceptRequest(rq.username)}>Accept✅</button>
                    <button onClick={() => handleDenyRequest(rq.username)}>Deny❌</button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <h2>Players : ({game?.activePlayers?.length ?? 0}/{game?.maxPlayers ?? 0})</h2>
            <div className="active-players-list">
              {(game?.activePlayers ?? []).map((username, index) => (
                <div key={username ?? index} className="player-card2">
                  <div className="player-avatar" title={username}>
                  </div>
                  <div className="player-name">{username}</div>
                  {isCreator && username !== game.creator && (
                    <button
                      className="expel-player-btn"
                      onClick={() => handleExpelPlayer(username)}>
                      ❌ EJECT
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
                  <button className="button-small" onClick={handleExitLobby}>🚪 EXIT LOBBY</button>
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