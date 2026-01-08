import React from 'react';
import minerRol from '../cards-images/roles/minerRol.png';

export default function PlayerRole({ playerRol, loggedInUser, isSpectator }) {
  if (isSpectator) return null;

  const currentPlayerRole = Array.isArray(playerRol) 
    ? playerRol.find(p => p.username === loggedInUser.username)
    : null;

  const roleImg = currentPlayerRole?.roleImg || minerRol;
  const roleName = currentPlayerRole?.roleName || 'MINER';

  const isSaboteur = roleName === 'SABOTEUR';

  return (
    <div className={`my-role ${isSaboteur ? 'saboteur' : 'miner'}`}>
      <div className="logo-img">
        <img 
          src={roleImg} 
          alt={roleName} 
          className="logo-img"
        />
      </div>
      <div className="role-name-text">{roleName}</div>
    </div>
  );
}
