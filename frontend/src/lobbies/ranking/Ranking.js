import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../static/css/lobbies/ranking.css";
import tokenService from "../../services/token.service";
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png";

export default function Ranking() {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState("wonGames"); 
    
    const user = tokenService.getUser(); 
    const jwt = tokenService.getLocalAccessToken();


    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                
                const response = await fetch("/api/v1/players", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                const finalData = data.length > 0 ? data : [];
                
                setPlayers(finalData);
                sortPlayers(finalData, "wonGames");
                setLoading(false);

            } catch (error) {
                console.error("Error fetching ranking, using mock data:", error);
                
                setLoading(false);
            }
        };

        fetchPlayers();
        
    }, []);

    const sortPlayers = (data, selectedMetric) => {
        const sorted = [...data].sort((a, b) => {
            const valA = a[selectedMetric] || 0;
            const valB = b[selectedMetric] || 0;
            return valB - valA; 
        });
        setFilteredPlayers(sorted);
    };

    const handleMetricChange = (e) => {
        const newMetric = e.target.value;
        setMetric(newMetric);
        sortPlayers(players, newMetric);
    };

    const getMetricLabel = (metricKey) => {
        switch(metricKey) {
            case "wonGames": return "VICTORIES";
            case "acquiredGoldNuggets": return "GOLDS";
            case "builtPaths": return "BUILT PATHS";
            case "destroyedPaths": return "DESTROYED PATHS";
            default: return "VALUE";
        }
    };

    if (loading) {
        return (
            <div className="ranking-bg">
                <div className="ranking-container">
                    <h2 style={{color: '#ffd700', textAlign: 'center'}}>Loading Ranking...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="ranking-bg">
            <div className="ranking-container">

                
                <div className="ranking-header-container">
                <div className="ranking-header">
                    <h1>🏆 GLOBAL RANKING 🏆</h1>
                </div>
                <div class="top-right-lobby-buttons">
                <Link to="/lobby">
                                    <button className="button-lobby"> ➡️</button>
                                </Link>
                                </div>
                </div>

    
                <div className="ranking-filters">
                    <label>SORT BY:</label>
                    <select value={metric} onChange={handleMetricChange} className="filter-select">
                        <option value="wonGames">VICTORIES</option>
                        <option value="acquiredGoldNuggets">GOLDS</option>
                        <option value="builtPaths">BUILT PATHS</option>
                        <option value="destroyedPaths">DESTROYED PATHS</option>
                    </select>
                </div>

                
                <div className="ranking-table-wrapper">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th className="gold-text">TOP</th> 
                                <th className="gold-text">PLAYER</th>
                                <th className="text-center gold-text">{getMetricLabel(metric)}</th>
                                <th className="text-center gold-text">GAMES PLAYED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.length > 0 ? (
                                filteredPlayers.map((player, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = user && user.username === player.username;
                                    const value = player[metric] || 0;
                                    
                                    return (
                                        <tr 
                                            key={player.id} 
                                            className={`ranking-row rank-${rank} ${isCurrentUser ? 'current-user-row' : ''}`}
                                        >
                                            <td className="rank-position">
                                                {rank === 1 ? "🥇 1" : rank === 2 ? "🥈 2" : rank === 3 ? "🥉 3" : `${rank}`}
                                            </td>
                                            <td>
                                                <div className="player-info">
                                                    <img 
                                                        src={player.image ? player.image : defaultProfileAvatar} 
                                                        alt={player.username} 
                                                        className="rank-avatar"
                                                        onError={(e) => { 
                                                            if (e.target.src !== defaultProfileAvatar) {
                                                                e.target.src = defaultProfileAvatar;
                                                            }
                                                        }}
                                                    />
                                                    <span className="player-name">{player.username}</span>
                                                </div>
                                            </td>
                                            <td className="text-center highlight-stat">{value}</td>
                                            <td className="text-center">{player.playedGames}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'white'}}>No players available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
