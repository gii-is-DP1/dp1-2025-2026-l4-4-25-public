import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../services/token.service';

// Helper function to get JWT dynamically (prevents stale token issues)
const getJwt = () => tokenService.getLocalAccessToken();

export default function GameEndModal({ 
  playerRankings,
  countdown,
  gameId,
  activePlayers
}) {
  const finishExecutedRef = useRef(false);
  
  // Ordenar por total de pepitas (de mayor a menor)
  const sortedRankings = [...(playerRankings || [])].sort((a, b) => b.totalNuggets - a.totalNuggets);
  
  const winner = sortedRankings[0];

  const handleFinish = async () => {
    if (finishExecutedRef.current) return;
    finishExecutedRef.current = true;

    const tools = {pickaxeState: true, cartState: true, candleState: true, goldNugget: 0, rol: false};
    
    try {
      console.log("Finishing game:", gameId);
      
      if (!activePlayers || !Array.isArray(activePlayers)) {
        console.warn("activePlayers is not valid:", activePlayers);
        await updateGame(gameId, {gameStatus: "FINISHED"});
        toast.success("Game finished successfully!");
        return}
      
      let winnerId = null;
      if (winner && winner.username) {
        const winnerData = await fetchActivePlayerByUsername(winner.username);
        if (winnerData) {
          winnerId = winnerData.id;
          console.log("🏆 Winner ID:", winnerId, "Username:", winner.username);
        }
      }
      
      const request = {
        gameStatus: "FINISHED",
        endTime: new Date().toISOString()
      };
      if (winnerId) {
        request.winner = { id: winnerId }}

      const validPlayers = activePlayers.filter(p => p && p.username);
      
      for (const player of validPlayers) {
        const playerData = await fetchActivePlayerByUsername(player.username);
        if (playerData) {
          await patchActivePlayer(playerData.id, tools)}
      }
      
      await updateGame(gameId, request);
      toast.success("Game finished successfully!");
    } catch (error) {
      console.error(error); 
      toast.error('Error finishing the game.');
    }
  };

  const fetchActivePlayerByUsername = async (username) => {
    try {
      const response = await fetch(`/api/v1/activePlayers/byUsername?username=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJwt()}`,
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching active player:', error);
      return null;
    }
  };

  const patchActivePlayer = async (playerId, updates) => {
    try {
      const response = await fetch(`/api/v1/activePlayers/${playerId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getJwt()}` 
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error patching active player:', error);
      return null;
    }
  };

  const updateGame = async (gameId, updates) => {
    try {
      const response = await fetch(`/api/v1/games/${gameId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getJwt()}` 
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to update game');
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (countdown === 0 && !finishExecutedRef.current) {
      handleFinish();
    }
  }, [countdown]);
  
  const getPodiumEmoji = (position) => {
    switch(position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${position + 1}`;
    }
  };

  return (
    <div className="round-end-overlay">
      <div className="round-end-card game-end-card">
        <h2 className="game-end-title">
          🎮🏆 GAME OVER 🏆🎮
        </h2>
        
        {winner && (
          <div className="game-winner-section">
            <h3 className="winner-announcement">👑 WINNER 👑</h3>
            <div className="winner-card">
              <span className="winner-emoji">🏆</span>
              <span className="winner-name">{winner.username}</span>
              <span className="winner-nuggets">{winner.totalNuggets} 🪙</span>
            </div>
          </div>
        )}

        <div className="round-end-section">
          <h3 className="round-end-section-title">📊 FINAL RANKINGS 📊</h3>
          <div className="rankings-grid">
            {sortedRankings.map((player, index) => (
              <div 
                key={index} 
                className={`ranking-row ${index === 0 ? 'ranking-first' : ''} ${index === 1 ? 'ranking-second' : ''} ${index === 2 ? 'ranking-third' : ''}`}
              >
                <span className="ranking-position">{getPodiumEmoji(index)}</span>
                <span className="ranking-username">{player.username}</span>
                <span className="ranking-nuggets">{player.totalNuggets} 🪙</span>
              </div>
            ))}
          </div>
        </div>

        <div className="round-end-countdown">
          <p className="countdown-text">
            Returning to lobby in: {countdown}s
          </p>
          <div className="countdown-bar">
            <div 
              className="countdown-progress" 
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );  
}
