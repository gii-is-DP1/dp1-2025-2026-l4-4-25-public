import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import generateRandomLink from '../util/generateRandomLink';
import { createGameRequest } from './utils/lobbyHelpers';
import useLobbyUser from './hooks/useLobbyUser';

// Importar componentes modulares
import Logo from './components/Logo';
import TopRightButtons from './components/TopRightButtons';
import InfoButton from './components/InfoButton';
import PlayerActions from './components/PlayerActions';
import AdminActions from './components/AdminActions';
import RankingButton from './components/RankingButton';

import '../App.css';
import '../static/css/home/home.css';

export default function Lobby() {
  const navigate = useNavigate();
  const [showFriends, setShowFriends] = useState(false);
  
  // Custom hook para manejar usuario, player y amigos
  const { isAdmin, player, friends, jwt } = useLobbyUser();

  const handleCreateGame = async () => {
    console.log("este es el player submit", player);
    
    try {
      // Generar enlace aleatorio para el juego
      const randomPart = generateRandomLink(16);
      const fullLink = `https://saboteur.com/game/${randomPart}`;

      // Crear solicitud de juego usando helper
      const gameRequest = createGameRequest(player, fullLink);
      console.log('Enviando solicitud de partida:', gameRequest);

      // POST para crear el juego
      const gameResponse = await fetch("/api/v1/games", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify(gameRequest),
      });

      if (gameResponse.ok) {
        const newGame = await gameResponse.json();
        toast.success("¡Partida creada con éxito!");
        console.log("Partida creada:", newGame);
        navigate('/CreateGame/' + newGame.id, { state: { game: newGame } });
      } else {
        const errorData = await gameResponse.json();
        toast.warn(`Error al crear la partida: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Hubo un problema con la petición fetch:', error);
      toast.error('Error de red. No se pudo conectar con el servidor.');
    }
  };

  const handleToggleFriends = () => {
    setShowFriends(prev => !prev);
  };

  return (
    <div className="home-page-lobby-container">
      <Logo />
      
      <TopRightButtons
        isAdmin={isAdmin}
        showFriends={showFriends}
        onToggleFriends={handleToggleFriends}
        friends={friends}
      />

      <InfoButton />

      {!isAdmin && (
        <PlayerActions onCreateGame={handleCreateGame} />
      )}

      {isAdmin && <AdminActions />}

      <RankingButton />
    </div>
  );
}



