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
    
    const usernames = ['Alexby205', 'Mantecao', 'Julio', 'Fran', 'Javi Osuna', 'Victor', 'Luiscxx', 'DiegoREY', 'Bedilia'];
    
    const mockPlayers = usernames.map((username, index) => ({
      id: 1000 + index,
      username,
      birthDate: new Date(1990 + index, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      profileImage: avatar,
      wins: Math.floor(Math.random() * 10),
    }));

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
    setActivePlayers([...validPlayers, ...mockPlayers]);
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

  const getDeck = async (activePlayer) => {
    try {
      const response = await fetch(`/api/v1/deck/byActivePlayer?activePlayer=${activePlayer}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDeck(data);
      } else {
        console.error('Error al obtener el mazo:', response.status);
      }
    } catch (error) {
      console.error('Error de red al obtener el mazo:', error);
    }
  };

  const findActivePlayerId = (activePlayers) => {
    const loggedInUser = tokenService.getUser();
    const activePlayer = activePlayers.find(p => p.username === loggedInUser.username);
    return activePlayer ? activePlayer.id : null;
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
    findActivePlayerId,
  };
};
