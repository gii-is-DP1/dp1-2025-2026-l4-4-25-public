import React, {useState,useRef, useEffect} from 'react';
import '../App.css';
import { toast } from 'react-toastify';
import '../static/css/home/home.css';
import { Link, useLocation } from 'react-router-dom';
import '../static/css/game/game.css'; 
import minerRol from '../game/cards-images/roles/minerRol.png';
import saboteurRol from '../game/cards-images/roles/saboteurRol.png';
// import getIdFromUrl from "../../util/getIdFromUrl";
import tokenService from '../services/token.service.js';
import avatar from "../static/images/icons/1.jpeg"
import startCardImage from '../static/images/card-images/tunnel-cards/start.png';
import objetivecardreverse from '../static/images/card-images/reverses/objetive_card_reverse.png';

const jwt = tokenService.getLocalAccessToken();

export default function Board() {
   const location = useLocation();
 
 const timeturn=60;

  const [isSpectator, setIsSpectator] = useState([]);
  const [CardPorPlayer, setCardPorPlayer] = useState(0);
  const [deckCount, setDeckCount] = useState(60);
  const [profileImage, setProfileImage] = useState(avatar);
  const [game, setGame] = useState(location.state?.game);
  const [message, setMessage] = useState([]); // UseState que almacenan los mensajes (Chat de texto)
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState('1'); 
  const [currentPlayer, setCurrentPlayer] = useState(); // Nos ayudará para el NextTurn (saber el usuario que tiene el turno)
  const [cont, setCont] = useState(timeturn); 
  const [gameLog, setGameLog] = useState([]);
  const [playerOrder, setPlayerOrder] = useState([]); // Lista de los jugadores ordenados por birthDate, NO FUNCIONA AUN X ESO EL ESTADO INICIAL (PARA PRUEBAS)
  const [playerRol, setPlayerRol] = useState([]); // Para los roles de saboteur y minero
  const [activePlayers, setActivePlayers] = useState([]); // Lista de arrays de isactivePlayer
  const nPlayers=setActivePlayers.length; // Total de jugadores en la partida
  const [privateLog, setPrivateLog] = useState([]); 
  
  const BOARD_COLS=11; // 11 columnas
  const BOARD_ROWS=9; // 9 filas
  const BOARD_CELLS=BOARD_COLS*BOARD_ROWS; // 99 celdas en total
  /* const [boardCells, setBoardCells] = useState(() =>
    Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => null))
  );*/
  const [boardCells, setBoardCells] = useState(() => {
    const initialBoard = Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => null));
    initialBoard[4][1] = { type: 'start', owner: 'system', placedAt: Date.now() };
    initialBoard[4][9] = { type: 'objective', owner: 'system', placedAt: Date.now() };
    initialBoard[2][9] = { type: 'objective', placedAt: Date.now() };
    initialBoard[6][9] = { type: 'objective', placedAt: Date.now() };
    


    return initialBoard;
  });

  const boardGridRef = useRef(null);

  const handleCellClick = (row, col) => {
    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      if (!next[row][col]) {
        next[row][col] = { type: 'path', owner: loggedInUser?.username || 'unknown', placedAt: Date.now() };
      }
      return next;
    });
  };

  const handleCellRightClick = (row, col) => {
    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      next[row][col] = null;
      return next;
    });
  };

useEffect(() => {
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
        toast.error('Error al obtener el jugador.');
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error de red. No se pudo conectar con el servidor.');
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
    /*const fetchedPlayers = await Promise.all(initialPlayers.map(username => fetchPlayerByUsername(username)));
    const validPlayers = fetchedPlayers.filter(player => player !== null); */
    const fetchedPlayers = await Promise.all(initialPlayers.map(async (username) => {
    try{
      const player = await fetchPlayerByUsername(username);
      if (!player) return null;
      return {
        username: player.username,
        birthDate: player.birthDate,
        profileImage: player.image || avatar, // Usa su imagen real o el avatar por defecto
        wins: player.wins ?? 0,
      };
    }catch (err) {
        console.error(`Error al cargar datos de ${username}:`, err);
        return null;
    }
  }));
    const validPlayers = fetchedPlayers.filter(p => p !== null);
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
  if(activePlayers.length > 1){
    const res = [...activePlayers].sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate)); 
    setPlayerOrder(res);
    setCurrentPlayer(res[0].username);
    console.log('ORDEN ACTUALIZADO', res);
  }
}, [activePlayers]);

useEffect(() => {
  if (boardGridRef.current) {
    // CENTRAR SCROLL TABLERO
    const scrollHeight = boardGridRef.current.scrollHeight;
    const clientHeight = boardGridRef.current.clientHeight;
    const centerScroll = (scrollHeight - clientHeight) / 2;
    boardGridRef.current.scrollTop = centerScroll;
  }
}, [boardCells]); 

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
  if (playerOrder.length === 0) return;
  const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
  const nextIndex = (currentIndex + 1) % playerOrder.length; 
  setCurrentPlayer(playerOrder[nextIndex].username);
  setCont(timeturn);
  const nextName = playerOrder[nextIndex].username;
  const nextClass = `player${nextIndex + 1}`;
  addLog(`🔁 Turn of <span class="${nextClass}">${nextName}</span>`, "turn");};


const deck = () => {
    return null; // AUN POR DEFINIR, ESTA FUNCIÓN TIENE QUE IR RESTANDO CARTAS DEL MAZO SEGÚN SE VAYA ROBANDO/DESCARTANDO ¿CREAR OTRA FUNCIÓN QUE ASIGNE CARTA DE ESE MAZO A UN JUGADOR?
};

const numPep = () => {
    return 0; // PEPITAS TOTALES, SIRVE PARA LAS ESTADISTICAS
};

