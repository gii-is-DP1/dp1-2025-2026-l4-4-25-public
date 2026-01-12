import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './BackgroundMusic.css';

// ID de video predeterminado de YouTube (usado solo como fallback cuando no existe un predeterminado local)
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
            // Solo poner autoplay en YouTube si NO hay un predeterminado local seleccionado
            if (selectedTrackIndex === null) {
              try {
                event.target.playVideo();
                setIsPlaying(true);
              } catch (e) {
                // autoplay bloqueado
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
          // 2: parámetro inválido, 5: error HTML5, 100/101/150: no encontrado o incrustación deshabilitada
            setIsPlaying(false);
            const code = event?.data;
            if (code === 101 || code === 150) {
              toast.error('This video cannot be embedded. Try another YouTube link.');
            } else if (code === 100) {
              toast.error('Video not found. Check the ID/URL.');
            } else {
              toast.error('Could not play that YouTube video.');
            }

            // Fallback: mantener la música volviendo al último video reproducible
            pendingVideoIdRef.current = null;
            const fallbackId = lastPlayableVideoIdRef.current;
            if (fallbackId && playerRef.current?.loadVideoById) {
              try {
                playerRef.current.loadVideoById({ videoId: fallbackId, startSeconds: 0 });
                playerRef.current.playVideo();
                loopVideoIdRef.current = fallbackId;
              } catch (e) {
                console.log('BackgroundMusic: fallback loadVideoById failed', e);
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
    // si tenemos inputVideoId establecido y modo 'local', intentar reproducirlo ahora
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
          // autoplay falló a pesar del gesto — dejar que el usuario pulse Play
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
          // Aún no se creó audio local — tratar Play como un gesto de usuario para crear+reproducir la pista seleccionada/ingresada
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

  // Cargar list.json desde public/music/list.json para poblar pistas y elegir el predeterminado
  useEffect(() => {
    let cancelled = false;
    // leer selección/estado de reproducción persistido (si existe)
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
          // Si el reproductor de YouTube ya existe, pausarlo para evitar reproducción simultánea
          try {
            if (playerRef.current?.pauseVideo) {
              playerRef.current.pauseVideo();
              setIsPlaying(false);
            }
          } catch (e) {
            // ignore
          }
        }
        // Restaurar selección/estado de reproducción guardado si está presente
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
            // intentar autoplay ahora que el usuario previamente habilitó audio; si está bloqueado dejar para que el usuario pulse Play
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
            // Intentar autoplay en silencio primero (los navegadores suelen permitir autoplay silenciado)
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
          // Fallback en tiempo de ejecución: intentar detectar un archivo predeterminado para que el profesor solo necesite ejecutar `npm start`.
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
            // Pausar el reproductor de YouTube si está en funcionamiento
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
        // limpiar cualquier listener de reanudación que hayamos adjuntado
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
        // tratar la entrada como una ruta local o URL a un archivo de audio
        // Si el usuario proporcionó una ruta local `/music/<file>` desde la lista, asegurarse de que esté URI-encoded
        const src = raw.startsWith('/music/') ? encodeURI(raw) : raw;
      // detener el reproductor de YouTube si está activo
      try { if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo(); } catch (e) {}
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
        audioRef.current = null;
      }
      // crear elemento de audio pero no asumir que el autoplay funcionará; mantener el comportamiento ligado a la acción Play del usuario
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
      audioRef.current.preload = 'auto';
      // intentar reproducir; si está bloqueado, mostrar un mensaje y dejar el audio listo para que el usuario lo inicie
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

  // Limpiar audio local al desmontar el componente
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

  // Pausar audio local al cambiar a modo youtube
  useEffect(() => {
    if (mode === 'youtube' && audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
    }
  }, [mode]);

  const extractVideoId = (input) => {
    if (input.length === 11 && !input.includes('/') && !input.includes('=')) {
      return input}

    // Si es una URL pero no de YouTube, no intentar tratarla como un ID
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

