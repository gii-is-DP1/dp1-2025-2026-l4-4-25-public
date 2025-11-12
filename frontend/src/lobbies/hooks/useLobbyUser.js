import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tokenService from '../../services/token.service';
import { isUserAdmin, getMockFriends } from '../utils/lobbyHelpers';

const useLobbyUser = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [player, setPlayer] = useState(null);
  const [friends, setFriends] = useState(getMockFriends());
  const jwt = tokenService.getLocalAccessToken();

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

        console.log("response del player", response);
        
        if (response.ok) {
          const data = await response.json();
          console.log("response 2", data);
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

    const admin = isUserAdmin(jwt);
    setIsAdmin(admin);

    // Solo buscar los datos del jugador si el usuario NO es un admin
    if (!admin) {
      fetchPlayer();
    }
  }, [jwt]);

  return {
    isAdmin,
    player,
    friends,
    setFriends,
    jwt
  };
};

export default useLobbyUser;
