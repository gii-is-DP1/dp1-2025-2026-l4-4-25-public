import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import '../../../static/css/lobby/inviteFriends.css';

const InviteFriends = ({ gameId, chatId, activePlayers = [] }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [activePlayers]);

  const loadFriends = async () => {
    try {
      const jwt = tokenService.getLocalAccessToken();
      const currentUser = tokenService.getUser();
      if (!currentUser?.username) return;

      const response = await fetch(`/api/v1/players/byUsername?username=${currentUser.username}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',},});

      if (response.ok) {
        const playerData = await response.json();
        
        if (playerData.friends && playerData.friends.length > 0) {
          const activeUsernames = activePlayers.map(p => p.username?.toLowerCase() || p.toLowerCase());
          
          if (typeof playerData.friends[0] === 'string') {
            const friendsData = await Promise.all(
              playerData.friends.map(async (username) => {
                const friendResponse = await fetch(`/api/v1/players/byUsername?username=${username}`, {
                  headers: { 'Authorization': `Bearer ${jwt}` },});
                if (friendResponse.ok) {
                  return await friendResponse.json();}
                return null;}));
            const availableFriends = friendsData.filter(f => 
              f !== null && !activeUsernames.includes(f.username?.toLowerCase()));
            setFriends(availableFriends);
          } else {
            const availableFriends = playerData.friends.filter(f => 
              !activeUsernames.includes(f.username?.toLowerCase()));
            setFriends(availableFriends);}}}
    } catch (error) {
      console.error('Error loading friends:', error);}};

  const handleInviteFriend = async (friendUsername) => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const currentUser = tokenService.getUser();

      const inviteMessage = {
        content: `GAME_INVITE:${friendUsername}:${gameId}:${currentUser.username}`,
        activePlayer: currentUser.username,
        chat: chatId};

      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',},
        body: JSON.stringify(inviteMessage),});

      if (response.ok) {
        toast.success(`🎮 Invitation sent to ${friendUsername}!`);
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting friend:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);}};

  if (friends.length === 0) {
    return (
      <div className="invite-friends-container">
        <h3 className="invite-friends-title">📩Invite Friends📩</h3>
        <div className="invite-friends-empty">❌No friends to invite</div>
      </div>);}

  return (
    <div className="invite-friends-container">
      <h3 className="invite-friends-title">📩Invite Friends📩</h3>
      <div className="invite-friends-list">
        {friends.map((friend) => (
          <div key={friend.username} className="friend-invite-item">
            <div className="friend-invite-info">
              <img 
                src={friend.image} 
                alt={friend.username}
                className="friend-invite-avatar"/>
              <span className="friend-invite-username">{friend.username}</span>
            </div>
            <button
              onClick={() => handleInviteFriend(friend.username)}
              disabled={loading}
              className="btn-invite-friend">
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteFriends;
