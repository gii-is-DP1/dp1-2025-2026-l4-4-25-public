import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../services/token.service';
import '../../static/css/lobby/friendsDropdown.css';

const API_URL = '/api/v1';

const FriendsDropdown = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchTermino, setSearchTermino] = useState('');
  const [loading, setLoading] = useState(false);
  const [ContReciv, setContReciv] = useState(0);
  const currentUser = tokenService.getUser();
  const currentUsername = currentUser?.username;

  // Polling cada 5 segundos 
  useEffect(() => {
    if (!currentUsername) return;
    loadReceivedRequests();
    const intervalId = setInterval(() => {
      loadReceivedRequests();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [currentUsername]);

  // Cargamos los datos
  useEffect(() => {
    if (!currentUsername) return;
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'received') {
      loadReceivedRequests();
    } else if (activeTab === 'sent') {
      loadSentRequests();}
  }, [activeTab, currentUsername]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`${API_URL}/players/byUsername?username=${currentUsername}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'},});
      if (response.ok) {
        const player = await response.json();
        console.log('DATA OF FRIENDS:', player.friends);
        if (player.friends && player.friends.length > 0) {
          if (typeof player.friends[0] === 'string') {
            const uniqueUsernames = [...new Set(player.friends)]; // Para Eliminar posibles duplicados de username (IA - 3.9)
            const friendsData = await Promise.all(
              uniqueUsernames.map(async (username) => {
                const friendResponse = await fetch(`${API_URL}/players/byUsername?username=${username}`, {
                  headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'}});
                if (friendResponse.ok) {
                  return await friendResponse.json();}
                return null;}));
            setFriends(friendsData.filter(f => f !== null));
          } else {
            const uniqueFriends = player.friends.reduce((ac, friend) => {
              if (!ac.find(f => f.username === friend.username)) {
                ac.push(friend);}
              return ac;
            }, []);
            setFriends(uniqueFriends);}
        } else {
          setFriends([]);}}
    } catch (err) {
      console.error('Error de carga', err);
    } finally {
      setLoading(false)}};

  const loadReceivedRequests = async () => {
    try {
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`${API_URL}/requests/byStatusAndReceiverUsername?status=PENDING&receiverUsername=${currentUsername}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'}});
      if (response.ok) {
        const data = await response.json();
        const requests = Array.isArray(data) ? data : [data];
        
        const pendingRequests = requests.filter(req => req.status === 'PENDING');

        if (ContReciv>0 && pendingRequests.length>ContReciv) {
          const newRequestsCount = pendingRequests.length-ContReciv;
          const latestRequest = pendingRequests[pendingRequests.length - 1];
          toast.info(`📬 New friend request from --> ${latestRequest.sender}!`)}
        setReceivedRequests(pendingRequests);
        setContReciv(pendingRequests.length);}
    } catch (err) {
      console.error('Error de carga de solicitudes:',err)}};

  const loadSentRequests = async () => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`${API_URL}/requests/byStatusAndSenderUsername?status=PENDING&senderUsername=${currentUsername}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'}}); 
      if (response.ok) {
        const data = await response.json();
        const requests = Array.isArray(data) ? data : [data];
        const pendingRequests = requests.filter(req => req.status === 'PENDING');
        setSentRequests(pendingRequests)}
    }catch(err){
      console.error('Error de carga de solicitudes enviadas', err);
    }finally{
      setLoading(false)}};

  const handleSearch = async () => {
    if (!searchTermino.trim()) {
      toast.warning('Please enter a username to search a user');
      return;}
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`${API_URL}/players`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'}});
      if (response.ok) {
        const allPlayers = await response.json();
        const filtered = allPlayers.filter(player => 
          player.username.toLowerCase().includes(searchTermino.toLowerCase()) &&
          player.username !== currentUsername &&
          !friends.some(f => f.username === player.username));
        setSearchResult(filtered);
        setActiveTab('search')}
    }catch(err){
      toast.error('Failed to search the player username');
    }finally{
      setLoading(false);}};

  const handleSendRequest = async (receiverUsername) => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'},
        body: JSON.stringify({
          sender: currentUsername,
          receiver: receiverUsername,
          status: 'PENDING'})});
      
      if (response.ok) {
        toast.success(`📩Friend request sent to ${receiverUsername}!`);
        setSearchResult(searchResult.filter(p => p.username !== receiverUsername));
        loadSentRequests();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to send request');
      }
    } catch (err) {
      toast.error('Failed to send friend request');
    } finally {
      setLoading(false)}};

  const handleAcceptRequest = async (request) => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
    
      const senderResponse = await fetch(`${API_URL}/players/byUsername?username=${request.sender}`, {
        headers: {'Authorization':`Bearer ${jwt}`}});
      const sender = await senderResponse.json();
      const receiverResponse = await fetch(`${API_URL}/players/byUsername?username=${request.receiver}`, {
        headers: {'Authorization':`Bearer ${jwt}`}});
      const receiver = await receiverResponse.json();
      await fetch(`${API_URL}/players/${sender.id}/addFriends/${receiver.id}`, {
        method: 'PATCH',
        headers: {'Authorization':`Bearer ${jwt}`}});
      await fetch(`${API_URL}/players/${receiver.id}/addFriends/${sender.id}`, {
        method: 'PATCH',
        headers: {'Authorization':`Bearer ${jwt}`}});
      await fetch(`${API_URL}/requests/${request.id}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${jwt}`}});

      setReceivedRequests(prev => {
        const up = prev.filter(req => req.id !== request.id);
        setContReciv(up.length); 
        return up});
      setSentRequests(prev => prev.filter(req => req.id !== request.id));
      toast.success(`✅ Friend request accepted! You are now friends of ${request.sender}`);
      loadFriends();
    } catch (err) {
      toast.error('Failed to accept friend request');
    } finally {
      setLoading(false);}};

  const handleRejectRequest = async (requestId, senderUsername) => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      await fetch(`${API_URL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${jwt}`}});
      
      setReceivedRequests(prev => {
        const up2 = prev.filter(req=>req.id!==requestId);
        setContReciv(up2.length); 
        return up2});
      setSentRequests(prev => prev.filter(req=>req.id!==requestId));
      toast.info(`❌Friend request from ${senderUsername} rejected`);
    } catch (err) {
      toast.error('❌Failed to reject friend request');
    } finally {
      setLoading(false)}};

  const handleCancelRequest = async (requestId, receiverUsername) => {
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      await fetch(`${API_URL}/requests/${requestId}`,{
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${jwt}`,'Content-Type': 'application/json'}});
      toast.info(`❌Friend request to ${receiverUsername} cancelled`);
      loadSentRequests();
    } catch (err) {
      toast.error('Failed to cancel friend request');
    } finally {
      setLoading(false)}};

  const handleRemoveFriend = async (friendUsername) => {
    if (!window.confirm(`Remove ${friendUsername} from your friends?`)) {
      return}
    try {
      setLoading(true);
      const jwt = tokenService.getLocalAccessToken();
      const currentResponse = await fetch(`${API_URL}/players/byUsername?username=${currentUsername}`,{
        headers: {'Authorization':`Bearer ${jwt}`}});
      const currentPlayer = await currentResponse.json();

      const friendResponse = await fetch(`${API_URL}/players/byUsername?username=${friendUsername}`,{
        headers: {'Authorization':`Bearer ${jwt}`}});
      const friendPlayer = await friendResponse.json();

  // Eliminamos los amigos de ambos lados ya que ers bidereccional 
      await fetch(`${API_URL}/players/${currentPlayer.id}/removeFriends/${friendPlayer.id}`,{
        method: 'PATCH',
        headers: {'Authorization':`Bearer ${jwt}`}});

      await fetch(`${API_URL}/players/${friendPlayer.id}/removeFriends/${currentPlayer.id}`,{
        method: 'PATCH',
        headers: {'Authorization':`Bearer ${jwt}`}});

      toast.success(`🔴${friendUsername} removed from friends`);
      loadFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
      toast.error('Failed to remove friend');
    } finally {
      setLoading(false)}};

  return (
    <div className="friends-dropdown">
      <div className="dropdown-header">
        <h4>🫂 Friends</h4>
      </div>

      <div className="dropdown-tabs">
        <button
          className={activeTab === 'friends' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('friends')}>
          🫂Friends {friends.length>0 && `(${friends.length})`}
        </button>
        <button
          className={activeTab === 'received' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('received')}>
          📩Received {receivedRequests.length>0 && `(${receivedRequests.length})`}
        </button>
        <button
          className={activeTab === 'sent' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('sent')}>
          📤Sent {sentRequests.length>0 && `(${sentRequests.length})`}
        </button>
      </div>

      <div className="dropdown-search">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTermino}
          onChange={(e) => setSearchTermino(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input-small"/>
        <button onClick={handleSearch} disabled={loading} className="search-btn-small">🔎</button>
      </div>

      <div className="dropdown-content">
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <div className="empty-state">❕No friends yet</div>
            ) : (
              friends.map((friend) => (
                <div key={friend.username} className="dropdown-friend-card">
                  <div className="friend-info-small">
                    <img
                      src={friend.image||'/default-avatar.png'}
                      alt={friend.username}
                      className="friend-avatar-small"/>
                    <div>
                      <strong>{friend.username}</strong>
                      {friend.firstName && friend.lastName && (
                        <div className="friend-name-small">
                          {friend.firstName} {friend.lastName}
                        </div>)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.username)}
                    disabled={loading}
                    className="btn-remove-small">❌</button>
                </div>)))}
          </>
        )}

        {activeTab === 'received' && (
          <>
            {receivedRequests.length === 0 ? (
              <div className="empty-state">❕No pending requests</div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.id} className="dropdown-request-card">
                  <div className="friend-info-small">
                    <div>
                      <strong>{request.sender}</strong>
                      <div className="status-pending-small">🔁Pending</div>
                    </div>
                  </div>
                  <div className="request-actions-small">
                    <button
                      onClick={() => handleAcceptRequest(request)}
                      disabled={loading}
                      className="btn-accept-small">✅</button>
                    <button
                      onClick={() => handleRejectRequest(request.id, request.sender)}
                      disabled={loading}
                      className="btn-reject-small">❎</button>
                  </div>
                </div>
              )))}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {sentRequests.length === 0 ? (
              <div className="empty-state">❕No sent requests</div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="dropdown-request-card">
                  <div className="friend-info-small">
                    <div>
                      <strong>{request.receiver}</strong>
                      <div className="status-pending-small">🔁Pending</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(request.id, request.receiver)}
                    disabled={loading}
                    className="btn-cancel-small">
                    ❌Cancel
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'search' && (
          <>
            {searchResult.length === 0 ? (
              <div className="empty-state">❗No players found</div>
            ) : (
              searchResult.map((player) => (
                <div key={player.username} className="dropdown-request-card">
                  <div className="friend-info-small">
                    <img
                      src={player.image || '/default-avatar.png'}
                      alt={player.username}
                      className="friend-avatar-small"/>
                    <div>
                      <strong>{player.username}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(player.username)}
                    disabled={loading}
                    className="btn-add-small">
                    📥Add
                  </button>
                </div>
              )))}
          </>
        )}
      </div>
    </div>
  );};

export default FriendsDropdown;
