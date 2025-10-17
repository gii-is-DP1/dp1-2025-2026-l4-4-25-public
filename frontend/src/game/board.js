import React, {useState} from 'react';
import '../App.css';
import '../static/css/home/home.css';
import '../static/css/game/game.css'; 
import CreateGame from '../lobbies/CreateGame';
import { Link } from 'react-router-dom';
import camino from '../game/images/camino-inicio.png';


export default function Board() {
  const nPlayers=4; // Hasta que en CreateGame no ponga lo de seleccion de partida...
  const ndeck=60;

  const [message, setMessage] = useState([]); // UseState que almacenan los mensajes (Chat de texto)
  const [newMessage, setNewMessage] = useState('');

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
          <img src="/logo1-recortado.png" alt="logo" className="logo-img"/> 
        </div>
      </div>

      <div className="n-deck">
        🎴{ndeck}
      </div>

      <div className="time-card">
        ⏰00.20s
      </div>

      <div className="round-box">
        🕓·ROUND 2/3 
      </div>

      <div className="board-grid">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="board-cell">
            {i === 15 && <img src={camino} alt="Imagen" />}
          </div>
        ))}
      </div>

      <div className="turn-box">
        🔴 · TURNO DE CARLOSXX23
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