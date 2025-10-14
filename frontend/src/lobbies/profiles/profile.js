import React, { useState, useEffect } from 'react';
import '../../App.css';
import '../../static/css/lobbies/profile.css';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"
import getIconImage from "../../util/getIconImage.js";

const jwt = tokenService.getLocalAccessToken();

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // 1. Obtener los datos del usuario guardados en el login
        const loggedInUser = tokenService.getUser();
        if (!loggedInUser || !loggedInUser.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }

        // 2. Usar el ID para llamar al endpoint correcto
        fetch(`/api/v1/users/${loggedInUser.id}`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(function (response) {
            if (response.status === 200) {
                return response.json();
            } else {
                return Promise.reject('Error fetching user data');
            }
        })
        .then(function (data) {
            setUser(data);
            console.log("✅ Usuario cargado:", data);
        })
        .catch(function (error) {
            console.error('There was a problem with the fetch operation:', error);
        });
        
    }, []);

    return (
        <div className="home-page-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 95 }} />
            </div>
            <div className="top-right-lobby-buttons">
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
                        src= {user?.image || defaultProfileAvatar}
                        alt="Avatar"
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h2>{user?.username || 'Cargando...'}</h2>
                        <div className="profile-buttons">
                            <h2>Joined in {user?.birthDate || ''}</h2>
                        </div>
                        <div className="profile-buttons">
                            <Link to="/profile/editProfile">
                                <button className="button-small">✏️ Edit Profile</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}