import React, { useRef, useEffect, useState, useCallback } from 'react';

const CANVAS_WIDTH = 680;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.45;
const JUMP_FORCE = -9;
const PIPE_SPEED = 3.5;
const PIPE_GAP = 160;
const PIPE_WIDTH = 60;
const PIPE_INTERVAL = 130; // frames between pipes

const Game = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    bird: { x: 120, y: CANVAS_HEIGHT / 2, vy: 0, width: 64, height: 64 },
    pipes: [],
    score: 0,
    frame: 0,
    gameOver: false,
    started: false,
  });
  const animRef = useRef(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle'); // idle | playing | over
  const ruukiImgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/ruuki_flappy.png';
    ruukiImgRef.current = img;
  }, []);

  const drawBackground = (ctx) => {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#c9e8f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Halftone dots
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let x = 0; x < CANVAS_WIDTH; x += 16) {
      for (let y = 0; y < CANVAS_HEIGHT; y += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ground
    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);

    // Ground stripes
    ctx.fillStyle = '#4a9a4a';
    for (let i = 0; i < CANVAS_WIDTH; i += 30) {
      ctx.fillRect(i, CANVAS_HEIGHT - 40, 15, 40);
    }
  };

  const drawPipe = (ctx, pipe) => {
    // Comic pipe style - thick outline, vibrant green
    const pipeColor = '#3aac3a';
    const darkPipe = '#2d8c2d';
    
    // Top pipe body
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    ctx.fillStyle = darkPipe;
    ctx.fillRect(pipe.x, 0, 12, pipe.top);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.top);

    // Top pipe cap
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x - 8, pipe.top - 30, PIPE_WIDTH + 16, 30);
    ctx.fillStyle = darkPipe;
    ctx.fillRect(pipe.x - 8, pipe.top - 30, 14, 30);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x - 8, pipe.top - 30, PIPE_WIDTH + 16, 30);

    // Bottom pipe body
    const bottomY = pipe.top + PIPE_GAP;
    const bottomH = CANVAS_HEIGHT - 40 - bottomY;
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomH);
    ctx.fillStyle = darkPipe;
    ctx.fillRect(pipe.x, bottomY, 12, bottomH);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomH);

    // Bottom pipe cap
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x - 8, bottomY, PIPE_WIDTH + 16, 30);
    ctx.fillStyle = darkPipe;
    ctx.fillRect(pipe.x - 8, bottomY, 14, 30);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x - 8, bottomY, PIPE_WIDTH + 16, 30);

    // "Drug Demon" emoji on pipe
    ctx.font = '24px serif';
    ctx.fillText('💊', pipe.x + 10, pipe.top - 40);
  };

  const drawBird = (ctx, bird) => {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    // Tilt based on velocity
    const tilt = Math.min(Math.max(stateRef.current.bird.vy * 3, -30), 45);
    ctx.rotate((tilt * Math.PI) / 180);

    if (ruukiImgRef.current?.complete && ruukiImgRef.current.naturalWidth) {
      ctx.drawImage(ruukiImgRef.current, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    } else {
      // Fallback circle
      ctx.fillStyle = '#FFE033';
      ctx.beginPath();
      ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Third eye
      ctx.fillStyle = '#00C4CC';
      ctx.beginPath();
      ctx.arc(0, -8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawHUD = (ctx, score) => {
    ctx.font = 'bold 28px Bangers, cursive';
    ctx.fillStyle = '#111';
    ctx.fillText(`SCORE: ${score}`, 16, 36);
    ctx.fillStyle = '#FFE033';
    ctx.font = 'bold 28px Bangers, cursive';
    ctx.fillText(`SCORE: ${score}`, 14, 34);
  };

  const drawOverlay = (ctx, status, score) => {
    if (status === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '52px Bangers, cursive';
      ctx.fillStyle = '#FFE033';
      ctx.textAlign = 'center';
      ctx.fillText('FLAPPY RUUKI!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.font = '24px Comic Neue, cursive';
      ctx.fillStyle = '#fff';
      ctx.fillText('Click or Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Avoid the Drug Demon Pipes! 💊', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);
      ctx.textAlign = 'left';
    } else if (status === 'over') {
      ctx.fillStyle = 'rgba(232,33,42,0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '64px Bangers, cursive';
      ctx.fillStyle = '#FFE033';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.font = '30px Bangers, cursive';
      ctx.fillStyle = '#fff';
      ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

      ctx.font = '22px Comic Neue, cursive';
      ctx.fillText('Click or SPACE to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);
      ctx.textAlign = 'left';
    }
  };

  const resetGame = useCallback(() => {
    stateRef.current = {
      bird: { x: 120, y: CANVAS_HEIGHT / 2, vy: 0, width: 64, height: 64 },
      pipes: [],
      score: 0,
      frame: 0,
      gameOver: false,
      started: true,
    };
    setDisplayScore(0);
    setGameStatus('playing');
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver || !s.started) {
      resetGame();
      return;
    }
    s.bird.vy = JUMP_FORCE;
  }, [resetGame]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    drawBackground(ctx);

    if (!s.started || s.gameOver) {
      drawOverlay(ctx, s.gameOver ? 'over' : 'idle', s.score);
      animRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    s.frame++;

    // Spawn pipes
    if (s.frame % PIPE_INTERVAL === 0) {
      const topH = 60 + Math.random() * (CANVAS_HEIGHT - 40 - PIPE_GAP - 60);
      s.pipes.push({ x: CANVAS_WIDTH, top: topH, passed: false });
    }

    // Move pipes & score
    s.pipes.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;
      if (!pipe.passed && pipe.x + PIPE_WIDTH < s.bird.x) {
        pipe.passed = true;
        s.score++;
        setDisplayScore(s.score);
      }
    });

    s.pipes = s.pipes.filter((p) => p.x + PIPE_WIDTH + 20 > 0);

    // Physics
    s.bird.vy += GRAVITY;
    s.bird.y += s.bird.vy;

    // Collision
    const birdLeft = s.bird.x + 8;
    const birdRight = s.bird.x + s.bird.width - 8;
    const birdTop = s.bird.y + 8;
    const birdBottom = s.bird.y + s.bird.height - 8;

    // Floor / ceiling
    if (birdBottom >= CANVAS_HEIGHT - 40 || birdTop <= 0) {
      s.gameOver = true;
      setGameStatus('over');
    }

    // Pipe collision
    for (const pipe of s.pipes) {
      const capX = pipe.x - 8;
      if (birdRight > capX && birdLeft < capX + PIPE_WIDTH + 16) {
        if (birdTop < pipe.top || birdBottom > pipe.top + PIPE_GAP) {
          s.gameOver = true;
          setGameStatus('over');
          break;
        }
      }
    }

    // Draw pipes
    s.pipes.forEach((pipe) => drawPipe(ctx, pipe));

    // Draw bird
    drawBird(ctx, s.bird);

    // HUD
    drawHUD(ctx, s.score);

    animRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBackground(ctx);
    drawOverlay(ctx, 'idle', 0);
    animRef.current = requestAnimationFrame(gameLoop);

    const handleKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameLoop, jump]);

  return (
    <section className="game-section" id="game">
      <div className="section-header">
        <h2 data-text="FLAPPY RUUKI!">FLAPPY RUUKI! 🎮</h2>
        <p className="section-tagline">Help Ruuki dodge the Drug Demon pipes! Click or press SPACE to fly!</p>
      </div>

      <div className="game-score-display">
        <span>⭐ SCORE: {displayScore}</span>
      </div>

      <div className="game-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={jump}
          style={{ cursor: 'pointer', display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      <div className="game-controls">
        <button className="btn-comic btn-yellow" onClick={resetGame}>
          🔄 RESTART
        </button>
        <button className="btn-comic btn-blue" onClick={jump}>
          ✈️ FLAP!
        </button>
      </div>
    </section>
  );
};

export default Game;
