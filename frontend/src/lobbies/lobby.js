import React from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link } from 'react-router-dom';

export default function Lobby(){
    return(
        <div className="home-page-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 95 }} />
             </div>
            <div className="top-right-buttons">
                <Link to="/register">
                    <button className="button-register">📃Register</button>
                </Link>
                <Link to="/login">
                    <button className="button-login">💻Login</button>
                </Link>
                <Link to="/logout">
                    <button className="button-logOut"> ➡️🚪Log Out</button>
                </Link>
                <Link to="/profile">
                    <button className="button-logOut"> 👤Profile</button>
                </Link>
            </div>

            <div className="hero-div">
                <Link to="/CreateGame">
                   <button className="button-crear">📑CREATE GAME</button>  
                </Link>
                 
                <button className="button-unirse">📥JOIN A GAME</button>   
            </div>
            <div className="bottom-left-button">
                <button className="button-ranking">🏆RANKING</button>
             </div>
        </div>
        
    );
}
