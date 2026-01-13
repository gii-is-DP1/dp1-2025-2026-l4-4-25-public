import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createGameRequest } from './utils/lobbyHelpers';
import useLobbyUser from './hooks/useLobbyUser';

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
  const { isAdmin, player, friends, jwt } = useLobbyUser();

  const handleCreateGame = async () => {
    console.log("this is the player submit", player);
    
    try {
      const gameRequest = createGameRequest(player);
      console.log('Sending game request:', gameRequest);

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
        toast.success("Game created successfully!");
        console.log("Game created:", newGame);
        navigate('/CreateGame/' + newGame.id, { state: { game: newGame } });
      } else {
        const errorData = await gameResponse.json();
        toast.warn(`Error creating game: ${errorData.message}`);
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      toast.error('Network error. Could not connect to the server.');
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



