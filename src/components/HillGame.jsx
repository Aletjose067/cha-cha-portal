import React, { useRef, useEffect, useState, useCallback } from 'react';

const W = 680, H = 380;

const HillGame = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const imgRef = useRef(null);

  const stateRef = useRef({
    carX: 120, carY: 0, carAngle: 0, carVx: 0,
    fuel: 100, score: 0, started: false, over: false,
    camX: 0, speed: 0, boostActive: false,
    coins: [],
  });
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(100);

  useEffect(() => {
    const img = new Image(); img.src = '/chacha_car.png'; imgRef.current = img;
  }, []);

  // Generate terrain heights
  const TERRAIN_STEP = 10;
  const terrainRef = useRef([]);
  useEffect(() => {
    const pts = [];
    let h = 240; let freq = 0;
    for (let i = 0; i < 3000; i++) {
      freq += 0.01;
      h += Math.sin(i * 0.04 + freq) * 2.5 + Math.sin(i * 0.012) * 4;
      h = Math.max(180, Math.min(340, h));
      pts.push(h);
    }
    terrainRef.current = pts;
  }, []);

  const getTerrainY = (x) => {
    const pts = terrainRef.current;
    const idx = Math.floor(x / TERRAIN_STEP);
    if (idx < 0) return 240; if (idx >= pts.length - 1) return pts[pts.length - 1];
    const t = (x / TERRAIN_STEP) - idx;
    return pts[idx] * (1 - t) + pts[idx + 1] * t;
  };

  const drawScene = (ctx, state) => {
    const cam = state.camX;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#4a90d9'); sky.addColorStop(1, '#87CEEB');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [[80, 60, 50], [220, 80, 40], [450, 55, 55], [580, 70, 35]].forEach(([x, y, r]) => {
      const rx = x - (cam % W);
      ctx.beginPath(); ctx.ellipse(rx, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Terrain fill
    ctx.beginPath(); ctx.moveTo(0, H);
    const pts = terrainRef.current;
    for (let sx = 0; sx <= W; sx += TERRAIN_STEP) {
      const wx = sx + cam;
      const idx = Math.floor(wx / TERRAIN_STEP);
      const ty = (idx >= 0 && idx < pts.length) ? pts[idx] : 240;
      ctx.lineTo(sx, ty);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = '#5cb85c'; ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();

    // Coins
    state.coins.forEach(c => {
      if (c.collected) return;
      const sx = c.wx - cam;
      if (sx < -20 || sx > W + 20) return;
      ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, c.y - 18, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.font = '14px serif'; ctx.fillText('⭐', sx - 9, c.y - 12);
    });

    // Car
    const carSx = state.carX - cam;
    const carSy = state.carY;
    ctx.save(); ctx.translate(carSx, carSy); ctx.rotate(state.carAngle);
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      ctx.drawImage(imgRef.current, -45, -30, 90, 55);
    } else {
      ctx.fillStyle = '#FFE033';
      ctx.fillRect(-40, -25, 80, 40);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-40, -25, 80, 40);
      // Wheels
      ctx.fillStyle = '#333';
      [-22, 22].forEach(wx => { ctx.beginPath(); ctx.arc(wx, 18, 14, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.restore();
  };

  const drawHUD = (ctx, state) => {
    // Score
    ctx.font = '26px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    ctx.strokeText(`SCORE: ${Math.floor(state.score)}`, 16, 36); ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 16, 36);
    // Fuel bar
    ctx.fillStyle = '#111'; ctx.fillRect(16, 48, 154, 22);
    ctx.fillStyle = state.fuel > 30 ? '#2ECC40' : '#E8212A';
    ctx.fillRect(18, 50, Math.max(0, state.fuel / 100 * 150), 18);
    ctx.strokeStyle = '#FFE033'; ctx.lineWidth = 2; ctx.strokeRect(16, 48, 154, 22);
    ctx.font = '14px Bangers, cursive'; ctx.fillStyle = '#fff'; ctx.fillText('FUEL', 20, 64);
  };

  const drawOverlay = (ctx, status, sc) => {
    ctx.fillStyle = status === 'over' ? 'rgba(232,33,42,0.82)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (status === 'idle') {
      ctx.font = '46px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('CHA CHA HILL CLIMB! 🚗', W / 2, H / 2 - 24);
      ctx.font = '22px Comic Neue, cursive'; ctx.fillStyle = '#fff';
      ctx.fillText('Hold ➡ to accelerate, ⬅ to brake', W / 2, H / 2 + 18);
      ctx.fillText('Collect stars, don\'t run out of FUEL!', W / 2, H / 2 + 50);
      ctx.fillText('Click to Start', W / 2, H / 2 + 82);
    } else {
      ctx.font = '56px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('GAME OVER!', W / 2, H / 2 - 36);
      ctx.font = '28px Bangers, cursive'; ctx.fillStyle = '#fff'; ctx.fillText(`SCORE: ${sc}`, W / 2, H / 2 + 10);
      ctx.font = '20px Comic Neue, cursive'; ctx.fillText('Click to retry', W / 2, H / 2 + 52);
    }
    ctx.textAlign = 'left';
  };

  const keysRef = useRef({ right: false, left: false });
  useEffect(() => {
    const isInput = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
    };
    const dn = (e) => {
      if (isInput(e)) return;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
    };
    const up = (e) => {
      if (isInput(e)) return;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
    };
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  const reset = useCallback(() => {
    const startY = getTerrainY(120);
    const coins = [];
    for (let i = 5; i < 200; i += 8) {
      const wx = i * TERRAIN_STEP * 4;
      coins.push({ wx, y: getTerrainY(wx), collected: false });
    }
    stateRef.current = { carX: 120, carY: startY, carAngle: 0, carVx: 0, fuel: 100, score: 0, started: true, over: false, camX: 0, speed: 0, coins };
    setScore(0); setFuel(100);
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    if (!s.started || s.over) {
      drawScene(ctx, s);
      drawOverlay(ctx, s.over ? 'over' : 'idle', Math.floor(s.score));
      animRef.current = requestAnimationFrame(loop); return;
    }

    const keys = keysRef.current;
    const ACCEL = 0.25, BRAKE = 0.18, FRICTION = 0.97, MAX_SPEED = 8, GRAVITY_COMP = 0.3;

    if (keys.right && s.fuel > 0) { s.carVx = Math.min(s.carVx + ACCEL, MAX_SPEED); s.fuel -= 0.15; setFuel(Math.floor(s.fuel)); }
    if (keys.left) { s.carVx = Math.max(s.carVx - BRAKE, -MAX_SPEED * 0.5); }
    s.carVx *= FRICTION;

    s.carX += s.carVx;
    s.carX = Math.max(40, s.carX);

    // Terrain follow
    const ty = getTerrainY(s.carX);
    s.carY += (ty - s.carY) * 0.3;

    // Slope angle
    const ty1 = getTerrainY(s.carX - 5), ty2 = getTerrainY(s.carX + 5);
    s.carAngle = Math.atan2(ty2 - ty1, 10) * 0.8;

    // Gravity on slope
    s.carVx -= Math.sin(s.carAngle) * GRAVITY_COMP;

    // Camera
    s.camX += (s.carX - W * 0.3 - s.camX) * 0.1;
    s.camX = Math.max(0, s.camX);

    // Score
    s.score += Math.max(0, s.carVx * 0.1);
    setScore(Math.floor(s.score));

    // Coin collection
    s.coins.forEach(c => {
      if (c.collected) return;
      const sx = c.wx - s.camX;
      if (Math.abs(sx - (s.carX - s.camX)) < 40 && Math.abs(c.y - s.carY) < 40) {
        c.collected = true; s.score += 50; s.fuel = Math.min(100, s.fuel + 15); setScore(Math.floor(s.score)); setFuel(Math.floor(s.fuel));
      }
    });

    // Out of fuel or flipped too far
    if (s.fuel <= 0 || Math.abs(s.carAngle) > 1.4) s.over = true;

    drawScene(ctx, s);
    drawHUD(ctx, s);
    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    drawScene(ctx, stateRef.current); drawOverlay(ctx, 'idle', 0);
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [loop]);

  return (
    <div>
      <div className="game-score-display"><span>⭐ SCORE: {score} &nbsp; ⛽ FUEL: {fuel}%</span></div>
      <div className="game-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} onClick={reset} style={{ cursor: 'pointer', display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <div className="game-controls">
        <button className="btn-comic btn-yellow" onClick={reset}>🔄 RESTART</button>
        <div style={{ background: '#fff', border: '3px solid #111', padding: '8px 16px', borderRadius: '4px', boxShadow: '3px 3px 0 #111', fontFamily: 'Comic Neue, cursive', fontWeight: 700, fontSize: '0.9rem' }}>
          ⬅ Brake &nbsp;|&nbsp; ➡ Accelerate
        </div>
      </div>
    </div>
  );
};

export default HillGame;
