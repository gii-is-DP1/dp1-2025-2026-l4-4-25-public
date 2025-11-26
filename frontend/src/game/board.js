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
import useWebSocket from "../hooks/useWebSocket";


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
  console.log('Render Board. currentPlayer:', currentPlayer);
  const [cont, setCont] = useState(timeturn);
  const [gameLog, setGameLog] = useState([]);
  const [logData, setLogData] = useState(null);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [playerRol, setPlayerRol] = useState([]);
  const [privateLog, setPrivateLog] = useState([]);
    //  ESTADOS DE LAS HERRAMIENTAS, DICCIONARIO {username:{candle:true,wagon:true,pickaxe:true}}
  const [playerTools, setPlayerTools] = useState({});
  //round del navigate
  const [round, setRound] = useState(location.state?.round || null);
  
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

  const hasPatchedBoardBusy = useRef(false);
  const lastLoggedTurn = useRef(null);
  const lastPlacedLog = useRef({ player: null, row: null, col: null, ts: 0 });
  const lastObjectiveHideLog = useRef(0);
  const lastCollapseLog = useRef(0);
  const seenPrivateMessages = useRef(new Set());

  const boardGridRef = useRef(null);
  const processingAction = useRef(false);
  const isTurnChanging = useRef(false);

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
    deck,
    squaresById,
    patchSquare,
    pactchBoard,
    getBoard,
    getSquareByCoordinates,
    getLog,
    patchLog,
    getmessagebychatId
  } = useGameData(game);

  
    const rotatedOnly = getRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    const nonRotatedOnly = getNonRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    
    const boardId = typeof round?.board === 'number' ? round.board : round?.board?.id;
    const boardMessage = useWebSocket(`/topic/game/${boardId}`);
    //const gameMessage = useWebSocket(`/topic/game/${game?.id}`);

    useEffect(() => {
      if(!boardMessage) return;

      console.log("WS recibido:", boardMessage);
      console.log("Keys del mensaje WS:", Object.keys(boardMessage));
      const {action} = boardMessage;

      switch(action){
        case "CARD_PLACED":
          handleWsCardPlaced(boardMessage);
          break;

        case "CARD_DESTROYED":
          handleWsCardDestroyed(boardMessage);
          break;
        
        default:
          console.warn("WS action unrecognized:", action);
      }
    },[boardMessage]);

    // Depuración usuarios duplicados
    useEffect(() => {
        console.log("activePlayers en Board:", activePlayers);
    }, [activePlayers]);

    useEffect(() => {
      console.log("playerOrder:", playerOrder);
    }, [playerOrder]);
    /*useEffect(() => {
      if(!gameMessage) return;
      const { action } = gameMessage;
      if(action === "TURN_CHANGED") setCurrentPlayer(gameMessage.nextPlayer);
    }, [gameMessage]);
  */
    //Modularizar estas funciones
    const handleWsCardPlaced = ({row, col, card, player})=>{
      const actor = player || currentPlayer || 'unknown';
      const now = Date.now();
      const sameAsLast =
        lastPlacedLog.current &&
        lastPlacedLog.current.row === row &&
        lastPlacedLog.current.col === col &&
        now - lastPlacedLog.current.ts < 1500;

      if (sameAsLast) return;
      lastPlacedLog.current = { player: actor, row, col, ts: now };

      setBoardCells(prev => {
        const next = prev.map(r => r.slice());
        next[row][col] = {
          ...card,
          type: "tunnel",
          owner: player,
          placedAt: Date.now(),
          occupied: true
        };
        return next;
      });
      addLog(`<b>${actor}</b> placed a card at (${row}, ${col})`, "action");
    }

    const handleWsCardDestroyed = ({ row, col, player }) => {
      setBoardCells(prev => {
          const next = prev.map(r => r.slice());
          next[row][col] = null;
          return next;
      });
    };

    // HASTA AQUÍ LAS FUNCIONES A MODULARIZAR (LAS QUE USA EL USEFFECT DEL WEBSOCKET)
    
    const handleCardDrop = async (row, col, card, cardIndex, squareId) => {
    if (processingAction.current) return;
    processingAction.current = true;

    try {
      if (isSpectator) {
        addPrivateLog("Spectators cannot place cards", "warning");
        return;
      }

      const boardId = typeof round?.board === 'number' ? round.board : round?.board?.id;

      if (loggedInUser.username !== currentPlayer) {
        toast.warning("It's not your turn!");
        return;
      }
      setCont(timeturn);

      // If squareId is not provided, fetch it by coordinates
      let actualSquareId = squareId;
      if (!actualSquareId) {
        const square = await getSquareByCoordinates(boardId, col, row);
        if (square) {
          actualSquareId = square.id;
        } else {
          toast.error('Could not find square at this position');
          return;
        }
      }

      patchSquare(actualSquareId, {
        occupation: true,
        card: card?.id || card,
        board: boardId,
      });

      setBoardCells(prev => {
        const next = prev.map(r => r.slice());
        next[row][col] = {
          ...prev[row][col],
          ...card,
          type: 'tunnel',
          owner: loggedInUser?.username || 'unknown',
          placedAt: Date.now(),
          occupied: true,
        };
        return next;
      });

      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(cardIndex);
      }
      setDeckCount(prev => Math.max(0, prev - 1));
      toast.success(`Card placed in (${row}, ${col})! ${deckCount > 1 ? 'Drew new card.' : 'No more cards in deck.'}`);
      nextTurn();
    } finally {
      processingAction.current = false;
    }
  };

