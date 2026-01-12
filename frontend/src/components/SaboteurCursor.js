import React, { useEffect, useRef } from 'react';
import './SaboteurCursor.css';

// Robust cursor that remains synced during pointer and drag interactions.
const SaboteurCursor = () => {
  const cursorRef = useRef(null);
  const sparklesRef = useRef([]);
  const rafRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // update DOM position without re-rendering React to avoid freezes
    const updatePosition = () => {
      const el = cursorRef.current;
      if (el) {
        el.style.left = `${posRef.current.x}px`;
        el.style.top = `${posRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    rafRef.current = requestAnimationFrame(updatePosition);

    const handlePointerMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    };

    const handlePointerDown = (e) => {
      const el = cursorRef.current;
      if (el) el.classList.add('mining');
      // create sparkles at pointer location
      const now = Date.now();
      const newS = Array.from({ length: 8 }, (_, i) => ({ id: now + i, x: posRef.current.x, y: posRef.current.y, angle: (360 / 8) * i }));
      sparklesRef.current = [...sparklesRef.current, ...newS];
      // schedule cleanup
      setTimeout(() => { sparklesRef.current = sparklesRef.current.filter(s => s.id > Date.now() - 700); }, 700);
    };

    const handlePointerUp = () => {
      const el = cursorRef.current;
      if (el) el.classList.remove('mining');
    };

    // dragstart: hide the browser drag image so our custom cursor appears to drag
    const handleDragStart = (e) => {
      try {
        // create a tiny transparent canvas as drag image
        const img = document.createElement('canvas');
        img.width = 1; img.height = 1;
        e.dataTransfer && e.dataTransfer.setDragImage(img, 0, 0);
      } catch (err) {
        // ignore
      }
      if (cursorRef.current) cursorRef.current.classList.add('dragging');
    };

    const handleDragEnd = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('dragging');
    };

    // When native select opens some browsers halt pointer events; try to re-enable cursor
    const handleMouseDown = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'SELECT' || t.closest && t.closest('select'))) {
        // ensure our cursor stays visible while the select is open
        if (cursorRef.current) cursorRef.current.classList.add('keep-visible');
        const onBlur = () => { if (cursorRef.current) cursorRef.current.classList.remove('keep-visible'); t.removeEventListener('blur', onBlur); };
        t.addEventListener('blur', onBlur);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('dragend', handleDragEnd);
    // also listen for custom pointer-based drag lifecycle events
    document.body.addEventListener('saboteur-dragstart', handleDragStart);
    document.body.addEventListener('saboteur-dragend', handleDragEnd);
    window.addEventListener('mousedown', handleMouseDown);

    // ensure cursor is visible on focus (some browser interactions hide it)
    const ensureVisible = () => { if (cursorRef.current) cursorRef.current.style.display = 'block'; };
    window.addEventListener('focus', ensureVisible);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('dragend', handleDragEnd);
      document.body.removeEventListener('saboteur-dragstart', handleDragStart);
      document.body.removeEventListener('saboteur-dragend', handleDragEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('focus', ensureVisible);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="saboteur-cursor" style={{ left: 0, top: 0 }}>
        <div className="pickaxe">⛏️</div>
        <div className="cursor-ring"></div>
      </div>

      {/* render sparkles from ref without re-rendering main cursor; keep a small portal */}
      {sparklesRef.current && sparklesRef.current.map((s) => (
        <div key={s.id} className="sparkle" style={{ left: `${s.x}px`, top: `${s.y}px`, '--angle': `${s.angle}deg` }}>✨</div>
      ))}

      <div className="gold-dust" style={{ left: `${posRef.current.x}px`, top: `${posRef.current.y}px` }}>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
      </div>
    </>
  );
};

export default SaboteurCursor;
