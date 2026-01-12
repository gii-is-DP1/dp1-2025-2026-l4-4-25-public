import React, { useEffect, useState, useRef } from 'react';
import '../static/css/components/welcomeScreen.css';
import minerRol from '../game/cards-images/roles/minerRol.png';
import saboteurRol from '../game/cards-images/roles/saboteurRol.png';
import audioBackground from './audiobackground.mp3';

export default function WelcomeScreen({ username, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(audioBackground);
    audio.volume = 0.4;
    audio.loop = true;
    audio.currentTime = 50; 
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        setTimeout(() => {
          audio.play().catch(e => console.log("Second attempt failed:", e));
        }, 100);
      }
    };
    
    playAudio();

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        try { audio.src = ''; } catch (e) {}
        audioRef.current = null;
      } 
      if (onComplete) {
        onComplete();
      }
    }, 7500);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        try { audio.src = ''; } catch (e) {}
        audioRef.current = null;
      }
    };
  }, [onComplete]);
    
  if (!isVisible) return null;

  return (
    <div className="welcome-screen-overlay">
      <video 
        className="welcome-background-video" 
        autoPlay 
        loop 
        muted 
        playsInline>
        <source src="/LOADINGVIDEO.mp4" type="video/mp4" />
      </video>
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`}></div>
        ))}
      </div>
      <div className="welcome-screen-content">
        <div className="welcome-title-container">
          <div className="title-background-glow"></div>
          <h1 className="welcome-title glow">WELCOME TO</h1>
          <h1 className="welcome-game-title">SABOTEUR</h1>
          <div className="welcome-subtitle">
            <span className="subtitle-text">⛏️ Dig for gold... or sabotage the miners! 💣</span>
          </div>
        </div>

        <div className="welcome-user">
          <p className="user-greeting">
            Welcome back, <span className="username-highlight">{username}</span>!
          </p>
        </div>

        <div className="welcome-progress">
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
          <p className="progress-text">Loading your adventure...</p>
        </div>
      </div>
    </div>
  );
}
