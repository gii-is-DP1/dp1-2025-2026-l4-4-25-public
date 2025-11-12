import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import { extractJoinRequests, getUniqueActivePlayers } from '../utils/lobbyUtils';

/**
 * Custom hook para manejar toda la lógica de datos del lobby
 */
const useLobbyData = (gameId, jwt, isCreator) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [game, setGame] = useState(null);

  // Fetch inicial del juego
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

  // Fetch de solicitudes de unión (solo para creador)
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
        
        if (!cancelled) {
          setJoinRequests(requests);
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

  // Fetch inicial del primer mensaje de bienvenida
  const postFirstMessage = async (creatorUsername, chatId) => {
    try {
      const loggedInUser = tokenService.getUser();
      if (!loggedInUser || !loggedInUser.id) {
        console.error("No se encontró el ID del usuario.");
        return;
      }

      const msg = "Bienvenido a Saboteur";
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
        console.log('Chat del CreateGame:', data);
      } else {
        console.error('Respuesta no OK:', response.status);
        toast.error('Error al obtener el mensaje del jugador.');
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error de red. No se pudo conectar con el servidor.');
    }
  };

  // Actualizar el juego con PATCH
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

  // Eliminar el juego
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

  // Enviar mensaje (para aceptar/rechazar solicitudes)
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

  // Eliminar mensajes
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

  return {
    game,
    setGame,
    joinRequests,
    setJoinRequests,
    postFirstMessage,
    updateGame,
    deleteGame,
    sendMessage,
    deleteMessages
  };
};

export default useLobbyData;
