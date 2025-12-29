import React from 'react';
import { Link } from 'react-router-dom';

const PlayerActions = ({ onCreateGame }) => {
  return (
    <div className="hero-div-lobby">
      <button className="button-crear" onClick={onCreateGame}>
        CREATE GAME
      </button>
      <Link to="/ListGames">
        <button className="button-unirse">📥JOIN A GAME</button>   
      </Link>
    </div>
  );
};

export default PlayerActions;
