import React, { useRef, useEffect, useState, useCallback } from 'react';

const W = 680, H = 400;
const GRAVITY = 0.45, JUMP = -9, PIPE_SPEED = 3.5, GAP = 160, PW = 60, INTERVAL = 130;

const FlappyGame = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({ bird: { x: 120, y: H / 2, vy: 0, w: 64, h: 64 }, pipes: [], score: 0, frame: 0, over: false, started: false });
  const animRef = useRef(null);
  const [score, setScore] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/chacha_flappy.png';
    imgRef.current = img;
  }, []);

  const drawBg = (ctx) => {
    // Sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#87CEEB'); g.addColorStop(1, '#c9e8f7');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Halftone
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let x = 0; x < W; x += 16) for (let y = 0; y < H; y += 16) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    // Ground
    ctx.fillStyle = '#5cb85c'; ctx.fillRect(0, H - 40, W, 40);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(0, H - 40, W, 40);
  };

  const drawPipe = (ctx, p) => {
    const green = '#3aac3a', dark = '#2d8c2d';
    ctx.fillStyle = green; ctx.fillRect(p.x, 0, PW, p.top);
    ctx.fillStyle = dark; ctx.fillRect(p.x, 0, 12, p.top);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(p.x, 0, PW, p.top);
    ctx.fillStyle = green; ctx.fillRect(p.x - 8, p.top - 30, PW + 16, 30);
    ctx.strokeStyle = '#111'; ctx.strokeRect(p.x - 8, p.top - 30, PW + 16, 30);
    const bY = p.top + GAP, bH = H - 40 - bY;
    ctx.fillStyle = green; ctx.fillRect(p.x, bY, PW, bH);
    ctx.fillStyle = dark; ctx.fillRect(p.x, bY, 12, bH);
    ctx.strokeStyle = '#111'; ctx.strokeRect(p.x, bY, PW, bH);
    ctx.fillStyle = green; ctx.fillRect(p.x - 8, bY, PW + 16, 30);
    ctx.strokeStyle = '#111'; ctx.strokeRect(p.x - 8, bY, PW + 16, 30);
    ctx.font = '22px serif'; ctx.fillText('💊', p.x + 12, p.top - 38);
  };

  const drawBird = (ctx, b) => {
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate((Math.min(Math.max(b.vy * 3, -30), 45) * Math.PI) / 180);
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      // Draw with mix-blend-mode to remove white: use globalCompositeOperation
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(imgRef.current, -b.w / 2, -b.h / 2, b.w, b.h);
    } else {
      ctx.fillStyle = '#FFE033';
      ctx.beginPath(); ctx.arc(0, 0, b.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
  };

  const drawOverlay = (ctx, status, sc) => {
    ctx.fillStyle = status === 'over' ? 'rgba(232,33,42,0.82)' : 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (status === 'idle') {
      ctx.font = '52px Bangers, cursive'; ctx.fillStyle = '#FFE033';
      ctx.fillText('FLAPPY CHA CHA!', W / 2, H / 2 - 30);
      ctx.font = '22px Comic Neue, cursive'; ctx.fillStyle = '#fff';
      ctx.fillText('Click or SPACE to start', W / 2, H / 2 + 16);
      ctx.fillText('Dodge Drug Demon pipes! 💊', W / 2, H / 2 + 48);
    } else {
      ctx.font = '60px Bangers, cursive'; ctx.fillStyle = '#FFE033';
      ctx.fillText('GAME OVER!', W / 2, H / 2 - 36);
      ctx.font = '28px Bangers, cursive'; ctx.fillStyle = '#fff';
      ctx.fillText(`SCORE: ${sc}`, W / 2, H / 2 + 10);
      ctx.font = '20px Comic Neue, cursive';
      ctx.fillText('Click or SPACE to try again', W / 2, H / 2 + 52);
    }
    ctx.textAlign = 'left';
  };

  const reset = useCallback(() => {
    stateRef.current = { bird: { x: 120, y: H / 2, vy: 0, w: 64, h: 64 }, pipes: [], score: 0, frame: 0, over: false, started: true };
    setScore(0);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.over || !s.started) { reset(); return; }
    s.bird.vy = JUMP;
  }, [reset]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    drawBg(ctx);
    if (!s.started || s.over) { drawOverlay(ctx, s.over ? 'over' : 'idle', s.score); animRef.current = requestAnimationFrame(loop); return; }
    s.frame++;
    if (s.frame % INTERVAL === 0) { const top = 60 + Math.random() * (H - 40 - GAP - 60); s.pipes.push({ x: W, top, passed: false }); }
    s.pipes.forEach(p => { p.x -= PIPE_SPEED; if (!p.passed && p.x + PW < s.bird.x) { p.passed = true; s.score++; setScore(s.score); } });
    s.pipes = s.pipes.filter(p => p.x + PW + 20 > 0);
    s.bird.vy += GRAVITY; s.bird.y += s.bird.vy;
    const bL = s.bird.x + 8, bR = s.bird.x + s.bird.w - 8, bT = s.bird.y + 8, bB = s.bird.y + s.bird.h - 8;
    if (bB >= H - 40 || bT <= 0) { s.over = true; }
    for (const p of s.pipes) { if (bR > p.x - 8 && bL < p.x + PW + 8 && (bT < p.top || bB > p.top + GAP)) { s.over = true; break; } }
    s.pipes.forEach(p => drawPipe(ctx, p));
    drawBird(ctx, s.bird);
    ctx.font = 'bold 26px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    ctx.strokeText(`SCORE: ${s.score}`, 16, 36); ctx.fillText(`SCORE: ${s.score}`, 16, 36);
    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    drawBg(ctx); drawOverlay(ctx, 'idle', 0);
    animRef.current = requestAnimationFrame(loop);
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKey); };
  }, [loop, jump]);

  return { canvasRef, score, reset, jump };
};

const FlappySection = () => {
  const { canvasRef, score, reset, jump } = FlappyGame();
  return (
    <div>
      <div className="game-score-display"><span>⭐ SCORE: {score}</span></div>
      <div className="game-canvas-wrap">
        <canvas ref={canvasRef} width={680} height={400} onClick={jump} style={{ cursor: 'pointer', display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <div className="game-controls">
        <button className="btn-comic btn-yellow" onClick={reset}>🔄 RESTART</button>
        <button className="btn-comic btn-blue" onClick={jump}>✈️ FLAP!</button>
      </div>
    </div>
  );
};

export default FlappySection;
