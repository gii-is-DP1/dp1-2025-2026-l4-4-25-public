import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import tokenService from "../../services/token.service";
import useWebSocket from "../../hooks/useWebSocket";
import useLobbyData from "./hooks/useLobbyData";
import { canStartGame, isPlayerInLobby, removePlayerFromLobby } from "./utils/lobbyUtils";

// Importar componentes modulares
import LobbyInfo from "./components/LobbyInfo";
import JoinRequestsPanel from "./components/JoinRequestsPanel";
import GameSettings from "./components/GameSettings";
import PlayersListLobby from "./components/PlayersListLobby";
import InviteFriends from "./components/InviteFriends";
import LobbyControls from "./components/LobbyControls";

import "../../static/css/lobbies/games/CreateGame.css";

const CreateGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jwt = tokenService.getLocalAccessToken();
  const loggedInUser = tokenService.getUser();
  
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
    postFirstMessage,
    updateGame,
    deleteGame,
    sendMessage,
    deleteMessages,
    postround,
    round
  } = useLobbyData(game?.id, jwt, isCreator);

  // Sincronizar el estado del juego con el hook
  useEffect(() => {
    if (gameFromHook) {
      setGame(gameFromHook);
    }
  }, [gameFromHook]);

  // WebSocket para actualizaciones en tiempo real
  const socketMessage = useWebSocket(
    `/topic/game/${game?.id}`,
    `/topic/private/${loggedInUser?.username}`,
    jwt
  );

  // Navegación automática cuando el juego comienza
  useEffect(() => {
  if (game?.gameStatus === "ONGOING" && round?.board?.id) {
    navigate(`/board/${round.board.id}`, { state: { game } });
  }
}, [game?.gameStatus, round?.board?.id, navigate, game]);


  // Lógica para unirse al juego (solo no-creadores)
  useEffect(() => {
    if (!game?.id || isCreator) return;

    const joinGame = async () => {
      try {
        const currentUsername = loggedInUser?.username;
        const currentActivePlayers = game.activePlayers ?? [];

        if (isPlayerInLobby(currentActivePlayers, currentUsername)) {
          console.log("Ya estás en la partida");
          return;
        }

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
          console.log("Unido a la partida con éxito");
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
  }, [game?.id]);

  // Postear mensaje de bienvenida y obtener info del jugador (solo creador)
  useEffect(() => {
    if (!game?.creator || !game?.chat) return;
    
    postFirstMessage(game.creator, game.chat);

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

  // Handlers para solicitudes de unión
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

    try {
      const newGame = await updateGame(request);
      setpatchgame(newGame);
      const newRound = await postround(newGame.id, 1);  
      toast.success("¡Game started successfully!");
      navigate(`/board/${newRound.board}`, { state: { game: newGame, round: newRound } });
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

          <InviteFriends />

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