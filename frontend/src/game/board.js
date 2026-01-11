import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

// Función para detectar si la página se cargó por un refresh (F5)
const detectPageRefresh = () => {
  // Método 1: Performance Navigation API (más confiable)
  const navEntries = performance.getEntriesByType('navigation');
  if (navEntries.length > 0) {
    const navType = navEntries[0].type;
    // 'reload' = F5/refresh, 'navigate' = navegación normal, 'back_forward' = botón atrás/adelante
    return navType === 'reload';
  }
  // Método 2: Fallback para navegadores antiguos
  if (performance.navigation) {
    return performance.navigation.type === 1; // 1 = TYPE_RELOAD
  }
  return false;
};

// Nota: la detección de "refresh"/"newRoundData" se realiza
// dinámicamente dentro del efecto de inicialización para evitar
// valores persistentes entre navegaciones sin recarga completa.

const getSavedRoundData = () => {
  const savedData = sessionStorage.getItem('newRoundData');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    const nextRoundId = parsed?.round?.id;
    if (nextRoundId !== undefined && nextRoundId !== null) {
      sessionStorage.setItem('forceRolesReassignmentRoundId', String(nextRoundId));
    }
    // IMPORTANT: do not remove `newRoundData` here. Keep it available so
    // initialization/verification logic can detect that a round transition
    // is in progress. It will be cleared by `verify()` once membership is
    // confirmed to avoid races that send players to the lobby incorrectly.
    return parsed;
  }
  // Try to recover from general session storage (reload fix)
  const recoveredData = sessionStorage.getItem('savedGameData');
  if (recoveredData) {
      return JSON.parse(recoveredData);
  }
  return null;
};

const savedRoundData = getSavedRoundData();

