import React, { useState, useEffect } from 'react';
import '../../static/css/game/loadingScreen.css';

const LoadingScreen = ({ progress, loadingSteps }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [points, SetPoints] = useState('');

  const messages = ["⛏️ Preparing the mine...","🗺️ Mapping the tunnels...","💎 Hiding the gold nuggets...","🎴 Shuffling the cards...","👥 Gathering the miners...",
    "🕯️ Lighting the torches...","🔨 Sharpening the tools...","🎭 Assigning secret roles...","📜 Reviewing the strategy...","⚙️ Finalizing preparations..."];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev)=>(prev+1)%messages.length)}, 2000);
    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const pointsInterval = setInterval(() => {
      SetPoints((prev) => (prev.length >= 3?'': prev+'.'))}, 500);

    return () => clearInterval(pointsInterval);
  }, []);

  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-container">
        <div className="loading-screen-content">
          <div className="loading-miner-animation">
            <div className="miner-icon">⛏️</div>
            <div className="digging-effect"></div>
          </div>

          <h1 className="loading-title">SABOTEUR</h1>
          <div className="loading-message">
            {messages[currentMessageIndex]}
            <span className="loading-points">{points}</span>
          </div>

          <div className="loading-progress-container">
            <div 
              className="loading-progress-bar" 
              style={{width:`${progress}%`}}>
              <div className="loading-progress-shine"></div>
            </div>
            <div className="loading-progress-text">{Math.round(progress)}%</div>
          </div>

          <div className="loading-steps">
            {loadingSteps.map((step, index) => (
              <div 
                key={index} 
                className={`loading-step ${step.completed?'completed':'pending'}`}>
                <span className="step-icon">
                  {step.completed?'✅':'⏳'}
                </span>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="loading-tip">
            💡 <em>Tip: Remember, saboteurs win by blocking the path to access the gold!</em>
          </div>
        </div>
      </div>
    </div>
  )};

export default LoadingScreen;
