import React from 'react';
import { Link } from 'react-router-dom';

const RankingButton = () => {
  return (
    <div className="bottom-left-button">
      <Link to="/Ranking">
        <button className="button-ranking">🏆RANKING</button>
      </Link>
    </div>
  );
};

export default RankingButton;
