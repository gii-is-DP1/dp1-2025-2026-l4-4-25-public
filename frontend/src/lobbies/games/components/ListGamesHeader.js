import React from 'react';
import { Link } from 'react-router-dom';
import gamesImg from '../../../static/images/games.png';

const ListGamesHeader = ({ onRefresh }) => {
  return (
    <>
      <img src={gamesImg} alt="Encabezado" className="listgames-top-image" />
      <div className="top-right-lobby-buttons">
        <button className="button-logOut" onClick={onRefresh}>
          🔁
        </button>
        <Link to="/lobby">
          <button className="button-logOut">➡️</button>
        </Link>
      </div>
    </>
  );
};

export default ListGamesHeader;
