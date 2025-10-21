import React, { useEffect, useState } from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link, useNavigate} from 'react-router-dom';
import tokenService from "../services/token.service";
import generateRandomLink from '../util/generateRandomLink';

export default function Lobby(){
    const [isAdmin, setisAdmin] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [isPrivate, setisPrivate] = useState(false);
    const [player, setPlayer] = useState()
    const [link,setlink] = useState("")
    const [chat,setchat] = useState()
    const jwt = tokenService.getLocalAccessToken();
    const navigate = useNavigate();


    // SIMULAMOS LOS AMIGOS HASTA QUE ESTÉ HECHO EN EL BACKEND
    const [friends, setFriends] = useState([
        {username: "Alexby205", status: "A", color: "green" },
        {username: "LuisCV1", status: "B", color: "orange" },
        {username: "Julio", status: "C", color: "red" },
    ]);

    useEffect(() => {
        const jwt = tokenService.getLocalAccessToken();
        if (jwt) {
        try {
            const p=JSON.parse(atob(jwt.split('.')[1]));
            setisAdmin(p.authorities?.includes("ADMIN")||false);
        } catch (error) {
            console.error(error);}}
    }, []);

    
    useEffect(() => {
    const fetchPlayer = async () => {
          try {
            const loggedInUser = tokenService.getUser();
          if (!loggedInUser || !loggedInUser.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }
            const response = await fetch(`/api/v1/players/${loggedInUser.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
              }
            });
            console.log(response);
            if (response.ok) {
              const data = await response.json();
              setPlayer(data);
            } else {
              console.error('Respuesta no OK:', response.status);
              alert('Error al obtener la información del jugador.');
            }
          } catch (error) {
            console.error('Hubo un problema con la petición fetch:', error);
            alert('Error de red. No se pudo conectar con el servidor.');}
        };
        fetchPlayer()
        console.log("este es  el player", player)
  },[jwt])

    async function handleSubmit() {
        const jwt = tokenService.getLocalAccessToken();
        try {
            const chatResponse = await fetch("/api/v1/chats", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}` 
                },
                body: JSON.stringify({ message: "" }), });
            if (!chatResponse.ok) { 
                const errorData = await chatResponse.json();
                alert(`Error al crear el chat: ${errorData.message}`);
                return;}
        const newChat = await chatResponse.json();
        alert("Chat creado con éxito!");
        console.log("Chat creado:", newChat);
        setchat(newChat); 
        const randomPart = generateRandomLink(16);
        const fullLink = `https://saboteur.com/game/${randomPart}`;
        setlink(fullLink)

        const gameRequest = {
            gameStatus: "CREATED",
            link: fullLink, 
            maxPlayers: 3,
            creator: player.username,
            chat: newChat.id, 
            private: false
        };

        console.log('Enviando solicitud de partida:', gameRequest);

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
            alert("¡Partida creada con éxito!");
            console.log("Partida creada:", newGame);
            navigate('/CreateGame', { state: { game: newGame } });
        } else {
            const errorData = await gameResponse.json();
            alert(`Error al crear la partida: ${errorData.message}`);
        }

    } catch (error) {
        console.error('Hubo un problema con la petición fetch:', error);
        alert('Error de red. No se pudo conectar con el servidor.');
    }
}

    return(
        <div className="home-page-lobby-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 100 }} />
             </div>
            <div className="top-right-lobby-buttons">
                {/*<Link to="/register">
                    <button className="button-register">📃Register</button>
                </Link>
                <Link to="/login">
                    <button className="button-login">💻Login</button>
                </Link>
                */}
                {!isAdmin && (
                <div className="friends-dropdown-container">
                    <button 
                        className="button-logOut" 
                        onClick={() => setShowFriends(prev => !prev)}>
                        🫂Friends
                    </button>
                    {showFriends && (
                        <div className="friends-dropdown">
                            <h4>🫂Friends Section🫂</h4>
                            {friends.map((f, idx) => (
                                <div key={idx} className="friend-item">
                                    <span>{f.username}</span>
                                    <span className="friend-status" style={{ backgroundColor: f.color }}></span>
                                    <span>{f.status}</span>
                                </div>
                            ))}
                            <hr />
                            <button className="friend-action">📩Friend Request</button>
                            <button className="friend-action">🔎Find Player</button>
                        </div>
                    )}
                </div>
                )}
                <Link to="/profile">
                    <button className="button-logOut"> 👤Profile</button>
                </Link>
            </div>
            <div className="button-info">
                <Link to="/info">
                    <button className="button-info"> ℹ️</button>
                </Link>
            </div>
            {!isAdmin && (
            <div className="hero-div-lobby">
                    <button className="button-crear" onClick={handleSubmit}>📑CREATE GAME</button>
                 <Link to="/ListGames">
                <button className="button-unirse">📥JOIN A GAME</button>   
                </Link>
            </div>
             )}
            {isAdmin && (
                 <div className="hero-div-lobby">
                <Link to="/users">
                    <button className="button-users">📑Users</button>
                </Link>
                    </div>
                )}
             {isAdmin && (
                 <div className="hero-div-lobby">
                <Link to="/EditAchievement">
                    <button className="button-edit">✏️Edit Achievement</button>
                </Link>
                    </div>
                )}
            <div className="bottom-left-button">
                <Link to="/Ranking">
                <button className="button-ranking">🏆RANKING</button>
                </Link>
             </div>
        </div>
    )
}


