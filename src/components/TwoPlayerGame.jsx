import React, { useRef, useEffect, useState, useCallback } from 'react';

// 2-Player fighting game: Cha Cha vs Drug Demon
// P1: A/D (move), W (jump), S (punch)
// P2: LEFT/RIGHT (move), UP (jump), DOWN (punch)

const W = 680, H = 380;
const GROUND = H - 80;

const TwoPlayerGame = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const img1Ref = useRef(null); // Cha Cha hero
  const img2Ref = useRef(null); // Cha Cha strong (demon side)

  const makePlayer = (x, dir, color, name, keys) => ({
    x, y: GROUND - 80, vy: 0, w: 60, h: 80, dir, color, name, keys,
    hp: 100, onGround: true, punching: false, punchTimer: 0, stunTimer: 0,
  });

  const stateRef = useRef({
    p1: null, p2: null, started: false, over: false, winner: '',
  });
  const [hp1, setHp1] = useState(100);
  const [hp2, setHp2] = useState(100);
  const [status, setStatus] = useState('idle');
  const [winner, setWinner] = useState('');

  useEffect(() => {
    const i1 = new Image(); i1.src = '/ruuki_hero.png'; img1Ref.current = i1;
    const i2 = new Image(); i2.src = '/ruuki_strong.png'; img2Ref.current = i2;
  }, []);

  const keysRef = useRef({});
  useEffect(() => {
    const dn = (e) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  const drawBg = (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#1a0040'); g.addColorStop(1, '#4a0080');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND);
    // Stars
    ctx.fillStyle = '#FFE033';
    [[50,30],[120,60],[300,20],[460,45],[600,25],[650,70],[200,80]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
    });
    // Halftone
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < W; x += 20) for (let y = 0; y < GROUND; y += 20) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill(); }
    // Ground
    ctx.fillStyle = '#7B2FBE'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = '#FFE033'; ctx.lineWidth = 4; ctx.strokeRect(0, GROUND, W, H - GROUND);
    // Ground pattern
    ctx.fillStyle = '#6a28a0';
    for (let i = 0; i < W; i += 40) ctx.fillRect(i, GROUND, 20, H - GROUND);
    // FIGHT ARENA label
    ctx.textAlign = 'center'; ctx.font = '20px Bangers, cursive'; ctx.fillStyle = '#FFE033';
    ctx.fillText('⚡ FIGHT ARENA ⚡', W/2, H - 20); ctx.textAlign = 'left';
  };

  const drawPlayer = (ctx, p, imgRef) => {
    ctx.save();
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    if (p.dir === -1) ctx.scale(-1, 1);
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      ctx.drawImage(imgRef.current, -p.w/2, -p.h/2, p.w, p.h);
    } else {
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-p.w/2, -p.h/2, p.w, p.h);
    }
    // Punch flash
    if (p.punching) {
      ctx.fillStyle = 'rgba(255,230,0,0.6)';
      ctx.beginPath(); ctx.arc(p.w/2 + 10, 0, 20, 0, Math.PI*2); ctx.fill();
      ctx.font = '20px serif'; ctx.fillText('👊', p.w/2, 8);
    }
    ctx.restore();
    // Name tag
    ctx.font = 'bold 14px Bangers, cursive'; ctx.textAlign = 'center';
    ctx.fillStyle = '#FFE033'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    ctx.strokeText(p.name, p.x + p.w/2, p.y - 8);
    ctx.fillText(p.name, p.x + p.w/2, p.y - 8);
    ctx.textAlign = 'left';
  };

  const drawHUD = (ctx, p1, p2) => {
    // P1 HP bar
    ctx.fillStyle = '#111'; ctx.fillRect(16, 14, 204, 24);
    ctx.fillStyle = p1.hp > 40 ? '#2ECC40' : '#E8212A';
    ctx.fillRect(18, 16, Math.max(0, p1.hp / 100 * 200), 20);
    ctx.strokeStyle = '#FFE033'; ctx.lineWidth = 2; ctx.strokeRect(16, 14, 204, 24);
    ctx.font = '14px Bangers, cursive'; ctx.fillStyle = '#fff'; ctx.fillText(`P1: ${p1.name}`, 22, 30);

    // P2 HP bar
    ctx.fillStyle = '#111'; ctx.fillRect(W - 220, 14, 204, 24);
    ctx.fillStyle = p2.hp > 40 ? '#2ECC40' : '#E8212A';
    ctx.fillRect(W - 218, 16, Math.max(0, p2.hp / 100 * 200), 20);
    ctx.strokeStyle = '#FFE033'; ctx.lineWidth = 2; ctx.strokeRect(W - 220, 14, 204, 24);
    ctx.font = '14px Bangers, cursive'; ctx.fillStyle = '#fff';
    ctx.textAlign = 'right'; ctx.fillText(`P2: ${p2.name}`, W - 22, 30); ctx.textAlign = 'left';

    // VS
    ctx.textAlign = 'center'; ctx.font = '22px Bangers, cursive'; ctx.fillStyle = '#FFE033';
    ctx.fillText('VS', W/2, 34); ctx.textAlign = 'left';
  };

  const drawOverlay = (ctx, status, win) => {
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (status === 'idle') {
      ctx.font = '50px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('CHA CHA BRAWL! 🥊', W/2, H/2 - 30);
      ctx.font = '18px Comic Neue, cursive'; ctx.fillStyle = '#fff';
      ctx.fillText('P1: A/D=Move, W=Jump, S=Punch', W/2, H/2 + 10);
      ctx.fillText('P2: ←/→=Move, ↑=Jump, ↓=Punch', W/2, H/2 + 36);
      ctx.font = '22px Comic Neue, cursive'; ctx.fillStyle = '#FFE033';
      ctx.fillText('Click to Start!', W/2, H/2 + 72);
    } else {
      ctx.font = '60px Bangers, cursive'; ctx.fillStyle = '#FFE033'; ctx.fillText('KO!! 💥', W/2, H/2 - 30);
      ctx.font = '32px Bangers, cursive'; ctx.fillStyle = '#fff'; ctx.fillText(`${win} WINS!`, W/2, H/2 + 20);
      ctx.font = '20px Comic Neue, cursive'; ctx.fillText('Click to Play Again', W/2, H/2 + 60);
    }
    ctx.textAlign = 'left';
  };

  const reset = useCallback(() => {
    stateRef.current = {
      p1: makePlayer(80, 1, '#FFE033', 'CHA CHA', {}),
      p2: makePlayer(W - 140, -1, '#E8212A', 'DEMON', {}),
      started: true, over: false, winner: '',
    };
    setHp1(100); setHp2(100); setStatus('playing'); setWinner('');
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    drawBg(ctx);

    if (!s.started || s.over) {
      if (s.p1 && s.p2) { drawPlayer(ctx, s.p1, img1Ref); drawPlayer(ctx, s.p2, img2Ref); }
      drawOverlay(ctx, s.over ? 'over' : 'idle', s.winner);
      animRef.current = requestAnimationFrame(loop); return;
    }

    const keys = keysRef.current;
    const [p1, p2] = [s.p1, s.p2];
    const SPEED = 4, JUMP = -13, GRAVITY = 0.55, PUNCH_REACH = 80, PUNCH_DMG = 8;

    [p1, p2].forEach(p => {
      // Movement
      const leftKey = p === p1 ? 'a' : 'arrowleft';
      const rightKey = p === p1 ? 'd' : 'arrowright';
      const jumpKey = p === p1 ? 'w' : 'arrowup';
      const punchKey = p === p1 ? 's' : 'arrowdown';

      if (p.stunTimer <= 0) {
        if (keys[leftKey]) { p.x -= SPEED; p.dir = -1; }
        if (keys[rightKey]) { p.x += SPEED; p.dir = 1; }
        if (keys[jumpKey] && p.onGround) { p.vy = JUMP; p.onGround = false; }
        if (keys[punchKey] && !p.punching) { p.punching = true; p.punchTimer = 18; }
      }

      p.x = Math.max(0, Math.min(W - p.w, p.x));
      p.vy += GRAVITY; p.y += p.vy;
      if (p.y >= GROUND - p.h) { p.y = GROUND - p.h; p.vy = 0; p.onGround = true; }
      if (p.punchTimer > 0) p.punchTimer--; else p.punching = false;
      if (p.stunTimer > 0) p.stunTimer--;
    });

    // Punch collision
    const checkPunch = (attacker, defender, imgD) => {
      if (!attacker.punching || attacker.punchTimer !== 14) return;
      const ax = attacker.x + (attacker.dir === 1 ? attacker.w : 0);
      const dx = defender.x + defender.w / 2;
      if (Math.abs(ax - dx) < PUNCH_REACH && Math.abs(attacker.y - defender.y) < 60) {
        defender.hp = Math.max(0, defender.hp - PUNCH_DMG);
        defender.stunTimer = 20;
        setHp1(s.p1.hp); setHp2(s.p2.hp);
        if (defender.hp <= 0) {
          s.over = true; s.winner = attacker.name;
          setStatus('over'); setWinner(attacker.name);
        }
      }
    };
    checkPunch(p1, p2); checkPunch(p2, p1);

    drawPlayer(ctx, p1, img1Ref);
    drawPlayer(ctx, p2, img2Ref);
    drawHUD(ctx, p1, p2);

    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    drawBg(ctx); drawOverlay(ctx, 'idle', '');
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [loop]);

  return (
    <div>
      <div className="game-score-display">
        <span style={{ color: '#2ECC40' }}>❤️ P1: {hp1}%</span>
        <span style={{ margin: '0 1rem', color: '#111' }}>VS</span>
        <span style={{ color: '#E8212A' }}>❤️ P2: {hp2}%</span>
      </div>
      <div className="game-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} onClick={reset} style={{ cursor: 'pointer', display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <div className="game-controls">
        <button className="btn-comic btn-yellow" onClick={reset}>🔄 NEW FIGHT</button>
        <div style={{ background: '#fff', border: '3px solid #111', padding: '8px 16px', borderRadius: '4px', boxShadow: '3px 3px 0 #111', fontFamily: 'Comic Neue, cursive', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.6 }}>
          🟡 P1: A/D move · W jump · S punch<br/>
          🔴 P2: ←/→ move · ↑ jump · ↓ punch
        </div>
      </div>
    </div>
  );
};

export default TwoPlayerGame;
