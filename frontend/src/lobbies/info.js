import React from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link } from 'react-router-dom';

export default function Info() {
    return (
        <div className="home-page-lobby-container">
            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 100 }} />
            </div>

            <div className="top-right-lobby-buttons">
                <Link to="/profile">
                    <button className="button-logOut"> 👤Profile</button>
                </Link>
                <Link to="/lobby">
                    <button className="button-logOut"> ➡️</button>
                </Link>
            </div>

            <div className="info-container" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
            <div className="info-section">
                <h2 className="info-title">💻 Repositorio GitHub</h2>
                <p className="info-text">
                    Puedes acceder al proyecto completo en nuestro repositorio:</p>
                <a 
                    href="https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="github-link">
                    https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25
                </a>
            </div>
                <div className="info-section">
                    <h2 className="info-title">🎮 Video del Juego</h2>
                    <div className="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/lwxIUdtN4aE" 
                            title="Video del Juego" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">👩‍💻 Developers</h2>
                    <div className="developers-grid">
                        <div className="developer-card">
                            <h3>Carlos Borrego</h3>
                            <p>Email: carborort@alum.us.es</p>
                            <a href="https://github.com/Carlosbox2k" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="developer-card">
                            <h3>Diego Rey</h3>
                            <p>Email: diereycar@alum.us.es</p>
                            <a href="https://github.com/RHQ7780" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="developer-card">
                            <h3>Marcos Ayala</h3>
                            <p>Email: marayabla@alum.us.es</p>
                            <a href="https://github.com/GBK4935" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="developer-card">
                            <h3>Alejandro Caro</h3>
                            <p>Email: alercarper@alum.us.es</p>
                            <a href="https://github.com/FQY7185-Alejandro" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="developer-card">
                            <h3>Luis Calderon</h3>
                            <p>Email: luicalcar@alum.us.es</p>
                            <a href="https://github.com/JGR9196" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="developer-card">
                            <h3>Lorenzo Valderrama</h3>
                            <p>Email: lorvalrom@alum.us.es</p>
                            <a href="https://github.com/wrg8176" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
