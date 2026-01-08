import React, { useEffect, useState } from 'react';
import defaultAvatar from '../../../static/images/icons/default_profile_avatar.png';
import tokenService from '../../../services/token.service';
import { toast } from 'react-toastify';

const PlayersListLobby = ({
  activePlayers = [],
  maxPlayers = 0,
  creatorUsername,
  isCreator,
  onExpelPlayer
}) => {
  const [playersData, setPlayersData] = useState([]);
  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    if (!activePlayers || activePlayers.length === 0) {
      setPlayersData([]);
      return;
    }

    const fetchAvatars = async () => {
      try {
        const uniqueUsernames = Array.from(new Set(activePlayers));

        const responses = await Promise.all(
          uniqueUsernames.map(async (username) => {
            const response = await fetch(`/api/v1/players/byUsername?username=${username}`, {
              headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) throw new Error(`Error fetching ${username}`);

            const data = await response.json();
            const player = Array.isArray(data) ? data[0] : data;
            return {
              username,
              avatar: player?.image || null,
              id: player?.id ?? username
            };
          })
        );

        setPlayersData(responses);
      } catch (error) {
        console.error("Error fetching avatars:", error);
        toast.error("Error loading player avatars.");
      }
    };

    fetchAvatars();
  }, [activePlayers, jwt]);

  return (
    <div className="active-players-section">
      <h2>Players : ({playersData.length}/{maxPlayers})</h2>
      <div className="active-players-list">
        {playersData.map((player, index) => (
          <div key={player.id ?? index} className="player-card2">
            <img
              src={player.avatar || defaultAvatar}
              alt={`${player.username}'s avatar`}
              className="player-avatar-img"
              title={player.username}
            />
            <div className="player-name">{player.username}</div>
            {isCreator && player.username !== creatorUsername && (
              <button
                className="expel-player-btn"
                onClick={() => onExpelPlayer(player.username)}
              >
                ❌ EXPEL
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersListLobby;
