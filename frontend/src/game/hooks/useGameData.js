import { useState, useEffect } from 'react';
import tokenService from '../../services/token.service';
import { toast } from 'react-toastify';
import avatar from '../../static/images/icons/1.jpeg';

const jwt = tokenService.getLocalAccessToken();

export const useGameData = (game) => {
  const [activePlayers, setActivePlayers] = useState([]);
  const [chat, setChat] = useState([]);
  const [loggedActivePlayer, setLoggedActivePlayer] = useState(null);
  const [ListCards, setListCards] = useState([]);
  const [deck, setDeck] = useState();
  const [round, setRound] = useState();

  const fetchPlayerByUsername = async (username) => {
    try {
      const response = await fetch(`/api/v1/players/byUsername?username=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Respuesta no OK:', response.status);
        toast.error('Error al obtener el jugador.');
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error de red. No se pudo conectar con el servidor.');
    }
  };

  const loadActivePlayers = async () => {
    const initialPlayers = game?.activePlayers || [];
    
    if (initialPlayers.length === 0) {
      return;
    }

    const fetchedPlayers = await Promise.all(initialPlayers.map(async (username) => {
      try {
        const player = await fetchPlayerByUsername(username);
        if (!player) return null;
        return {
          id: player.id,
          username: player.username,
          birthDate: player.birthDate,
          profileImage: player.image || avatar,
          wins: player.wins ?? 0,
        };
      } catch (err) {
        console.error(`Error al cargar datos de ${username}:`, err);
        return null;
      }
    }));

    const validPlayers = fetchedPlayers.filter(p => p !== null);
    setActivePlayers(validPlayers);
  };

  const getChat = async () => {
    try {
      const response = await fetch(`/api/v1/chats/${game.chat}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const chatData = await response.json();
        setChat(chatData);
      } else {
        console.error('Error al obtener el chat:', response.status);
      }
    } catch (error) {
      console.error('Error de red al obtener el chat:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/v1/cards`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        }
      });
      const data = await response.json();
      setListCards(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAndSetLoggedActivePlayer = async () => {
    const loggedInUser = tokenService.getUser();
    const player = await fetchPlayerByUsername(loggedInUser.username);
    setLoggedActivePlayer(player);
  };

  const postDeck = async (activePlayer, ListCards) => {
    const body = {
      activePlayer: activePlayer,
      cards: ListCards
    };

    try {
      const response = await fetch(`/api/v1/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      setDeck(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Obtiene el deck por username (resuelve a activePlayerId y luego llama al endpoint correcto)
  const getDeck = async (username) => {
    try {
      const activePlayer = await fetchActivePlayerByUsername(username);
      if (!activePlayer?.id) {
        console.warn('ActivePlayer no encontrado para username:', username);
        setDeck(null);
        return null;
      }

      const response = await fetch(`/api/v1/decks/byActivePlayerId?activePlayerId=${activePlayer.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeck(data);
        return data;
      } else if (response.status === 404) {
        // No existe mazo todavía
        setDeck(null);
        return null;
      } else {
        console.error('Error al obtener el mazo:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error de red al obtener el mazo:', error);
      return null;
    }
  };

  // Actualiza (PATCH) el deck de un ActivePlayer por username con la lista de IDs de cartas
  const patchDeck = async (username, cardIds) => {
    try {
      const activePlayer = await fetchActivePlayerByUsername(username);
      if (!activePlayer?.id) {
        console.warn('ActivePlayer no encontrado para username:', username);
        return null;
      }

      // Buscar el deck por activePlayerId para obtener su ID
      const deckRes = await fetch(`/api/v1/decks/byActivePlayerId?activePlayerId=${activePlayer.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!deckRes.ok) {
        console.error('No se pudo obtener el deck para hacer PATCH. Status:', deckRes.status);
        return null;
      }

      const deckData = await deckRes.json();
      const deckId = deckData?.id;
      if (!deckId) {
        console.error('Deck sin ID válido para hacer PATCH');
        return null;
      }

      // Hacemos PATCH con la lista de cartas
      const patchRes = await fetch(`/api/v1/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ cards: cardIds }),
      });

      if (!patchRes.ok) {
        const msg = await patchRes.text();
        console.error('Error al hacer PATCH del deck:', patchRes.status, msg);
        return null;
      }

      const updated = await patchRes.json();
      setDeck(updated);
      return updated;
    } catch (error) {
      console.error('Error de red al hacer PATCH del deck:', error);
      return null;
    }
  };

  const findActivePlayerUsername = (activePlayers) => {
    const loggedInUser = tokenService.getUser();
    const activePlayer = activePlayers.find(p => p.username === loggedInUser.username);
    return activePlayer ? activePlayer.username : null;
  };

  const fetchActivePlayerByUsername = async (username) => {
    try {
      const response = await fetch(`/api/v1/activePlayers/byUsername?username=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Respuesta no OK al buscar ActivePlayer:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error de red al buscar ActivePlayer por username:', error);
      return null;
    }
  };

  




  return {
    activePlayers,
    chat,
    deck,
    loggedActivePlayer,
    ListCards,
    loadActivePlayers,
    getChat,
    fetchCards,
    fetchAndSetLoggedActivePlayer,
    postDeck,
    getDeck,
    patchDeck,
    findActivePlayerUsername,
    fetchActivePlayerByUsername,
  };
};
  
