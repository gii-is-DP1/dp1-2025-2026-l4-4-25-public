import React from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link } from 'react-router-dom';
import Lobby from './lobby';

export default function Profile(){
    return(
    
        <div className="home-page-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 95 }} />
             </div>
            <div className="top-right-buttons">
                <Link to="/logout">
                    <button className="button-logOut"> 🔴Log Out</button>
                </Link>
                <Link to="/lobby">
                    <button className="button-logOut"> ➡️</button>
                </Link>
            </div>
            <div className="top-left-button">
            <Link to="/profile">
                <button className="button-games-played">🎮 Games Played</button>
            </Link>
            </div>


            <div className="profile-overlay">
          <div className="profile-header">
          <img
            src='imagen'
            alt="Avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2> DIEGO_REY_CARMONA </h2>
            <div className="profile-buttons">
              <h2> Te uniste en 2025  </h2>
              <Link to="/profile/edit">
                <button className="button-small">✏️ Edit Profile</button>
              </Link>
            </div>
          </div>
        </div>

      </div>
        </div>
        
    );
}
