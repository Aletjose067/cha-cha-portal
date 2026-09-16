import React, { useEffect, useRef, useState } from 'react';
import { playImpactSound } from '../utils/audio';

const WORDS = ['POW!', 'ZAP!', 'BOOM!', 'KABAM!', 'BAM!', 'ZING!', 'WOW!'];
const COLORS = ['#FFE033', '#E8212A', '#00C4CC', '#7B2FBE', '#2ECC40'];

const ComicVFX = () => {
  const canvasRef = useRef(null);
  const [popups, setPopups] = useState([]);

  // Handle click comic action burst
  useEffect(() => {
    const handleClick = (e) => {
      // Don't trigger popup on buttons or inputs if user is typing
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      playImpactSound();

      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const id = Date.now() + Math.random();
      const rotation = (Math.random() - 0.5) * 35; // -17deg to +17deg

      const newPopup = {
        id,
        x: e.clientX,
        y: e.clientY,
        word,
        color,
        rotation,
      };

      setPopups((prev) => [...prev.slice(-6), newPopup]);

      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Ambient Floating Particle Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -Math.random() * 1.2 - 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="comic-vfx-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 90,
        }}
      />

      <div className="comic-click-popups-layer" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
        {popups.map((p) => (
          <div
            key={p.id}
            className="comic-burst-popup"
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
              backgroundColor: p.color,
            }}
          >
            <span>{p.word}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default ComicVFX;
