import React, {useState, useEffect} from 'react';
import '../App.css';
import '../static/css/home/home.css';
import { Link, useLocation } from 'react-router-dom';
import '../static/css/game/game.css'; 
import minerRol from '../game/cards-images/roles/minerRol.png';
import saboteurRol from '../game/cards-images/roles/saboteurRol.png';
// import getIdFromUrl from "../../util/getIdFromUrl";
import tokenService from '../services/token.service.js';
import avatar from "../static/images/icons/1.jpeg"

const jwt = tokenService.getLocalAccessToken();

export default function Board() {
   const location = useLocation();
 
  const ndeck=60;
  const timeturn=60;

  const [profileImage, setProfileImage] = useState(avatar);
  const [game, setGame] = useState(location.state?.game);
  const [message, setMessage] = useState([]); // UseState que almacenan los mensajes (Chat de texto)
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState('1'); 
  const [currentPlayer, setCurrentPlayer] = useState(); // Nos ayudará para el NextTurn (saber el usuario que tiene el turno)
  const [cont, setCont] = useState(timeturn); 
  const [gameLog, setGameLog] = useState([]);
  const [playerOrder, setPlayerOrder] = useState(['Alexby205', 'Mantecao', 'Julio', 'Fran', 'Javi Osuna', 'Victor', 'Luiscxx', 'DiegoREY', 'Bedilia']); // Lista de los jugadores ordenados por birthDate, NO FUNCIONA AUN X ESO EL ESTADO INICIAL (PARA PRUEBAS)
  const [playerRol, setPlayerRol] = useState([]); // Para los roles de saboteur y minero
  const [activePlayers, setActivePlayers] = useState([]); // Lista de arrays de isactivePlayer
  const nPlayers=setActivePlayers.length; // Total de jugadores en la partida


useEffect(() => {
  // console.log("game", game)

  const fetchPlayerByUsername = async (username) => {
    try {
      const response = await fetch(`/api/v1/players/byUsername?username=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // console.log('players', data)
        return data;
      } else {
        console.error('Respuesta no OK:', response.status);
        alert('Error al obtener el jugador.');
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      alert('Error de red. No se pudo conectar con el servidor.');
    }
  };

  const loadActivePlayers = async () => {
    const initialPlayers = game?.activePlayers || [];
    //prueba
    const usernames = ['Alexby205', 'Mantecao', 'Julio', 'Fran', 'Javi Osuna', 'Victor', 'Luiscxx', 'DiegoREY', 'Bedilia'];
    //prueba
    const mockPlayers = usernames.map((username, index) => ({
      username,
      birthDate: new Date(1990 + index, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(), 
      profileImage: avatar, 
      wins: Math.floor(Math.random() * 10), 
    }));
    const fetchedPlayers = await Promise.all(initialPlayers.map(username => fetchPlayerByUsername(username)));
    const validPlayers = fetchedPlayers.filter(player => player !== null); 
    setActivePlayers([...validPlayers, ...mockPlayers]); 
  };

  loadActivePlayers();

  async function handlerounds() {
    const irounds = game?.rounds?.length || 0;
    if (irounds <= 0) {
      setNumRound(1);
    }
  }

  handlerounds();

  
}, []);
useEffect(() => {
  if (activePlayers.length > 1) {
    const res = [...activePlayers].sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate)); 
    setPlayerOrder(res);
    setCurrentPlayer(res[0].username);
  } else if (activePlayers.length === 1) {
    setCurrentPlayer(activePlayers[0].username || activePlayers[0]);
  }

  console.log("activeplayer", activePlayers);
  console.log("player", currentPlayer);
}, [activePlayers]);

  

/*
useEffect(() => {
  
  const fetchActivePlayers = async () => {
    try {
      const response = await fetch(`/api/v1/games/${game.id}/activePlayers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        }
      });
      const data = await response.json();
      setActivePlayer(data);
    } catch (error) {
      console.error(error);}};
    fetchActivePlayers();
  }, [game.id]);
  */
 //NO HACE FALTA LO COGEMOS DE NAVIGATE 

const loggedInUser = tokenService.getUser();

const assignRolesGame = () => {
  const n = activePlayers.length;
  let numSaboteur = 0;
  let numMiner = 0;
  if(n===1){numSaboteur = 1; numMiner = 3;}
  else if(n===4){numSaboteur = 1; numMiner = 3;}
  else if(n===5){numSaboteur = 2; numMiner = 3;}
  else if(n===6){numSaboteur = 2; numMiner = 4;}
  else if(n===7){numSaboteur = 3; numMiner = 4;}
  else if(n===8){numSaboteur = 3; numMiner = 5;}
  else if(n===9){numSaboteur = 4; numMiner = 5;}
  else if(n===10){numSaboteur = 4; numMiner = 6;}
  else if(n===11){numSaboteur = 5; numMiner = 6;}
  else if(n===12){numSaboteur = 5; numMiner = 7;}

  const sArray = (array) => {
  const res = [...array];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i + 1));
    [res[i], res[j]] = [res[j], res[i]];}
  return res;};

  const sPlayers = sArray(activePlayers);
  const roles = sPlayers.map((p, i) => ({
    username: p.username || p,
    role: i<numSaboteur ? 'SABOTEUR':'MINER',
    roleImg: i<numSaboteur ? saboteurRol:minerRol}));
  return roles;};

