import React, { useState, useEffect } from 'react';
import '../../App.css';
import '../../static/css/lobbies/profile.css';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"
import useAchievementsData from './hooks/useAchievementsData.js';
import getAchievementBadgeImage from '../../util/getAchievementBadgeImage.js';


const metricToBadgeNumber = {
    'BUILT_PATHS': 1,
    'DESTROYED_PATHS': 2,
    'TOOLS_DAMAGED': 3,
    'GOLD_NUGGETS': 4,
    'GAMES_PLAYED': 5,
    'TOOLS_REPAIRED': 6,
    'VICTORIES': 7
};

const getAchievementImage = (achievement) => {
    if (achievement.badgeImage) return achievement.badgeImage;
    const badgeNumber = metricToBadgeNumber[achievement.metric];
    return getAchievementBadgeImage(badgeNumber);
};


const jwt = tokenService.getLocalAccessToken();

export default function Profile() {
    const [isAdmin, setisAdmin] = useState(false);
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
    const { achievements, loading: loadingAchievements } = useAchievementsData();

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
                // 
                if(!response.ok){
                    throw new Error("Could not fetch profile. User might not exist");
                }
                const data = await response.json();
                setProfile(data);
                console.log(data);


            } catch(error){
                console.error("Error fetching profile:", error);
                setProfile(null);
            }
        };

        fetchProfile();
    }, []); 

    useEffect(() => {
        const jwt = tokenService.getLocalAccessToken();
        if (jwt) {
        try {
            const p=JSON.parse(atob(jwt.split('.')[1]));
            setisAdmin(p.authorities?.includes("ADMIN")||false);
        } catch (error) {
            console.error(error);}}
    }, []);

    if (!profile) {
        return <div>Loading profile...</div>;
    }
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

            {!isAdmin && (
                <div className="top-left-button">
                    <Link to="/GamesPlayed">
                        <button className="button-games-played">🎮 Games Played</button>
                    </Link>
                </div>
            )}
    

            <div className="profile-overlay">
                <div style={{marginBottom: '1rem' }}>
                    {isAdmin && (
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
                            <button className="button-small">🏠 Joined in {profile?.joined ? new Date(profile.joined).toLocaleDateString() : ''}</button>
                            <Link to="/profile/editProfile">
                                <button className="button-small">✏️ Edit Profile</button>
                            </Link>
                            {!isAdmin && (
                                <Link to="/stats">
                                     <button className="button-small">📊 Stats</button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {!isAdmin && (
                    <div className="achievements-section">
                        <h3 className="achievements-title">🏆 Achievements</h3>
                        {loadingAchievements ? (
                            <p>Loading achievements...</p>
                        ) : (
                            <div className="achievements-grid">
                                {achievements.slice(0, 6).map((ach) => (
                                    <div 
                                        key={ach.id} 
                                        className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
                                        <div className="achievement-icon">
                                            {ach.unlocked ? (
                                                <img 
                                                    src={getAchievementImage(ach)} 
                                                    alt={ach.tittle}
                                                    style={{ 
                                                        width: '55px', 
                                                        height: '55px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : '🔒'}
                                        </div>
                                        <div className="achievement-details">
                                            <h4>{ach.tittle}</h4>
                                            <p className="achievement-description">{ach.description}</p>
                                            <div className="achievement-progress">
                                                <span>{ach.progress}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {achievements.length > 6 && (
                            <Link to="/achievement" className="view-all-link">
                                View All Achievements 📥
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}