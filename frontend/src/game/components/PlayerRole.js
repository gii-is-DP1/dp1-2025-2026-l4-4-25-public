import React from 'react';
import minerRol from '../cards-images/roles/minerRol.png';

export default function PlayerRole({ playerRol, loggedInUser, isSpectator }) {
  if (isSpectator) return null;

  return (
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
  );
}
