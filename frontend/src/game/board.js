import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
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
import RoundEndModal from './components/RoundEnd';

// Utilidades
import { assignRolesGame, calculateSaboteurCount, formatTime, calculateCardsPerPlayer, calculateInitialDeck, getRotatedCards, getNonRotatedCards } from './utils/gameUtils';
import { handleActionCard as handleActionCardUtil } from './utils/actionCardHandler';
import { checkRoundEnd, distributeGold } from './utils/roundEndLogic';
import saboteurRol from './cards-images/roles/saboteurRol.png';
import minerRol from './cards-images/roles/minerRol.png';

// Hooks personalizados
import { useGameData } from './hooks/useGameData';

// Estilos
import '../App.css';
import '../static/css/home/home.css';
import '../static/css/game/game.css';
import useWebSocket from "../hooks/useWebSocket";


const jwt = tokenService.getLocalAccessToken();
const timeturn = 10;

// Obtener datos iniciales fuera del componente para evitar problemas con re-renders
const getSavedRoundData = () => {
  const savedData = sessionStorage.getItem('newRoundData');
  if (savedData) {
    sessionStorage.removeItem('newRoundData');
    return JSON.parse(savedData);
  }
  return null;
};

const savedRoundData = getSavedRoundData();

export default function Board() {
  const location = useLocation();
  const loggedInUser = tokenService.getUser();

  // Usar datos guardados o los de location.state
  const initialState = savedRoundData || {
    game: location.state?.game,
    round: location.state?.round || null,
    isSpectator: location.state?.isSpectator || false
  };
  
  console.log('initialState:', initialState);

  // Estados principales
  const [isSpectator] = useState(initialState.isSpectator);
  const [CardPorPlayer, setCardPorPlayer] = useState(0);
  const [deckCount, setDeckCount] = useState(60);
  const [game, setGame] = useState(initialState.game);
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState(initialState.round?.roundNumber || '1');
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
  const [round, setRound] = useState(initialState.round);
  
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

  // Estado para el modal de fin de ronda
  const [roundEndData, setRoundEndData] = useState(null);
  const [roundEndCountdown, setRoundEndCountdown] = useState(10);
  const navigate = useNavigate();

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
  const lastPublishedRoles = useRef([]);
  const roleNotificationShown = useRef(false);

  const boardGridRef = useRef(null);
  const processingAction = useRef(false);
  const isTurnChanging = useRef(false);
  const isNavigatingToNewRound = useRef(false);
  const roundEndedRef = useRef(false);

  const lastTurnToast = useRef({username: null, ts: 0}); 
  const lastTimeoutToastTs = useRef(0);
  const lastReceivedTurnKey = useRef({ key: null, ts: 0 });


  // Hook personalizado para cargar datos del juego
  const {
    ListCards,
    activePlayers,
    postDeck,
    getDeck,
    patchDeck,
    fetchOtherPlayerDeck,
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
    getmessagebychatId,
    patchActivePlayer,
    patchRound,
    postRound
  } = useGameData(game);

  
    const rotatedOnly = getRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    const nonRotatedOnly = getNonRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    
    const boardId = typeof round?.board === 'number' ? round.board : round?.board?.id;
    const boardMessage = useWebSocket(`/topic/game/${boardId}`);
    const gameMessage = useWebSocket(`/topic/game/${game?.id}`);

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

    useEffect(()=>{
      if(!gameMessage) return; 
      console.log("WS Partida:", gameMessage); 
      const {action} = gameMessage; 
      switch (action) {
      case "TURN_CHANGED":
        handleWsTurnChanged(gameMessage);
        break;

      case "TOOLS_CHANGED":
        handleWsToolsChanged(gameMessage);
        break;
      case "GAME_FINISHED": // Por si implementamos esto luego
        // handleGameFinished(gameMessage);
        break;

      default:
        break;
    }
    },[gameMessage])
    // Depuración usuarios duplicados
    useEffect(() => {
        console.log("activePlayers en Board:", activePlayers);
    }, [activePlayers]);

    useEffect(() => {
      console.log("playerOrder:", playerOrder);
    }, [playerOrder]);
   
    
    //Modularizar estas funciones
    const handleWsCardPlaced = ({row, col, card, player, squareId})=>{
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
          occupied: true,
          squareId: squareId
        };
        return next;
      });
      addLog(`<b>${actor}</b> placed a card at (${row}, ${col})`, "action");
    }

    const handleWsCardDestroyed = ({ row, col, player }) => {

      // 1. Activar animación visual
      setDestroyingCell({ row, col });

      // 2. Después de la animación, eliminar la carta visualmente
      setTimeout(() => {
        setBoardCells(prev => {
          const next = prev.map(r => r.slice());
          next[row][col] = null;
          return next;
        });

        // limpiar estado visual
        setDestroyingCell(null);

      }, 800); 
    };

    const handleWsTurnChanged = async (message) =>{
      const payload = message.newTurnIndex !== undefined ? message : JSON.parse(message.body || "{}");
      const { newTurnIndex, roundId, leftCards } = payload;
      console.log("🔄 WS Turn Change:", newTurnIndex);

      const turnKey = `${roundId}:${newTurnIndex}`;
      const now = Date.now();
      if (lastReceivedTurnKey.current.key === turnKey && (now - lastReceivedTurnKey.current.ts) < 2000) {
          console.log("Ignored duplicate TURN_CHANGED:", turnKey);
          return;
      }
      lastReceivedTurnKey.current = { key: turnKey, ts: now };

      setRound(prev => ({ ...prev, id: roundId, turn: newTurnIndex }));

      if(leftCards !== undefined && leftCards !== null){
        setDeckCount(leftCards);
      }

      if (playerOrder && playerOrder.length > 0) {
      // Aseguramos que el índice sea válido usando el módulo
        const safeIndex = newTurnIndex % playerOrder.length;
        const nextPlayerObj = playerOrder[safeIndex];

        if (nextPlayerObj) {
          const nextUsername = nextPlayerObj.username;
          const nextClass = `player${safeIndex + 1}`; // Clase CSS para el color

          setCurrentPlayer(nextUsername);
        
          setCont(timeturn);

          if (lastLoggedTurn.current !== nextUsername) {
            addLog(`Turn of <span class="${nextClass}">${nextUsername}</span>`, "turn");
            lastLoggedTurn.current = nextUsername;
          }

          if (nextUsername === loggedInUser.username) {
            const now2 = Date.now(); 
            const last = lastTurnToast.current;
            if (last.username !== nextUsername || (now2 - last.ts) > 3000) {
              toast.info("🎲 IT´S YOUR TURN! 🎲");
              lastTurnToast.current = { username: nextUsername, ts: now2 };
            } else {
              console.log("Skipped duplicate YOUR TURN toast for", nextUsername);
            }
          }
          await checkForRoundEnd(); 
        }
      }
    }; 

    const handleWsToolsChanged = (message) =>{
      const {username, tools} = message; 
      console.log(`🔧 Herramientas actualizadas para ${username}:`, tools);
      setPlayerTools(prev => ({
        ...prev,
        [username]:{
          pickaxe: tools.pickaxe,
          candle: tools.candle,
          wagon: tools.wagon
        }
      }));
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
      
      // Verificar si el jugador tiene alguna herramienta rota
      const currentPlayerTools = playerTools[loggedInUser.username];
      if (currentPlayerTools) {
        const hasBrokenTool = !currentPlayerTools.pickaxe || !currentPlayerTools.candle || !currentPlayerTools.wagon;
        if (hasBrokenTool) {
          toast.error("🔧 You can't place tunnel cards while you have a broken tool!");
          return;
        }
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
          squareId: actualSquareId,
        };
        return next;
      });

      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(cardIndex);
      }
      const newDeckCount = Math.max(0, deckCount - 1);
      setDeckCount(newDeckCount);
      toast.success(`Card placed in (${row}, ${col})! ${deckCount > 1 ? 'Drew new card.' : 'No more cards in deck.'}`);
      nextTurn({newDeckCount: newDeckCount});
      
      // Evaluar fin de ronda después de colocar carta (puede que se haya encontrado el oro)
      //checkForRoundEnd(); //Evaluar el checkForRoundEnd() solo en webSocket
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
      setDeckCount,
      activePlayers,
      patchActivePlayer,
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

      const newDeckCount = Math.max(0, deckCount - 1);
      setDeckCount(newDeckCount);
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      addColoredLog(currentIndex,currentPlayer,`🗺️ Used a map card to reveal an objective`);
      
      nextTurn({newDeckCount: newDeckCount});
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

  const handleCellClick = async (row, col) => {
  if (!collapseMode.active) return;
  if (processingAction.current) return;
  processingAction.current = true;

  const cell = boardCells[row][col];
  if (!cell || cell.type === 'start' || cell.type === 'objective') {
    processingAction.current = false;
    return;
  }
 
  if (cell.type !== 'tunnel') {
    toast.warning('🔴You can only destroy tunnel cards');
    processingAction.current = false;
    return;
  }

  setCont(timeturn);
  setDestroyingCell({ row, col });

  try {  
    if (cell.squareId) {
      patchSquare(cell.squareId, {
        occupation: false,
        card: null,
      });
    } else {
      console.error(`❌ ERROR CRÍTICO: Intentando destruir celda [${row},${col}] pero no tiene squareId. La petición al servidor se ha cancelado.`);
      toast.error("Error de sincronización: No se pudo destruir la carta en el servidor.");
      return; // Detenemos la ejecución para que no se borre visualmente si falló el server
    }

    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      next[row][col] = null; // eliminar carta localmente
      return next;
    });

    if (window.removeCardAndDraw) {
      window.removeCardAndDraw(collapseMode.cardIndex);
    }

    const newDeckCount = Math.max(0, deckCount - 1);
    setDeckCount(newDeckCount);

    const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
    addColoredLog(
      currentIndex,
      playerOrder[currentIndex].username,
      `💣 Destroyed a tunnel card at [${row},${col}]. ${newDeckCount} cards left in the deck.`
    );

    toast.success('Tunnel card destroyed!');
    setCollapseMode({ active: false, card: null, cardIndex: null });
    setDestroyingCell(null);
    nextTurn({newDeckCount: newDeckCount});
  } finally {
    processingAction.current = false;
  }
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

  // Función para cambiar de turno--->Ahora llama al PATCH de Round para modificar el atributo turno
  

  const nextTurn = ({ force = false, newDeckCount = null } = {}) => {
    if (isTurnChanging.current && !force) return false;
    if (playerOrder.length === 0) return false;

    isTurnChanging.current = true;
    setTimeout(() => { isTurnChanging.current = false; }, 1000);

    const currentTurnIndex = round?.turn || 0; 

    const nextIndex = (currentTurnIndex + 1)% playerOrder.length; 

    console.log(`Paso de turno (Backend): ${currentTurnIndex} -> ${nextIndex}`);
    try{
      if(round && round.id){
        const patchBody = {turn: nextIndex};
        //Mapear el newDeckCount al atributo de backend leftCards
        if(newDeckCount !== null){
          patchBody.leftCards = newDeckCount; 
        }

        patchRound(round.id, patchBody);

      }else{
        console.error("No hay ID de ronda disponible");
      }
      //Ahora no hacemos el setCurrentPlayer aquí, esperamos a que el webSocket lo diga
      return true; 
    } catch(error){
      console.error("Error passing turn:", error);
      toast.error("Error al pasar turno.");
      isTurnChanging.current = false;
      return false;
    }
  };

  // Función para evaluar si la ronda ha terminado
  const checkForRoundEnd = async () => {
    // No verificar si ya terminó la ronda (usar ref para evitar problemas de closure)
    if (roundEndedRef.current) {
      return;
    }
    
    // No verificar fin de ronda si aún no hay deck creado (evita errores al inicio)
    if (!deck || !deck.id) {
      return;
    }
    
    const roundEndResult = await checkRoundEnd(boardCells, deckCount, activePlayers, objectiveCards);
    
    if (roundEndResult.ended) {
      roundEndedRef.current = true; // Marcar que la ronda terminó
      handleRoundEnd(roundEndResult);
    }
  };

  // Funcion para manejar el final de la última ronda
  const handleLastRoundEnd = (result) => {

  };

  // Función para manejar el final de ronda
  const handleRoundEnd = async (result) => {
    const { reason, winnerTeam, goldPosition } = result;
    
    // Mostrar mensaje de final de ronda
    if (reason === 'GOLD_REACHED') {
      addLog(`🏆 Round ended! The ${winnerTeam} found the gold at ${goldPosition}!`, 'success');
      
      if (revealedObjective?.position !== goldPosition) {
        setRevealedObjective({ position: goldPosition, cardType: 'gold' });
      }
    } else if (reason === 'NO_CARDS') {
      addLog(`🏆 Round ended! No more cards. ${winnerTeam} win!`, 'success');
    }

    // Distribuir pepitas de oro y obtener la distribución para el modal
    const winnerRol = winnerTeam === 'MINERS' ? false : true;
    const goldDistribution = await distributeGold(activePlayers, winnerRol);
    
    // Preparar datos de roles para el modal (p.rol es booleano: true = SABOTEUR, false = MINER)
    const playerRolesData = activePlayers.map(p => ({
      username: p.username,
      role: p.rol === true ? 'SABOTEUR' : 'MINER'
    }));
    
    // Resetear el flag de navegación para esta nueva ronda
    isNavigatingToNewRound.current = false;
    
    // Mostrar el modal de fin de ronda
    setRoundEndData({
      winnerTeam,
      reason,
      goldDistribution,
      playerRoles: playerRolesData
    });
    setRoundEndCountdown(10);
    
    // Actualizar el estado del round en el backend
    patchRound(round.id, { winnerRol: winnerRol });
    
    // Si es la ronda 3, manejar el final del juego
    if (round.roundNumber === 3) {
      handleLastRoundEnd(result);
      return;
    }
  };

  // Efect para manejar el countdown y la navegación a la nueva ronda
  useEffect(() => {
    if (!roundEndData) return;
    
    const interval = setInterval(() => {
      setRoundEndCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [roundEndData]); // Solo depende de roundEndData, no del countdown

  // Efecto separado para navegar cuando el countdown llega a 0
  useEffect(() => {
    if (!roundEndData || roundEndCountdown > 0) return;
    if (isNavigatingToNewRound.current) return; // Evitar múltiples navegaciones
    
    isNavigatingToNewRound.current = true;
    
    const createAndNavigateToNewRound = async () => {
      try {
        console.log('Creando nueva ronda...');
        const newRound = await postRound({ gameId: game.id, roundNumber: round.roundNumber + 1 });
        console.log('Nueva ronda creada:', newRound);
        
        if (newRound && newRound.id) {
          // Guardar datos en sessionStorage para recuperarlos después del reload
          sessionStorage.setItem('newRoundData', JSON.stringify({
            game: game,
            round: newRound,
            isSpectator: isSpectator
          }));
          
          // Navegar y forzar reload para reiniciar todo el estado
          window.location.href = `/board/${newRound.board}`;
        } else {
          console.error('Nueva ronda no tiene ID válido:', newRound);
          isNavigatingToNewRound.current = false;
        }
      } catch (error) {
        console.error('Error al crear nueva ronda:', error);
        toast.error('Error creating new round');
        isNavigatingToNewRound.current = false;
      }
    };
    
    createAndNavigateToNewRound();
  }, [roundEndCountdown]);

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
        const newDeckCount = Math.max(0, deckCount - 1);
        setDeckCount(newDeckCount);
        nextTurn({newDeckCount: newDeckCount});
        setCont(timeturn);
        addColoredLog(
          currentIndex,
          playerOrder[currentIndex].username,
          `🎴 Discarded a card and take one. ${newDeckCount} cards left in the deck.`);
        toast.success('Card discarded successfully!');
        
        // Evaluar fin de ronda después de descartar (puede que se hayan acabado las cartas)
        //checkForRoundEnd();
      } else {
        toast.warning("Please select a card to discard (right-click in the card)");}
    } finally {
      processingAction.current = false;
    }
  };

  // Función auxiliar para cuando se acaba el tiempo
  const handleTurnTimeOut = () => {
    // Evitamos llamar varias veces si ya se está procesando
    if (processingAction.current) return;
    // Evitamos toasts repetidos por timeout que puedan dispararse varias veces
    const now = Date.now();
      if ((now - lastTimeoutToastTs.current) > 3000) {
        toast.error("⌛ Time's up! Passing turn...");
        lastTimeoutToastTs.current = now;
      } else {
        console.log("Skipped duplicate Time's up toast");
      }
    nextTurn({ force: true });
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
    return loggedActivePlayer?.username;
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

    // Fetch inicial
    fetchLogForRound();

    // Polling cada 1 segundo para mantener el log actualizado
    const pollInterval = setInterval(fetchLogForRound, 1000);

    // Cleanup al desmontar
    return () => clearInterval(pollInterval);
  }, [round]);

  useEffect(() => {
    console.log('useEffect [activePlayers] triggered. activePlayers:', activePlayers);
    if (activePlayers.length > 1) {
      const res = [...activePlayers].sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
      setPlayerOrder(res);
      
      const initialTurnIndex = round?.turn || 0;
      const safeIndex = initialTurnIndex % res.length;
      const initialPlayerUsername = res[safeIndex].username;

      setCurrentPlayer(prev => {
        if (prev && res.find(p => p.username === prev)) {
          return prev;
        }
        return initialPlayerUsername;
      });
      
      console.log('ORDEN ACTUALIZADO', res);
    }
  }, [activePlayers, round]);

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
    if (activePlayers.length === 0) return;

    const initialTools = {};
    activePlayers.forEach(player => {
      initialTools[player.username] = {
        candle: player.candleState ?? true,
        wagon: player.cartState ?? player.wagon ?? true,
        pickaxe: player.pickaxeState ?? true
      };
    });
    setPlayerTools(initialTools);
    console.log('Herramientas inicializadas desde backend:', initialTools);

    let cancelled = false;

    const buildRolesFromBackend = () =>
      activePlayers
        .filter(player => typeof player.rol === 'boolean')
        .map(player => ({
          username: player.username,
          role: player.rol ? 'SABOTEUR' : 'MINER',
          roleImg: player.rol ? saboteurRol : minerRol,
          roleName: player.rol ? 'SABOTEUR' : 'MINER'
        }));

    const sameRoles = (prev, next) => {
      if (!Array.isArray(prev) || !Array.isArray(next)) return false;
      if (prev.length !== next.length) return false;
      const sortByUser = (arr) => [...arr].sort((a, b) => a.username.localeCompare(b.username));
      const a = sortByUser(prev);
      const b = sortByUser(next);
      return a.every((item, idx) => item.username === b[idx].username && item.role === b[idx].role);
    };

    const publishRoles = (rolesList) => {
      if (cancelled) return;
      if (sameRoles(lastPublishedRoles.current, rolesList)) return;

      lastPublishedRoles.current = rolesList.map(({ username, role }) => ({ username, role }));
      setPlayerRol(rolesList);
      if (isSpectator) return;

      // Solo mostrar notificación si no se ha mostrado antes
      if (!roleNotificationShown.current) {
        const currentPlayerRole = rolesList.find(p => p.username === loggedInUser.username);
        if (currentPlayerRole) {
          roleNotificationShown.current = true;
          setMyRole(currentPlayerRole);
          setShowRoleNotification(true);
          setTimeout(() => setShowRoleNotification(false), 5000);
        }
      }
    };

    const persistRoles = async (rolesList) => {
      const updates = rolesList
        .map(roleInfo => {
          const target = activePlayers.find(p => p.username === roleInfo.username);
          if (!target?.id) return null;
          return patchActivePlayer(target.id, { rol: roleInfo.role === 'SABOTEUR' });
        })
        .filter(Boolean);

      if (updates.length === 0) return;

      try {
        await Promise.all(updates);
        await loadActivePlayers();
      } catch (err) {
        console.error('Error al persistir roles:', err);
        toast.error('Error al guardar los roles asignados');
      }
    };

    const syncRoles = async () => {
      const expectedSaboteurs = calculateSaboteurCount(activePlayers.length);
      const backendRoles = buildRolesFromBackend();
      const saboteursAlready = backendRoles.filter(r => r.role === 'SABOTEUR').length;
      const rolesComplete =
        backendRoles.length === activePlayers.length &&
        saboteursAlready === expectedSaboteurs;

      if (rolesComplete) {
        publishRoles(backendRoles);
        return;
      }

      const rolesAssigned = assignRolesGame(activePlayers);
      publishRoles(rolesAssigned);
      await persistRoles(rolesAssigned);
    };

    syncRoles();

    return () => { cancelled = true; };
  }, [activePlayers]);

  useEffect(() => {
    if(!currentPlayer || playerOrder.length === 0) return;

    if(loggedInUser.username !== currentPlayer){
      setCont(timeturn);
      return; 
    }

    const time = setInterval(() => {
      setCont((prevCont) => {
        if (prevCont <= 1) {
          // El tiempo se ha acabado -> Forzamos cambio de turno
          clearInterval(time);
          handleTurnTimeOut(); 
          return 0;
        }
        return prevCont - 1;
      });
    }, 1000);

    return () => clearInterval(time);
  }, [currentPlayer, loggedInUser.username, playerOrder]);

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
      // No hacer patch del board.busy aquí - los squares ya están asociados al board desde el backend
    };

    loadBoard();
  }, [round?.id, ListCards]);

  // ELIMINADO: Este useEffect estaba causando que se borraran los squares del board
  // porque hacía PATCH con solo los squares ocupados, sobrescribiendo la lista completa

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

      {/* Modal de fin de ronda */}
      {roundEndData && (
        <RoundEndModal
          winnerTeam={roundEndData.winnerTeam}
          reason={roundEndData.reason}
          goldDistribution={roundEndData.goldDistribution}
          playerRoles={roundEndData.playerRoles}
          countdown={roundEndCountdown}
          roundNumber={round.roundNumber}
        />
      )}

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
        fetchOtherPlayerDeck={fetchOtherPlayerDeck}
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
