import React, { useState, useEffect } from 'react';
import '../../App.css';
import '../../static/css/lobbies/profile.css';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"


const jwt = tokenService.getLocalAccessToken();

export default function Profile() {
    const [profile, setProfile] = useState({
        username: "",
        password: "",
        email: "",
        birthdate: "",
        image: "",
        status: "",
        joined: "",
        authority: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const jwt = tokenService.getUser();
                if (!jwt || !jwt.id){
                    throw new Error("User ID not found")
                }
                
                const userId = jwt.id;
                const response = await fetch(`/api/v1/users/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                const data = await response.json();
                setProfile(data);
                console.log(data);
                //setOriginalUsername(data.username);
                //setOriginalPassword(data.password);

            } catch(error){
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
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
            
            {profile.authority.authority !== 'ADMIN' && (
                <div className="top-left-button">
                    <Link to="/profile">
                        <button className="button-games-played">🎮 Games Played</button>
                    </Link>
                </div>
            )}
    

            <div className="profile-overlay">
                <div style={{marginBottom: '1rem' }}>
                    {profile.authority.authority === 'ADMIN' && (
                            <span className="admin-badge">⭐ ADMIN</span>
                    )}
                </div>
                <div className="profile-header">
                    <img
                        src= {profile?.image || defaultProfileAvatar}
                        alt="Avatar"
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h2 className={profile.authority.authority === 'ADMIN' ? "admin-username" : ""}>{profile?.username || 'Loading...'}</h2>
                        <div className="profile-buttons">
                            <h2>Joined in {profile?.joined ? new Date(profile.joined).toLocaleDateString() : ''}</h2>
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