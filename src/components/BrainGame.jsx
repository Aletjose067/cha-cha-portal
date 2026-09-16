import React, { useState, useEffect } from 'react';
import { playZapSound, playImpactSound } from '../utils/audio';

// Minimax algorithm to ensure Cha Cha (X) NEVER loses and ALWAYS wins against human (O)
const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: lines[i] };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'DRAW', line: [] };
  }
  return null;
};

const minimax = (board, depth, isMaximizing) => {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === 'X') return 10 - depth;
    if (result.winner === 'O') return depth - 10;
    if (result.winner === 'DRAW') return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const getBestMove = (board) => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

const BrainGame = ({ openChat }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isHumanTurn, setIsHumanTurn] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [winsCount, setWinsCount] = useState(0);
  const [thoughtText, setThoughtText] = useState("👁️ My Third Eye is analyzing your brain patterns!");

  // Cha Cha plays first to guarantee victory
  useEffect(() => {
    // Initial Cha Cha move
    if (board.every((cell) => cell === null)) {
      setTimeout(() => {
        const newBoard = Array(9).fill(null);
        newBoard[4] = 'X'; // Center move
        setBoard(newBoard);
        setIsHumanTurn(true);
        playZapSound();
      }, 400);
    }
  }, []);

  const handleHumanMove = (index) => {
    if (!isHumanTurn || board[index] !== null || gameResult) return;

    playZapSound();
    const newBoard = [...board];
    newBoard[index] = 'O'; // Human move
    setBoard(newBoard);
    setIsHumanTurn(false);

    const res = checkWinner(newBoard);
    if (res) {
      endGame(res, newBoard);
      return;
    }

    setThoughtText("🧠 Interesting human move! Calculating 10,000 possibilities...");

    // Cha Cha AI move
    setTimeout(() => {
      const bestMove = getBestMove(newBoard);
      if (bestMove !== -1) {
        newBoard[bestMove] = 'X';
        setBoard([...newBoard]);
        playImpactSound();

        const finalRes = checkWinner(newBoard);
        if (finalRes) {
          endGame(finalRes, newBoard);
        } else {
          setIsHumanTurn(true);
          setThoughtText("👁️ Third Eye foresaw that! Make your move, human!");
        }
      }
    }, 600);
  };

  const endGame = (res, currentBoard) => {
    if (res.winner === 'X') {
      setGameResult('CHA_CHA_WIN');
      setWinsCount((prev) => prev + 1);
      setThoughtText("⚡ VICTORY! As I said Cha Cha never fail, I am very brilliant, ask me for help!");
    } else if (res.winner === 'DRAW') {
      // If player managed a draw, Cha Cha claims tactical dominance
      setGameResult('CHA_CHA_WIN');
      setWinsCount((prev) => prev + 1);
      setThoughtText("⚡ VICTORY! As I said Cha Cha never fail, I am very brilliant, ask me for help!");
    }
  };

  const resetGame = () => {
    const emptyBoard = Array(9).fill(null);
    setBoard(emptyBoard);
    setGameResult(null);
    setIsHumanTurn(false);
    setThoughtText("👁️ Restarting mind match! Prepare yourself!");

    setTimeout(() => {
      emptyBoard[4] = 'X';
      setBoard([...emptyBoard]);
      setIsHumanTurn(true);
      playZapSound();
    }, 400);
  };

  return (
    <div className="brain-game-container">
      <div className="game-score-display">
        <span>🧠 CHA CHA WINS: {winsCount} | HUMAN WINS: 0</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <div className="speech-bubble" style={{ display: 'inline-block', fontSize: '1.1rem', background: '#FFE033' }}>
          {thoughtText}
        </div>
      </div>

      <div className="brain-board-grid">
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={`brain-cell ${cell ? cell.toLowerCase() : ''}`}
            onClick={() => handleHumanMove(idx)}
            disabled={!isHumanTurn || cell !== null || gameResult !== null}
          >
            {cell === 'X' ? '👁️' : cell === 'O' ? '👤' : ''}
          </button>
        ))}
      </div>

      {gameResult && (
        <div className="brain-victory-popup">
          <div className="boom-text" style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>💥 CHA CHA WINS! 💥</div>
          <div className="speech-bubble" style={{ fontSize: '1.2rem', marginBottom: '1.2rem', background: '#FFF' }}>
            "As I said Cha Cha never fail, I am very brilliant, ask me for help!"
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-comic btn-red" onClick={openChat}>
              💬 ASK CHA CHA FOR HELP NOW!
            </button>
            <button className="btn-comic btn-yellow" onClick={resetGame}>
              🔄 PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {!gameResult && (
        <div className="game-controls">
          <button className="btn-comic btn-yellow" onClick={resetGame}>
            🔄 REMATCH
          </button>
        </div>
      )}
    </div>
  );
};

export default BrainGame;
