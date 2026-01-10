import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Label } from 'reactstrap';
import tokenService from '../../services/token.service';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png";
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobbies/achievements.css';

export default function EditAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState(null);

  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = tokenService.getUser();
        if (!user?.id) throw new Error("User ID not found");

        const response = await fetch(`/api/v1/users/${user.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!response.ok) throw new Error("Could not fetch profile");

        const data = await response.json();
        setProfile(data);
        setIsAdmin(data.authority?.authority === "ADMIN");
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [jwt]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch('/api/v1/achievements', { headers: { Authorization: `Bearer ${jwt}` } });
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        setAchievements(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAchievements();
  }, [jwt]);


  const handleChange = (index, field, value) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value;
    setAchievements(newAchievements);};

  const handleSubmit = async (event, ach) => {
    event.preventDefault();
    try {
      const res = await fetch(`/api/v1/achievements/${ach.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}` 
        },
        body: JSON.stringify(ach),
      });
      if (!res.ok) throw new Error("Failed to update achievement");
      setMessage("Achievement updated!");
    } catch (err) {
      console.error(err);
      setMessage("Error updating achievement");}};

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="home-page-container">
      <div className="top-right-lobby-buttons">
        <Link to="/logout"><button className="button-logOut"> 🔴Log Out</button></Link>
        <Link to="/lobby"><button className="button-logOut"> ➡️</button></Link>
      </div>
     </div>
  );
}