export default function Board() {
  const { boardId: urlBoardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const loggedInUser = tokenService.getUser();

  const hasDeniedIllegalAccess = useRef(false);

  useEffect(() => {
    toast.dismiss();
    return () => {
      toast.dismiss();
    };
  }, []);

  if (location.state) {
    sessionStorage.removeItem('newRoundData');
  }

  // Dar prioridad a location.state sobre savedRoundData
  // CHECK: If savedRoundData exists but belongs to a DIFFERENT board, ignore it to prevent "stuck in previous round"
  let loadedState = null;
  
  if (location.state) {
    loadedState = {
      game: location.state.game,
      round: location.state.round || null,
      isSpectator: location.state.isSpectator || false
    };
  } else if (savedRoundData) {
      // Validate Board ID if possible
      const savedBoardId = savedRoundData.round?.board?.id || savedRoundData.round?.board;
      if (urlBoardId && savedBoardId && String(savedBoardId) !== String(urlBoardId)) {
          console.warn(`⚠️ State mismatch detected! URL Board: ${urlBoardId}, Saved Board: ${savedBoardId}. Discarding saved state.`);
          loadedState = null; // Force fetch
      } else {
          loadedState = savedRoundData;
      }
  }

  const initialState = loadedState || {
    game: null,
    round: null,
    isSpectator: false
  };

  // El cálculo de si saltar la sincronización se hace en el efecto
  // `initializeGame` para evitar valores stale entre navegaciones.

  // Estados principales
  const [isSpectator] = useState(initialState.isSpectator);

  const [playerCardsCount, setPlayerCardsCount] = useState({});
  const [deckCount, setDeckCount] = useState(0);
  const [game, setGame] = useState(initialState.game);
  const [message, setMessage] = useState([]);

  // Estado para sincronización de jugadores - esperar a que todos carguen
  // Se inicializa en 'true' y el efecto `initializeGame` decidirá
  // si debe saltarse la sincronización en ese momento.
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);

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

  // Si un usuario loggueado intenta acceder a /board/:boardId a través de la URL sin ser parte de la partida, se le redirige a /lobby mostrando un toast.
  useEffect(() => {
    if (!jwt || !loggedInUser?.username || !urlBoardId) {
      return;
    }
    if (hasDeniedIllegalAccess.current) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 200;

    const readSavedGameData = () => {
      try {
        const raw = sessionStorage.getItem('savedGameData');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    };

    const extractUsernames = (list) => {
      if (!Array.isArray(list)) return [];
      return list
        .map(p => p?.username || p?.user?.username || (typeof p === 'string' ? p : null))
        .filter(Boolean);
    };

    const extractBoardIdsFromRounds = (rounds) => {
      if (!Array.isArray(rounds)) return [];
      return rounds
        .map(r => r?.board?.id ?? r?.board)
        .filter(v => v !== null && v !== undefined)
        .map(String);
    };

    const deny = () => {
      if (hasDeniedIllegalAccess.current) return;
      hasDeniedIllegalAccess.current = true;
      sessionStorage.removeItem('savedGameData');
      sessionStorage.removeItem('newRoundData');
      navigate('/lobby', { replace: true });
      
    };

    const verify = async () => {
      if (cancelled) return;

      const saved = readSavedGameData();
      const candidateGame = location?.state?.game || game || saved?.game;
      const candidateRound = location?.state?.round || round || saved?.round;

      // If we detect a transition (newRoundData, saved game, or navigation state),
      // give the client a longer window to resolve races before denying access.
      // Also consider `savedRoundData` (loaded from sessionStorage during init)
      // as a transition hint because `newRoundData` is consumed during init.
      const transitionHint = !!(sessionStorage.getItem('newRoundData') || saved || location?.state || savedRoundData);
      const localMaxAttempts = transitionHint ? 150 : maxAttempts; // ~30s when transitionHint
      const localDelayMs = delayMs;

      // Wait until we have enough info to validate.
      if (!candidateGame || !candidateRound) {
        attempts += 1;
        if (attempts >= localMaxAttempts) {
          // If we still couldn't resolve data, but there's a pending newRoundData
          // or location.state (fresh navigation), keep waiting a bit longer instead
          // of denying immediately. This avoids races during round transitions.
          if (sessionStorage.getItem('newRoundData') || location?.state || savedRoundData) {
            console.log('🔁 Delaying deny: newRoundData or location.state present, continuing verify');
            attempts = 0; // reset attempts and keep waiting
            setTimeout(verify, delayMs);
            return;
          }
          // If no hint of a transition, fail closed.
          deny();
          return;
        }
        setTimeout(verify, delayMs);
        return;
      }

      const allowedUsernames = new Set([
        ...extractUsernames(candidateGame.activePlayers),
        ...extractUsernames(candidateGame.watchers)
      ].map(String));

      // If activePlayers isn't ready yet, retry briefly (race during game start).
      if (allowedUsernames.size === 0) {
        attempts += 1;
        if (attempts >= localMaxAttempts) {
          // If activePlayers isn't populated yet but we have a newRoundData or
          // came here via location.state, prefer to keep waiting instead of denying.
          if (sessionStorage.getItem('newRoundData') || location?.state || savedRoundData) {
            console.log('🔁 Delaying deny: allowedUsernames empty but newRoundData/location.state/savedRoundData present');
            attempts = 0;
            setTimeout(verify, delayMs);
            return;
          }
          deny();
          return;
        }
        setTimeout(verify, delayMs);
        return;
      }

      if (!allowedUsernames.has(String(loggedInUser.username))) {
        // Possible race: client-side game data is stale. Verify against server before denying.
        const gameId = candidateGame?.id;
        if (gameId) {
          try {
            const res = await fetch(`/api/v1/games/${gameId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
            });
            if (res.ok) {
              const freshGame = await res.json();
              const freshAllowed = new Set([
                ...(Array.isArray(freshGame.activePlayers) ? freshGame.activePlayers : []),
                ...(Array.isArray(freshGame.watchers) ? freshGame.watchers : [])
              ].map(String));
              if (freshAllowed.has(String(loggedInUser.username))) {
                console.log('✅ verify: membership confirmed by server, not denying access');
                return; // allow
              }
            }
          } catch (err) {
            console.warn('Error fetching fresh game data during verify:', err);
            // fallthrough to deny below if we cannot confirm
          }
        }
        // If we cannot confirm membership on server, check if we're in a transition
        // and allow a bit more time before final deny.
        if (transitionHint && attempts < localMaxAttempts) {
          console.log('🔁 verify: transition hinted, delaying final deny');
          setTimeout(verify, localDelayMs);
          return;
        }
        deny();
        return;
      }

      // Membership confirmed client-side: clear the temporary newRoundData
      // so subsequent checks don't lose the transition hint prematurely.
      try {
        if (sessionStorage.getItem('newRoundData')) {
          sessionStorage.removeItem('newRoundData');
          console.log('🧹 Cleared newRoundData after membership confirmation');
        }
      } catch (e) {
        console.warn('Could not clear newRoundData from sessionStorage:', e);
      }

      const candidateBoardId = candidateRound?.board?.id ?? candidateRound?.board;
      if (candidateBoardId && String(candidateBoardId) !== String(urlBoardId)) {
        // If we're not on the round's board, let the existing mismatch logic handle it.
        return;
      }

      const boardIds = new Set([
        ...extractBoardIdsFromRounds(candidateGame.rounds),
        String(candidateBoardId ?? '')
      ].filter(Boolean));

      // If we can map the game -> rounds -> board, ensure the requested board belongs to that game.
      if (boardIds.size > 0 && !boardIds.has(String(urlBoardId))) {
        deny();
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [loggedInUser?.username, navigate, urlBoardId, location?.state, game, round]);

  const [roundEndData, setRoundEndData] = useState(null);
  const [roundEndCountdown, setRoundEndCountdown] = useState(10);
  const [gameEndData, setGameEndData] = useState(null);
  const [gameEndCountdown, setGameEndCountdown] = useState(10);

  // EFFECT: Fetch Game/Round data if missing (e.g. reload on new round URL without state)
  // Moved here to avoid ReferenceError: round is not defined
  useEffect(() => {
      const fetchMissingData = async () => {
          if ((!game || !round || (round.board?.id && String(round.board.id) !== String(urlBoardId))) && urlBoardId) {
                  console.log(`🔄 Fetching Round data for Board ID: ${urlBoardId}...`);
                  try {
                      setIsLoading(true);
                      const res = await fetch(`/api/v1/rounds/byBoardId?boardId=${urlBoardId}`, {
                          headers: { "Authorization": `Bearer ${jwt}` }
                      });
                      if (res.ok) {
                          const fetchedRound = await res.json();
                          console.log('✅ Fetched Round:', fetchedRound);
                          setRound(fetchedRound);
                          if (fetchedRound.game) {
                              setGame(fetchedRound.game);
                          }
                      } else {
                          console.error('❌ Failed to fetch round by board ID');
                          toast.error('Failed to load game data');
                      }
                  } catch (err) {
                      console.error('Network error fetching round:', err);
                  } finally {
                      setIsLoading(false);
                  }
          }
      };

      fetchMissingData();
  }, [urlBoardId, game, round]); 

  // Save game state to sessionStorage to persist on reload.
  // Once the game has ended we stop persisting to avoid redirect loops
  // (the App-level StrictInGameRedirect uses savedGameData presence as "in game").
  useEffect(() => {
    if (gameEndData) {
      return;
    }
    if (hasDeniedIllegalAccess.current) {
      return;
    }
    if (game && round) {
      const stateToSave = {
        game: game,
        round: round,
        isSpectator: isSpectator
      };
      sessionStorage.setItem('savedGameData', JSON.stringify(stateToSave));
    }
  }, [game, round, isSpectator, gameEndData]);
  // Estados del tablero
  const BOARD_COLS = 11;
  const BOARD_ROWS = 9;
  const [collapseMode, setCollapseMode] = useState({ active: false, card: null, cardIndex: null });
  const [objectiveCards, setObjectiveCards] = useState({});
  // Estado para cartas objetivo permanentemente reveladas (persiste en sessionStorage)
  const [permanentlyRevealedGoals, setPermanentlyRevealedGoals] = useState(() => {
    // Inicializar desde sessionStorage si existe
    const savedKey = round?.id ? `revealedGoals_${round.id}` : null;
    if (savedKey) {
      const saved = sessionStorage.getItem(savedKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });
  const [revealedObjective, setRevealedObjective] = useState(null);

  const [destroyingCell, setDestroyingCell] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([{label: 'Loading Game Data', completed:false}, 
    {label: 'Loading Players', completed:false}, {label: 'Loading Board', completed:false}, {label: 'Loading Cards', completed:false}, 
    {label: 'Loading Chat', completed:false}, {label: 'Assigning Rols', completed:false}, {label: 'Initializing Game State', completed:false},
    {label: 'Waiting for all players to join the game', completed:false}]);

  const updateLoadingStep = (stepIndex, completed = true) => {
    setLoadingSteps(prev => {
      const up = [...prev];
      up[stepIndex].completed = completed;
      const completedCont = up.filter(s => s.completed).length;
      const progress = Math.round((completedCont/up.length)*100);
      setLoadingProgress(progress);
      return up})}; 

  const [spectatorRequests, setSpectatorRequests] = useState([]);
  const creatorUsername = game?.creator?.username || game?.creator;
  const isCreator = creatorUsername === loggedInUser?.username;

  const handleExitSpectatorMode = () => {
    if (!isSpectator) return;

    toast.dismiss();
    sessionStorage.removeItem('newRoundData');

    const returnTo = location?.state?.returnTo;
    navigate(returnTo || '/ListGames');
  };

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
  const lastSkippedTurn = useRef({ roundId: null, turnIndex: null });
  const lastPlacedLog = useRef({ player: null, row: null, col: null, ts: 0 });
  const lastObjectiveHideLog = useRef(0);
  const lastCollapseLog = useRef(0);
  const seenPrivateMessages = useRef(new Set());
  const lastPublishedRoles = useRef([]);
  const lastSyncedLogMessages = useRef([]);
  const syncLogFromServerRef = useRef(null);


  const boardGridRef = useRef(null);
  const processingAction = useRef(false);
  const isTurnChanging = useRef(false);
  const isNavigatingToNewRound = useRef(false);
  const hasTriggeredGameEnd = useRef(false);
  const ROUND_STATE = {
    ACTIVE: 'ACTIVE',
    ENDING: 'ENDING',
    ENDED: 'ENDED'
  };
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

      // Evitar mostrar roles de la ronda anterior mientras llegan los nuevos
      lastPublishedRoles.current = [];
      setPlayerRol([]);

      playersOutOfCardsLogged.current.clear();
      hasPatchedInitialLeftCards.current = false;
      console.log('🔄 hasPatchedInitialLeftCards reset to false');
      lastSyncedLogMessages.current = [];
      lastRoundId.current = round.id;
      
      // Cargar cartas reveladas desde sessionStorage para esta ronda
      const savedKey = `revealedGoals_${round.id}`;
      const saved = sessionStorage.getItem(savedKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPermanentlyRevealedGoals(parsed);
          console.log('📋 Loaded revealed goals from sessionStorage:', parsed);
        } catch (e) {
          console.error('Error parsing revealed goals from sessionStorage:', e);
          setPermanentlyRevealedGoals({});
        }
      } else {
        setPermanentlyRevealedGoals({});
      }
    }
  }, [round?.id]);

  // Persistir cartas reveladas en sessionStorage cuando cambien
  useEffect(() => {
    if (round?.id && Object.keys(permanentlyRevealedGoals).length > 0) {
      const savedKey = `revealedGoals_${round.id}`;
      sessionStorage.setItem(savedKey, JSON.stringify(permanentlyRevealedGoals));
      console.log('💾 Saved revealed goals to sessionStorage:', permanentlyRevealedGoals);
    }
  }, [permanentlyRevealedGoals, round?.id]);

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
    getRoundById,
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

      case "ALL_PLAYERS_READY":
        console.log('✅ ALL_PLAYERS_READY WS payload:', gameMessage);
        console.log('✅ Todos los jugadores están listos! - clearing wait state');
        setWaitingForPlayers(false);
        setIsLoading(false);
        break;
      
      default:
        break;
    }
    },[gameMessage])
    
    const lastProcessedDeckTs = useRef(null);

    if (deckMessage && deckMessage._ts !== lastProcessedDeckTs.current) {
      console.log('📦 deckMessage received:', deckMessage, 'previousPlayerCardsCount:', playerCardsCount);
      lastProcessedDeckTs.current = deckMessage._ts;

      if (deckMessage.action === "DECK_COUNT") {
        const { username, leftCards } = deckMessage;
        setTimeout(() => {
          console.log('📊 Applying DECK_COUNT update', { username, leftCards });
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
      /*
      const sameAsLast = ... (Removed to ensure logging always fires)
      if (sameAsLast) return;
      */
      
      // We update the ref but do not block execution
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
      // NO añadir log aquí - el jugador que colocó la carta ya lo hizo
      // Este WebSocket solo sincroniza el estado visual del tablero
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
    const positionKey = `[${row}][${col}]`;
    
    // Guardar en permanentlyRevealedGoals para persistir en sessionStorage
    setPermanentlyRevealedGoals(prev => ({
      ...prev,
      [positionKey]: goalType.toLowerCase()
    }));
    
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
      [positionKey]: normalized
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
  
  
    // Handlers para solicitudes de espectador
    const deleteMessagesByIds = async (ids) => {
      const safeIds = (ids || []).filter(id => id !== null && id !== undefined);
      if (safeIds.length === 0) return;

      const results = await Promise.all(
        safeIds.map((id) =>
          fetch(`/api/v1/messages/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          })
        )
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} message(s)`);
      }
    };

    const handleAcceptSpectatorRequest = async (username) => {
      try {
        toast.success(`${username} accepted as spectator`);

        const reqIds = (spectatorRequests || [])
          .filter(s => s.username === username)
          .map(s => s.messageId)
          .filter(id => id !== null && id !== undefined);
        const requestId = reqIds.length > 0 ? Math.max(...reqIds.map(Number).filter(Number.isFinite)) : null;
        
        // Enviar mensaje de aceptación
        const acceptMessage = {
          content: requestId !== null
            ? `SPECTATOR_ACCEPTED:${username}:${game.id}:${requestId}`
            : `SPECTATOR_ACCEPTED:${username}:${game.id}`,
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

        await deleteMessagesByIds(msgsToDelete);
        
        setSpectatorRequests(prev => prev.filter(p => p.username !== username));
        
      } catch (err) {
        console.error(err);
        toast.error('Error to accept spectator request.');
      }
    };

    const handleDenySpectatorRequest = async (username) => {
      try {
        const reqIds = (spectatorRequests || [])
          .filter(s => s.username === username)
          .map(s => s.messageId)
          .filter(id => id !== null && id !== undefined);
        const requestId = reqIds.length > 0 ? Math.max(...reqIds.map(Number).filter(Number.isFinite)) : null;

        // Enviar mensaje de rechazo
        const denyMessage = {
          content: requestId !== null
            ? `SPECTATOR_DENIED:${username}:${game.id}:${requestId}`
            : `SPECTATOR_DENIED:${username}:${game.id}`,
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

        await deleteMessagesByIds(msgsToDelete);
        
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
          sessionStorage.removeItem('savedGameData');
          sessionStorage.removeItem('newRoundData');
          navigate('/lobby')}, 3000);

      } else if (adminAction.action === "PLAYER_EXPELLED") {
        if (adminAction.affectedPlayer === currentUser) {
          toast.error(`🚫 You have been expelled from this game. Reason: ${adminAction.reason}`);
          setTimeout(() => {
            sessionStorage.removeItem('savedGameData');
            sessionStorage.removeItem('newRoundData');
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

          // Solo el primer jugador en el orden añade el log de turno para evitar duplicados
          const isFirstPlayer = playerOrder[0]?.username === loggedInUser.username;
          if (lastLoggedTurn.current !== nextUsername && isFirstPlayer) {
            await addLog(`Turn of <span class="${nextClass}">${nextUsername}</span>`, "turn");
            lastLoggedTurn.current = nextUsername;
          }

          // Si es MI turno - mostrar toast
          if (nextUsername === loggedInUser.username) {
            const now2 = Date.now(); 
            const last = lastTurnToast.current;
            if (last.username !== nextUsername || (now2 - last.ts) > 3000) {
              toast.info("🎲 It's your turn! 🎲");
              lastTurnToast.current = { username: nextUsername, ts: now2 };
            }
            // El auto-skip se maneja en el useEffect separado que observa playerCardsCount
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
    
    // Handler para cuando se crea una nueva ronda - todos los jugadores navegan al nuevo board
const handleWsNewRound = (message) => {
  const { newRound, boardId } = message;
  console.log('🔄 WS NEW_ROUND received:', message);

  // Guardar firma de roles de la ronda anterior para detectar si el backend aún devuelve roles antiguos
  try {
    const prevFromPublished = (lastPublishedRoles?.current && Array.isArray(lastPublishedRoles.current) && lastPublishedRoles.current.length > 0)
      ? lastPublishedRoles.current
          .map(p => ({ u: p.username, r: p.role === 'SABOTEUR' ? 1 : 0 }))
      : null;

    const prevFromActivePlayers = (Array.isArray(activePlayers) ? activePlayers : [])
      .filter(p => typeof p?.rol === 'boolean')
      .map(p => ({ u: p.username, r: p.rol === true ? 1 : 0 }));

    const base = (prevFromPublished && prevFromPublished.length > 0) ? prevFromPublished : prevFromActivePlayers;

    const prevSig = base
      .sort((a, b) => String(a.u).localeCompare(String(b.u)))
      .map(x => `${x.u}:${x.r}`)
      .join('|');

    sessionStorage.setItem('previousRoundRolesSignature', prevSig);
  } catch (e) {
    console.warn('Could not store previous round roles signature', e);
  }
  
  // Limpiar sessionStorage anterior para evitar conflictos
  sessionStorage.removeItem('savedGameData');
  
  // Guardar datos en sessionStorage para recuperarlos después del reload
  sessionStorage.setItem('newRoundData', JSON.stringify({
    game: game,
    round: newRound,
    isSpectator: isSpectator
  }));

  // Marcar que en esta ronda hay que reasignar roles (sobrevive al reload)
  if (newRound?.id !== undefined && newRound?.id !== null) {
    sessionStorage.setItem('forceRolesReassignmentRoundId', String(newRound.id));
  }
  
  // Navegar y forzar reload para reiniciar todo el estado
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
      
      // Añadir log de la acción antes de cambiar turno
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      await addColoredLog(
        currentIndex,
        currentPlayer,
        `🃏 Placed a card at (${row}, ${col})`
      );
      
      toast.success(`Card placed in (${row}, ${col})! ${deckCount > 1 ? 'Drew new card.' : 'No more cards in deck.'}`);

      if (roundEndedRef.current === ROUND_STATE.ACTIVE) {
        nextTurn({newDeckCount: newDeckCount});
      }
    } finally {
      processingAction.current = false;
    }
  };

const handleActionCard = async (card, targetPlayer, cardIndex, selectedTool = null) => {
  if (processingAction.current) return;
  if (roundEndedRef.current === ROUND_STATE.ENDED) return;
  processingAction.current = true;
  try {
    setCollapseMode({ active: false, card: null, cardIndex: null });
    const success = await handleActionCardUtil(card, targetPlayer, cardIndex, {
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
      selectedTool,
    });
    if (success) {
      setCont(timeturn);
    }
  } finally {
    processingAction.current = false;
  }
};

  const handleMapCard = async (card, objectivePosition, cardIndex) => {
    if (processingAction.current) return;
    processingAction.current = true;
    try {
      if (isSpectator) {
        await addPrivateLog("ℹ️ Spectators cannot use this", "warning");
        return;}
      setCont(timeturn);

      const objectiveCardType = objectiveCards[objectivePosition];
      setRevealedObjective({ position: objectivePosition, cardType: objectiveCardType }); 
      toast.info(`🔍 Revealing objective... Look at the board!`);
      
      // Añadir log inmediatamente para todos los jugadores
      const currentIndex = playerOrder.findIndex(p => p.username === currentPlayer);
      await addColoredLog(currentIndex, currentPlayer, `🗺️ Used a map card to reveal objective at ${objectivePosition}`);
      
      setTimeout(() => {
        setRevealedObjective(null);
      }, 5000);

      if (window.removeCardAndDraw) {
        window.removeCardAndDraw(cardIndex);}

      setCollapseMode({ active: false, card: null, cardIndex: null });
      const newDeckCount = Math.max(0, deckCount - 1);
      setDeckCount(newDeckCount);
      
      nextTurn({newDeckCount: newDeckCount});
    } finally {
      processingAction.current = false;
    }
  };

const activateCollapseMode = (card, cardIndex) => {
    setCollapseMode({ active: true, card, cardIndex });
    toast.info('💣Click on a tunnel card to destroy it');
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
    await addColoredLog(
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
  const addLog = async (msg, type = "info") => {
    await appendAndPersistLog(msg, type);
  };
  const addPrivateLog = async (msg, type = "info") => {
    // Los logs privados ahora también se sincronizan para consistencia
    await appendAndPersistLog(msg, type);
  };

  const addColoredLog = async (playerIndex, playerName, action) => {
    const coloredName = `<span class="player${playerIndex + 1}">${playerName}</span>`;
    await addLog(`${coloredName} ${action}`, "action");
  };

  const nextTurn = ({ force = false, newDeckCount = null } = {}) => {
    if (roundEndedRef.current === ROUND_STATE.ENDING || roundEndedRef.current === ROUND_STATE.ENDED) {
    console.log('⛔ nextTurn blocked: round ended');
    return false;
    }
    if (isTurnChanging.current && !force) return false;
    if (playerOrder.length === 0) return false;

    isTurnChanging.current = true;
    setTimeout(() => { isTurnChanging.current = false; }, 1000);

    setCollapseMode({ active: false, card: null, cardIndex: null });

    const currentTurnIndex = round?.turn || 0; 
    let nextIndex = (currentTurnIndex + 1) % playerOrder.length;
    
    // Auto-skip jugadores sin cartas
    let skippedPlayers = 0;
    const maxSkips = playerOrder.length;
    
    while (skippedPlayers < maxSkips) {
      const nextPlayer = playerOrder[nextIndex];
      const nextPlayerCards = playerCardsCount[nextPlayer?.username];
      
      // Verificar si TODOS tienen 0 cartas
      const allPlayersCards = playerOrder.map(p => playerCardsCount[p.username] || 0);
      const totalCards = allPlayersCards.reduce((sum, count) => sum + count, 0);
      
      if (totalCards === 0) {
        // Todos sin cartas, dejar que termine la ronda naturalmente
        break;
      }
      
      if (nextPlayerCards === 0) {
        // Este jugador no tiene cartas, saltar al siguiente
        const playerIndex = nextIndex;
        const playerClass = `player${playerIndex + 1}`;
        addLog(`<span class="${playerClass}">${nextPlayer.username}</span> has no cards, skipping turn`, "info");
        
        nextIndex = (nextIndex + 1) % playerOrder.length;
        skippedPlayers++;
      } else {
        // Este jugador tiene cartas, usar este índice
        break;
      }
    } 

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
    
    // Verificar si soy el primer jugador (responsable de calcular y enviar datos)
    let firstPlayerUsername = null;
    if (playerOrder.length > 0) {
        firstPlayerUsername = playerOrder[0]?.username;
    } else if (activePlayers.length > 0) {
        // Fallback: sort activePlayers locally if playerOrder is not yet set
        const sorted = [...activePlayers].sort((a, b) => a.id - b.id);
        firstPlayerUsername = sorted[0]?.user?.username || sorted[0]?.username;
    }

    const isFirstPlayer = firstPlayerUsername && loggedInUser?.username && firstPlayerUsername === loggedInUser?.username;
    const shouldExecuteLogic = isFirstPlayer || result.forcedByCreator;

    console.log(`🤖 handleRoundEnd Check: isFirstPlayer=${isFirstPlayer}, forced=${result.forcedByCreator} -> Executing=${shouldExecuteLogic}`);
    
    if (reason === 'GOLD_REACHED') {
      addLog(`🏆 Round ended! The ${winnerTeam} found the gold at ${goldPosition}!`, 'success');
      
      if (revealedObjective?.position !== goldPosition) {
        setRevealedObjective({ position: goldPosition, cardType: 'gold' });
      }
    } else if (reason === 'NO_CARDS' || reason === 'ALL_PLAYERS_OUT_OF_CARDS') {
      addLog(`🏆 Round ended! No more cards. ${winnerTeam} win!`, 'success');
    }

    // Solo el primer jugador (o el creador si forzó el fin) calcula y envía los datos
    if (shouldExecuteLogic) {
      console.log('I am responsible (FirstPlayer or Creator), calculating gold distribution...');
      console.log('activePlayers with roles:', activePlayers.map(p => ({ username: p.username, rol: p.rol })));
      
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

    // Determinar robustamente quién es el primer jugador
    let firstPlayerUsername = null;
    if (playerOrder.length > 0) {
        firstPlayerUsername = playerOrder[0]?.username;
    } else if (activePlayers.length > 0) {
        // Fallback: sort activePlayers locally if playerOrder is not yet set
        const sorted = [...activePlayers].sort((a, b) => a.id - b.id);
        firstPlayerUsername = sorted[0]?.user?.username || sorted[0]?.username;
    }

    const isFirstPlayer = firstPlayerUsername && loggedInUser?.username && firstPlayerUsername === loggedInUser?.username;
    console.log(`🔄 Navigation Check: isFirstPlayer=${isFirstPlayer}`);
    
    const isLastRound = round?.roundNumber === 3;

    if (isLastRound) {
      if (hasTriggeredGameEnd.current) return;
      hasTriggeredGameEnd.current = true;
      handleLastRoundEnd(roundEndData);
      return;
    }

    // Solo el primer jugador crea la nueva ronda
    // Los demás esperarán el mensaje WebSocket NEW_ROUND
    if (!isFirstPlayer) {
      console.log('🔄 Not the first player, waiting for WebSocket NEW_ROUND message...');
      return; // Los demás jugadores esperan el WebSocket
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
          // Guardar firma de roles de la ronda anterior para detectar si el backend aún devuelve roles antiguos
          try {
            const prevFromPublished = (lastPublishedRoles?.current && Array.isArray(lastPublishedRoles.current) && lastPublishedRoles.current.length > 0)
              ? lastPublishedRoles.current
                  .map(p => ({ u: p.username, r: p.role === 'SABOTEUR' ? 1 : 0 }))
              : null;

            const prevFromActivePlayers = (Array.isArray(activePlayers) ? activePlayers : [])
              .filter(p => typeof p?.rol === 'boolean')
              .map(p => ({ u: p.username, r: p.rol === true ? 1 : 0 }));

            const base = (prevFromPublished && prevFromPublished.length > 0) ? prevFromPublished : prevFromActivePlayers;

            const prevSig = base
              .sort((a, b) => String(a.u).localeCompare(String(b.u)))
              .map(x => `${x.u}:${x.r}`)
              .join('|');

            sessionStorage.setItem('previousRoundRolesSignature', prevSig);
          } catch (e) {
            console.warn('Could not store previous round roles signature', e);
          }

          sessionStorage.setItem('newRoundData', JSON.stringify({
            game: game,
            round: newRound,
            isSpectator: isSpectator
          }));

          // Marcar que en esta ronda hay que reasignar roles (sobrevive al reload)
          if (newRound?.id !== undefined && newRound?.id !== null) {
            sessionStorage.setItem('forceRolesReassignmentRoundId', String(newRound.id));
          }

          window.location.href = `/board/${newRound.board}`;
        }
        
      } catch (error) {
        console.error('❌ Error creating new round:', error);
        toast.error('Error creating new round');
        isNavigatingToNewRound.current = false;
      }
    };
    
    createNewRound();
  }, [roundEndCountdown, roundEndData, activePlayers, playerOrder, loggedInUser, round, game]);

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
    sessionStorage.removeItem('savedGameData');
    sessionStorage.removeItem('newRoundData');
    navigate('/lobby');
  }, [gameEndCountdown, gameEndData, navigate]);

  const handleDiscard = async () => {
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
        
        await addColoredLog(
          currentIndex,
          playerOrder[currentIndex].username,
          `🎴 Discarded a card and take one. ${newDeckCount} cards left in the deck.`);
        toast.success('Card discarded successfully!');
        
        nextTurn({newDeckCount: newDeckCount});
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
        goldPosition: `[${r}][${c}]`,
        forcedByCreator: true
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
    const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
    const roundId = typeof round?.id === 'number' ? round.id : round?.round?.id;

    if (!logId || !roundId) {
      console.warn('Cannot persist log: missing logId or roundId');
      return;
    }

    try {
      // Obtener el estado MÁS RECIENTE del servidor primero
      const currentLog = await getLog(logId);
      const serverMessages = currentLog?.messages || [];
      
      // Añadir el nuevo mensaje a los mensajes del servidor
      const nextMessages = [...serverMessages, msg];
      
      // Persistir en el servidor
      await patchLog(logId, { round: roundId, messages: nextMessages });
      
      // Actualizar referencias
      lastSyncedLogMessages.current = nextMessages;
      
      // Actualizar UI inmediatamente con el resultado confirmado
      const serverLog = nextMessages.map((m, idx) => ({ 
        msg: m, 
        type: 'info',
        timestamp: Date.now() - (nextMessages.length - idx) * 10
      }));
      setGameLog(serverLog);
      
      setLogData(prev => ({
        ...(prev || {}),
        id: logId,
        messages: nextMessages
      }));
      
    } catch (error) {
      console.error('Error persisting log:', error);
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
          toast.info('Spectator mode activated✅');
          // Espectadores no esperan sincronización
          setWaitingForPlayers(false);
          setIsLoading(false);
        } else {
          // Recalcular condiciones en tiempo de ejecución para decidir si
          // saltamos la sincronización de jugadores o no.
          const isRefreshNow = detectPageRefresh();
          const newRoundRaw = sessionStorage.getItem('newRoundData');
          const savedGameRaw = sessionStorage.getItem('savedGameData');
          const hasNewRoundSession = newRoundRaw !== null;
          const hasSavedGameSession = savedGameRaw !== null;

          const shouldSkipPlayerSyncLocal = hasNewRoundSession || (isRefreshNow && hasSavedGameSession);

          console.log('🔎 Player sync decision:', {
            isRefreshNow,
            hasNewRoundSession,
            hasSavedGameSession,
            newRoundRawPreview: hasNewRoundSession ? (newRoundRaw ? newRoundRaw.substring(0, 300) : '<empty>') : null,
            savedGameRawPreview: hasSavedGameSession ? (savedGameRaw ? savedGameRaw.substring(0, 300) : '<empty>') : null,
            locationStatePresent: !!location?.state,
            forceRolesReassignmentRoundId: sessionStorage.getItem('forceRolesReassignmentRoundId')
          });

          if (shouldSkipPlayerSyncLocal) {
            console.log('🔄 Skipping player sync (refresh or round transition) - local decision', { isRefreshNow, hasNewRoundSession, hasSavedGameSession });
            setWaitingForPlayers(false);
            setIsLoading(false);
          } else {
            // Entrada fresca a una nueva partida - notificar al servidor que este jugador está listo
            console.log('🎮 Fresh game entry - waiting for player sync');
            updateLoadingStep(7); // Marcar que estamos esperando jugadores
            try {
              const res = await fetch('/api/v1/rounds/playerReady', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                  roundId: round?.id,
                  username: loggedInUser?.username
                }),
              });
              let bodyTxt = null;
              try {
                bodyTxt = await res.text();
              } catch (e) {
                bodyTxt = '<unreadable response body>';
              }
              console.log('📤 Notificado al servidor: jugador listo', { ok: res.ok, status: res.status, body: bodyTxt });
            } catch (err) {
              console.error('Error notificando playerReady:', err);
              // Si falla, salir del loading de todas formas para no bloquear
              setWaitingForPlayers(false);
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        toast.error('Error loading game data');
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  useEffect(() => {
    const logId = typeof round?.log === 'number' ? round.log : round?.log?.id;
    if (!logId) return;

    let cancelled = false;

    const syncLogFromServer = async () => {
      if (cancelled) return;
      
      try {
        const log = await getLog(logId);
        if (cancelled || !log) return;

        if (log.messages && Array.isArray(log.messages)) {
          const serverMessages = log.messages;
          const currentMessages = lastSyncedLogMessages.current;
          
          // Comparar si los mensajes son realmente diferentes
          const isDifferent = serverMessages.length !== currentMessages.length ||
            JSON.stringify(serverMessages) !== JSON.stringify(currentMessages);
          
          if (!isDifferent) {
            return;
          }
          
          // Actualizar con los mensajes del servidor (siempre confiar en el servidor)
          const serverLog = serverMessages.map((msg, idx) => ({ 
            msg, 
            type: 'info',
            timestamp: Date.now() - (serverMessages.length - idx) * 10
          }));
          
          setGameLog(serverLog);
          lastSyncedLogMessages.current = [...serverMessages];
          setLogData(log);
        }
      } catch (error) {
        console.error('Error syncing log:', error);
      }
    };

    // Exponer la función para que appendAndPersistLog pueda llamarla
    syncLogFromServerRef.current = syncLogFromServer;

    // Sincronización inicial
    syncLogFromServer();

    // Polling cada 1 segundo para sincronización más rápida
    const syncInterval = setInterval(syncLogFromServer, 1000);

    return () => {
      cancelled = true;
      syncLogFromServerRef.current = null;
      clearInterval(syncInterval);
    };
  }, [round?.log, round?.id]);

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
    // Initialize tools only for usernames that don't have an entry yet.
    // This avoids overwriting runtime updates coming from TOOLS_CHANGED WS messages
    // while still ensuring new players get default tool states.
    setPlayerTools(prev => {
      const next = { ...(prev || {}) };
      Object.keys(initialTools).forEach(username => {
        if (!(username in next)) {
          next[username] = initialTools[username];
        }
      });
      return next;
    });
    let cancelled = false;

    const getOrderedUsernames = () => {
      // Prefer the already-computed playerOrder
      if (Array.isArray(playerOrder) && playerOrder.length > 0) {
        return playerOrder.map(p => p?.username).filter(Boolean);
      }

      // Otherwise, compute the same ordering playerOrder uses: by birthDate asc (oldest first)
      if (Array.isArray(activePlayers) && activePlayers.length > 0) {
        return [...activePlayers]
          .sort((a, b) => {
            const da = a?.birthDate ? new Date(a.birthDate).getTime() : Number.POSITIVE_INFINITY;
            const db = b?.birthDate ? new Date(b.birthDate).getTime() : Number.POSITIVE_INFINITY;
            if (da !== db) return da - db;
            return (a?.id ?? 0) - (b?.id ?? 0);
          })
          .map(p => p?.username)
          .filter(Boolean);
      }

      return [];
    };

    const getFirstPlayerUsername = () => {
      const ordered = getOrderedUsernames();
      return ordered.length > 0 ? ordered[0] : null;
    };

    const firstPlayerUsername = getFirstPlayerUsername();
    const isRoleAssigner =
      !!firstPlayerUsername && !!loggedInUser?.username && firstPlayerUsername === loggedInUser.username;

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

    const rolesSignature = (rolesList) =>
      (Array.isArray(rolesList) ? rolesList : [])
        .map(r => ({ u: r.username, v: r.role === 'SABOTEUR' ? 1 : 0 }))
        .sort((a, b) => String(a.u).localeCompare(String(b.u)))
        .map(x => `${x.u}:${x.v}`)
        .join('|');

    const fnv1a32 = (str) => {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      return h >>> 0;
    };

    const mulberry32 = (seed) => {
      let t = seed >>> 0;
      return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    };

    const assignRolesDeterministic = (players, seedStr) => {
      const list = Array.isArray(players) ? players : [];
      const n = list.length;
      const numSaboteur = calculateSaboteurCount(n);
      const ordered = [...list].sort((a, b) => String(a.username).localeCompare(String(b.username)));
      const rng = mulberry32(fnv1a32(String(seedStr ?? '')));

      // Deterministic Fisher–Yates
      for (let i = ordered.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }

      return ordered.map((p, i) => ({
        username: p.username,
        role: i < numSaboteur ? 'SABOTEUR' : 'MINER',
        roleImg: i < numSaboteur ? saboteurRol : minerRol,
        roleName: i < numSaboteur ? 'SABOTEUR' : 'MINER'
      }));
    };

    const publishRoles = (rolesList) => {
      if (cancelled) return;
      if (sameRoles(lastPublishedRoles.current, rolesList)) return;

      lastPublishedRoles.current = rolesList.map(({ username, role }) => ({ username, role }));
      setPlayerRol(rolesList);
      if (isSpectator) return;


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
        console.error('Error persisting roles:', err);
        toast.error('Error saving assigned roles');
      }
    };

    const syncRoles = async () => {
      const sessionForceRoundId = sessionStorage.getItem('forceRolesReassignmentRoundId');
      const shouldForceFromSession =
        sessionForceRoundId && round?.id && String(sessionForceRoundId) === String(round.id);

      const expectedSaboteurs = calculateSaboteurCount(activePlayers.length);
      const backendRoles = buildRolesFromBackend();
      const saboteursAlready = backendRoles.filter(r => r.role === 'SABOTEUR').length;
      const rolesComplete =
        backendRoles.length === activePlayers.length &&
        saboteursAlready === expectedSaboteurs;

      // Si se fuerza la reasignación (nueva ronda), siempre reasignar roles
      if (shouldForceFromSession || forceRolesReassignment.current) {
        console.log('🎭 Forcing role reassignment for new round');
        forceRolesReassignment.current = false;

        // Evitar condiciones de carrera: solo el primer jugador asigna y persiste
        if (isSpectator) {
          publishRoles(backendRoles);
          return;
        }

        if (!isRoleAssigner) {
          // Esperar a que el primer jugador persista roles.
          // Ojo: el backend puede devolver roles "completos" pero aún ser los de la ronda anterior.
          // Para evitar quedarnos con roles antiguos, hacemos polling unas pocas veces.
          const pollKey = round?.id ? `forceRolesReassignmentPolls_${round.id}` : 'forceRolesReassignmentPolls';
          const polls = Number(sessionStorage.getItem(pollKey) || '0');
          const nextPolls = polls + 1;
          sessionStorage.setItem(pollKey, String(nextPolls));

          const prevSig = sessionStorage.getItem('previousRoundRolesSignature');
          const currSig = rolesSignature(backendRoles);
          const looksLikeStillPrevious = !!prevSig && currSig === prevSig;

          // Fallback seguro: si tras varios polls seguimos viendo exactamente la firma anterior,
          // dejamos que un único "segundo jugador" haga la asignación/persistencia.
          const ordered = getOrderedUsernames();
          const takeoverUsername = ordered.length > 1 ? ordered[1] : null;
          const canTakeOver =
            !!takeoverUsername && !!loggedInUser?.username && takeoverUsername === loggedInUser.username;

          if (canTakeOver && looksLikeStillPrevious && nextPolls >= 15) {
            console.warn('🎭 Role reassignment takeover by fallback player:', takeoverUsername);
            const baseSeed = `round:${round?.id ?? 'unknown'}:takeover`;
            let rolesAssigned = assignRolesDeterministic(activePlayers, baseSeed);
            if (prevSig) {
              let attempts = 0;
              while (attempts < 8 && rolesSignature(rolesAssigned) === prevSig) {
                attempts += 1;
                rolesAssigned = assignRolesDeterministic(activePlayers, `${baseSeed}:retry:${attempts}`);
              }
            }
            publishRoles(rolesAssigned);
            await persistRoles(rolesAssigned);
            sessionStorage.removeItem('forceRolesReassignmentRoundId');
            sessionStorage.removeItem(pollKey);
            sessionStorage.removeItem('previousRoundRolesSignature');
            return;
          }

          if (rolesComplete && nextPolls >= 2 && !looksLikeStillPrevious) {
            sessionStorage.removeItem('forceRolesReassignmentRoundId');
            sessionStorage.removeItem(pollKey);
            sessionStorage.removeItem('previousRoundRolesSignature');
            publishRoles(backendRoles);
            return;
          }

          setTimeout(() => {
            loadActivePlayers();
          }, 400);
          return;
        }

        // Primer jugador: reasigna y persiste (determinista por ronda para evitar intermitencia)
        const prevSig = sessionStorage.getItem('previousRoundRolesSignature');
        const baseSeed = `round:${round?.id ?? 'unknown'}`;
        let rolesAssigned = assignRolesDeterministic(activePlayers, baseSeed);
        if (prevSig) {
          // Si por casualidad coincide con la ronda anterior, variar la semilla de forma determinista
          let attempts = 0;
          while (attempts < 8 && rolesSignature(rolesAssigned) === prevSig) {
            attempts += 1;
            rolesAssigned = assignRolesDeterministic(activePlayers, `${baseSeed}:retry:${attempts}`);
          }
        }
        publishRoles(rolesAssigned);
        await persistRoles(rolesAssigned);
        sessionStorage.removeItem('forceRolesReassignmentRoundId');
        sessionStorage.removeItem('previousRoundRolesSignature');
        return;
      }

      if (rolesComplete) {
        publishRoles(backendRoles);
        return;
      }

      // Si faltan roles, solo el creador los asigna/persiste para evitar carreras
      if (isSpectator) {
        publishRoles(backendRoles);
        return;
      }

      if (!isRoleAssigner) {
        setTimeout(() => {
          loadActivePlayers();
        }, 400);
        return;
      }

      const rolesAssigned = assignRolesDeterministic(activePlayers, `round:${round?.id ?? 'unknown'}:missingRoles`);
      publishRoles(rolesAssigned);
      await persistRoles(rolesAssigned);
    };

    syncRoles();

    return () => { cancelled = true; };
  }, [activePlayers, playerOrder, loggedInUser?.username, round?.id, isSpectator]);

  useEffect(() => {
    if (!currentPlayer || playerOrder.length === 0 || roundEnded) return;

    // No iniciar timer hasta que todos los jugadores estén listos
    if (waitingForPlayers) return;

    const isMyTurn = !isSpectator && loggedInUser.username === currentPlayer;

    // Only decrement timer if it's the current player's turn
    if (!isMyTurn) {
      // For other players, keep the timer frozen at timeturn
      console.log('⏸ Timer frozen for non-current player', { currentPlayer, myUsername: loggedInUser.username, waitingForPlayers, cont });
      setCont(timeturn);
      return;
    }

    console.log('▶️ Starting timer interval', { currentPlayer, myUsername: loggedInUser.username, waitingForPlayers });
    const time = setInterval(() => {
      setCont((prevCont) => {
        if (prevCont <= 1) {
          clearInterval(time);
          handleTurnTimeOut();
          return 0;
        }
        return prevCont - 1;
      });
    }, 1000);

    return () => {
      clearInterval(time);
      console.log('⏹ Clearing timer interval', { currentPlayer, myUsername: loggedInUser.username });
    };
  }, [currentPlayer, loggedInUser.username, playerOrder.length, roundEnded, isSpectator, waitingForPlayers]);

  useEffect(() => {
    if (roundEnded) {
      setCont(0);
    }
  }, [roundEnded]);

  useEffect(() => {
    const initializeLeftCards = async () => {
      if (activePlayers.length > 0 && round?.id && !hasPatchedInitialLeftCards.current) {
        const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
        
        // Hacer fetch fresco del round desde el backend
        console.log('🃏 Fetching fresh round data for round:', round.id);
        const freshRound = await getRoundById(round.id);
        const backendLeftCards = freshRound?.leftCards;
        const backendTurn = freshRound?.turn;
        
        console.log('🃏 Backend Round Data:', { backendLeftCards, backendTurn });

        if (backendLeftCards !== undefined && backendLeftCards !== null && backendLeftCards >= 0) {
            console.log('🃏 Using backend leftCards:', backendLeftCards);
            
            const expectedInitialDeck = 70 - (activePlayers.length * calculateCardsPerPlayer(activePlayers.length));
            const isFirstTurn = backendTurn === 0 || backendTurn === null || backendTurn === undefined;

            if (isFirstTurn && backendLeftCards !== expectedInitialDeck) {
                 console.warn(`🃏 Initial deck mismatch! Backend: ${backendLeftCards}, Expected: ${expectedInitialDeck}. Auto-correcting...`);
                 setDeckCount(expectedInitialDeck);
                 patchRound(round.id, { leftCards: expectedInitialDeck });
            } else {
                 setDeckCount(backendLeftCards);
            }
        } else {
             // Fallback only if backend data is missing
             console.log("🃏 calculating initial deck locally")
             const cardsPerPlayer = calculateCardsPerPlayer(activePlayers.length);
             const initialDeck = calculateInitialDeck(activePlayers.length, cardsPerPlayer);
             setDeckCount(initialDeck);
             patchRound(round.id, { leftCards: initialDeck });
        }

        // ... rest of the logic
        const initialCounts = {};
        activePlayers.forEach(p => {
          if (!p) return; 
          const name = p.username || p;
          if (name) {
             // We don't have per-player card counts from backend round yet? 
             // We'll trust the WebSocket updates for specific counts, 
             // or initialize securely if needed. For now, rely on deckMessage.
            initialCounts[name] = cardsPerPlayer;
          }
        });
        setPlayerCardsCount(initialCounts);
        hasPatchedInitialLeftCards.current = true;
      }
    };
    
    initializeLeftCards();
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
      
      // Restaurar cartas objetivo reveladas desde sessionStorage
      const savedKey = `revealedGoals_${round.id}`;
      const saved = sessionStorage.getItem(savedKey);
      if (saved) {
        try {
          const revealedGoals = JSON.parse(saved);
          console.log('🔄 Restoring revealed goals from sessionStorage:', revealedGoals);
          
          Object.entries(revealedGoals).forEach(([posKey, cardType]) => {
            // Parsear la clave de posición "[row][col]" 
            const match = posKey.match(/\[(\d+)\]\[(\d+)\]/);
            if (match) {
              const row = parseInt(match[1], 10);
              const col = parseInt(match[2], 10);
              if (baseBoard[row] && baseBoard[row][col]) {
                baseBoard[row][col] = {
                  ...baseBoard[row][col],
                  revealed: true,
                  cardType: cardType
                };
                console.log(`✅ Restored revealed goal at [${row}][${col}] = ${cardType}`);
              }
            }
          });
        } catch (e) {
          console.error('Error restoring revealed goals:', e);
        }
      }
      
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
      
      <SpectatorIndicator isSpectator={isSpectator} onExit={handleExitSpectatorMode} />

      <PlayerRole 
        playerRol={playerRol} 
        activePlayers={activePlayers}
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
        isMyTurn={loggedInUser?.username === currentPlayer}
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