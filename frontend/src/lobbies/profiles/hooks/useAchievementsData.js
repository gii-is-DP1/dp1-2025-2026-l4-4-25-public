import { useState, useEffect } from 'react';
import tokenService from '../../../services/token.service';

/**
 * Custom hook para manejar datos de achievements y perfil
 */
const useAchievementsData = () => {
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const jwt = tokenService.getLocalAccessToken();

  // Fetch del perfil del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = tokenService.getUser();
        if (!user?.id) throw new Error("User ID not found");

        const response = await fetch(`/api/v1/users/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        
        if (!response.ok) throw new Error("Could not fetch profile");

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        setProfile(null);
      }
    };
    
    fetchProfile();
  }, [jwt]);

  // Verificar si el usuario es admin
  useEffect(() => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      setIsAdmin(payload.authorities?.includes("ADMIN") || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  }, [jwt]);

  // Fetch de los achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/achievements', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!response.ok) throw new Error("Failed to fetch achievements");
        
        const data = await response.json();
        console.log("Logros: ", data);
        setAchievements(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [jwt]);

  return {
    achievements,
    profile,
    isAdmin,
    loading,
    error,
    jwt
  };
};

export default useAchievementsData;