const handleActionCard = (card, targetPlayer, cardIndex) => {
    if (processingAction.current) return;
    processingAction.current = true;
    try {
      setCont(timeturn);
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
    } finally {
      processingAction.current = false;
    }
  };

  const handleMapCard = (card, objectivePosition, cardIndex) => {
    if (processingAction.current) return;
    processingAction.current = true;
    try {
      if (isSpectator) {
        addPrivateLog("ℹ️ Spectators cannot use this", "warning");
        return;}
      setCont(timeturn);

      const objectiveCardType = objectiveCards[objectivePosition];
      console.log(`🔍 Revealing objective at ${objectivePosition}: ${objectiveCardType}`);
      setRevealedObjective({ position: objectivePosition, cardType: objectiveCardType }); // Solo para el jugador que usa la carta
      toast.info(`🔍 Revealing objective... Look at the board!`);
      setTimeout(() => {
        setRevealedObjective(null);
        const now = Date.now();
        if (now - lastObjectiveHideLog.current > 2000) {
          addPrivateLog('🔍 Objective card hidden again', 'info');
          lastObjectiveHideLog.current = now;
        }
      }, 5000);

      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(cardIndex);}

      setDeckCount(prev => Math.max(0, prev - 1));
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      addColoredLog(currentIndex,currentPlayer,`🗺️ Used a map card to reveal an objective`);
      
      nextTurn();
    } finally {
      processingAction.current = false;
    }
  };

