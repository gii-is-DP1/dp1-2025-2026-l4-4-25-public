import React from 'react';

const GameSettings = ({ 
  numPlayers, 
  onNumPlayersChange, 
  isPrivate, 
  onPrivacyChange,
  isCreator 
}) => {
  if (!isCreator) return null;

  return (
    <div className="game-settings">
      <div className="form-group">
        <label>Number of players</label>
        <select
          id="num-jugadores"
          className="form-control"
          value={numPlayers}
          onChange={(e) => onNumPlayersChange(e.target.value)}
        >
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </div>

      <div className="form-group privacy-toggle">
        <label>Privacity</label>
        <div className="toggle-switch">
          <span>{isPrivate ? "Private" : "Public"}</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => onPrivacyChange(!isPrivate)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
