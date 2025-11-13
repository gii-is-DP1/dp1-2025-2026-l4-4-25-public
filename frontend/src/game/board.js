import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import tokenService from '../services/token.service.js';

// Componentes
import PlayerCards from './components/PlayerCards';
import PlayerRole from './components/PlayerRole';
import SpectatorIndicator from './components/SpectatorIndicator';
import GameControls from './components/GameControls';
import GameBoard from './components/GameBoard';
import PlayersList from './components/PlayersList';
import GameLog from './components/GameLog';
import ChatBox from './components/ChatBox';

// Utilidades
import { assignRolesGame, formatTime, calculateCardsPerPlayer, calculateInitialDeck, getRotatedCards, getNonRotatedCards, partitionCardsByRotation } from './utils/gameUtils';

// Hooks personalizados
import { useGameData } from './hooks/useGameData';

// Estilos
import '../App.css';
import '../static/css/home/home.css';
import '../static/css/game/game.css';

const jwt = tokenService.getLocalAccessToken();
const timeturn = 60;

export default function Board() {
  const location = useLocation();
  const loggedInUser = tokenService.getUser();

  // Estados principales
  const [isSpectator] = useState(location.state?.isSpectator || false);
  const [CardPorPlayer, setCardPorPlayer] = useState(0);
  const [deckCount, setDeckCount] = useState(60);
  const [game, setGame] = useState(location.state?.game);
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState('1');
  const [currentPlayer, setCurrentPlayer] = useState();
  const [cont, setCont] = useState(timeturn);
  const [gameLog, setGameLog] = useState([]);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [playerRol, setPlayerRol] = useState([]);
  const [privateLog, setPrivateLog] = useState([]);
  
  

  // Estados del tablero
  const BOARD_COLS = 11;
  const BOARD_ROWS = 9;
  const [boardCells, setBoardCells] = useState(() => {
    const initialBoard = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null)
    );
    initialBoard[4][1] = { type: 'start', owner: 'system', placedAt: Date.now() };
    initialBoard[4][9] = { type: 'objective', owner: 'system', placedAt: Date.now() };
    initialBoard[2][9] = { type: 'objective', placedAt: Date.now() };
    initialBoard[6][9] = { type: 'objective', placedAt: Date.now() };
    initialBoard[4][2] = { type: 'tunnel', placedAt: Date.now() };
    return initialBoard;
  });

  const boardGridRef = useRef(null);

  // Hook personalizado para cargar datos del juego
  const {
    ListCards,
    activePlayers,
    postDeck,
    findActivePlayerUsername,
    loadActivePlayers,
    loggedActivePlayer,
    chat,
    getChat,
    fetchCards,
    fetchAndSetLoggedActivePlayer
  } = useGameData(game);

  // Particionar cartas en rotadas y no rotadas
  const rotatedOnly = getRotatedCards(ListCards);
  const nonRotatedOnly = getNonRotatedCards(ListCards);

  // Funciones de manejo del tablero
  const handleCellClick = (row, col) => {
    if (isSpectator) {
      addPrivateLog("ℹ️ Spectators cannot place cards", "warning");
      return;
    }
    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      if (!next[row][col]) {
        next[row][col] = {
          type: 'path',
          owner: loggedInUser?.username || 'unknown',
          placedAt: Date.now()
        };
      }
      return next;
    });
  };

  // Funciones de logs
  const addLog = (msg, type = "info") => {
    setGameLog(prev => [...prev, { msg, type }]);
  };

  const addPrivateLog = (msg, type = "info") => {
    setPrivateLog(prev => [...prev, { msg, type }]);
  };

  const addColoredLog = (playerIndex, playerName, action) => {
    const coloredName = `<span class="player${playerIndex + 1}">${playerName}</span>`;
    addLog(`${coloredName} ${action}`, "action");
  };

  // Función para cambiar de turno
  const nextTurn = () => {
    if (playerOrder.length === 0) return;
    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    const nextIndex = (currentIndex + 1) % playerOrder.length;
    setCurrentPlayer(playerOrder[nextIndex].username);
    setCont(timeturn);
    const nextName = playerOrder[nextIndex].username;
    const nextClass = `player${nextIndex + 1}`;
    addLog(`🔁 Turn of <span class="${nextClass}">${nextName}</span>`, "turn");
  };

  // Función para descartar carta
  const handleDiscard = () => {
    if (isSpectator) {
      addPrivateLog("ℹ️ Spectators cannot discard cards", "warning");
      return;
    }

    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    if (loggedInUser.username !== currentPlayer) {
      addPrivateLog("⚠️ It's not your turn!", "warning");
      return;
    }
    if (deckCount > 0) {
      setDeckCount(p => p - 1);
      nextTurn();
      setCont(timeturn);
      addColoredLog(
        currentIndex,
        playerOrder[currentIndex].username,
        `🎴 Discarded a card. ${deckCount - 1} cards left in the deck.`
      );
    } else {
      addLog("⛔No more cards left in the deck!", "warning");
    }
  };

  // Función para enviar mensajes
  const postMessage = async (content, activePlayerUsername, chatId) => {
    try {
      console.log('Enviando mensaje:', { activePlayerUsername, content, chatId });
      const response = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          content: content,
          activePlayer: activePlayerUsername,
          chat: chatId,
        }),
      });

      if (response.ok) {
        console.log('Mensaje enviado correctamente');
      } else {
        const errorText = await response.text();
        console.error('Error to send a message:', errorText);
        toast.error('Error to send a message');
      }
    } catch (error) {
      console.error('Network error while sending message:', error);
      toast.error('Network error. Could not send the message.');
    }
  };

  const SendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    const messagePrefix = isSpectator ? '[]' : '';
    const finalMessage = messagePrefix + trimmedMessage;

    if (!isSpectator && !loggedActivePlayer) {
      toast.error('Cannot identify your active player');
      console.error('ActivePlayer no disponible para el usuario:', loggedInUser.username);
      return;
    }

    const activePlayerUsername = isSpectator
      ? loggedInUser.username
      : (loggedActivePlayer?.username
        ?? loggedActivePlayer?.player?.user?.username
        ?? loggedActivePlayer?.player?.username);

    if (!activePlayerUsername) {
      toast.error('Cannot identify your username');
      console.error('Username no encontrado. isSpectator:', isSpectator, 'loggedActivePlayer:', loggedActivePlayer);
      return;
    }

    const chatId = chat?.id ?? chat ?? game?.chat?.id ?? game?.chatId;

    if (!chatId) {
      toast.error('Cannot identify the game chat');
      console.error('Chat ID no encontrado. chat state:', chat, 'game:', game);
      return;
    }

    setMessage(prev => [...prev, { author: loggedInUser.username, text: finalMessage }]);
    await postMessage(finalMessage, activePlayerUsername, chatId);
    setNewMessage('');
  };

  // Efectos
  useEffect(() => {
    fetchCards();
    loadActivePlayers();
    getChat();
    fetchAndSetLoggedActivePlayer();

    async function handlerounds() {
      const irounds = game?.rounds?.length || 0;
      if (irounds <= 0) {
        setNumRound(1);
      }
    }
    handlerounds();

    if (isSpectator) {
      addLog('📥Entering as <span style="color: #2313b6ff;">SPECTATOR</span>. Restriction applies, you can only watch de game!', 'info');
      toast.info('Spectator mode activated✅');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activePlayers.length > 1) {
      const res = [...activePlayers].sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
      setPlayerOrder(res);
      setCurrentPlayer(res[0].username);
      console.log('ORDEN ACTUALIZADO', res);
    }
  }, [activePlayers]);

  useEffect(() => {
    if (boardGridRef.current) {
      const scrollHeight = boardGridRef.current.scrollHeight;
      const clientHeight = boardGridRef.current.clientHeight;
      const centerScroll = (scrollHeight - clientHeight) / 2;
      boardGridRef.current.scrollTop = centerScroll;
    }
  }, [boardCells]);

  useEffect(() => {
    const fetchCompleteGame = async () => {
      if (!game?.id) return;

      try {
        const response = await fetch(`/api/v1/games/${game.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          }
        });

        if (response.ok) {
          const completeGame = await response.json();
          setGame(completeGame);
          console.log('Game completo cargado:', completeGame);
        }
      } catch (error) {
        console.error('Error al cargar el game completo:', error);
      }
    };

    fetchCompleteGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activePlayers.length > 0) {
      const rolesAssigned = assignRolesGame(activePlayers);
      setPlayerRol(rolesAssigned);
    }
  }, [activePlayers]);

  useEffect(() => {
    const time = setInterval(() => {
      setCont(p => {
        if (p <= 1) {
          nextTurn();
          return timeturn;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, playerOrder]);

  useEffect(() => {
    if (activePlayers.length > 0) {
      const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
      const initialDeck = calculateInitialDeck(activePlayers.length, cardsPerPlayer);
      setDeckCount(initialDeck);
      setCardPorPlayer(cardsPerPlayer);
    }
  }, [activePlayers]);

  
  //Console log rotated and non-rotated cards
  useEffect(() => {
    
    console.log('Rotated Cards:', rotatedOnly);
    console.log('Non-Rotated Cards:', nonRotatedOnly);

  }, [ListCards]);

  // Render
  return (
    <div className="board-container">
      <div className="logo-container">
        <img src="/logo1-recortado.png" alt="logo" className="logo-img1" />
      </div>

      <PlayerCards 
        game={game} 
        ListCards={ListCards} 
        activePlayers={activePlayers} 
        postDeck={postDeck} 
        findActivePlayerUsername={findActivePlayerUsername} 
        CardPorPlayer={CardPorPlayer} 
        isSpectator={isSpectator} 
      />
      
      <SpectatorIndicator isSpectator={isSpectator} />

      <PlayerRole 
        playerRol={playerRol} 
        loggedInUser={loggedInUser} 
        isSpectator={isSpectator} 
      />

      <GameControls
        deckCount={deckCount}
        formatTime={formatTime}
        cont={cont}
        numRound={numRound}
        handleDiscard={handleDiscard}
        isSpectator={isSpectator}
      />

      <GameBoard
        boardCells={boardCells}
        boardGridRef={boardGridRef}
        handleCellClick={handleCellClick}
        ListCards={ListCards}
      />

      <div className="turn-box">🔴 · TURNO DE {currentPlayer}</div>

      <PlayersList 
        activePlayers={activePlayers} 
        CardPorPlayer={CardPorPlayer} 
      />

      <GameLog gameLog={gameLog} privateLog={privateLog} />

      <ChatBox
        message={message}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        SendMessage={SendMessage}
        isSpectator={isSpectator}
      />
    </div>
  );
}
