import React from 'react';

const Logo = () => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      padding: '10px', 
      zIndex: 10 
    }}>
      <img 
        src="/logo1-recortado.png" 
        alt="logo" 
        style={{ height: 95, width: 100 }} 
      />
    </div>
  );
};

export default Logo;
