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
        console.error('Response not OK:', response.status);
        toast.error('Error to obtain player.');
      }
    } catch (error) {
      console.error('A problem with the fetch request:', error);
      toast.error('Network error. Could not connect to the server.');
    }
  };

  const loadActivePlayers = async () => {
    const initialPlayers = game?.activePlayers || [];
    
    if (initialPlayers.length === 0) {
      return;
    }

    const fetchedPlayers = await Promise.all(initialPlayers.map(async (username) => {
      try {
        const activePlayer = await fetchActivePlayerByUsername(username);
        if (activePlayer) {
          return {
            id: activePlayer.id,
            username: activePlayer.username,
            birthDate: activePlayer.birthDate,
            profileImage: activePlayer.image || avatar,
            wins: activePlayer.wonGames ?? activePlayer.wins ?? 0,
            rol: activePlayer.rol,
            pickaxeState: activePlayer.pickaxeState,
            candleState: activePlayer.candleState,
            cartState: activePlayer.cartState,
            goldNugget: activePlayer.goldNugget || 0,
          };
        }

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
        console.error('Error getting chat:', response.status);
      }
    } catch (error) {
      console.error('Network error getting chat:', error);
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

  const getDeck = async (username) => {
    try {
      const activePlayer = await fetchActivePlayerByUsername(username);
      if (!activePlayer?.id) {
        console.warn('ActivePlayer not found for username:', username);
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
        setDeck(null);
        return null;
      } else {
        console.error('Error getting deck:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting deck:', error);
      return null;
    }
  };
  const fetchOtherPlayerDeck = async (username) => {
    try {
      const activePlayer = await fetchActivePlayerByUsername(username);
      if (!activePlayer?.id) {
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
        return data;
      }
      return null;
    } catch (error) {
      console.error('Network error getting deck of another player:', error);
      return null;
    }
  };

  const patchDeck = async (username, cardIds) => {
    try {
      const activePlayer = await fetchActivePlayerByUsername(username);
      if (!activePlayer?.id) {
        console.warn('ActivePlayer not found for username:', username);
        return null;
      }

      const deckRes = await fetch(`/api/v1/decks/byActivePlayerId?activePlayerId=${activePlayer.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!deckRes.ok) {
        console.error('Could not get deck for PATCH. Status:', deckRes.status);
        return null;
      }

      const deckData = await deckRes.json();
      const deckId = deckData?.id;
      if (!deckId) {
        console.error('Deck without valid ID for PATCH');
        return null;
      }

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
        console.error('Error making PATCH request for deck:', patchRes.status, msg);
        return null;
      }

      const updated = await patchRes.json();
      setDeck(updated);
      return updated;
    } catch (error) {
      console.error('Network error making PATCH request for deck:', error);
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
        console.error('Error getting ActivePlayer:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting ActivePlayer by username:', error);
      return null;
    }
  };

  const squaresById = async (id) => {
    try {
      const response = await fetch(`/api/v1/squares/${id}`, { 
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Response not OK getting square:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting square:', error);
      return null;
    }
  };

  const patchSquare = async (squareId, updates) => {
    try {
      const response = await fetch(`/api/v1/squares/${squareId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(updates),
      }); 
      if (response.ok) {
        const updatedSquare = await response.json();
        return updatedSquare;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Network error making PATCH request for square:', error);
      return null;
    }
  };

  const pactchBoard = async (boardId, updates) => {
    try {
      const response = await fetch(`/api/v1/boards/${boardId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(updates),
      }); 
      if (response.ok) {
        const updatedBoard = await response.json();
        return updatedBoard;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Network error making PATCH request for board:', error);
      return null;
    }
  };

  const getBoard = async (boardId) => { 
    try {
      const response = await fetch(`/api/v1/boards/${boardId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
      }); 
      if (response.ok) {
        const boardData = await response.json();
        return boardData;
      } else {
        console.error('Response not OK getting board:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting board:', error);
      return null;
    }
  }

  const getSquareByCoordinates = async (boardId, coordinateX, coordinateY) => {
    console.log('🔍 getSquareByCoordinates llamado con:', { boardId, coordinateX, coordinateY });
    try {
      const response = await fetch(
        `/api/v1/squares/byBoardAndCoordinates?boardId=${boardId}&coordinateX=${coordinateX}&coordinateY=${coordinateY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          },
        }
      );
      console.log('🔍 Respuesta del servidor:', response.status);
      if (response.ok) {
        const text = await response.text();
        if (!text) {
          console.warn('Square not found for coordinates:', coordinateX, coordinateY);
          return null;
        }
        const square = JSON.parse(text);
        console.log('🔍 Square found:', square);
        return square;
      } else {
        console.error('Response not OK getting square by coordinates:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting square by coordinates:', error);
      return null;
    }
  }

  const getLog = async (logId) => { 
    try {
      const response = await fetch(`/api/v1/logs/${logId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
      }); 
      if (response.ok) {
        const logData = await response.json();
        return logData;
      } else {
        console.error('Response not OK getting log:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting log:', error);
      return null;
    }
  }

  const patchLog = async (logId, updates) => {
    try {
      const response = await fetch(`/api/v1/logs/${logId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(updates),
      }); 
      if (response.ok) {
        const updatedLog = await response.json();
        return updatedLog;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Network error making PATCH request for log:', error);
      return null;
    }
  };

  const getmessagebychatId = async (chatId) => {
    try {
      const response = await fetch(`/api/v1/messages/byChatId?chatId=${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const messages = await response.json();
        return messages;
      } else {
        console.error('Response not OK getting messages by chatId:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error getting messages by chatId:', error);
      return null;
    }
  };

  const patchActivePlayer = async (activePlayerId, data) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${activePlayerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedPlayer = await response.json();
      console.log('ActivePlayer updated:', updatedPlayer);
      return updatedPlayer;
    } else {
      console.error('Error updating ActivePlayer');
      return null;
    }
  } catch (error) {
    console.error('Network error making PATCH request for activePlayer:', error);
    return null;
  }
};

  const patchRound = async (roundId, updates) => {
    try {
      const response = await fetch(`/api/v1/rounds/${roundId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updatedRound = await response.json();
        console.log('Round updated:', updatedRound);
        return updatedRound;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Network error making PATCH request for round:', error);
      return null;
    }
  };

  const postRound = async ({ gameId, roundNumber }) => {
    try {
      const response = await fetch(`/api/v1/rounds?gameId=${gameId}&&roundNumber=${roundNumber}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        }
      });
      if (response.ok) {
        const newRound = await response.json();
        console.log('Round created:', newRound);
        return newRound;
      } else {
        const errorText = await response.text();
        console.error('Error creating round:', errorText);
        return null;
      }
    } catch (error) {
      console.error('Network error making POST request for round:', error);
      return null;
    }
  };

  const getRoundByNumber = async (gameId, roundNumber) => {
    try {
      const response = await fetch(`/api/v1/rounds/byGameIdAndNumber?gameId=${gameId}&&roundNumber=${roundNumber}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        }
      });
      if (response.ok) {
        const rounds = await response.json();
        return rounds;
      }
    } catch (error) {
      console.error('Network error getting round:', error);
      return null;
    }
  };

  const notifyRoundEnd = async (roundId, roundEndData) => {
    try {
      const response = await fetch(`/api/v1/rounds/${roundId}/notifyRoundEnd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(roundEndData)
      });
      
      if (response.ok) {
        console.log('✅ Notification of round end sent');
        return await response.json();
      } else {
        console.error('Error notifying round end:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Network error notifying round end:', error);
      return null;
    }
  };

  const getActivePlayersbyId = async (activePlayerId) => {
  try {
    const response = await fetch(`/api/v1/activePlayers/${activePlayerId}`, {
      method: "GET",
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (response.ok) {
          const activePlayer = await response.json();
          return activePlayer;
        } else {
          console.error('Response not OK getting activePlayer by ID:', response.status);
          return null;
        }
      } catch (error) {
        console.error('Network error getting activePlayer by ID:', error);
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
    fetchOtherPlayerDeck,
    findActivePlayerUsername,
    fetchActivePlayerByUsername,
    squaresById,
    patchSquare,
    pactchBoard,
    getBoard,
    getSquareByCoordinates,
    getLog,
    patchLog,
    getmessagebychatId,
    patchActivePlayer,
    patchRound,
    postRound,
    getRoundByNumber,
    getRoundById,
    notifyRoundEnd,
    getActivePlayersbyId
  };
};
  