const statePic = () => {
    return "🟢"; // ESTADO PICO, SIRVE PARA LAS ESTADISTICAS
};

const stateVag = () => {
    return "🟢"; // ESTADO VAGONETA, SIRVE PARA LAS ESTADISTICAS
};

const stateLint = () => {
    return "🟢"; // ESTADO LINTERNA, SIRVE PARA LAS ESTADISTICAS
};

const repartoCartas = () => {
    return null; 
};

const addLog = (msg,type="info") => {
  setGameLog(prev => [...prev, { msg,type }]);}; 

const addPrivateLog = (msg, type = "info") => {
  setPrivateLog(prev => [...prev, { msg, type }]);};

const messagesEndRef = useRef(null);
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({behavior:'smooth'});
}, [gameLog]); 

 useEffect(() => {
    const time = setInterval(() => {
      setCont(p => {
        if (p <= 1) {
          nextTurn(); 
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

useEffect(() => {
  if (activePlayers.length > 0) {
    let cardsPerPlayer = 0;
    if (activePlayers.length <= 5) cardsPerPlayer = 6;
    else if (activePlayers.length <= 9) cardsPerPlayer = 5;
    else cardsPerPlayer = 4;
    const initialDeck = 60 - (activePlayers.length * cardsPerPlayer);
    setDeckCount(initialDeck); 
    setCardPorPlayer(cardsPerPlayer);}
}, [activePlayers]);

const deckfuction = () => deckCount;

const handleDiscard = () => {
  const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
  if (loggedInUser.username!==currentPlayer) {
    addPrivateLog("⚠️ It's not your turn!", "warning");
    return;}
  if (deckCount>0) {
    setDeckCount(p =>p-1);
    nextTurn();           
    setCont(timeturn);    
    addColoredLog(currentIndex, playerOrder[currentIndex].username, `🎴 Discarded a card. ${deckCount - 1} cards left in the deck.`);
  } else {
    addLog("⛔No more cards left in the deck!", "warning");}};


  const SendMessage = (e) => {
    e.preventDefault(); // No quitar que sino no se actualiza
    setMessage([...message,{ author:'Player1', text:newMessage}]); // Indicar el player con la llamda del backend
    setNewMessage(''); 
  };

  const addColoredLog = (playerIndex, playerName, action) => {
     const coloredName = `<span class="player${playerIndex + 1}">${playerName}</span>`;
     addLog(`${coloredName} ${action}`, "action");};


  const cards = [...Array(CardPorPlayer)].map((_, i) => (
    <button key={i} className="card-slot">Cards {i + 1}</button>));

  
// nueva función para renderizar el contenido de la celda (usa if/else)
const renderCellContent = (row, col, cell) => {
  if (!cell) {
    return <div className="cell-coords">{row},{col}</div>;
  }

  if (cell.type === 'start') {
    return <img src={startCardImage} alt="Start Card" className="static-card-image" />;
  }

  if (cell.type === 'objective') {
    return (
      <div className="card-preview objective">
        <img src={objetivecardreverse} alt="Objective Card" className="static-card-image" />
        
      </div>
    );
  }

  // default rendering for path or other card types
  return (
    <div className="card-preview path">
      <div className="card-type">{cell.type}</div>
      <div className="card-owner small">{cell.owner}</div>
    </div>
  );
}


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
      🎴{deckfuction()}
    </div>

    <button className="n-discard" onClick={handleDiscard}>
      📥 Discard
    </button>

    <div className="time-card">
     ⏰ {formatTime(cont)}
    </div>

    <div className="round-box">
      🕓·ROUND {numRound}/3 
    </div>

     <div ref={boardGridRef} className="board-grid saboteur-grid">
      {boardCells.map((row, r) => (
        <div key={`row-${r}`} className="board-row">
          {row.map((cell, c) => (
            <div
              key={`cell-${r}-${c}`}
              className={`board-cell ${cell ? 'has-card' : ''}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => { e.preventDefault(); handleCellRightClick(r, c); }}
              title={cell ? `Card: ${cell.type} (by ${cell.owner})` : `Empty ${r},${c}`}
            >
              {renderCellContent(r, c, cell)}
            </div>
          ))}
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
          <div className="player-lint"> 🔦 : 🟢 {/*stateLint*/}</div>
          <div className="player-vag">🪨 : 🟢 {/*stateVag*/}</div> 
          <div className="player-pic"> ⛏️ : 🟢 {/*statePic*/} </div> {/* Habrá que poner la funcion que hace que verifique si un usuario tiene esa acción disponible*/}
          <div className="player-pep"> 🪙 : 0 {/*numPep*/} 🎴 : {CardPorPlayer} </div>
        </div>
      ))}

    </div>

    <div className="game-log">
      <div className="game-log-header">💻 GAME LOG 💻</div>
      <div className="game-log-messages">
        {gameLog.length === 0 && privateLog.length === 0 ? (
          <p className="no-log">❕No actions yet...</p>
        ) : (
          <>
            {gameLog.map((log, index) => (
              <p
                key={`global-${index}`}
                className={`log-entry ${log.type}`}
                dangerouslySetInnerHTML={{ __html: log.msg }}/>))}

            {privateLog.map((log, index) => (
              <p
                key={`private-${index}`}
                className={`log-entry ${log.type}`}
                dangerouslySetInnerHTML={{ __html: log.msg }}/>))}

          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>


    <div className="chat-box">
      <div className="chat-header">TEXT CHAT</div>

      <div className="chat-messages">
        {message.length===0 ? ( <p className="no-messages">Not messages yet...</p>
        ):(
          message.map((msg, index) => (
            <p key={index}><strong>{msg.author}:</strong> {msg.text}</p>
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