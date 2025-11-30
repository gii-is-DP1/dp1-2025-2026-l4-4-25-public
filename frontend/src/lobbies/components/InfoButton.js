import React from 'react';
import { Link } from 'react-router-dom';

const InfoButton = () => {
  return (
    <div className="button-info">
      <Link to="/info">
        <button className="button-info">ℹ️</button>
      </Link>
    </div>
  );
};

export default InfoButton;
