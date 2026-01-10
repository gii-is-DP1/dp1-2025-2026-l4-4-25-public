import React, { useState, useEffect, useRef } from 'react';
import './BackgroundMusic.css';

const BackgroundMusic = () => {

  const DEFAULT_VIDEO_ID = 'f--e5fca2Jg';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showControls, setShowControls] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(DEFAULT_VIDEO_ID);
  const [inputVideoId, setInputVideoId] = useState('');
  const playerRef = useRef(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const ytPlayer = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: currentVideoId, 
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(30);
            event.target.playVideo();
            setIsPlaying(true);
            setPlayer(event.target)},
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    return () => {
      if (player) {
        player.destroy()}}}, []);

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true)}}
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  const changeVideo = () => {
    if (player && inputVideoId.trim()) {
      const videoId = extractVideoId(inputVideoId.trim());
      player.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
      });
      player.setLoop(true);
      setCurrentVideoId(videoId);
      setIsPlaying(true);
      console.log('🎵 Cambiando a video:', videoId);
    }
  };

  const extractVideoId = (input) => {
    if (input.length === 11 && !input.includes('/') && !input.includes('=')) {
      return input}
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1]}
    }
    
    return input;
  };

  return (
    <div className="music-player-container">
      <div id="youtube-player" style={{ display: 'none' }}></div>
      <button
        className="music-toggle-button"
        onClick={() => setShowControls(!showControls)}
        title="Music Controls">
        {isPlaying ? '🎵' : '🔇'}
      </button>

      {showControls && (
        <div className="music-controls-panel">
          <div className="music-controls-header">
            <span>🎶 YouTube Music</span>
            <button
              className="close-controls"
              onClick={() => setShowControls(false)}>
              ➡️
            </button>
          </div>
          
          <div className="music-controls">
            <button
              className="play-pause-button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="volume-control">
              <label htmlFor="volume">🔊</label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-percentage">
                {volume}%
              </span>
            </div>

            <div className="change-music">
              <label htmlFor="video-id">🎬 Change Music:</label>
              <div className="video-input-group">
                <input
                  id="video-id"
                  type="text"
                  placeholder="YouTube ID or URL"
                  value={inputVideoId}
                  onChange={(e) => setInputVideoId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && changeVideo()}
                  className="video-input"/>
                <button
                  onClick={changeVideo}
                  className="change-button"
                  title="Change Music">
                  ✅
                </button>
              </div>
            </div>
          </div>

          <div className="music-info">
            <small>💡 Paste the full YouTube ID or URL and press Enter or ✅</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;

