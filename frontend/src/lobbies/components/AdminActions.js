import React from 'react';
import { Link } from 'react-router-dom';

const AdminActions = () => {
  return (
    <>
      <div className="hero-div-lobby">
        <Link to="/users">
          <button className="button-users">📑 Users</button>
        </Link>
      </div>
      <div className="hero-div-lobby">
        <Link to="/admin/games">
          <button className="button-edit">🎮 Games Management</button>
        </Link>
      </div>
      <div className="hero-div-lobby">
        <Link to="/EditAchievement">
          <button className="button-edit">✏️ Edit Achievements</button>
        </Link>
      </div>
    </>
  );
};

export default AdminActions;
