import React from 'react';
import '../App.css';
import '../static/css/lobbies/ListGames.css'; 
import { Link } from 'react-router-dom';
import games from '../static/images/games.png'; 

export default function ListGames(){

        return (
        <div className="home-page-lobby-container"> 
            <img src={games} alt="Encabezado" className="listgames-top-image" /> 
                 <div className="top-right-lobby-buttons">
                <Link to="/lobby">
                   <button className="button-logOut"> ➡️</button>
               </Link>       
                </div>
               <div className="hero-div"> 
                  <div className="listgames-card"></div>
               </div>
          </div>
   )
}