useEffect(() => {
  if(activePlayers.length > 0){
    console.log(playerRol)
    const rolesAssigned = assignRolesGame(activePlayers);
    setPlayerRol(rolesAssigned); }
}, [activePlayers]);


const nextTurn = () => {
    return null; // AUN POR DEFINIR
  };

const deck = () => {
    return null; // AUN POR DEFINIR, ESTA FUNCIÓN TIENE QUE IR RESTANDO CARTAS DEL MAZO SEGÚN SE VAYA ROBANDO/DESCARTANDO ¿CREAR OTRA FUNCIÓN QUE ASIGNE CARTA DE ESE MAZO A UN JUGADOR?
};

const addLog = (msg,type="info") => {
  setGameLog(prev => [...prev, { msg,type }]);
}; // Tendriamos que llamarlo en nextTurn

 useEffect(() => {
    const time = setInterval(() => {
      setCont(p => {
        if (p <= 1) {
          nextTurn(); // Hay que definir para que al acabar el contador el turno sea cedido al siguiente jugador
          return timeturn;}
        return p-1;});
    }, 1000);
    return () => clearInterval(time);
  }, [currentPlayer, playerOrder]);

  const formatTime = (s) => {
    const min = Math.floor(s/60).toString().padStart(2, '0');
    const sec = (s%60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  //console.log("activeplayers", activePlayers)

  /*
  useEffect(() => {
    const fetchedRound = async () => {
      try {
        const response = await fetch(`/api/v1/rounds/byGame/${game.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          }
        });
        const data = await response.json();
        if (data && data.roundNumber) {
          setNumRound(data.roundNumber);}
      } catch (error) {
        console.error(error);
      }};

    fetchedRound();
  }, [game.id]);
  */
 //NO HACE FALTA COGEMOS LAS RONDAS DEL NAVIGATE

  let numCards = 0; // Iniciamos con 0 cartas, según los jugadores se repartirá x cartas
  if (nPlayers <= 5) {
    numCards = 6;
  } else if (nPlayers > 5 && nPlayers <= 9) {
    numCards = 5;
  } else {
    numCards = 4; // Con 3-4-5 jugadores cada jugador tiene 6 cartas, con 6-7-8-9 tiene 5 cartas, con 10-11-12 tiene 4 cartas.
  }

  const SendMessage = (e) => {
    e.preventDefault(); // No quitar que sino no se actualiza
    setMessage([...message,{ author:'Player1', text:newMessage}]); // Indicar el player con la llamda del backend
    setNewMessage(''); 
  };

  const cards = [...Array(numCards)].map((_, i) => (
    <button key={i} className="card-slot">Cards {i + 1}</button>));

  return (
    <div className="board-container">

      <div className="logo-container">
        <img src="/logo1-recortado.png" alt="logo" className="logo-img1"/>
      </div>

      <div className="player-cards">
        <div className="cards-label">MY CARDS</div>
        <div className="cards-list">
            {cards}
        </div>
      </div>

      <div className="my-role">
        MY ROLE:
        <div className="logo-img">
      <img 
        src={Array.isArray(playerRol) 
              ? playerRol.find(p => p.username === loggedInUser.username)?.roleImg || minerRol
              : minerRol
            } 
        alt="My Role" 
        className="logo-img"
      />
        </div>
      </div>

      <div className="n-deck">
        🎴{ndeck}
      </div>

      <button className="n-discard">
        <Link to={deck}>
        📥Discard
        </Link>
      </button>

      <div className="time-card">
       ⏰ {formatTime(cont)}
      </div>

      <div className="round-box">
        🕓·ROUND {numRound}/3 
      </div>

      <div className="board-grid">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="board-cell">
          </div>
        ))}
      </div>

      <div className="turn-box">
        🔴 · TURNO DE {currentPlayer}
      </div>

      <div className="players-var">
        {activePlayers.map((activePlayers, index) => (
          <div key={index} className={`player-card player${index + 1}`}>
            <div className="player-avatar">
              <img src={activePlayers.profileImage || avatar} alt={activePlayers.username || activePlayers} />
            </div>
            <div className={`player-name player${index + 1}`}>
              {activePlayers.username || activePlayers}
            </div>
            <div className="player-lint"> 🔦 : 🟢</div>
            <div className="player-vag">🪨 : 🟢</div> 
            <div className="player-pic"> ⛏️ : 🟢</div> {/* Habrá que poner la funcion que hace que verifique si un usuario tiene esa acción disponible*/}
            <div className="player-pep"> 🪙 : {activePlayers.wins}</div>
          </div>
        ))}
      </div>

      <div className="game-log">
        <div className="game-log-header">💻 GAME LOG 💻</div>
        <div className="game-log-messages">
          {gameLog.length === 0 ? (
            <p className="no-log">❕No actions yet...</p>
          ) : (
            gameLog.map((log, index) => (
              <p key={index} className={`log-entry ${log.type}`}>
                {log.msg}
              </p> )))}
        </div>
      </div>


      <div className="chat-box">
        <div className="chat-header">TEXT CHAT</div>

        <div className="chat-messages">
          {message.length===0 ? ( <p className="no-messages">Not messages yet...</p>
          ):(
            message.map((msg, index) => (
              <p key={index}><strong>{playerOrder.username}:</strong> {msg.text}</p>
            ))
          )}
        </div>
        <form className="chat-input" onSubmit={SendMessage}>
          <input
            type="text"
            placeholder="Write a message📥"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}