import React, { useEffect, useState } from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link } from 'react-router-dom';
import tokenService from "../services/token.service";

export default function Lobby(){
    const [isAdmin, setisAdmin] = useState(false);
    const [showFriends, setShowFriends] = useState(false);

    // SIMULAMOS LOS AMIGOS HASTA QUE ESTÉ HECHO EN EL BACKEND
    const [friends, setFriends] = useState([
        {username: "Alexby205", status: "A", color: "green" },
        {username: "LuisCV1", status: "B", color: "orange" },
        {username: "Julio", status: "C", color: "red" },
    ]);

    useEffect(() => {
        const jwt = tokenService.getLocalAccessToken();
        if (jwt) {
        try {
            const p=JSON.parse(atob(jwt.split('.')[1]));
            setisAdmin(p.authorities?.includes("ADMIN")||false);
        } catch (error) {
            console.error(error);}}
    }, []);

    return(
        <div className="home-page-lobby-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 100 }} />
             </div>
            <div className="top-right-lobby-buttons">
                {/*<Link to="/register">
                    <button className="button-register">📃Register</button>
                </Link>
                <Link to="/login">
                    <button className="button-login">💻Login</button>
                </Link>
                */}
                {isAdmin && (
                <Link to="/users">
                    <button className="button-logOut">📑Users</button>
                </Link>
                )}
                {isAdmin && (
                <Link to="/EditAchievement">
                    <button className="button-logOut">🥇Achievement</button>
                </Link>
                )}
                <div className="friends-dropdown-container">
                    <button 
                        className="button-logOut" 
                        onClick={() => setShowFriends(prev => !prev)}>
                        🫂Friends
                    </button>
                    {showFriends && (
                        <div className="friends-dropdown">
                            <h4>🫂Friends Section🫂</h4>
                            {friends.map((f, idx) => (
                                <div key={idx} className="friend-item">
                                    <span>{f.username}</span>
                                    <span className="friend-status" style={{ backgroundColor: f.color }}></span>
                                    <span>{f.status}</span>
                                </div>
                            ))}
                            <hr />
                            <button className="friend-action">📩Friend Request</button>
                            <button className="friend-action">🔎Find Player</button>
                        </div>
                    )}
                </div>
                <Link to="/profile">
                    <button className="button-logOut"> 👤Profile</button>
                </Link>
            </div>
            <div className="button-info">
                <Link to="/info">
                    <button className="button-info"> ℹ️</button>
                </Link>
            </div>
            <div className="hero-div-lobby">
                <Link to="/CreateGame">
                   <button className="button-crear">📑CREATE GAME</button>  
                </Link>
                 <Link to="/ListGames">
                <button className="button-unirse">📥JOIN A GAME</button>   
                </Link>
            </div>
            <div className="bottom-left-button">
                <button className="button-ranking">🏆RANKING</button>
             </div>
        </div>
        
    );
}
