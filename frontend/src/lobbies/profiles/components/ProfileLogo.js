import React from 'react';

const ProfileLogo = () => {
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
        style={{ height: 95, width: 95 }} 
      />
    </div>
  );
};

export default ProfileLogo;
