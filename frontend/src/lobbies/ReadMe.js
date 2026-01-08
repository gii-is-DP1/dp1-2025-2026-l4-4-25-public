import React from 'react';
import '../App.css';
import '../static/css/home/home.css';
import { Link } from 'react-router-dom';

export default function ReadMe() {
    return (
        <div className="home-page-lobby-container">
            <div className="logo-container">
                <img src="/logo1-recortado.png" alt="Saboteur Logo" className="logo-image" />
            </div>

            <div className="top-right-lobby-buttons">
                <Link to="/profile">
                    <button className="button-logOut">👤Profile</button>
                </Link>
                <Link to="/lobby">
                    <button className="button-logOut">➡️</button>
                </Link>
            </div>

            <div className="info-container readme-container">
                <div className="info-section highlight-section">
                    <h2 className="info-title">🎯 Game Objectives 🎯</h2>
                    <div className="team-boxes">
                        <div className="team-box gold-diggers">
                            <h3>⛏️ Miners</h3>
                            <p>Build paths, support the other miners to reach the gold nugget in the mine!</p>
                        </div>
                        <div className="team-box saboteurs">
                            <h3>🔨 Saboteurs</h3>
                            <p>Prevent the miners from reaching the nuggets. Disguise yourself as a miner, destroy paths, and sabotage your opponents.</p></div>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">📋 Things to Keep in Mind 📋</h2>
                    <div className="rules-list">
                        <div className="rule-item">
                            <span className="rule-number">1</span>
                            <div className="rule-content">
                                <h4>tip1</h4>
                                <p>DESCRIPTION</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">2</span>
                            <div className="rule-content">
                                <h4>tip2</h4>
                                <p>DESCRIPTION</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">3</span>
                            <div className="rule-content">
                                <h4>tip3</h4>
                                <p>DESCRIPTION</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">4</span>
                            <div className="rule-content">
                                <h4>tip4</h4>
                                <p>DESCRIPTION</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">5</span>
                            <div className="rule-content">
                                <h4>tip5</h4>
                                <p>DESCRIPTION</p></div>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">💡 Tips 💡</h2>
                    <div className="tips-grid">
                        <div className="tip-card tip-gold">
                            <h4>🏆 MINERS</h4>
                            <ul>
                                <li>1</li>
                                <li>2</li></ul>
                        </div>
                        <div className="tip-card tip-saboteur">
                            <h4>🎭 SABOTEURS</h4>
                            <ul>
                                <li>1</li>
                                <li>2</li></ul>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">⚠️ Common Errors ⚠️</h2>
                    <div className="important-points">
                        <div className="important-item warning">
                            <span className="icon">🚫</span>
                            <div>
                                <strong>It won't let me register a new user</strong>
                                <p>[Explain cache issue]</p>
                            </div>
                        </div>
                        <div className="important-item info">
                            <span className="icon">⏱️</span>
                            <div>
                                <strong>Does it take too long to load the items and cards in a game?</strong>
                                <p>[Explain board loading issue]</p>
                            </div>
                        </div>
                        <div className="important-item warning">
                            <span className="icon">📥</span>
                            <div>
                                <strong>Other</strong>
                                <p>[Explanation]</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">🎮 Game Settings 🎮</h2>
                    <div className="config-info">
                        <div className="config-item">
                            <strong>👤Players:</strong> 3 to 12 players
                        </div>
                        <div className="config-item">
                            <strong>⏰Duration:</strong> Approximately 30-45 minutes per round
                        </div>
                        <div className="config-item">
                            <strong>⌛Rounds:</strong> 3 rounds per game
                        </div>
                        <div className="config-item">
                            <strong>💪Difficulty:</strong> Medium - requires strategy and deduction
                        </div>
                    </div>
                </div>

                <div className="info-section footer-section">
                    <p className="footer-text">
                        💻 L4 Group of Design and Testing I of Engineering of Software, US 💻
                    </p>
                </div>
            </div>
        </div>
    );
}
