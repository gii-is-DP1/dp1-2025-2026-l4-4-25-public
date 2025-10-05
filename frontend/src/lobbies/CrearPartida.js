import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../static/css/lobbies/CrearPartida.css'; 

const CrearPartida = () => {
  // const [numJugadores, setNumJugadores] = useState('3');
  // const [esPrivada, setEsPrivada] = useState(false);

  return (
    <div className="home-page-container">
      <div className="hero-div"> 
        <h1>Create Game</h1>
        
        <div className="form-group">
          <label>Number of players</label>
          <select
          className="form-control"
          /*
            id="num-jugadores"
            className="form-control"
            value={numJugadores}
            onChange={(e) => setNumJugadores(e.target.value)}
            */
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
          <label>Privacidad</label>
          <div className="toggle-switch">
            <span>Público / Privado </span>
            <label className="switch">
              <input
                type="checkbox"
                /*
                checked={esPrivada}
                onChange={() => setEsPrivada(!esPrivada)}
                */
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
          <button>
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
  );
};

export default CrearPartida;