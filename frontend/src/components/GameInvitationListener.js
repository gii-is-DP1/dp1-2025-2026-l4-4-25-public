import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';

const GameInvitationListener = () => {
  const [polling, setPolling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = tokenService.getLocalAccessToken();
    const currentUser = tokenService.getUser();
    
    if (!jwt || !currentUser?.username) return;

    const intervalId = setInterval(async () => { 
      try {
        const response = await fetch(`/api/v1/messages`, {
          headers: {'Authorization':`Bearer ${jwt}`,'Content-Type':'application/json'}});

        if (!response.ok) {
          if (response.status === 401) {
            clearInterval(intervalId);
            return;
          }
          return;
        }
        
        if (response.ok) {
          const messages = await response.json();
          messages.forEach((message) => {
            if (message.content && message.content.startsWith('GAME_INVITE:')) {
              const parts = message.content.split(':');
              const targetUser = parts[1];
              const gameId = parts[2];
              const inviterUsername = parts[3];
              if (targetUser === currentUser.username) {
                showInvitationToast(gameId, inviterUsername, message.id, jwt)}}})}
      } catch (err) {
        console.error('Error checking invitations:', err)}}, 3000);
    setPolling(intervalId);

    return () => {
      if (intervalId) clearInterval(intervalId);};
  },[]);

  const showInvitationToast = (gameId, inviterUsername, messageId, jwt) => {
    const toastId = `invite-${gameId}-${messageId}`;
    if (toast.isActive(toastId)) return;
    toast.info(
      <div>
        <p><strong>{inviterUsername}</strong> invited to join to your game!</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={() => handleAcceptInvite(gameId, messageId, jwt, toastId)}
            style={{
              padding: '5px 15px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'}}>
            📥Join
          </button>
          <button 
            onClick={() => handleDeclineInvite(messageId, jwt, toastId)}
            style={{
              padding: '5px 15px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'}}>
            🚫Decline
          </button>
        </div>
      </div>,
      {toastId: toastId,
        autoClose: 15000,
        closeButton: false,
        position: 'top-center'}
    )};

  const handleAcceptInvite = async (gameId, messageId, jwt, toastId) => {
    try {
      toast.dismiss(toastId);
      await fetch(`/api/v1/messages/${messageId}`,{
        method:'DELETE',headers:{'Authorization':`Bearer ${jwt}`}});

      const gameResponse = await fetch(`/api/v1/games/${gameId}`,{ // Navegamos hasta el juego
        headers:{'Authorization':`Bearer ${jwt}`}});

      if (gameResponse.ok) {
        const game = await gameResponse.json();
        navigate(`/CreateGame/${gameId}`, { state: { game } });
        toast.success('⌛Joining game...');
      } else {
        toast.error('🔴Game not found')}
    } catch (err) {
      console.error('ERROR de aceptar la invitación',err);
      toast.error('Failed to join game');
    }
  };

  const handleDeclineInvite = async (messageId, jwt, toastId) => {
    try {
      toast.dismiss(toastId);
      await fetch(`/api/v1/messages/${messageId}`,{method: 'DELETE',headers: {'Authorization': `Bearer ${jwt}`}});
      toast.info('Invitation declined');
    } catch (err) {
      console.error('Error declining invite:',err)}};
  return null};

export default GameInvitationListener;
