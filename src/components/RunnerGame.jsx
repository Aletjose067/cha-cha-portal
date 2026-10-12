import React, { useRef, useEffect, useState, useCallback } from 'react';

const W = 680, H = 380;
// Runner game: Cha Cha runs through the city, obstacles scroll in

const RunnerGame = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const imgRef = useRef(null);
  const stateRef = useRef({
    runner: { x: 100, y: H - 100, vy: 0, w: 60, h: 70, onGround: true },
    obstacles: [],
    coins: [],
    score: 0,
    frame: 0,
    speed: 5,
    started: false,
    over: false,
    bgX: 0,
    buildingX: 0,
  });
  const [score, setScore] = useState(0);

  useEffect(() => {
    const img = new Image(); img.src = '/chacha_runner.png'; imgRef.current = img;
  }, []);

  const GROUND = H - 60;

  const drawBg = (ctx, state) => {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#FF6B6B'); sky.addColorStop(1, '#FFE66D');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND);

    // Halftone
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let x = 0; x < W; x += 14) for (let y = 0; y < GROUND; y += 14) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); }

    // Buildings scrolling
    const bx = state.buildingX;
    const buildings = [
      { x: 0, w: 80, h: 180, color: '#E8212A' }, { x: 100, w: 60, h: 130, color: '#1E5FA8' },
      { x: 180, w: 90, h: 200, color: '#7B2FBE' }, { x: 290, w: 70, h: 150, color: '#E8212A' },
      { x: 380, w: 80, h: 170, color: '#1E5FA8' }, { x: 480, w: 60, h: 120, color: '#7B2FBE' },
      { x: 560, w: 100, h: 180, color: '#E8212A' }, { x: 680, w: 80, h: 160, color: '#1E5FA8' },
    ];
    buildings.forEach(b => {
      const rx = ((b.x + bx) % (W + 100)) - 50;
      ctx.fillStyle = b.color; ctx.fillRect(rx, GROUND - b.h, b.w, b.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(rx, GROUND - b.h, b.w, b.h);
      // windows
      ctx.fillStyle = '#FFE033';
      for (let wy = GROUND - b.h + 15; wy < GROUND - 20; wy += 28)
        for (let wx = rx + 10; wx < rx + b.w - 15; wx += 22)
          ctx.fillRect(wx, wy, 12, 12);
    });

    // Ground
    ctx.fillStyle = '#5cb85c'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(0, GROUND, W, H - GROUND);
    // Ground stripes
    ctx.fillStyle = '#4a9a4a';
    for (let i = (state.bgX % 40) - 40; i < W; i += 40) ctx.fillRect(i, GROUND, 20, H - GROUND);
  };

  const drawObstacle = (ctx, obs) => {
    const emojis = ['💊', '🍺', '🚫', '⚡'];
    ctx.fillStyle = '#E8212A'; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    ctx.font = `${obs.w - 8}px serif`; ctx.fillText(emojis[obs.type % emojis.length], obs.x + 4, obs.y + obs.h - 6);
  };

  const drawCoin = (ctx, coin) => {
    if (coin.collected) return;
    ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(coin.x, coin.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = '14px serif'; ctx.fillText('⭐', coin.x - 9, coin.y + 6);
  };

  const drawRunner = (ctx, r) => {
    ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      ctx.drawImage(imgRef.current, -r.w / 2, -r.h / 2, r.w, r.h);
    } else {
      ctx.fillStyle = '#FFE033'; ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
    }
    ctx.restore();
  };

  const drawOverlay = (ctx, status, sc) => {
    ctx.fillStyle = status === 'over' ? 'rgba(232,33,42,0.82)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (status === 'idle') {
      ctx.font = '48px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('CHA CHA RUN! 🏃', W / 2, H / 2 - 24);
      ctx.font = '22px Comic Neue, cursive'; ctx.fillStyle = '#fff';
      ctx.fillText('Click or SPACE to jump!', W / 2, H / 2 + 18);
      ctx.fillText('Dodge addiction obstacles! 💊🍺', W / 2, H / 2 + 50);
    } else {
      ctx.font = '56px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('GAME OVER!', W / 2, H / 2 - 36);
      ctx.font = '28px Bangers, cursive'; ctx.fillStyle = '#fff'; ctx.fillText(`SCORE: ${sc}`, W / 2, H / 2 + 10);
      ctx.font = '20px Comic Neue, cursive'; ctx.fillText('Click or SPACE to retry', W / 2, H / 2 + 52);
    }
    ctx.textAlign = 'left';
  };

  const reset = useCallback(() => {
    stateRef.current = {
      runner: { x: 100, y: GROUND - 70, vy: 0, w: 60, h: 70, onGround: true },
      obstacles: [], coins: [], score: 0, frame: 0, speed: 5, started: true, over: false, bgX: 0, buildingX: 0,
    };
    setScore(0);
  }, []);

  const doJump = useCallback(() => {
    const s = stateRef.current;
    if (s.over || !s.started) { reset(); return; }
    if (s.runner.onGround) { s.runner.vy = -13; s.runner.onGround = false; }
  }, [reset]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    drawBg(ctx, s);
    if (!s.started || s.over) { drawOverlay(ctx, s.over ? 'over' : 'idle', s.score); animRef.current = requestAnimationFrame(loop); return; }

    s.frame++; s.bgX -= s.speed * 0.5; s.buildingX -= s.speed * 0.3;
    if (s.frame % 60 === 0 && s.frame > 0) s.speed = Math.min(s.speed + 0.2, 12);

    // Spawn obstacles
    if (s.frame % Math.max(50, 90 - s.frame / 30) === 0) {
      const h = 40 + Math.random() * 40;
      s.obstacles.push({ x: W + 10, y: GROUND - h, w: 40, h, type: Math.floor(Math.random() * 4) });
    }
    // Spawn coins
    if (s.frame % 70 === 35) {
      s.coins.push({ x: W + 10, y: GROUND - 100 - Math.random() * 80, collected: false });
    }

    // Update obstacles
    s.obstacles.forEach(o => o.x -= s.speed);
    s.obstacles = s.obstacles.filter(o => o.x + o.w > 0);
    s.coins.forEach(c => c.x -= s.speed);
    s.coins = s.coins.filter(c => c.x > -20);

    // Physics
    s.runner.vy += 0.6; s.runner.y += s.runner.vy;
    if (s.runner.y >= GROUND - s.runner.h) { s.runner.y = GROUND - s.runner.h; s.runner.vy = 0; s.runner.onGround = true; }

    // Coin collection
    s.coins.forEach(c => {
      if (!c.collected && Math.abs(c.x - (s.runner.x + s.runner.w / 2)) < 30 && Math.abs(c.y - (s.runner.y + s.runner.h / 2)) < 30) {
        c.collected = true; s.score += 10; setScore(s.score);
      }
    });

    // Obstacle collision
    const rL = s.runner.x + 8, rR = s.runner.x + s.runner.w - 8, rT = s.runner.y + 8, rB = s.runner.y + s.runner.h - 4;
    for (const o of s.obstacles) {
      if (rR > o.x + 4 && rL < o.x + o.w - 4 && rB > o.y + 4 && rT < o.y + o.h) { s.over = true; break; }
    }

    s.score += 0.05; setScore(Math.floor(s.score));

    s.coins.forEach(c => drawCoin(ctx, c));
    s.obstacles.forEach(o => drawObstacle(ctx, o));
    drawRunner(ctx, s.runner);

    ctx.font = 'bold 26px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    ctx.strokeText(`SCORE: ${Math.floor(s.score)}`, 16, 36); ctx.fillText(`SCORE: ${Math.floor(s.score)}`, 16, 36);

    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    drawBg(ctx, stateRef.current); drawOverlay(ctx, 'idle', 0);
    animRef.current = requestAnimationFrame(loop);
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); doJump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); };
  }, [loop, doJump]);

  return (
    <div>
      <div className="game-score-display"><span>⭐ SCORE: {score}</span></div>
      <div className="game-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} onClick={doJump} style={{ cursor: 'pointer', display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <div className="game-controls">
        <button className="btn-comic btn-yellow" onClick={reset}>🔄 RESTART</button>
        <button className="btn-comic btn-red" onClick={doJump}>🏃 JUMP!</button>
      </div>
    </div>
  );
};

export default RunnerGame;
