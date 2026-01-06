import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service.js';

// Componentes
import PlayerCards from './components/PlayerCards';
import PlayerRole from './components/PlayerRole';
import SpectatorIndicator from './components/SpectatorIndicator';
import SpectatorRequestsInGame from './components/SpectatorRequestsInGame';
import GameControls from './components/GameControls';
import GameBoard from './components/GameBoard';
import PlayersList from './components/PlayersList';
import GameLog from './components/GameLog';
import ChatBox from './components/ChatBox';
import RoundEndModal from './components/RoundEnd';
import GameEnd from './components/GameEnd';
import LoadingScreen from './components/LoadingScreen';

// Utilidades
import { assignRolesGame, calculateSaboteurCount, formatTime, calculateCardsPerPlayer, calculateInitialDeck, getRotatedCards, getNonRotatedCards } from './utils/gameUtils';
import { handleActionCard as handleActionCardUtil } from './utils/actionCardHandler';
import { checkRoundEnd, distributeGold, resetToolsForNewRound } from './utils/roundEndLogic';
import { extractSpectatorRequests } from '../lobbies/games/utils/lobbyUtils';
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
  const navigate = useNavigate();
  const loggedInUser = tokenService.getUser();

  useEffect(() => {
    toast.dismiss();
    return () => {
      toast.dismiss();
    };
  }, []);

  if (location.state) {
    sessionStorage.removeItem('newRoundData');
  }

  const initialState = location.state ? {
    game: location.state.game,
    round: location.state.round || null,
    isSpectator: location.state.isSpectator || false
  } : savedRoundData || {
    game: null,
    round: null,
    isSpectator: false
  };

  // Estados principales
  const [isSpectator] = useState(initialState.isSpectator);
  const [CardPorPlayer, setCardPorPlayer] = useState(0);
  const [playerCardsCount, setPlayerCardsCount] = useState({});
  const [deckCount, setDeckCount] = useState(0);
  const [game, setGame] = useState(initialState.game);
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [numRound, setNumRound] = useState(initialState.round?.roundNumber || '1');
  const [currentPlayer, setCurrentPlayer] = useState();
  const [cont, setCont] = useState(timeturn);
  const [gameLog, setGameLog] = useState([]);
  const [logData, setLogData] = useState(null);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [playerRol, setPlayerRol] = useState([]);
  const [privateLog, setPrivateLog] = useState([]);
  const [playerTools, setPlayerTools] = useState({});
  const [round, setRound] = useState(initialState.round);
  const [roundEnded, setRoundEnded] = useState(false); 
  const BOARD_COLS = 11;
  const BOARD_ROWS = 9;
  const [collapseMode, setCollapseMode] = useState({ active: false, card: null, cardIndex: null });
  const [objectiveCards, setObjectiveCards] = useState({});
  const [revealedObjective, setRevealedObjective] = useState(null);
  const [showRoleNotification, setShowRoleNotification] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [destroyingCell, setDestroyingCell] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([{label: 'Loading Game Data', completed:false}, 
    {label: 'Loading Players', completed:false}, {label: 'Loading Board', completed:false}, {label: 'Loading Cards', completed:false}, 
    {label: 'Loading Chat', completed:false}, {label: 'Assigning Rols', completed:false}, {label: 'Initializing Game State', completed:false}]);

  const updateLoadingStep = (stepIndex, completed = true) => {
    setLoadingSteps(prev => {
      const up = [...prev];
      up[stepIndex].completed = completed;
      const completedCont = up.filter(s => s.completed).length;
      const progress = Math.round((completedCont/up.length)*100);
      setLoadingProgress(progress);
      return up})}; 

  const [roundEndData, setRoundEndData] = useState(null);
  const [roundEndCountdown, setRoundEndCountdown] = useState(10);
  const [gameEndData, setGameEndData] = useState(null);
  const [gameEndCountdown, setGameEndCountdown] = useState(10);
  const [spectatorRequests, setSpectatorRequests] = useState([]);
  const isCreator = game?.creator === loggedInUser?.username;

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
  const hasPatchedInitialLeftCards = useRef(false);
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
  const ROUND_STATE = {ACTIVE: 'ACTIVE', ENDING: 'ENDING', ENDED: 'ENDED'};
  const roundEndedRef = useRef(ROUND_STATE.ACTIVE);
  const lastRoundId = useRef(null);
  const forceRolesReassignment = useRef(false);
  const playersOutOfCardsLogged = useRef(new Set());

  useEffect(() => {
    console.log('🔄 useEffect round.id check - round?.id:', round?.id, 'lastRoundId.current:', lastRoundId.current);
    if (round?.id && round.id !== lastRoundId.current) {
      roundEndedRef.current = ROUND_STATE.ACTIVE;
      if (lastRoundId.current !== null) {
        forceRolesReassignment.current = true;
        console.log('🎭 Mark to reassign roles in new round');
      }
      playersOutOfCardsLogged.current.clear();
      hasPatchedInitialLeftCards.current = false;
      console.log('🔄 hasPatchedInitialLeftCards reset to false');
      lastRoundId.current = round.id;
    }
  }, [round?.id]);

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
    postRound,
    notifyRoundEnd
  } = useGameData(game);

  
    const rotatedOnly = getRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    const nonRotatedOnly = getNonRotatedCards(Array.isArray(ListCards) ? ListCards : []);
    const boardId = typeof round?.board === 'number' ? round.board : round?.board?.id;
    const boardMessage = useWebSocket(`/topic/game/${boardId}`);
    const gameMessage = useWebSocket(`/topic/game/${game?.id}`);
    const deckTopic = game?.id ? `/topic/game/${game.id}/deck` : null;
    console.log('- deckTopic:', deckTopic);
    const deckMessage = useWebSocket(deckTopic);
    
    console.log('-WebSocket states:', { boardMessage: boardMessage ? 'connected' : 'null', gameMessage: gameMessage ? 'connected' : 'null',  deckMessage: deckMessage ? 'connected' : 'null'});

    useEffect(() => {
      if(!boardMessage) return;
      const {action} = boardMessage;

      switch(action){
        case "CARD_PLACED":
          handleWsCardPlaced(boardMessage);
          if (boardMessage.goalReveals && Array.isArray(boardMessage.goalReveals)) {
            boardMessage.goalReveals.forEach(goal => {
              handleWsGoalRevealed(goal);
              
              if (goal.goalType === 'gold') {
                console.log('🏆 Gold revealed → blocking turn immediately');
                roundEndedRef.current = ROUND_STATE.ENDING;
                setRoundEnded(true);
              }
            });
          } 
          else if (boardMessage.goalReveal) {
            handleWsGoalRevealed(boardMessage.goalReveal);

            if (boardMessage.goalReveal.goalType === 'gold'){
              console.log('🏆 Gold revealed → blocking turn immediately');
              roundEndedRef.current = ROUND_STATE.ENDING;
              setRoundEnded(true);
            }
          }
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
      
      if (gameMessage.adminAction) {
        handleAdminAction(gameMessage);
        return;
      }

      const {action} = gameMessage; 
      switch (action) {
      case "TURN_CHANGED":
        handleWsTurnChanged(gameMessage);
        break;

      case "TOOLS_CHANGED":
        handleWsToolsChanged(gameMessage);
        break;
        
      case "NEW_ROUND":
        handleWsNewRound(gameMessage);
        break;
        
      case "ROUND_END":
        handleWsRoundEnd(gameMessage);
        break;
      
      default:
        break;
    }
    },[gameMessage])
    
    const lastProcessedDeckTs = useRef(null);

    if (deckMessage && deckMessage._ts !== lastProcessedDeckTs.current) {
      lastProcessedDeckTs.current = deckMessage._ts;
      
      if (deckMessage.action === "DECK_COUNT") {
        const { username, leftCards } = deckMessage;
        setTimeout(() => {
          setPlayerCardsCount(prev => ({
            ...prev,
            [username]: leftCards
          }));
          
          if (leftCards === 0 && !playersOutOfCardsLogged.current.has(username)) {
            playersOutOfCardsLogged.current.add(username);
            addLog(`🃏 ${username} has run out of cards!`, 'warning');
          }
        }, 0);
      }
    }
    
    useEffect(() => {
      const totalCards = Object.values(playerCardsCount).reduce((sum, count) => sum + count, 0);
      console.log('🔍 playerCardsCount changed:', playerCardsCount, 'totalCards:', totalCards);
      if (totalCards === 0 && roundEndedRef.current === ROUND_STATE.ACTIVE) {
        console.log('🔍 Calling checkForRoundEnd because totalCards === 0');
        checkForRoundEnd();
      }
    }, [playerCardsCount]);
    
    useEffect(() => {
    }, [playerOrder]);

    useEffect(() => {
      if (!isCreator || !game?.chat) return;
      
      let cancelled = false;
      
      const fetchSpectatorRequests = async () => {
        try {
          const res = await fetch(`/api/v1/messages/byChatId?chatId=${game.chat}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (!res.ok) return;
          
          const msgs = await res.json();
          const spectatorReqs = extractSpectatorRequests(msgs);
          
          if (!cancelled) {
            setSpectatorRequests(spectatorReqs);
          }
        } catch (error) {
          console.error('Error fetching spectator requests', error);
        }
      };

      fetchSpectatorRequests();
      const interval = setInterval(fetchSpectatorRequests, 5000);
      return () => { 
        cancelled = true; 
        clearInterval(interval); 
      };
    }, [isCreator, game?.chat, jwt]);
    
    const handleWsCardPlaced =  async ({row, col, card, player, squareId})=>{
      console.log('📥 WebSocket CARD_PLACED received:', { row, col, card, player, squareId });
      let fullCard = card;
      const cardId = typeof card === 'number' ? card : card?.id;
      
      if (cardId && Array.isArray(ListCards)) {
        const foundCard = ListCards.find(c => c.id === cardId);
        if (foundCard) {
          fullCard = {
            ...foundCard,
            ...card, 
            arriba: foundCard.arriba,
            abajo: foundCard.abajo,
            izquierda: foundCard.izquierda,
            derecha: foundCard.derecha,
            centro: foundCard.centro,
            image: foundCard.image
          };
          console.log('✅ Card found in ListCards:', fullCard);
        } else {
          console.warn('⚠️ Card not found in ListCards, using WS data');
        }
      }
      
      console.log('📥 Final card properties:', {
        id: fullCard?.id,
        image: fullCard?.image,
        arriba: fullCard?.arriba,
        abajo: fullCard?.abajo,
        izquierda: fullCard?.izquierda,
        derecha: fullCard?.derecha,
        centro: fullCard?.centro,
        rotacion: fullCard?.rotacion
      });
      
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
          ...fullCard,
          type: "tunnel",
          owner: player,
          placedAt: Date.now(),
          occupied: true,
          squareId: squareId,
          arriba: fullCard?.arriba,
          abajo: fullCard?.abajo,
          izquierda: fullCard?.izquierda,
          derecha: fullCard?.derecha,
          centro: fullCard?.centro
        };
        return next;
      });
      addLog(`<b>${actor}</b> placed a card at (${row}, ${col})`, "action");
    }

    const handleWsCardDestroyed = ({ row, col, player }) => {

      setDestroyingCell({ row, col });
      setTimeout(() => {
        setBoardCells(prev => {
          const next = prev.map(r => r.slice());
          next[row][col] = null;
          return next});
        setDestroyingCell(null);
      }, 800); 
    };

  const handleWsGoalRevealed = async ({ row, col, goalType }) => {
    console.log(`🎯 Received GOAL_REVEALED at (${row}, ${col}) type: ${goalType}`);
    const normalized = goalType; 
    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      
      if (next[row] && next[row][col]) {
        next[row][col] = {
          ...next[row][col], 
          revealed: true, 
          cardType: goalType.toLowerCase() 
        };
      }
      return next;
    });

    setObjectiveCards(prev => ({
      ...prev, 
      [`[${row}][${col}]`]: normalized
    }));
    
    addLog(`A goal card has been revealed at (${row}, ${col})!`, "action");
    if (goalType.toLowerCase() === 'gold') {
      console.log("🏆 GOLD DETECTED. Ending round immediately...");
      const mockResult = {
        ended: true,
        reason: 'GOLD_REACHED',
        winnerTeam: 'MINERS',
        goldPosition: `[${row}][${col}]`
      };
      await handleRoundEnd(mockResult);
    }
  };
  
    const handleAcceptSpectatorRequest = async (username) => {
      try {
        toast.success(`${username} accepted as spectator`);

        const acceptMessage = {
          content: `SPECTATOR_ACCEPTED:${username}:${game.id}`,
          activePlayer: loggedInUser.username,
          chat: game.chat
        };
        
        await fetch(`/api/v1/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(acceptMessage),
        });

        const msgsToDelete = spectatorRequests
          .filter(s => s.username === username)
          .map(s => s.messageId);
        
        if (msgsToDelete.length > 0) {
          await fetch('/api/v1/messages/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(msgsToDelete),
          });
        }
        
        setSpectatorRequests(prev => prev.filter(p => p.username !== username));
        
      } catch (err) {
        console.error(err);
        toast.error('Error to accept spectator request.');
      }
    };

    const handleDenySpectatorRequest = async (username) => {
      try {
        const denyMessage = {
          content: `SPECTATOR_DENIED:${username}:${game.id}`,
          activePlayer: loggedInUser.username,
          chat: game.chat
        };
        
        await fetch(`/api/v1/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(denyMessage),
        });

        const msgsToDelete = spectatorRequests
          .filter(s => s.username === username)
          .map(s => s.messageId);
        
        if (msgsToDelete.length > 0) {
          await fetch('/api/v1/messages/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(msgsToDelete),
          });
        }
        
        toast.info(`${username} spectator request denied`);
        setSpectatorRequests(prev => prev.filter(p => p.username !== username));
        
      } catch (err) {
        console.error(err);
        toast.error('Error to deny spectator request.');
      }
    };

    const handleAdminAction = (message) => {
      const {adminAction} = message;
      const currentUser = tokenService.getUser()?.username;

      if (adminAction.action === "FORCE_FINISH") {
        toast.error(`⚠️ Admin has deleted this game. Reason: ${adminAction.reason}`);
        setTimeout(() => {
          navigate('/lobby')}, 3000);

      } else if (adminAction.action === "PLAYER_EXPELLED") {
        if (adminAction.affectedPlayer === currentUser) {
          toast.error(`🚫 You have been expelled from this game. Reason: ${adminAction.reason}`);
          setTimeout(() => {
            navigate('/lobby')}, 3000);
        } else {
          toast.warning(`⚠️ Player ${adminAction.affectedPlayer} has been expelled by admin. Reason: ${adminAction.reason}`);
          if (message.game) {
            setGame(message.game)}}}
    };

    const handleWsTurnChanged = async (message) =>{
      if (roundEndedRef.current === ROUND_STATE.ENDING || roundEndedRef.current === ROUND_STATE.ENDED) {
        console.log('⛔ TURN_CHANGED ignored: round ended');
        return;
      }
      const payload = message.newTurnIndex !== undefined ? message : JSON.parse(message.body || "{}");
      const { newTurnIndex, roundId, leftCards } = payload;
      const turnKey = `${roundId}:${newTurnIndex}`;
      const now = Date.now();
      if (lastReceivedTurnKey.current.key === turnKey && (now - lastReceivedTurnKey.current.ts) < 2000) {
          return;
      }
      lastReceivedTurnKey.current = { key: turnKey, ts: now };

      setRound(prev => ({ ...prev, id: roundId, turn: newTurnIndex }));

      if(leftCards !== undefined && leftCards !== null){
        setDeckCount(leftCards);
      }

      if (playerOrder && playerOrder.length > 0) {
        const safeIndex = newTurnIndex % playerOrder.length;
        const nextPlayerObj = playerOrder[safeIndex];

        if (nextPlayerObj) {
          const nextUsername = nextPlayerObj.username;
          const nextClass = `player${safeIndex + 1}`; 

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
              toast.info("🎲 It's your turn! 🎲");
              lastTurnToast.current = { username: nextUsername, ts: now2 };
            }
          }
        }
      }
    }; 

    const handleWsToolsChanged = (message) =>{
      const {username, tools} = message; 
      setPlayerTools(prev => ({
        ...prev,
        [username]:{
          pickaxe: tools.pickaxe,
          candle: tools.candle,
          wagon: tools.wagon
        }
      }));
    };
    

    const handleWsNewRound = (message) => {
      const { newRound, boardId } = message;
      console.log('🔄 WS NEW_ROUND received:', message);
      
      if (isNavigatingToNewRound.current) {
        console.log('Already navigating to new round, ignoring duplicate message');
        return}
      isNavigatingToNewRound.current = true;
      sessionStorage.setItem('newRoundData', JSON.stringify({
        game: game,
        round: newRound,
        isSpectator: isSpectator
      }));
      
      const targetBoardId = boardId || newRound?.board;
      console.log('Navigating to board:', targetBoardId);
      window.location.href = `/board/${targetBoardId}`;
    };
    
    const handleWsRoundEnd = (message) => {
      const { winnerTeam, reason, goldDistribution, playerRoles, roundId } = message;
      console.log('🏆 WS ROUND_END received:', message, 'current round.id:', round?.id);

      if (roundId && round?.id && roundId !== round.id) {
        console.log('🏆 Ignoring ROUND_END from different round:', roundId, '!=', round.id);
        return;
      }
      roundEndedRef.current = ROUND_STATE.ENDED;
      setRoundEnded(true);
      
      isNavigatingToNewRound.current = false;
      const roundResult = {
        winnerTeam,
        reason,
        goldDistribution,
        playerRoles
      };
      
      setRoundEndData(roundResult);
      setRoundEndCountdown(10);
    };
    
    const handleCardDrop = async (row, col, card, cardIndex, squareId) => {
    if (processingAction.current) return;
    processingAction.current = true;

    if (roundEndedRef.current === ROUND_STATE.ENDED) {
      toast.info("The round has already ended");
      return;
    }

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
      
      const currentPlayerTools = playerTools[loggedInUser.username];
      if (currentPlayerTools) {
        const hasBrokenTool = !currentPlayerTools.pickaxe || !currentPlayerTools.candle || !currentPlayerTools.wagon;
        if (hasBrokenTool) {
          toast.error("🔧 You can't place tunnel cards while you have a broken tool!");
          return;
        }
      }
      
      setCont(timeturn);

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

      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(cardIndex);
      }
      const newDeckCount = Math.max(0, deckCount - 1);
      setDeckCount(newDeckCount);
      setCollapseMode({ active: false, card: null, cardIndex: null });
      toast.success(`Card placed in (${row}, ${col})! ${deckCount > 1 ? 'Drew new card.' : 'No more cards in deck.'}`);

      if (roundEndedRef.current === ROUND_STATE.ACTIVE) {
        nextTurn({newDeckCount: newDeckCount});
      }
    } finally {
      processingAction.current = false;
    }
  };

const handleActionCard = (card, targetPlayer, cardIndex) => {
  if (processingAction.current) return;
  if (roundEndedRef.current === ROUND_STATE.ENDED) return;
  processingAction.current = true;
  try {
    setCont(timeturn);
    setCollapseMode({ active: false, card: null, cardIndex: null });
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
      setRevealedObjective({ position: objectivePosition, cardType: objectiveCardType }); 
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

      setCollapseMode({ active: false, card: null, cardIndex: null });
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
  if (roundEndedRef.current === ROUND_STATE.ENDED) return;
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
      console.error(`❌ ERROR: If you want to destroy the cell [${row},${col}] but no have squareId. The server request CANCELLED.`);
      toast.error("Error of sincronizitation: Cannot destroy the card on the server.");
      return; 
    }

    setBoardCells(prev => {
      const next = prev.map(r => r.slice());
      next[row][col] = null; 
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
  const addLog = (msg, type = "info") => {
    appendAndPersistLog(msg, type);
  };
  const addPrivateLog = () => {};

  const addColoredLog = (playerIndex, playerName, action) => {
    const coloredName = `<span class="player${playerIndex + 1}">${playerName}</span>`;
    addLog(`${coloredName} ${action}`, "action");
  };

  const nextTurn = ({ force = false, newDeckCount = null } = {}) => {
    if (roundEndedRef.current === ROUND_STATE.ENDING || roundEndedRef.current === ROUND_STATE.ENDED) {
    console.log('⛔ nextTurn bloqued: ronda ended');
    return false;
    }
    if (isTurnChanging.current && !force) return false;
    if (playerOrder.length === 0) return false;

    isTurnChanging.current = true;
    setTimeout(() => { isTurnChanging.current = false; }, 1000);

    setCollapseMode({ active: false, card: null, cardIndex: null });

    const currentTurnIndex = round?.turn || 0; 
    const nextIndex = (currentTurnIndex + 1)% playerOrder.length; 

    try{
      if(round && round.id){
        const patchBody = {turn: nextIndex};
        if(newDeckCount !== null){
          patchBody.leftCards = newDeckCount; 
        }

        patchRound(round.id, patchBody);

      }else{
        console.error("No round ID available");
      }
      return true; 
    } catch(error){
      console.error("Error passing turn:", error);
      toast.error("Error passing turn.");
      isTurnChanging.current = false;
      return false;
    }
  };

  const checkForRoundEnd = async () => {
    console.log('🔍 checkForRoundEnd called. roundEndedRef:', roundEndedRef.current, 'deck:', deck?.id, 'deckCount:', deckCount);
    
    if (roundEndedRef.current === ROUND_STATE.ENDED) {
      console.log('🔍 checkForRoundEnd: round already ended, exiting');
      return;
    }
    
    if (!deck || !deck.id) {
      console.log('🔍 checkForRoundEnd: deck not available, exiting');
      return;
    }
    
    const roundEndResult = await checkRoundEnd(boardCells, deckCount, activePlayers, objectiveCards, playerCardsCount);
    console.log('🔍 checkForRoundEnd result:', roundEndResult);
    
    if (roundEndResult.ended) {
      roundEndedRef.current = ROUND_STATE.ENDED; 
      setRoundEnded(true);
      if (roundEndResult.reason === 'GOLD_REACHED' && roundEndResult.goldPosition) {
        const [r, c] = roundEndResult.goldPosition
          .replace('[', '')
          .replace(']', '')
          .split(',')
          .map(Number);

        setBoardCells(prev => {
          const next = prev.map(row => row.slice());
          if (next[r]?.[c]) {
            next[r][c] = {
              ...next[r][c],
              revealed: true,
              cardType: 'gold'
            };
          }
          return next;
        });
      }
      handleRoundEnd(roundEndResult);
    }
  };

  const handleLastRoundEnd = async (result) => {
    console.log('Final of last round - Preparing game end...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadActivePlayers();
    
    const playerRankings = roundEndData?.goldDistribution?.map(p => ({
      username: p.username,
      totalNuggets: p.totalNuggets || 0
    })) || [];
    
    console.log('📊 Player rankings:', playerRankings);
    const sortedRankings = [...playerRankings].sort((a, b) => b.totalNuggets - a.totalNuggets);
    const winnerUsername = sortedRankings.length > 0 ? sortedRankings[0].username : null;
    console.log('👑 Winner:', winnerUsername);

    // Solo el primer jugador procesa las estadísticas y logros (para evitar duplicados)
    const isFirstPlayer = playerOrder.length > 0 && playerOrder[0]?.username === loggedInUser?.username;
    
    if (isFirstPlayer && winnerUsername) {
      try {
        console.log('🏆 Processing game statistics and achievements for game:', game.id);
        const achievementResponse = await fetch(`/api/v1/achievements/process/${game.id}?winnerUsername=${encodeURIComponent(winnerUsername)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });
        if (achievementResponse.ok) {
          console.log('✅ Game statistics and achievements processed successfully');
        } else {
          console.error('❌ Error processing game statistics and achievements:', achievementResponse.status);
        }
      } catch (error) {
        console.error('❌ Error processing game statistics and achievements:', error);
      }
    }
  
    setGameEndData({ playerRankings });
    setGameEndCountdown(10);
  };

  const handleRoundEnd = async (result) => {
    const { reason, winnerTeam, goldPosition } = result;
  
    const isFirstPlayer = playerOrder.length > 0 && playerOrder[0]?.username === loggedInUser?.username;
    
    if (reason === 'GOLD_REACHED') {
      addLog(`🏆 Round ended! The ${winnerTeam} found the gold at ${goldPosition}!`, 'success');
      
      if (revealedObjective?.position !== goldPosition) {
        setRevealedObjective({ position: goldPosition, cardType: 'gold' });
      }
    } else if (reason === 'NO_CARDS' || reason === 'ALL_PLAYERS_OUT_OF_CARDS') {
      addLog(`🏆 Round ended! No more cards. ${winnerTeam} win!`, 'success');
    }

    if (isFirstPlayer) {
      console.log('Soy el primer jugador, calculando distribución de oro...');
      console.log('activePlayers con roles:', activePlayers.map(p => ({ username: p.username, rol: p.rol })));
      
      // Distribuir pepitas de oro y obtener la distribución para el modal
      const winnerRol = winnerTeam === 'MINERS' ? false : true;
      const goldDistribution = await distributeGold(activePlayers, winnerRol);
      await loadActivePlayers();
      
      const playerRolesData = activePlayers.map(p => ({
        username: p.user?.username || p.username,
        rol: p.rol === true ? 'SABOTEUR' : 'MINER'}));
      
      console.log('playerRolesData ready:', playerRolesData);
      isNavigatingToNewRound.current = false;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await patchRound(round.id, { winnerRol: winnerRol });

      const result = await notifyRoundEnd(round.id, {
        winnerTeam,
        reason,
        goldDistribution,
        playerRoles: playerRolesData
      });
      
      if (!result) {
        setRoundEndData({ winnerTeam, reason, goldDistribution, playerRoles: playerRolesData });
        setRoundEndCountdown(10);
      }
    }
    
  };

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
  }, [roundEndData]);

  useEffect(() => {
    if (!roundEndData || roundEndCountdown > 0) return;

    const isFirstPlayer = playerOrder.length > 0 && playerOrder[0]?.username === loggedInUser?.username;
    
    const isLastRound = round?.roundNumber === 3;

    if (isLastRound) {
      handleLastRoundEnd(roundEndData);
      return;
    }
    
    if (isNavigatingToNewRound.current) return;
    isNavigatingToNewRound.current = true;
    
    const createNewRound = async () => {
      try {
        console.log('🔧 Resetting tools for all players...');
        await resetToolsForNewRound(activePlayers);
        
        const newRound = await postRound({ gameId: game.id, roundNumber: round.roundNumber + 1 });
        console.log('✅ New round created:', newRound);
        
        // El backend enviará el WebSocket NEW_ROUND a todos los jugadores
        // La navegación real se hace en handleWsNewRound cuando llegue el mensaje
        // Pero por si acaso el WS no llega, navegamos directamente
        if (newRound && newRound.board) {
          sessionStorage.setItem('newRoundData', JSON.stringify({
            game: game,
            round: newRound,
            isSpectator: isSpectator
          }));
          window.location.href = `/board/${newRound.board}`;
        }
        
      } catch (error) {
        console.error('❌ Error creating new round:', error);
        toast.error('Error creating new round');
        isNavigatingToNewRound.current = false;
      }
    };
    
    createNewRound();
  }, [roundEndCountdown, roundEndData]);

  useEffect(() => {
    if (!gameEndData) return;
    
    const interval = setInterval(() => {
      setGameEndCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameEndData]);

  useEffect(() => {
    if (!gameEndData || gameEndCountdown > 0) return;
    
    console.log('🏁 Game finished, returning to lobby...');
    sessionStorage.removeItem('newRoundData');
    navigate('/lobby');
  }, [gameEndCountdown, gameEndData, navigate]);

  const handleDiscard = () => {
    if (processingAction.current) return;
    if (roundEndedRef.current === ROUND_STATE.ENDED) return;
    processingAction.current = true;
    try {
      if (isSpectator) {
        toast.info("🔍 Spectators cannot discard cards");
        return;
      }
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      if (loggedInUser.username !== currentPlayer) {
        toast.warning("It's not your turn!");
        return;
      }
      if (window.discardSelectedCard && window.discardSelectedCard()) {
        const newDeckCount = Math.max(0, deckCount - 1);
        setDeckCount(newDeckCount);
        setCollapseMode({ active: false, card: null, cardIndex: null });
        nextTurn({newDeckCount: newDeckCount});
        addColoredLog(
          currentIndex,
          playerOrder[currentIndex].username,
          `🎴 Discarded a card and take one. ${newDeckCount} cards left in the deck.`);
        toast.success('Card discarded successfully!');
        
      } else {
        toast.warning("Please select a card to discard (right-click in the card)");}
    } finally {
      processingAction.current = false;
    }
  };

  const handleTurnTimeOut = () => {
    if (roundEndedRef.current === ROUND_STATE.ENDING || roundEndedRef.current === ROUND_STATE.ENDED) {
      console.log("Timeout ignored: round has ended.");
      return; 
    }
    if (processingAction.current) return;
    const now = Date.now();
      if ((now - lastTimeoutToastTs.current) > 3000) {
        toast.error("⌛ Time's up! Passing turn...");
        lastTimeoutToastTs.current = now;
      }
    nextTurn({ force: true });
  };

  const handleForceEndRound = async () => {
    if (!isCreator) {
      toast.error('Only the game creator can force end the round');
      return}

    if (processingAction.current) return;
    processingAction.current = true;

    try {
      if (roundEndedRef.current === ROUND_STATE.ENDING || roundEndedRef.current === ROUND_STATE.ENDED) {
        toast.info('Round already ending or ended');
        return}

      const objectivePositions = [ '[2][9]', '[4][9]', '[6][9]' ];
      let goldPosKey = objectivePositions.find(k => objectiveCards[k] === 'gold');
      if (!goldPosKey) {
        goldPosKey = objectivePositions[0];
      }

      // Parsear coordenadas
      const match = goldPosKey.match(/\[(\d+)\]\[(\d+)\]/);
      const r = match ? Number(match[1]) : 4;
      const c = match ? Number(match[2]) : 9;

      // Revelar visualmente la carta objetivo
      setBoardCells(prev => {
        const next = prev.map(row => row.slice());
        if (next[r] && next[r][c]) {
          next[r][c] = {
            ...next[r][c],
            revealed: true,
            cardType: 'gold'
          };
        }
        return next;
      });

      roundEndedRef.current = ROUND_STATE.ENDING;
      setRoundEnded(true);

      const mockResult = {
        ended: true,
        reason: 'GOLD_REACHED',
        winnerTeam: 'MINERS',
        goldPosition: `[${r}][${c}]`
      };

      await handleRoundEnd(mockResult);
    } finally {
      processingAction.current = false;
    }
  };
  const postMessage = async (content, activePlayerUsername, chatId) => {
    try {
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

      if (!response.ok) {
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
      console.error('ActivePlayer not available for user:', loggedInUser.username);
      return;
    }

    const activePlayerUsername = resolveActivePlayerUsername();

    if (!activePlayerUsername) {
      toast.error('Cannot identify your username');
      console.error('Username not found. isSpectator:', isSpectator, 'loggedActivePlayer:', loggedActivePlayer);
      return;
    }

    const chatId = chatIdFromState();

    if (!chatId) {
      toast.error('Cannot identify the game chat');
      console.error('Chat ID not found. chat state:', chat, 'game:', game);
      return;
    }

    setMessage(prev => [...prev, { author: loggedInUser.username, text: finalMessage }]);
    await postMessage(finalMessage, activePlayerUsername, chatId);
    setNewMessage('');
  };

  const appendAndPersistLog = async (msg, type = "info") => {
    setGameLog(prev => [...prev, { msg, type }]);

    const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
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

  useEffect(() => {
    const initializeGame = async () => {
      try {
        updateLoadingStep(0);
        await fetchCards();
        updateLoadingStep(1);
        await loadActivePlayers();
        updateLoadingStep(2);
        const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
        if (logId) {
          const log = await getLog(logId);
          if (log) {
            setLogData(log);
            const mapped = (log.messages || []).map(m => ({ msg: m, type: "info" }));
            setGameLog(mapped);}}
        
        updateLoadingStep(3);
        updateLoadingStep(4);
        await getChat();
        await fetchAndSetLoggedActivePlayer();
        updateLoadingStep(5);

        async function handlerounds() {
          const irounds = game?.rounds?.length || 0;
          if (irounds <= 0) {
            setNumRound(1);}}
        await handlerounds();
        updateLoadingStep(6);

        if (isSpectator) {
          addLog('📥Entering as <span style="color: #2313b6ff;">SPECTATOR</span>. Restriction applies, you can only watch de game!', 'info');
          toast.info('Spectator mode activated✅');}

        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error initializing game:', error);
        toast.error('Error loading game data');
        setIsLoading(false);
      }
    };

    initializeGame();
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
        }
      } catch (error) {
        console.error('Error loading complete game:', error);
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

      // Si se fuerza la reasignación (nueva ronda), siempre reasignar roles
      if (forceRolesReassignment.current) {
        console.log('🎭 Forzando reasignación de roles para nueva ronda');
        forceRolesReassignment.current = false;
        const rolesAssigned = assignRolesGame(activePlayers);
        publishRoles(rolesAssigned);
        await persistRoles(rolesAssigned);
        return;
      }

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
    if(!currentPlayer || playerOrder.length === 0 || roundEnded) return;

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
  }, [currentPlayer, loggedInUser.username, playerOrder, roundEnded]);

  useEffect(() => {
    if (roundEnded) {
      setCont(0);
    }
  }, [roundEnded]);

  useEffect(() => {
    console.log('🔍 useEffect playerCardsCount init - activePlayers:', activePlayers.length, 'round?.id:', round?.id, 'hasPatchedInitialLeftCards:', hasPatchedInitialLeftCards.current);
    if (activePlayers.length > 0 && round?.id && !hasPatchedInitialLeftCards.current) {
      const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
      const initialDeck = calculateInitialDeck(activePlayers.length, cardsPerPlayer);
      setDeckCount(initialDeck);
      setCardPorPlayer(cardsPerPlayer);
      const initialCounts = {};
      activePlayers.forEach(p => {
        if (!p) return; 
        const name = p.username || p;
        if (name) {
          initialCounts[name] = cardsPerPlayer;
        }
      });
      console.log('- Initializing playerCardsCount:', initialCounts);
      setPlayerCardsCount(initialCounts);
      hasPatchedInitialLeftCards.current = true;
      patchRound(round.id, { leftCards: initialDeck });
      console.log(`- Initial leftCards patched to round: ${initialDeck} (70 - ${activePlayers.length} players * ${cardsPerPlayer} cards)`);
    }
  }, [activePlayers, round?.id]);

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
        toast.error("Error trying to fetch Squares");
      }
    } catch (error) {
      console.error( error);
      toast.error(error.message);
    }}
    fetchSquares(); 

  }, []);

  useEffect(() => {
    if (!round || !round.board || !squaresById) return;

    const loadBoard = async () => {
      const boardId = typeof round.board === 'number' ? round.board : round.board.id;
      if (!boardId) return;

      let busyIds = [];
      let boardData = null;
      
      if (Array.isArray(round.board.busy) && round.board.busy.length > 0) {
        busyIds = round.board.busy;
        boardData = await getBoard(boardId);
      } else {
        boardData = await getBoard(boardId);
        busyIds = (boardData?.busy || []).map(sq => sq.id ?? sq);
      }

      if (boardData?.objectiveCardsOrder) {
        const order = boardData.objectiveCardsOrder.split(',');
        console.log('- BOARD DEBUG - objectiveCardsOrder from server:', order);
        
        const mapping = {
          '[2][9]': order[0],
          '[4][9]': order[1],
          '[6][9]': order[2]
        };
        
        setObjectiveCards(mapping);
        console.log('- OBJECTIVE CARDS - Final mapping:', mapping);
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
              return; 
            }

            const cardFromBackend = sq.card;
            if (!cardFromBackend) {
              return}
      
            const cardId = typeof cardFromBackend === 'number' ? cardFromBackend : cardFromBackend?.id;
            let fullCard = cardFromBackend;
            
            if (cardId && Array.isArray(ListCards)) {
              const foundCard = ListCards.find(c => c.id === cardId);
              if (foundCard) {
                fullCard = {
                  ...foundCard,
                  ...cardFromBackend, 
                  arriba: foundCard.arriba,
                  abajo: foundCard.abajo,
                  izquierda: foundCard.izquierda,
                  derecha: foundCard.derecha,
                  centro: foundCard.centro,
                  image: foundCard.image
                };
              }
            }

            baseBoard[row][col] = {
              squareId: sq.id,
              backendType: sq.type,
              occupied: sq.occupation,
              card: fullCard,
              type: sq.type || fullCard?.type || (fullCard ? 'tunnel' : undefined),
              image: fullCard?.image,
              rotacion: fullCard?.rotacion ?? sq.rotacion,
              arriba: fullCard?.arriba,
              abajo: fullCard?.abajo,
              izquierda: fullCard?.izquierda,
              derecha: fullCard?.derecha,
              centro: fullCard?.centro
            };
          }
        })
      );
      setBoardCells(baseBoard);
    };

    loadBoard();
  }, [round?.id, ListCards]);

  useEffect(() => {
  const fetchChatMessages = async () => {
    const chatId = chat?.id ?? chat ?? game?.chat?.id ?? game?.chatId;
    
    if (!chatId) {
      return}

    try {
      const messages = await getmessagebychatId(chatId);
      
      if (Array.isArray(messages)) {
        const formattedMessages = messages.map(msg => {
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
        
        setMessage(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  fetchChatMessages();
  const pollInterval = setInterval(fetchChatMessages, 1000);
  return () => clearInterval(pollInterval);
}, [chat, game]); 


  // Render 
  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} loadingSteps={loadingSteps} />;}

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

      {isCreator && spectatorRequests.length > 0 && (
        <SpectatorRequestsInGame
          spectatorRequests={spectatorRequests}
          onAccept={handleAcceptSpectatorRequest}
          onDeny={handleDenySpectatorRequest}
        />
      )}

      {roundEndData && !gameEndData && (
        <RoundEndModal
          winnerTeam={roundEndData.winnerTeam}
          reason={roundEndData.reason}
          goldDistribution={roundEndData.goldDistribution}
          playerRoles={roundEndData.playerRoles}
          countdown={roundEndCountdown}
          roundNumber={round.roundNumber}
        />
      )}
      
      {gameEndData && (
        <GameEnd
          playerRankings={gameEndData.playerRankings}
          countdown={gameEndCountdown}
          gameId={game?.id}
          activePlayers={activePlayers}
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
        playerCardsCount={playerCardsCount}
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
        isCreator={isCreator}
        handleForceEndRound={handleForceEndRound}
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
        playerCardsCount={playerCardsCount}
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