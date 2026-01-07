import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import tokenService from "../../services/token.service";
import useWebSocket from "../../hooks/useWebSocket";
import useLobbyData from "./hooks/useLobbyData";
import { canStartGame, isPlayerInLobby, removePlayerFromLobby } from "./utils/lobbyUtils";

// Importar componentes modulares
import LobbyInfo from "./components/LobbyInfo";
import JoinRequestsPanel from "./components/JoinRequestsPanel";
import SpectatorRequestsPanel from "./components/SpectatorRequestsPanel";
import GameSettings from "./components/GameSettings";
import PlayersListLobby from "./components/PlayersListLobby";
import InviteFriends from "./components/InviteFriends";
import LobbyControls from "./components/LobbyControls";

import "../../static/css/lobbies/games/CreateGame.css";
import { useGameData } from "../../game/hooks/useGameData";

const CreateGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jwt = tokenService.getLocalAccessToken();
  const loggedInUser = tokenService.getUser();
  

  const welcomeMessageSentRef = useRef(false);
  
  // Estado inicial del juego desde la navegación
  const [game, setGame] = useState(location.state?.game ?? null);
  const [player, setPlayer] = useState(null);
  const [numPlayers, setnumPlayers] = useState(game?.maxPlayers ?? 3);
  const [isPrivate, setisPrivate] = useState(game?.private ?? false);
  const [patchgame, setpatchgame] = useState(game);
  const [lobbyIn, SetLobbyIn] = useState(() => {
    try {
      return isPlayerInLobby(game?.activePlayers, loggedInUser?.username);
    } catch (e) {
      return false;
    }
  });

  const isCreator = game?.creator === loggedInUser?.username;

  // Custom hook para manejo de datos del lobby
  const {
    game: gameFromHook,
    setGame: setGameFromHook,
    joinRequests,
    setJoinRequests,
    spectatorRequests,
    setSpectatorRequests,
    postFirstMessage,
    updateGame,
    deleteGame,
    sendMessage,
    deleteMessages,
    postround,
    round
  } = useLobbyData(game?.id, jwt, isCreator);

  const {
    patchActivePlayer,
    fetchActivePlayerByUsername,
  } = useGameData(game);

  // Sincronizar el estado del juego con el hook
  useEffect(() => {
    if (gameFromHook) {
      setGame(gameFromHook);
    }
  }, [gameFromHook]);

  // WebSocket para actualizaciones en tiempo real
  const socketMessage = useWebSocket(
    `/topic/game/${game?.id}`
  );

  // Efecto para procesar el mensaje que viene del socket
  useEffect(() => {
    console.log("Mensaje recibido del socket:", socketMessage);

    if (!socketMessage) return;

    let payload = socketMessage;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.error("Error parseando mensaje WS:", e);
        return;
      }
    }

    if (payload.gameCancelled) {
      toast.error("The game has been cancelled by the creator");
      setTimeout(() => {
        navigate('/lobby')}, 2000);
      return}

    if (payload.adminAction) {
      handleAdminActionInLobby(payload);
      return}

    const { game: updatedGame, round: updatedRound } = payload;
    console.log(" ROUND COMPLETO DEL SOCKET:", updatedRound);
    console.log(" BOARD EN EL ROUND:", updatedRound?.board);

    if (!updatedGame) return;

    setGame(updatedGame);

    if (updatedGame.gameStatus === "ONGOING" && updatedRound?.board) {
      navigate(`/board/${updatedRound.board}`, {
        state: { game: updatedGame, round: updatedRound }
      });
    }
  }, [socketMessage]);

  useEffect(() => {
    if (!game?.id) return;

    const currentUsername = loggedInUser?.username;
    const currentActivePlayers = game?.activePlayers ?? [];

    if (isCreator) return;
    if (!currentUsername) return;
    if (currentActivePlayers.includes(currentUsername)) return;

    const joinGame = async () => {
      try {
        const updatedActivePlayerList = [...currentActivePlayers, currentUsername];

        const patchResponse = await fetch(`/api/v1/games/${game.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          },
          body: JSON.stringify({ activePlayers: updatedActivePlayerList }),
        });

        if (patchResponse.ok) {
          const updatedGame = await patchResponse.json();
          setGame(updatedGame);
          SetLobbyIn(true);
        } else {
          toast.error("Error al intentar unirse a la partida");
          navigate("/ListGames");
        }
      } catch (error) {
        console.error("Error en el proceso de unirse:", error);
        toast.error(error.message);
        navigate("/ListGames");
      }
    };

    joinGame();

}, [game?.id, game?.activePlayers]);

  // Postear mensaje de bienvenida y obtener info del jugador (solo creador)
  useEffect(() => {
    if (!game?.creator || !game?.chat) return;
    
    // Solo enviar el mensaje de bienvenida una vez y solo si el usuario es el creador
    if (!welcomeMessageSentRef.current && isCreator) {
      welcomeMessageSentRef.current = true;
      postFirstMessage(game.creator, game.chat);
    }

    const fetchPlayer = async () => {
      try {
        const loggedInUser = tokenService.getUser();
        if (!loggedInUser || !loggedInUser.id) {
          console.error("No se encontró el ID del usuario.");
          return;
        }

        const response = await fetch(`/api/v1/players?username=${game.creator}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPlayer(data);
        } else {
          console.error('Respuesta no OK:', response.status);
          toast.error('Error al obtener la información del jugador.');
        }
      } catch (error) {
        console.error('Hubo un problema con la petición fetch:', error);
        toast.error('Error de red. No se pudo conectar con el servidor.');
      }
    };

    fetchPlayer();
  }, [game?.creator, game?.chat]);

  // Monitorear si el jugador es expulsado
  useEffect(() => {
    if (!game || !game.id) return;
    const currentUsername = loggedInUser?.username;
    if (!currentUsername) return;

    const currentIn = isPlayerInLobby(game.activePlayers, currentUsername);
    
    if (lobbyIn && !currentIn) {
      toast.error('You have been expelled from the game');
      navigate('/lobby');
    }
    
    SetLobbyIn(currentIn);
  }, [game?.activePlayers]);

  const handleAdminActionInLobby = (payload) => {
    const { adminAction } = payload;
    if (!adminAction) return;
    const currentUser = tokenService.getUser()?.username;
    if (adminAction.action === "FORCE_FINISH") {
      toast.error(`⚠️ Admin has deleted this game. Reason: ${adminAction.reason}`);
      setTimeout(() => {
        navigate('/lobby')}, 3000);
    } else if (adminAction.action === "PLAYER_EXPELLED") {
      if (adminAction.affectedPlayer === currentUser) {
        toast.error(`🚫 You have been expelled from this game. Reason: ${adminAction.reason}`);
        setTimeout(() => {
          navigate('/lobby');
        }, 3000);
      } else {
        toast.warning(`⚠️ Player ${adminAction.affectedPlayer} has been expelled by admin. Reason: ${adminAction.reason}`);
        if (payload.game) {
          setGame(payload.game);
        }}}
  };

  const handleAcceptRequest = async (username) => {
    try {
      const currentActivePlayers = Array.from(new Set(game.activePlayers ?? []));
      
      if (isPlayerInLobby(currentActivePlayers, username)) {
        toast.info(`${username} is already in the lobby`);
        setJoinRequests(prev => prev.filter(p => p.username !== username));
        return;
      }

      const newActive = [...currentActivePlayers, username];
      const updated = await updateGame({ activePlayers: newActive });
      
      toast.success(`${username} accepted to the game`);
      
      await sendMessage(
        `REQUEST_ACCEPTED:${username}:${game.id}`,
        game.creator,
        game.chat
      );

      const msgsToDelete = joinRequests
        .filter(j => j.username === username)
        .map(j => j.messageId);
      
      await deleteMessages(msgsToDelete);
      setJoinRequests(prev => prev.filter(p => p.username !== username));
      
    } catch (err) {
      console.error(err);
      toast.error('Error to accept the request. Try Again.');
    }
  };

  const handleDenyRequest = async (username) => {
    try {
      await sendMessage(
        `REQUEST_DENIED:${username}:${game.id}`,
        game.creator,
        game.chat
      );

      const msgsToDelete = joinRequests
        .filter(j => j.username === username)
        .map(j => j.messageId);
      
      await deleteMessages(msgsToDelete);
      
      toast.info(`${username} has been denied`);
      setJoinRequests(prev => prev.filter(p => p.username !== username));
      
    } catch (err) {
      console.error(err);
      toast.error('Error to connect with the server. Try Again.');
    }
  };

  // Handlers para solicitudes de espectador
  const handleAcceptSpectatorRequest = async (username) => {
    try {
      toast.success(`${username} accepted as spectator`);

      const reqIds = (spectatorRequests || [])
        .filter(s => s.username === username)
        .map(s => s.messageId)
        .filter(id => id !== null && id !== undefined);
      const requestId = reqIds.length > 0 ? Math.max(...reqIds.map(Number).filter(Number.isFinite)) : null;

      const acceptContent = requestId !== null
        ? `SPECTATOR_ACCEPTED:${username}:${game.id}:${requestId}`
        : `SPECTATOR_ACCEPTED:${username}:${game.id}`;
      
      await sendMessage(
        acceptContent,
        game.creator,
        game.chat
      );

      const msgsToDelete = spectatorRequests
        .filter(s => s.username === username)
        .map(s => s.messageId);
      
      await deleteMessages(msgsToDelete);
      setSpectatorRequests(prev => prev.filter(p => p.username !== username));
      
    } catch (err) {
      console.error(err);
      toast.error('Error to accept spectator request. Try Again.');
    }
  };

  const handleDenySpectatorRequest = async (username) => {
    try {

      const reqIds = (spectatorRequests || [])
        .filter(s => s.username === username)
        .map(s => s.messageId)
        .filter(id => id !== null && id !== undefined);
      const requestId = reqIds.length > 0 ? Math.max(...reqIds.map(Number).filter(Number.isFinite)) : null;

      const denyContent = requestId !== null
        ? `SPECTATOR_DENIED:${username}:${game.id}:${requestId}`
        : `SPECTATOR_DENIED:${username}:${game.id}`;

      await sendMessage(
        denyContent,
        game.creator,
        game.chat
      );

      const msgsToDelete = spectatorRequests
        .filter(s => s.username === username)
        .map(s => s.messageId);
      
      await deleteMessages(msgsToDelete);
      
      toast.info(`${username} spectator request denied`);
      setSpectatorRequests(prev => prev.filter(p => p.username !== username));
      
    } catch (err) {
      console.error(err);
      toast.error('Error to connect with the server. Try Again.');
    }
  };

  // Handlers para controles del lobby
  const handleSubmit = async () => {
    const request = {
      gameStatus: "CREATED",
      private: isPrivate,
      maxPlayers: parseInt(numPlayers),
    };

    try {
      const updated = await updateGame(request);
      toast.success("¡Game updated successfully!");
      setpatchgame(updated);
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error of network. Try Again.');
    }
  };

  const handleStart = async () => {
    const request = {
      gameStatus: "ONGOING",
    };
    const tools = {
      pickaxeState: true,
      cartState: true,
      candleState: true,
      goldNugget: 0,  // Resetear pepitas a 0 al iniciar la partida
      rol: false
    }
    try {
      console.log("Starting game:", game);
      for (const player of game.activePlayers) {
        const playerData = await fetchActivePlayerByUsername(player);
        const resettools = await patchActivePlayer(playerData.id, tools);
      }
      const newRound = await postround(game.id, 1);
      const updatedGame = await updateGame(request);
      setpatchgame(updatedGame);  
      toast.success("Game started successfully!");
      // navigate(`/board/${newRound.board}`, { state: { game: newGame, round: newRound } });
    } catch (error) {
      console.error(error); 
      toast.error('Dont connect with the server.');
    }
  };

  const handleCancel = async () => {
    try {
      await deleteGame();
      toast.error("Partida eliminada");
      navigate("/lobby");
    } catch (error) {
      console.error(error);
      toast.error('No se pudo conectar con el servidor');
    }
  };

  const handleExpelPlayer = async (usernameToExpel) => {
    const newActivePlayers = removePlayerFromLobby(
      game.activePlayers,
      usernameToExpel
    );

    try {
      await updateGame({ activePlayers: newActivePlayers });
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo conectar con el servidor");
    }
  };

  const handleExitLobby = async () => {
    const currentPlayer = tokenService.getUser();
    const newActivePlayers = removePlayerFromLobby(
      game.activePlayers,
      currentPlayer.username
    );

    try {
      await updateGame({ activePlayers: newActivePlayers });
      navigate("/lobby");
      toast.success("Just left the game");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Dont connect with the server");
    }
  };

  return (
    <div className="home-page-container">
      <div className="hero-div">
        <LobbyInfo gameId={game?.id} />
        
        <div className="creategame-card">
          <JoinRequestsPanel
            joinRequests={isCreator ? joinRequests : []}
            onAccept={handleAcceptRequest}
            onDeny={handleDenyRequest}
          />
          
          <SpectatorRequestsPanel
            spectatorRequests={isCreator ? spectatorRequests : []}
            onAccept={handleAcceptSpectatorRequest}
            onDeny={handleDenySpectatorRequest}
          />

          <GameSettings
            numPlayers={numPlayers}
            onNumPlayersChange={setnumPlayers}
            isPrivate={isPrivate}
            onPrivacyChange={setisPrivate}
            isCreator={isCreator}
          />

          <PlayersListLobby
            activePlayers={game?.activePlayers ?? []}
            maxPlayers={game?.maxPlayers ?? 0}
            creatorUsername={game?.creator}
            isCreator={isCreator}
            onExpelPlayer={handleExpelPlayer}
          />

          {isCreator && (
            <InviteFriends 
              gameId={game?.id} 
              chatId={game?.chat} 
              activePlayers={game?.activePlayers ?? []}
            />
          )}

          <LobbyControls
            isCreator={isCreator}
            gameId={game?.id}
            canStart={canStartGame(game?.activePlayers?.length ?? 0)}
            onSave={handleSubmit}
            onStart={handleStart}
            onCancel={handleCancel}
            onExitLobby={handleExitLobby}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
