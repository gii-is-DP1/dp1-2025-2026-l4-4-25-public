import { useState, useEffect } from 'react';
import tokenService from '../../../services/token.service';

const useAchievementsData = () => {
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const jwt = tokenService.getLocalAccessToken();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = tokenService.getUser();
        if (!user?.username) throw new Error("Username not found");
        const response = await fetch(`/api/v1/players/byUsername?username=${user.username}`, {
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

  useEffect(() => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      setIsAdmin(payload.authorities?.includes("ADMIN") || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  }, [jwt]);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        const allAchievementsResponse = await fetch('/api/v1/achievements', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!allAchievementsResponse.ok) throw new Error("Failed to fetch achievements");
        
        const allAchievements = await allAchievementsResponse.json();
        const playerAchievements = profile.accquiredAchievements || [];
        const playerAchievementIds = playerAchievements.map(ach => ach.id);
        
        console.log("Todos los logros:", allAchievements);
        console.log("Logros del jugador:", playerAchievements);
        console.log("IDs de logros del jugador:", playerAchievementIds);
        
        const getCurrentValue = (metric) => {
          let value;
          switch (metric) {
            case 'GAMES_PLAYED':
              value = profile?.playedGames ?? 0;
              break;
            case 'VICTORIES':
              value = profile?.wonGames ?? 0;
              break;
            case 'BUILDED_PATHS':
              value = profile?.builtPaths ?? 0;
              break;
            case 'DESTROYED_PATHS':
              value = profile?.destroyedPaths ?? 0;
              break;
            case 'GOLD_NUGGETS':
              value = profile?.acquiredGoldNuggets ?? 0;
              break;
            case 'TOOLS_DAMAGED':
              value = profile?.peopleDamaged ?? 0;
              break;
            case 'TOOLS_REPAIRED':
              value = profile?.peopleRepaired ?? 0;
              break;
            default:
              value = 0;
          }
          
        console.log(`Metric ${metric} has value:`, value);
          return value;
        };

        const achievementsWithStatus = allAchievements.map(ach => {
          const currentValue = getCurrentValue(ach.metric);
          const progress = `${currentValue}/${ach.threshold || 0}`;
          console.log(`Achievement ${ach.tittle}: ${progress}`);
          
          return {
            ...ach,
            unlocked: playerAchievementIds.includes(ach.id),
            currentValue: currentValue,
            progress: progress
          };
        });
        
        achievementsWithStatus.sort((a, b) => {
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          return 0;
        });
        
        console.log("Logros con estado: ", achievementsWithStatus);
        setAchievements(achievementsWithStatus);
        setError(null);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [jwt, profile]);

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