const activateCollapseMode = (card, cardIndex) => {
    setCollapseMode({ active: true, card, cardIndex });
    toast.info('💣Click on a tunnel card to destroy it');
    const now = Date.now();
    if (now - lastCollapseLog.current > 2000) {
      addPrivateLog('💣Click on a tunnel card in the board to destroy it', 'info');
      lastCollapseLog.current = now;
    }
  };

  const handleCellClick = (row, col) => {
    // Solo permitir clicks si el modo colapso está activo
    if (!collapseMode.active) {
      return;
    }
    
    if (processingAction.current) return;
    processingAction.current = true;

    const cell = boardCells[row][col];
    console.log('Contenido:', cell);
    
    if (!cell || cell.type === 'start' || cell.type === 'objective') { // No permitir destruir cartas iniciales u objetivos
      processingAction.current = false;
      return;}
    
    if (cell.type !== 'tunnel') {
      toast.warning('🔴You can only destroy tunnel cards');
      processingAction.current = false;
      return;}

    setCont(timeturn);
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
      processingAction.current = false;
    }, 800);
  };

  useEffect(() => {
    window.activateCollapseMode = activateCollapseMode;
    return () => {
      delete window.activateCollapseMode;
    };
  }, []);

  // Funciones de logs
  const addLog = (msg, type = "info") => {
    appendAndPersistLog(msg, type);
  };

  // Private log deshabilitado
  const addPrivateLog = () => {};

  const addColoredLog = (playerIndex, playerName, action) => {
    const coloredName = `<span class="player${playerIndex + 1}">${playerName}</span>`;
    addLog(`${coloredName} ${action}`, "action");
  };

  // Funci?n para cambiar de turno
  const nextTurn = ({ force = false } = {}) => {
    if (isTurnChanging.current && !force) return false;
    if (playerOrder.length === 0) return false;

    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeCurrentIndex + 1) % playerOrder.length;
    const nextName = playerOrder[nextIndex].username;
    const nextClass = `player${nextIndex + 1}`;

    isTurnChanging.current = true;
    setTimeout(() => { isTurnChanging.current = false; }, 500);

    setCurrentPlayer(nextName);
    setCont(timeturn);
    if (lastLoggedTurn.current !== nextName) {
      addLog(`Turn of <span class="${nextClass}">${nextName}</span>`, "turn");
      lastLoggedTurn.current = nextName;
    }
    return true;
  };



  // Función para descartar carta
  const handleDiscard = () => {
    if (processingAction.current) return;
    processingAction.current = true;
    try {
      if (isSpectator) {
        toast.info("🔍 Spectators cannot discard cards");
        //addPrivateLog("ℹ️ Spectators cannot discard cards", "warning");
        return;
      }

      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      if (loggedInUser.username !== currentPlayer) {
        toast.warning("It's not your turn!");
        return;
      }
      setCont(timeturn);
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
    } finally {
      processingAction.current = false;
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

  const resolveActivePlayerUsername = () => {
    if (isSpectator) return loggedInUser?.username;
    return loggedActivePlayer?.username
      ?? loggedActivePlayer?.player?.user?.username
      ?? loggedActivePlayer?.player?.username;
  };

  const chatIdFromState = () => chat?.id ?? chat ?? game?.chat?.id ?? game?.chatId;

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

    const activePlayerUsername = resolveActivePlayerUsername();

    if (!activePlayerUsername) {
      toast.error('Cannot identify your username');
      console.error('Username no encontrado. isSpectator:', isSpectator, 'loggedActivePlayer:', loggedActivePlayer);
      return;
    }

    const chatId = chatIdFromState();

    if (!chatId) {
      toast.error('Cannot identify the game chat');
      console.error('Chat ID no encontrado. chat state:', chat, 'game:', game);
      return;
    }

    setMessage(prev => [...prev, { author: loggedInUser.username, text: finalMessage }]);
    await postMessage(finalMessage, activePlayerUsername, chatId);
    setNewMessage('');
  };

  const appendAndPersistLog = async (msg, type = "info") => {
    setGameLog(prev => [...prev, { msg, type }]);

    const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
    console.log('Log ID para persistencia:', logId);
    const roundId = typeof round?.id === 'number' ? round.id : round?.round?.id;

    const nextMessages = [...(logData?.messages || []), msg];

    if (logId && roundId) {
      setLogData(prev => ({
        ...(prev || {}),
        id: logId,
        messages: nextMessages
      }));
      patchLog(logId, { round: roundId, messages: nextMessages });
    }
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
    const fetchLogForRound = async () => {
      const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
      if (!logId) return;

      const log = await getLog(logId);
      if (log) {
        setLogData(log);
        const mapped = (log.messages || []).map(m => ({ msg: m, type: "info" }));
        setGameLog(mapped);
      }
    };

    fetchLogForRound();
  }, [round]);

  useEffect(() => {
    console.log('useEffect [activePlayers] triggered. activePlayers:', activePlayers);
    if (activePlayers.length > 1) {
      const res = [...activePlayers].sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
      setPlayerOrder(res);
      
      setCurrentPlayer(prev => {
        if (prev && res.find(p => p.username === prev)) {
          return prev;
        }
        return res[0].username;
      });
      
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
          const changed = nextTurn({ force: true });
          return changed ? timeturn : 0;
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

  
  //asociar el board con los squares usando getBoard para asegurar busy
  useEffect(() => {
    if (!round || !round.board || !squaresById) return;

    const loadBoard = async () => {
      const boardId = typeof round.board === 'number' ? round.board : round.board.id;
      if (!boardId) return;

      let busyIds = [];
      if (Array.isArray(round.board.busy) && round.board.busy.length > 0) {
        busyIds = round.board.busy;
      } else {
        const boardData = await getBoard(boardId);
        busyIds = (boardData?.busy || []).map(sq => sq.id ?? sq);
      }

      const baseBoard = Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => null)
      );
      baseBoard[4][1] = { type: 'start', owner: 'system', fixed: true };
      baseBoard[4][9] = { type: 'objective', owner: 'system', fixed: true };
      baseBoard[2][9] = { type: 'objective', owner: 'system', fixed: true };
      baseBoard[6][9] = { type: 'objective', owner: 'system', fixed: true };

      await Promise.all(
        busyIds.map(async (squareId) => {
          const sq = await squaresById(squareId);
          if (!sq) return;

          const row = sq.coordinateY;
          const col = sq.coordinateX;
          if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
            const existing = baseBoard[row][col];
            const isSpecial = existing && (existing.type === 'start' || existing.type === 'objective');
            if (isSpecial) {
              return; //Las cartas objetivo y de inicio no se sobreescriben
            }

            const cardFromBackend = sq.card;
            if (!cardFromBackend) {
              return; // Se deja la celda como null si no hay carta,
            }
            const fullCard =
              cardFromBackend?.image
                ? cardFromBackend
                : (ListCards || []).find(c => c.id === cardFromBackend?.id) || cardFromBackend;

            baseBoard[row][col] = {
              squareId: sq.id,
              backendType: sq.type,
              occupied: sq.occupation,
              card: fullCard,
              type: sq.type || fullCard?.type || (fullCard ? 'tunnel' : undefined),
              image: fullCard?.image,
              rotation: fullCard?.rotation,
            };
          }
        })
      );

      setBoardCells(baseBoard);
      if (busyIds.length > 0) {
        pactchBoard(boardId, { busy: busyIds });
      }
    };

    loadBoard();
  }, [round, ListCards]);

   //Hace un pacth cada vez que se cambia que hay un cambio en una square
  useEffect(() => {
    if (!round?.board) return;

    const busySquareIds = boardCells
      .flat()
      .filter(cell => cell && cell.squareId && cell.type !== 'start' && cell.type !== 'objective') //que no sean ni final ni objetivo
      .map(cell => cell.squareId);

    if (!hasPatchedBoardBusy.current && busySquareIds.length === 0) {
      return;
    }

    hasPatchedBoardBusy.current = true;
    pactchBoard(round.board, { busy: busySquareIds });
    console.log("he hecho este patch")
  }, [boardCells, round]);

  useEffect(() => {
  const fetchChatMessages = async () => {
    const chatId = chat?.id ?? chat ?? game?.chat?.id ?? game?.chatId;
    
    if (!chatId) {
      return;
    }

    try {
      const messages = await getmessagebychatId(chatId);
      console.log('Mensajes obtenidos:', messages);
      
      if (Array.isArray(messages)) {
        const formattedMessages = messages.map(msg => {
          // Extraer username de diferentes estructuras posibles
          let author = 'Unknown';
          
          if (msg.activePlayer?.player?.user?.username) {
            author = msg.activePlayer.player.user.username;
          } else if (msg.activePlayer?.player?.username) {
            author = msg.activePlayer.player.username;
          } else if (msg.activePlayer?.username) {
            author = msg.activePlayer.username;
          } else if (typeof msg.activePlayer === 'string') {
            author = msg.activePlayer;
          }
          
          return {
            author: author,
            text: msg.content || ''
          };
        });
        
        console.log('Mensajes formateados:', formattedMessages);
        setMessage(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  // Fetch inicial
  fetchChatMessages();

  // Polling cada 1 segundo
  const pollInterval = setInterval(fetchChatMessages, 1000);

  // Cleanup al desmontar
  return () => clearInterval(pollInterval);
}, [chat, game]); 


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