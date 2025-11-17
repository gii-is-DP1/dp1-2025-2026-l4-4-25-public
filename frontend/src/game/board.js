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
import { handleActionCard as handleActionCardUtil } from './utils/actionCardHandler';

// Hooks personalizados
import { useGameData } from './hooks/useGameData';

// Estilos
import '../App.css';
import '../static/css/home/home.css';
import '../static/css/game/game.css';

const jwt = tokenService.getLocalAccessToken();
const timeturn = 10;

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
    //  ESTADOS DE LAS HERRAMIENTAS, DICCIONARIO {username:{candle:true,wagon:true,pickaxe:true}}
  const [playerTools, setPlayerTools] = useState({});
  
  // Estados del tablero
  const BOARD_COLS = 11;
  const BOARD_ROWS = 9;
  const [collapseMode, setCollapseMode] = useState({ active: false, card: null, cardIndex: null });
  
  const [objectiveCards, setObjectiveCards] = useState(() => {
    const cards = ['gold', 'carbon_1', 'carbon_2'];
    const shuffled = cards.sort(() => Math.random() - 0.5);
    return {
      '[2][9]': shuffled[0],  
      '[4][9]': shuffled[1],  
      '[6][9]': shuffled[2]};});
  
  const [revealedObjective, setRevealedObjective] = useState(null);
  const [showRoleNotification, setShowRoleNotification] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [destroyingCell, setDestroyingCell] = useState(null); 

  const [boardCells, setBoardCells] = useState(() => {
    const initialBoard = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null)
    );
    initialBoard[4][1] = { type: 'start', owner: 'system', placedAt: Date.now() };
    initialBoard[4][9] = { type: 'objective', owner: 'system', placedAt: Date.now() };
    initialBoard[2][9] = { type: 'objective', placedAt: Date.now() };
    initialBoard[6][9] = { type: 'objective', placedAt: Date.now() };
    return initialBoard;
  });

  const boardGridRef = useRef(null);

  // Hook personalizado para cargar datos del juego
  const {
    ListCards,
    activePlayers,
    postDeck,
    getDeck,
    patchDeck,
    findActivePlayerUsername,
    loadActivePlayers,
    loggedActivePlayer,
    chat,
    getChat,
    fetchCards,
    fetchAndSetLoggedActivePlayer,
    deck
  } = useGameData(game);

  // Cartas Rotadas y No Rotadas
  const rotatedOnly = getRotatedCards(ListCards);
  const nonRotatedOnly = getNonRotatedCards(ListCards);

  const handleCardDrop = (row, col, card, cardIndex) => {
    if (isSpectator) {
      addPrivateLog("ℹ️ Spectators cannot place cards", "warning");
      return;}

    if (loggedInUser.username !== currentPlayer) {
      toast.warning("It's not your turn!");
      return;}

    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      next[row][col] = {
        ...card,
        type: 'tunnel',
        owner: loggedInUser?.username || 'unknown',
        placedAt: Date.now()
      };
      return next;
    });

    if (window.removeCardAndDraw) {
      window.removeCardAndDraw(cardIndex);}
    setDeckCount(prev => Math.max(0, prev - 1));
    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    addColoredLog(
      currentIndex,
      currentPlayer,
      `🃏 placed a tunnel card in (${row}, ${col})`);

    toast.success(`Card placed in (${row}, ${col})! ${deckCount > 1 ? 'Drew new card.' : '🔴No more cards in deck.'}`);
    nextTurn();};

  const handleActionCard = (card, targetPlayer, cardIndex) => {
    handleActionCardUtil(card, targetPlayer, cardIndex, {
      isSpectator,
      loggedInUser,
      currentPlayer,
      playerTools,
      setPlayerTools,
      addLog,
      addPrivateLog,
      nextTurn,
      setDeckCount
    });
  };

  const handleMapCard = (card, objectivePosition, cardIndex) => {
    if (isSpectator) {
      addPrivateLog("ℹ️ Spectators cannot use this", "warning");
      return;}

    const objectiveCardType = objectiveCards[objectivePosition];
    console.log(`🔍 Revealing objective at ${objectivePosition}: ${objectiveCardType}`);
    setRevealedObjective({ position: objectivePosition, cardType: objectiveCardType }); // Solo para el jugador que usa la carta
    toast.info(`🔍 Revealing objective... Look at the board!`);
    setTimeout(() => {
      setRevealedObjective(null);
      addPrivateLog('🔍 Objective card hidden again', 'info');
    }, 5000);

    if (window.removeCardAndDraw) {
      window.removeCardAndDraw(cardIndex);}

    setDeckCount(prev => Math.max(0, prev - 1));
    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    addColoredLog(currentIndex,currentPlayer,`🗺️ Used a map card to reveal an objective`);
    
    nextTurn();
  };

  const activateCollapseMode = (card, cardIndex) => {
    setCollapseMode({ active: true, card, cardIndex });
    toast.info('💣Click on a tunnel card to destroy it');
    addPrivateLog('💣Click on a tunnel card in the board to destroy it', 'info');
  };

  const handleCellClick = (row, col) => {
    // Solo permitir clicks si el modo colapso está activo
    if (!collapseMode.active) {
      return;
    }
    
    const cell = boardCells[row][col];
    console.log('Contenido:', cell);
    
    if (!cell || cell.type === 'start' || cell.type === 'objective') { // No permitir destruir cartas iniciales u objetivos
      return;}
    
    if (cell.type !== 'tunnel') {
      toast.warning('🔴You can only destroy tunnel cards');
      return;}
    setDestroyingCell({ row, col });
    setTimeout(() => {
      setBoardCells(prev => {
        const next = prev.map(r => r.slice());
        next[row][col] = null;
        return next;
      });
      
      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(collapseMode.cardIndex);
      }
      setDeckCount(prev => Math.max(0, prev - 1));
      
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      addColoredLog(currentIndex, playerOrder[currentIndex].username, `💣 Destroyed a tunnel card at [${row},${col}]. ${Math.max(0, deckCount - 1)} cards left in the deck.`);
      toast.success('Tunnel card destroyed!');
      setCollapseMode({ active: false, card: null, cardIndex: null });
      setDestroyingCell(null);
      nextTurn();
    }, 800);};

  useEffect(() => {
    window.activateCollapseMode = activateCollapseMode;
    return () => {
      delete window.activateCollapseMode;
    };
  }, []);

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
      toast.warning("It's not your turn!");
      return;
    }
    if (window.discardSelectedCard && window.discardSelectedCard()) {
      setDeckCount(p => Math.max(0, p - 1));
      nextTurn();
      setCont(timeturn);
      addColoredLog(
        currentIndex,
        playerOrder[currentIndex].username,
        `🎴 Discarded a card and take one. ${Math.max(0, deckCount - 1)} cards left in the deck.`);
      toast.success('Card discarded successfully!');
    } else {
      toast.warning("Please select a card to discard (right-click in the card)");}
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
  }, []);

  useEffect(() => {
    if (activePlayers.length > 0) {
      const rolesAssigned = assignRolesGame(activePlayers);
      setPlayerRol(rolesAssigned);
      if (!isSpectator) {
        const currentPlayerRole = rolesAssigned.find(p => p.username === loggedInUser.username);
        if (currentPlayerRole) {
          setMyRole(currentPlayerRole);
          setShowRoleNotification(true);
          setTimeout(() => {
            setShowRoleNotification(false);
          }, 5000);
        }
      }
      
      const initialTools = {};
      activePlayers.forEach(player => {
        initialTools[player.username] = {
          candle: true,
          wagon: true,
          pickaxe: true
        };});
      setPlayerTools(initialTools);
      console.log('Herramientas inicializadas (siempre tienen que estar a True):', initialTools);
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
  }, [currentPlayer, playerOrder]);

  useEffect(() => {
    if (activePlayers.length > 0) {
      const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
      const initialDeck = calculateInitialDeck(activePlayers.length, cardsPerPlayer);
      setDeckCount(initialDeck);
      setCardPorPlayer(cardsPerPlayer);
    }
  }, [activePlayers]);

  // useEffect utilizado para depurar y ver que los Squares se están cargando bien
  // /api/v1/squares
  useEffect(() => {
  const fetchSquares = async () => {
    try {
      const squaresResponse = await fetch(`/api/v1/squares`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`
        }
      });

      if (squaresResponse.ok) {
        const response = await squaresResponse.json();
        console.log("Squares:", response);
      } else {
        toast.error("Error al intentar obtener los Squares");
      }
    } catch (error) {
      console.error( error);
      toast.error(error.message);
    }}
    fetchSquares(); 

  }, []);
  // Render 
  return (
    <div className="board-container">
      {showRoleNotification && myRole && (
        <div className="role-notification-overlay">
          <div className="role-notification-card">
            <h2 className="role-notification-title">YOUR ROLE:</h2>
            <img 
              src={myRole.roleImg} 
              alt={myRole.roleName} 
              className="role-notification-image"
            />
            <p className="role-notification-name">{myRole.roleName}</p>
          </div>
        </div>)}

      <div className="logo-container">
        <img src="/logo1-recortado.png" alt="logo" className="logo-img1" />
      </div>

      <PlayerCards 
        game={game} 
        ListCards={ListCards} 
        activePlayers={activePlayers} 
        postDeck={postDeck} 
        getDeck={getDeck}
        patchDeck={patchDeck}
        findActivePlayerUsername={findActivePlayerUsername} 
        CardPorPlayer={CardPorPlayer} 
        isSpectator={isSpectator}
        onTunnelCardDrop={handleCardDrop}
        onActionCardUse={handleActionCard}
        onMapCardUse={handleMapCard}
        playerOrder={playerOrder}
        currentUsername={loggedInUser?.username}
        currentPlayer={currentPlayer}
        deckCount={deckCount}
        deck={deck}
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
        handleCardDrop={handleCardDrop}
        handleCellClick={handleCellClick}
        ListCards={ListCards}
        currentPlayer={currentPlayer}
        currentUsername={loggedInUser?.username}
        collapseModeActive={collapseMode.active}
        revealedObjective={revealedObjective}
        objectiveCards={objectiveCards}
        destroyingCell={destroyingCell}
      />

      <div className="turn-box">🔴 · TURN OF {currentPlayer}</div>

      <PlayersList 
        activePlayers={playerOrder} 
        CardPorPlayer={CardPorPlayer}
        onActionCardDrop={handleActionCard}
        isMyTurn={loggedInUser?.username === currentPlayer}
        currentUsername={loggedInUser?.username}
        playerTools={playerTools}
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
