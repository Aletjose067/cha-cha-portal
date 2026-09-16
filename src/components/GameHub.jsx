import React, { useState } from 'react';
import FlappySection from './FlappyGame';
import RunnerGame from './RunnerGame';
import HillGame from './HillGame';
import TwoPlayerGame from './TwoPlayerGame';
import BrainGame from './BrainGame';

const GAMES = [
  { id: 'flappy', label: '🐦 Flappy Cha Cha', desc: 'Click to flap! Dodge Drug Demon pipes!' },
  { id: 'runner', label: '🏃 Cha Cha Race', desc: 'Endless runner in the city — jump over obstacles!' },
  { id: 'hill', label: '🚗 Cha Climb', desc: 'Drive Cha Cha\'s jeep over mountains — don\'t run out of fuel!' },
  { id: 'brawl', label: '🥊 Cha Cha Fight', desc: '2 Players fight! P1 vs P2 — who wins the arena?' },
  { id: 'brain', label: '🧠 Cha Cha vs Human', desc: 'Brain Testing Game — Test your mind against Cha Cha\'s Third Eye!' },
];

const GameHub = ({ openChat }) => {
  const [activeGame, setActiveGame] = useState('flappy');

  return (
    <section className="game-section" id="game">
      <div className="section-header">
        <h2 data-text="GAME ZONE!">🎮 GAME ZONE! 🎮</h2>
        <p className="section-tagline">Play as Cha Cha in 5 awesome mini-games!</p>
      </div>

      {/* Game selector tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={`btn-comic ${activeGame === g.id ? 'btn-red' : 'btn-yellow'}`}
            style={{ fontSize: '1.05rem', padding: '8px 18px' }}
            onClick={() => setActiveGame(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Game description */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div className="speech-bubble" style={{ display: 'inline-block', fontSize: '1rem' }}>
          💬 {GAMES.find((g) => g.id === activeGame)?.desc}
        </div>
      </div>

      {/* Game panels */}
      {activeGame === 'flappy' && <FlappySection />}
      {activeGame === 'runner' && <RunnerGame />}
      {activeGame === 'hill' && <HillGame />}
      {activeGame === 'brawl' && <TwoPlayerGame />}
      {activeGame === 'brain' && <BrainGame openChat={openChat} />}
    </section>
  );
};

export default GameHub;
