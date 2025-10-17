import React, {useState, useEffect} from 'react';
import '../App.css';
import '../static/css/home/home.css';
import '../static/css/game/game.css'; 
import minerRol from '../game/cards-images/roles/minerRol.png';
import saboteurRol from '../game/cards-images/roles/minerRol.png';
// import getIdFromUrl from "../../util/getIdFromUrl";
import tokenService from '../services/token.service.js';

const jwt = tokenService.getLocalAccessToken();

export default function Board() {
 
  const ndeck=60;
  const timeturn=60;
  const idGame = 0; // Usar el getIdFromUrl

  const [message, setMessage] = useState([]); // UseState que almacenan los mensajes (Chat de texto)
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState('1'); 
  const [currentPlayer, setCurrentPlayer] = useState(); // Nos ayudará para el NextTurn (saber el usuario que tiene el turno)
  const [cont, setCont] = useState(timeturn); 
  const [playerOrder, setPlayerOrder] = useState([]); // Lista de los jugadores ordenados por birthDate
  const [playerRol, setPlayerRol] = useState({}); // Para los roles de saboteur y minero
  const [activePlayer, setActivePlayer] = useState([]); // Lista de arrays de isactivePlayer
  const nPlayers=setActivePlayer.length; // Total de jugadores en la partida

 useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/v1/players/byGameId?gameId=${idGame}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,}});
        const data = await response.json();
        if (data && data.length > 0) { // players > 0
          const res =data.sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
          setPlayerOrder(res);
          setCurrentPlayer(res[0].username);}
      } catch (error) {
        console.error(error);}};
    fetchPlayers();
  }, [idGame]);

useEffect(() => {
  const fetchActivePlayers = async () => {
    try {
      const response = await fetch(`/api/v1/games/${idGame}/activePlayers`, {
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
  }, [idGame]);

const assignRolesGame = (activePlayers) => {
  const roles = [];
   // AUN POR DEFINIR, HABRÁ QUE HACER LAS CONDICIONES DE SI HAY X JUGADORES, HABRÁ Y E Z ROLES

  const assignRolesPlayer = {};
    activePlayers.array.forEach((player, index) => {
      assignRolesPlayer[player.username] = roles[index];
    });
      setPlayerRol(assignRolesPlayer);
    };

const nextTurn = () => {
    return null; // AUN POR DEFINIR
  };

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

  useEffect(() => {
    const fetchedRound = async () => {
      try {
        const response = await fetch(`/api/v1/rounds/byGame/${idGame}`, {
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
  }, [idGame]);

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
    <div key={i} className="card-slot">Cards {i + 1}</div>));

  return (
    <div className="board-container">

      <div className="logo-container">
        <img src="/logo1-recortado.png" alt="logo" className="logo-img"/>
      </div>

      <div className="player-cards">
        <div className="cards-label">MY CARDS</div>
        <div className="cards-list">
            {cards}
        </div>
      </div>

      <div className="my-role">
        MY ROL :
        <div className="logo-img">
         <img src={minerRol} alt="Miner Role" className="logo-img"/> 
        </div>
      </div>

      <div className="n-deck">
        🎴{ndeck}
      </div>

      <div className="n-discard">
        📥Discard
      </div>
      

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

      <div className="chat-box">
        <div className="chat-header">TEXT CHAT</div>

        <div className="chat-messages">
          {message.length===0 ? ( <p className="no-messages">No messages yet...</p>
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