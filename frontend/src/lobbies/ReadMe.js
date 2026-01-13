import React, { useEffect } from 'react';
import '../App.css';
import '../static/css/home/home.css';
import { Link } from 'react-router-dom';

export default function ReadMe() {
    useEffect(() => {
        try { localStorage.setItem('readmeSeen', 'true'); } catch (e) { /* ignore */ }
    }, []);
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
                                <h4>Secret Roles</h4>
                                <p>At the start of each round, roles are assigned randomly. Your role is hidden from other players, creating an atmosphere of mystery and deduction.</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">2</span>
                            <div className="rule-content">
                                <h4>Path Cards</h4>
                                <p>Use path cards to build tunnels connecting the starting position to the gold nuggets. Each card must connect properly to adjacent paths following the tunnel rules.</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">3</span>
                            <div className="rule-content">
                                <h4>Action Cards</h4>
                                <p>Use action cards to sabotage opponents (break their tools), help allies (fix tools), or reveal hidden goal cards to discover where the gold is located.</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">4</span>
                            <div className="rule-content">
                                <h4>Strategy and Deduction</h4>
                                <p>Watch other players' moves carefully. Identify who might be a saboteur based on their actions. Saboteurs must act subtly to avoid being discovered.</p></div>
                        </div>
                        <div className="rule-item">
                            <span className="rule-number">5</span>
                            <div className="rule-content">
                                <h4>Gold Distribution</h4>
                                <p>At the end of each round, gold nuggets are distributed among the winners. The team that completes their objective receives points, and after 3 rounds, the player with the most gold wins!</p></div>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="info-title">💡 Tips 💡</h2>
                    <div className="tips-grid">
                        <div className="tip-card tip-gold">
                            <h4>🏆 MINERS</h4>
                            <ul>
                                <li>Communicate with your team through your moves and card choices</li>
                                <li>Build efficient paths toward the goal cards - don't waste cards!</li>
                                <li>Use action cards to reveal goal positions and identify saboteurs</li>
                                <li>Protect key miners by fixing their tools when sabotaged</li>
                                <li>Watch for suspicious behavior - not everyone is on your side!</li></ul>
                        </div>
                        <div className="tip-card tip-saboteur">
                            <h4>🎭 SABOTEURS</h4>
                            <ul>
                                <li>Blend in! Place path cards occasionally to avoid suspicion</li>
                                <li>Sabotage subtly - break tools of key players strategically</li>
                                <li>Build dead-end paths to confuse and mislead the miners</li>
                                <li>Don't reveal your identity too early in the game</li>
                                <li>Coordinate with other saboteurs if you can identify them</li></ul>
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

                <div className="info-section">
                    <h2 className="info-title">📺 How to Play 📺</h2>
                    <div className="video-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/RCmJwPnkGHA"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="info-section issues-section">
                    <h2 className="info-title">⚠️ Potential Issues & Fixes</h2>
                    <div className="issues-list" style={{lineHeight:1.6}}>
                        <p>Please review the known or potential issues and recommended workarounds before playing. Spanish version available in repository at <strong>docs/POTENTIAL_ISSUES_ES.md</strong> (plain path, not a link).</p>
                        <ul>
                            <li><strong>Performance</strong> and resource usage increase as more browsers and players connect simultaneously.</li>
                            <li>If an error occurs during a match (unlikely), <strong>refresh</strong> the page — most issues resolve after a <strong>reload</strong>.</li>
                            <li>Opening multiple browsers or sharing multiple screens can break layout: the <strong>CSS</strong> may not adapt to very large or unusual viewports. For testing, prefer a <strong>single display</strong> and use <strong>Ctrl + '-'</strong> to adjust <strong>zoom</strong> if needed.</li>
                            <li>Browsers tested: <strong>Firefox</strong> and <strong>Firefox Developer Edition</strong> (recommended). Edge, Chrome and Opera work but may render slower.</li>
                            <li>If a visual object appears <strong>cut off</strong>, it is likely a browser compatibility/layout issue — reduce the <strong>zoom</strong>.</li>
                            <li>The <strong>draw pile</strong> size is calculated per game rules from the number of players — this is expected behaviour, not a bug.</li>
                            <li>On Firefox, disabling sidebars/toolbars can provide a fuller view; alternatively reduce <strong>zoom</strong> — the game still functions correctly without disabling UI elements.</li>
                            <li>If a card placed in another browser doesn't appear after refreshing, try <strong>refreshing again</strong> (clients are designed to recover on reload).</li>
                            <li>Loading screens may take longer because the match waits for all players to join — please <strong>be patient</strong> and observe each player's loading bar reach 100%.</li>
                            <li>If a player advances to the second screen before others, refresh all browsers to re-synchronize.</li>
                            <li>If the in-game <strong>timer freezes</strong> after a reload, refresh the browser of the <strong>first player who started the match</strong> (their timer activates); if unknown, refresh all browsers.</li>
                            <li>If you change a player's <strong>username</strong>, log in again to avoid inconsistencies during a live match.</li>
                            <li>On the <strong>CreateGame</strong> screen, if you see a "Connect with The server" error, refresh the page (very rare but safe to retry).</li>
                            <li>If a player enters before others, refresh all browsers to synchronize the match (implementation prefers that all players be active before rounds proceed).</li>
                            <li><strong>Background music</strong> behaviour: use the Enable button or Reset Prefs; music may play on some screens and not others. When testing with multiple browsers, background music will play simultaneously in each — this is expected. Mute extra browsers or use the in-app audio controls. If autoplay issues occur, you can always toggle music manually.</li>
                        </ul>
                    </div>
                </div>
                    <div className="info-section footer-section" style={{marginTop:'1.25rem'}}>
                        <p className="footer-text" style={{textAlign:'center', opacity:0.9}}>
                            💻 L4 Group of Design and Testing I of Engineering of Software, US 💻
                        </p>
                    </div>
            </div>
        </div>
    );
}
