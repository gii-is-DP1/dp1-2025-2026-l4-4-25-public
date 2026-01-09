import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../services/token.service';
import { isUserAdmin, getMockFriends } from '../utils/lobbyHelpers';

const useLobbyUser = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [player, setPlayer] = useState(null);
  const [friends, setFriends] = useState(getMockFriends());
  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const loggedInUser = tokenService.getUser();
        if (!loggedInUser || !loggedInUser.id) {
          console.error("Not found user ID.");
          return;
        }

        const response = await fetch(`/api/v1/players/${loggedInUser.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          }
        });

        console.log("response of player", response);
        
        if (response.ok) {
          const data = await response.json();
          console.log("response 2", data);
          setPlayer(data);
        } else {
          console.error('Response not OK:', response.status);
          toast.error('Error fetching player information.');
        }
      } catch (error) {
        console.error('Fetch request problem:', error);
        toast.error('Network error. Could not connect to the server.');
      }
    };

    const admin = isUserAdmin(jwt);
    setIsAdmin(admin);
    if (!admin) {
      fetchPlayer();
    }
  }, [jwt]);

  return {
    isAdmin,
    player,
    friends,
    setFriends,
    jwt
  };
};

export default useLobbyUser;
