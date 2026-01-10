import React from 'react';
import minerRol from '../cards-images/roles/minerRol.png';
import saboteurRol from '../cards-images/roles/saboteurRol.png';

export default function PlayerRole({ playerRol, activePlayers, loggedInUser, isSpectator }) {
  if (isSpectator) return null;

  const username = loggedInUser?.username;

  const currentPlayerRole = Array.isArray(playerRol) && username
    ? playerRol.find(p => p.username === username)
    : null;

  // Fallback: when playerRol is stale/empty (e.g., right after a NEW_ROUND reload),
  // derive the role from activePlayers directly.
  const backendPlayer = Array.isArray(activePlayers) && username
    ? activePlayers.find(p => p.username === username)
    : null;

  const fallbackRoleName = backendPlayer?.rol === true ? 'SABOTEUR' : 'MINER';
  const fallbackRoleImg = backendPlayer?.rol === true ? saboteurRol : minerRol;

  const roleName = currentPlayerRole?.roleName || fallbackRoleName;
  const roleImg = currentPlayerRole?.roleImg || fallbackRoleImg;

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
