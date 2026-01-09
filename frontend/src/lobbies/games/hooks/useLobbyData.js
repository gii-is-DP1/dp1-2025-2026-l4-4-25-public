import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { extractJoinRequests, extractSpectatorRequests, getUniqueActivePlayers } from '../utils/lobbyUtils';


const useLobbyData = (gameId, jwt, isCreator) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [spectatorRequests, setSpectatorRequests] = useState([]);
  const [game, setGame] = useState(null);
  const [round, setRound] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/v1/games/${gameId}`, {
          headers: { "Authorization": `Bearer ${jwt}` },
        });
        if (!res.ok) return;
        
        const latestGame = await res.json();
        setGame(prev => ({
          ...prev,
          ...latestGame,
          activePlayers: getUniqueActivePlayers(latestGame.activePlayers),
          maxPlayers: latestGame.maxPlayers,
        }));
      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 3000);
    return () => clearInterval(interval);
  }, [gameId, jwt]);

  useEffect(() => {
    if (!isCreator || !game?.chat) return;
    
    let cancelled = false;
    
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/v1/messages/byChatId?chatId=${game.chat}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) return;
        
        const msgs = await res.json();
        const requests = extractJoinRequests(msgs);
        const spectatorReqs = extractSpectatorRequests(msgs);
        
        if (!cancelled) {
          setJoinRequests(requests);
          setSpectatorRequests(spectatorReqs);
        }
      } catch (error) {
        console.error('Error fetching the requests', error);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => { 
      cancelled = true; 
      clearInterval(interval); 
    };
  }, [isCreator, game?.chat, jwt]);

  const postFirstMessage = async (creatorUsername, chatId) => {
    try {
      const loggedInUser = tokenService.getUser();
      if (!loggedInUser || !loggedInUser.id) {
        console.error("User ID not found.");
        return;
      }

      const msg = "Welcome to Saboteur";
      const request = {
        content: msg,
        activePlayer: creatorUsername,
        chat: chatId
      };

      const response = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('CreateGame chat:', data);
      } else {
        console.error('Response not OK:', response.status);
        toast.error('Error fetching player message.');
      }
    } catch (error) {
      console.error('Fetch request problem:', error);
      toast.error('Network error. Could not connect to the server.');
    }
  };

  const updateGame = async (updates) => {
    try {
      const response = await fetch(`/api/v1/games/${gameId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedGame = await response.json();
        setGame(updatedGame);
        return updatedGame;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  const deleteGame = async () => {
    try {
      const response = await fetch(`/api/v1/games/${gameId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  };

  const sendMessage = async (content, activePlayer, chatId) => {
    try {
      await fetch(`/api/v1/messages`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${jwt}` 
        }, 
        body: JSON.stringify({ 
          content, 
          activePlayer, 
          chat: chatId 
        }) 
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessages = async (messageIds) => {
    for (const mid of messageIds) {
      try {
        await fetch(`/api/v1/messages/${mid}`, { 
          method: 'DELETE', 
          headers: { Authorization: `Bearer ${jwt}` } 
        });
      } catch (e) {
        console.warn('Failed deleting message', mid, e);
      }
    }
  };

  const postRound = async (gameId, roundNumber) => {
    try {
      const response = await fetch(`/api/v1/rounds?gameId=${gameId}&roundNumber=${roundNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRound(data);
        return data;   
      } else {
        console.error('Error creating round:', response.status);
      } 
    } catch (error) {
      console.error('Network error creating round:', error);
    }
  };

  return {
    game,
    setGame,
    joinRequests,
    setJoinRequests,
    spectatorRequests,
    setSpectatorRequests,
    postFirstMessage,
    updateGame,
    deleteGame,
    sendMessage,
    deleteMessages,
    postRound,
    round
  };
};

export default useLobbyData;
