import React from 'react';
import { Link } from 'react-router-dom';

const TopButtons = ({ showLogout = true, returnTo = "/lobby" }) => {
  return (
    <div className="top-right-lobby-buttons">
      {showLogout && (
        <Link to="/logout">
          <button className="button-logOut">🔴Log Out</button>
        </Link>
      )}
      <Link to={returnTo}>
        <button className="button-logOut">➡️</button>
      </Link>
    </div>
  );
};

export default TopButtons;
