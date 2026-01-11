import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './BackgroundMusic.css';

const DEFAULT_VIDEO_ID = 'f--e5fca2Jg';

const BackgroundMusic = () => {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showControls, setShowControls] = useState(false);
  const [player, setPlayer] = useState(null);
  const [inputVideoId, setInputVideoId] = useState('');
  const playerRef = useRef(null);
  const lastPlayableVideoIdRef = useRef(DEFAULT_VIDEO_ID);
  const pendingVideoIdRef = useRef(null);

  useEffect(() => {
    const initPlayer = () => {
      const ytPlayer = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: DEFAULT_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: DEFAULT_VIDEO_ID,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            lastPlayableVideoIdRef.current = DEFAULT_VIDEO_ID;
            event.target.setVolume(30);
            event.target.playVideo();
            setIsPlaying(true);
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              if (pendingVideoIdRef.current) {
                lastPlayableVideoIdRef.current = pendingVideoIdRef.current;
                pendingVideoIdRef.current = null;
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            // 2: invalid parameter, 5: HTML5 error, 100/101/150: not found or embedding disabled
            setIsPlaying(false);
            const code = event?.data;
            if (code === 101 || code === 150) {
              toast.error('This video cannot be embedded. Try another YouTube link.');
            } else if (code === 100) {
              toast.error('Video not found. Check the ID/URL.');
            } else {
              toast.error('Could not play that YouTube video.');
            }

            // Fallback: keep music going by returning to last playable video
            pendingVideoIdRef.current = null;
            const fallbackId = lastPlayableVideoIdRef.current;
            if (fallbackId && playerRef.current?.loadVideoById) {
              try {
                playerRef.current.loadVideoById({ videoId: fallbackId, startSeconds: 0 });
                playerRef.current.playVideo();
              } catch (e) {
                // ignore
              }
            }
          }
        },
      });
      playerRef.current = ytPlayer;
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
      return () => {
        if (playerRef.current?.destroy) {
          playerRef.current.destroy();
        }
      };
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => initPlayer();

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

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
    const raw = inputVideoId.trim();
    if (!player || !raw) return;

    const videoId = extractVideoId(raw);
    if (!videoId) {
      toast.error('Paste a YouTube video URL or ID (11 chars).');
      return;
    }

    pendingVideoIdRef.current = videoId;
    player.loadVideoById({ videoId, startSeconds: 0 });
    player.setLoop(true);
    player.playVideo();
    setIsPlaying(true);
  };

  const extractVideoId = (input) => {
    if (input.length === 11 && !input.includes('/') && !input.includes('=')) {
      return input}

    // If it's a URL but not YouTube, don't try to treat it as an ID
    if (input.includes('://') && !input.includes('youtube.com') && !input.includes('youtu.be')) {
      return null;
    }
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1]}
    }
    
    return input.length === 11 ? input : null;
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
            <small>💡 Only YouTube links/IDs work (some videos block embedding)</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;

