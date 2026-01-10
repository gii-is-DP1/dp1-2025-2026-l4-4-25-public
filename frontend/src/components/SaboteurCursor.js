import React, { useState, useEffect } from 'react';
import './SaboteurCursor.css';

const SaboteurCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        angle: (360 / 8) * i}));
      setSparkles((prev) => [...prev, ...newSparkles]);
      
      setTimeout(() => {
        setSparkles((prev) => prev.filter(s => s.id < Date.now() - 500));
      }, 600)};

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  return (
    <>
      <div
        className={`saboteur-cursor ${isClicking ? 'mining' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}>
        <div className="pickaxe">⛏️</div>
        <div className="cursor-ring"></div>
      </div>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            '--angle': `${sparkle.angle}deg`,
          }}>
          ✨
        </div>
      ))}

      <div
        className="gold-dust"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
      </div>
    </>
  );
};

export default SaboteurCursor;
