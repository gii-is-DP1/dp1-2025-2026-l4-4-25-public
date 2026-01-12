import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './BackgroundMusic.css';

// Default YouTube video ID (used only as fallback when no local default exists)
const DEFAULT_VIDEO_ID = 'a0PvlNn7B-0';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showControls, setShowControls] = useState(false);
  const [userEnabled, setUserEnabled] = useState(false);
  const [player, setPlayer] = useState(null);
  const [inputVideoId, setInputVideoId] = useState('');
  const [mode, setMode] = useState('youtube'); // 'youtube' | 'local'
  const [localSrc, setLocalSrc] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const resumeHandlersRef = useRef(null);
  const lastPlayableVideoIdRef = useRef(DEFAULT_VIDEO_ID);
  const pendingVideoIdRef = useRef(null);
  const loopVideoIdRef = useRef(DEFAULT_VIDEO_ID);

  useEffect(() => {
    console.log('BackgroundMusic: mounted');
    return () => { console.log('BackgroundMusic: unmounted'); };
  }, []);


  useEffect(() => {
    const initPlayer = () => {
      const ytPlayer = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: DEFAULT_VIDEO_ID,
        playerVars: {
          autoplay: 0,
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
            loopVideoIdRef.current = DEFAULT_VIDEO_ID;
            event.target.setVolume(30);
            // Only autoplay YouTube if there is NO local default selected
            if (selectedTrackIndex === null) {
              try {
                event.target.playVideo();
                setIsPlaying(true);
              } catch (e) {
                // autoplay blocked
                setIsPlaying(false);
              }
            }
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              if (pendingVideoIdRef.current) {
                lastPlayableVideoIdRef.current = pendingVideoIdRef.current;
                loopVideoIdRef.current = pendingVideoIdRef.current;
                pendingVideoIdRef.current = null;
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              const loopId = loopVideoIdRef.current;
              if (loopId && event?.target?.seekTo && event?.target?.playVideo) {
                event.target.seekTo(0, true);
                event.target.playVideo();
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
                loopVideoIdRef.current = fallbackId;
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

  const enableAudio = async () => {
    try { localStorage.setItem('bgm.enabled', 'true'); } catch (e) {}
    setUserEnabled(true);
    // if we have an inputVideoId set and mode local, try to play it now
    if (mode === 'local') {
      const raw = inputVideoId.trim();
      if (raw) {
        const src = raw.startsWith('/music/') ? raw : raw;
        try { if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo(); } catch (e) {}
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch (e) {}
          audioRef.current = null;
        }
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
        audioRef.current.preload = 'auto';
        try {
          await audioRef.current.play();
          setLocalSrc(src);
          setIsPlaying(true);
          try { localStorage.setItem('bgm.selected', src); localStorage.setItem('bgm.playing', 'true'); } catch (e) {}
        } catch (e) {
          // autoplay failed despite gesture — leave to user to press Play
          setIsPlaying(false);
        }
      }
    } else if (mode === 'youtube' && playerRef.current?.playVideo) {
      try { playerRef.current.playVideo(); setIsPlaying(true); } catch (e) {}
    }
  };

  const resetAudioPrefs = () => {
    try {
      localStorage.removeItem('bgm.enabled');
      localStorage.removeItem('bgm.selected');
      localStorage.removeItem('bgm.playing');
    } catch (e) {}
    setUserEnabled(false);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        try { audioRef.current.src = ''; } catch (e) {}
        audioRef.current = null;
      }
    } catch (e) {}
    setIsPlaying(false);
    toast.info('Audio preferences reset.');
  };

  const togglePlay = () => {
    if (mode === 'local') {
      if (!audioRef.current) {
        // No local audio created yet — treat Play as a user gesture to create+play the selected/input track
        changeVideo();
        return;
      }
      if (isPlaying) {
        console.log('BackgroundMusic: pausing local audio');
        audioRef.current.pause();
        setIsPlaying(false);
        try { localStorage.setItem('bgm.playing', 'false'); } catch (e) {}
      } else {
        audioRef.current.play().then(() => {
          console.log('BackgroundMusic: local play succeeded');
          setIsPlaying(true);
          try { localStorage.setItem('bgm.playing', 'true'); if (localSrc) localStorage.setItem('bgm.selected', localSrc); localStorage.setItem('bgm.enabled', 'true'); setUserEnabled(true); } catch (e) {}
        }).catch((err) => { console.log('BackgroundMusic: local play failed', err); setIsPlaying(false); });
      }
      return;
    }

    if (player) {
      if (isPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true)}
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100 * 1.0;
    }
  };

  // Load list.json from public/music/list.json to populate tracks and pick default
  useEffect(() => {
    let cancelled = false;
    // read persisted selection/play state (if any)
    let savedSel = null;
    let savedPlay = false;
    let savedEnabled = false;
    try {
      savedSel = localStorage.getItem('bgm.selected');
      savedPlay = localStorage.getItem('bgm.playing') === 'true';
      savedEnabled = localStorage.getItem('bgm.enabled') === 'true';
      setUserEnabled(savedEnabled);
    } catch (e) {
      savedSel = null; savedPlay = false; savedEnabled = false;
    }
    const loadList = async () => {
      try {
        const res = await fetch('/music/list.json');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const t = Array.isArray(data.tracks) ? data.tracks : [];
        setTracks(t);
        const defaultIdx = t.findIndex(x => x.default === true);
        if (defaultIdx >= 0) {
          setSelectedTrackIndex(defaultIdx);
          setMode('local');
          setInputVideoId(`/music/${encodeURIComponent(t[defaultIdx].file)}`);
          // If YouTube player already exists, pause it to avoid simultaneous playback
          try {
            if (playerRef.current?.pauseVideo) {
              playerRef.current.pauseVideo();
              setIsPlaying(false);
            }
          } catch (e) {
            // ignore
          }
        }
        // Restore saved selection/play state if present
        if (savedSel) {
          const src = savedSel.startsWith('/music/') ? savedSel : `/music/${encodeURIComponent(savedSel)}`;
          setInputVideoId(src);
          setMode('local');
          try {
            const plain = decodeURIComponent(src.replace('/music/', ''));
            const idx = t.findIndex(x => x.file === plain);
            if (idx >= 0) setSelectedTrackIndex(idx);
          } catch (e) {}

          if (savedPlay && savedEnabled) {
            // attempt autoplay now that the user previously enabled audio; if blocked leave for user Play
            try {
              if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
            } catch (e) {}
            if (audioRef.current) {
              try { audioRef.current.pause(); } catch (e) {}
              audioRef.current = null;
            }
            const attemptSrc = src;
            audioRef.current = new Audio(attemptSrc);
            audioRef.current.loop = true;
            // Attempt muted autoplay first (browsers usually allow muted autoplay)
            audioRef.current.muted = true;
            audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
            audioRef.current.preload = 'auto';
            audioRef.current.play().then(() => {
              console.log('BackgroundMusic: restored autoplay succeeded for', attemptSrc);
              setLocalSrc(attemptSrc);
              setIsPlaying(true);
              try { localStorage.setItem('bgm.selected', attemptSrc); localStorage.setItem('bgm.playing', 'true'); } catch (e) {}
              const unmuteOnce = () => {
                try { if (audioRef.current) audioRef.current.muted = false; } catch (e) {}
                try { localStorage.setItem('bgm.playing', 'true'); } catch (e) {}
                document.removeEventListener('click', unmuteOnce);
                window.removeEventListener('focus', unmuteOnce);
                document.removeEventListener('visibilitychange', unmuteOnceVisibility);
              };
              const unmuteOnceVisibility = () => { if (document.visibilityState === 'visible') unmuteOnce(); };
              document.addEventListener('click', unmuteOnce);
              window.addEventListener('focus', unmuteOnce);
              document.addEventListener('visibilitychange', unmuteOnceVisibility);
              resumeHandlersRef.current = { unmuteOnce, unmuteOnceVisibility };
            }).catch((err) => {
              console.log('BackgroundMusic: restored autoplay failed', err);
              setIsPlaying(false);
              toast.info('Click or focus the page to resume background audio.');
              const resumeHandler = () => {
                try {
                  if (!audioRef.current) audioRef.current = new Audio(attemptSrc);
                  audioRef.current.loop = true;
                  audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
                  audioRef.current.preload = 'auto';
                  audioRef.current.play().then(() => {
                    try { localStorage.setItem('bgm.selected', attemptSrc); localStorage.setItem('bgm.playing', 'true'); localStorage.setItem('bgm.enabled', 'true'); } catch (e) {}
                    try { audioRef.current.muted = false; } catch (e) {}
                    setLocalSrc(attemptSrc);
                    setIsPlaying(true);
                  }).catch(() => {});
                } catch (e) {}
                window.removeEventListener('focus', resumeHandler);
                document.removeEventListener('click', resumeHandler);
                document.removeEventListener('visibilitychange', visibilityResume);
              };
              const visibilityResume = () => { if (document.visibilityState === 'visible') resumeHandler(); };
              document.addEventListener('click', resumeHandler);
              window.addEventListener('focus', resumeHandler);
              document.addEventListener('visibilitychange', visibilityResume);
              resumeHandlersRef.current = { resumeHandler, visibilityResume };
            });
          }
        }
      } catch (e) {
        console.log('No music list found', e);
        // Runtime fallback: attempt to detect a default file so professor only needs to run `npm start`.
        try {
          const probe = async (p) => {
            try {
              const r = await fetch(p, { method: 'HEAD' });
              return r.ok;
            } catch (err) { return false; }
          };
          const candidates = ['/music/default.mp3', '/music/song21.mp3'];
          const found = [];
          for (const c of candidates) {
            // stop early if cancelled
            if (cancelled) break;
            // eslint-disable-next-line no-await-in-loop
            const ok = await probe(c);
            if (ok) {
              const filename = c.replace('/music/', '');
              found.push({ file: filename, title: filename.replace(/[-_]/g, ' ').replace(/\.mp3$/i, ''), default: true, credit: filename === 'song21.mp3' ? '"Mysterious Ambience (song21)" by Pixelsphere (OpenGameArt.org)' : null });
              break; // prefer first found
            }
          }
          if (found.length > 0) {
            setTracks(found);
            setSelectedTrackIndex(0);
            setMode('local');
            setInputVideoId(`/music/${encodeURIComponent(found[0].file)}`);
            // Pause YouTube player if it's running
            try {
              if (playerRef.current?.pauseVideo) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
              }
            } catch (e) {}
          }
        } catch (inner) { console.log('Fallback probe failed', inner); }
      }
    };
    loadList();
    
      return () => {
        cancelled = true;
        // cleanup any resume listeners we attached
        try {
          const r = resumeHandlersRef.current;
          if (r) {
            if (r.unmuteOnce) {
              document.removeEventListener('click', r.unmuteOnce);
              window.removeEventListener('focus', r.unmuteOnce);
              document.removeEventListener('visibilitychange', r.unmuteOnceVisibility);
            }
            if (r.resumeHandler) {
              document.removeEventListener('click', r.resumeHandler);
              window.removeEventListener('focus', r.resumeHandler);
              document.removeEventListener('visibilitychange', r.visibilityResume);
            }
          }
        } catch (e) {}
      };
  }, []);

  const changeVideo = () => {
    const raw = inputVideoId.trim();
    if (!raw) return;

      if (mode === 'local') {
        // treat input as a local path or URL to an audio file
        // If the user provided a local `/music/<file>` path from the list, ensure it's URI-encoded
        const src = raw.startsWith('/music/') ? encodeURI(raw) : raw;
      // stop youtube player if active
      try { if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo(); } catch (e) {}
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
        audioRef.current = null;
      }
      // create audio element but don't assume autoplay will succeed; keep behavior tied to the user's Play action
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
      audioRef.current.preload = 'auto';
      // attempt to play; if blocked, show clear English message and leave audio ready for user-triggered play
      audioRef.current.play().then(() => {
        console.log('BackgroundMusic: changeVideo started local src', src);
        setLocalSrc(src);
        setIsPlaying(true);
        try { localStorage.setItem('bgm.selected', src); localStorage.setItem('bgm.playing', 'true'); localStorage.setItem('bgm.enabled', 'true'); setUserEnabled(true); } catch (e) {}
      }).catch((e) => {
        console.log('BackgroundMusic: changeVideo failed to play local src', src, e);
        setIsPlaying(false);
        toast.error('Could not play local file (autoplay blocked or invalid path). Click Play to try again.');
        console.log('Local audio play error', e);
      });
      return;
    }

    // youtube mode
    if (!player) return;
    const videoId = extractVideoId(raw);
    if (!videoId) {
      toast.error('Paste a YouTube video URL or ID (11 chars).');
      return;
    }
    pendingVideoIdRef.current = videoId;
    player.loadVideoById({ videoId, startSeconds: 0 });
    player.playVideo();
    setIsPlaying(true);
  };

  // Cleanup local audio on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        try { localStorage.setItem('bgm.playing', 'false'); } catch (e) {}
      } catch (e) {}
    };
  }, []);

  // Pause local audio when switching to youtube mode
  useEffect(() => {
    if (mode === 'youtube' && audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
    }
  }, [mode]);

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
            <span>🎶 YouTube or Local Music (play on demand)</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {!userEnabled && (
                <button
                  className="change-button enable-button"
                  onClick={enableAudio}
                  title="Enable audio">
                  Enable audio
                </button>
              )}
              <button
                className="change-button reset-button"
                onClick={resetAudioPrefs}
                title="Reset audio preferences">
                Reset audio prefs
              </button>
              <button
                className="close-controls"
                onClick={() => setShowControls(false)}>
                ➡️
              </button>
            </div>
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="radio" name="mode" checked={mode === 'youtube'} onChange={() => setMode('youtube')} /> YouTube
                  </label>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="radio" name="mode" checked={mode === 'local'} onChange={() => setMode('local')} /> Local
                  </label>
                </div>

                <div className="video-input-group" style={{ marginTop: 8 }}>
                  <input
                    id="video-id"
                    type="text"
                    placeholder={mode === 'youtube' ? 'YouTube ID or URL' : '/music/your-file.mp3 or http(s)://...'}
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

              {tracks.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <label>Select track:</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <select value={selectedTrackIndex ?? ''} onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      setSelectedTrackIndex(idx);
                      const file = tracks[idx]?.file;
                        if (file) {
                        const path = `/music/${encodeURIComponent(file)}`;
                        setInputVideoId(path);
                        setMode('local');
                        try { localStorage.setItem('bgm.selected', path); } catch (e) {}
                      }
                    }}>
                      {tracks.map((t, i) => (
                        <option key={t.file} value={i}>{t.title || t.file}{t.default ? ' (default)' : ''}</option>
                      ))}
                    </select>
                    <button onClick={() => changeVideo()} className="change-button">▶️ Play</button>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="music-info">
            {mode === 'local' && selectedTrackIndex !== null && tracks[selectedTrackIndex] ? (
              <small>{tracks[selectedTrackIndex].credit || `${tracks[selectedTrackIndex].title || tracks[selectedTrackIndex].file}`}</small>
            ) : mode === 'local' && localSrc ? (
              <small>{localSrc}</small>
            ) : (
              <small>💡 YouTube plays only when requested; local tracks are preferred. Some YouTube videos block embedding.</small>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;

