import React from 'react';
import '../App.css';
import '../static/css/home/home.css'; 
import { Link } from 'react-router-dom';

export default function Info() {
    return (
        <div className="home-page-lobby-container">
            <div className="logo-container">
                <img src="/logo1-recortado.png" alt="Saboteur Logo" className="logo-image" />
            </div>

            <div className="top-right-lobby-buttons">
                <Link to="/profile">
                    <button className="button-logOut">👤 Profile</button>
                </Link>
                <Link to="/lobby">
                    <button className="button-logOut">➡️</button>
                </Link>
            </div>

            <div className="info-container">
                <div className="info-section highlight-section">
                    <h2 className="info-title">💻 GitHub Repository 💻</h2>
                    <p className="info-text">
                        Explore the complete source code of our project on GitHub.
                        Here you will find a video and team contributions on this proyect.
                    </p>
                    <a 
                        href="https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="github-link">
                        <span className="link-icon">🔗</span>View Repository</a>
                </div>

                <div className="info-section">
                    <h2 className="info-title">🎮 Game Demonstration Video</h2>
                    <p className="info-text">
                        Discover how to play Saboteur with our complete tutorial video.
                    </p>
                    <div className="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/lwxIUdtN4aE" 
                            title="Video Demostrativo de Saboteur" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">👥 Developers</h2>
                    <p className="info-text">
                        Meet the team behind this project developed for the course 
                        Design and Testing i at the University of Seville.
                    </p>
                    <div className="developers-grid">
                        <div className="developer-card">
                            <div className="developer-avatar">CB</div>
                            <h3>Carlos Borrego</h3>
                            <p className="developer-email">📧 carborort@alum.us.es</p>
                            <a href="https://github.com/Carlosbox2k" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                        <div className="developer-card">
                            <div className="developer-avatar">DR</div>
                            <h3>Diego Rey</h3>
                            <p className="developer-email">📧 diereycar@alum.us.es</p>
                            <a href="https://github.com/RHQ7780" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                        <div className="developer-card">
                            <div className="developer-avatar">MA</div>
                            <h3>Marcos Ayala</h3>
                            <p className="developer-email">📧 marayabla@alum.us.es</p>
                            <a href="https://github.com/GBK4935" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                        <div className="developer-card">
                            <div className="developer-avatar">AC</div>
                            <h3>Alejandro Caro</h3>
                            <p className="developer-email">📧 alercarper@alum.us.es</p>
                            <a href="https://github.com/FQY7185-Alejandro" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                        <div className="developer-card">
                            <div className="developer-avatar">LC</div>
                            <h3>Luis Calderon</h3>
                            <p className="developer-email">📧 luicalcar@alum.us.es</p>
                            <a href="https://github.com/JGR9196" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                        <div className="developer-card">
                            <div className="developer-avatar">LV</div>
                            <h3>Lorenzo Valderrama</h3>
                            <p className="developer-email">📧 lorvalrom@alum.us.es</p>
                            <a href="https://github.com/wrg8176" target="_blank" rel="noopener noreferrer" className="developer-github">
                                GitHub📥
                            </a>
                        </div>
                    </div>
                </div>

                <div className="info-section footer-section">
                    <p className="footer-text">
                        🎓 Project developed for Design and Testing I | University of Seville | 2025-2026 | L4-4
                    </p>
                </div>
            </div>
        </div>
    );
}
