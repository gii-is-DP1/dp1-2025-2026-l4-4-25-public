import React, { useState, useEffect } from 'react';
import '../../App.css';
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobbies/achievements.css';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = tokenService.getUser();
        if (!user?.id) throw new Error("User ID not found");

        const response = await fetch(`/api/v1/users/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (!response.ok) throw new Error("Could not fetch profile");

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [jwt]);

  useEffect(() => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      setIsAdmin(payload.authorities?.includes("ADMIN") || false);
    } catch (error) {
      console.error(error);
    }
  }, [jwt]);


  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/v1/achievements', {
          headers: { Authorization: `Bearer ${jwt}` },});
        if (!response.ok) throw new Error("Failed to fetch achievements");
        const data = await response.json();
        console.log("Logros: ", data);
        setAchievements(data);
      } catch (error) {
        console.error(error);}};
    fetchAchievements();
  }, [jwt]);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="home-page-container">
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
        <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 95 }} />
      </div>
      <div className="top-right-lobby-buttons">
        <Link to="/logout"><button className="button-logOut"> 🔴Log Out</button></Link>
        <Link to="/lobby"><button className="button-logOut"> ➡️</button></Link>
      </div>
       <ul className="achievements-list">
    <h1 className="achievement-text">🏆 ACHIEVEMENTS OF {profile.username}🏆</h1>
  {achievements.map((ach, index) => (
    <li key={index} className="achievement-card">
      <div className="achievement-info"> 
        <img
          className="achievement-avatar"
          src={profile?.image || defaultProfileAvatar}
          alt="User Avatar"
        />
        <div className="achievement-text">
          <strong>{ach.tittle}</strong>
          <p>{ach.description || 'No description'}</p>
        </div>
      </div>
      <div className="achievement-progress-container">
        <div className="progress-bar" style={{ width: `${ {/*ach.score*/} || 0}%` }}></div>
      </div>
    </li>
  ))}
</ul>

      </div>
  );
}
