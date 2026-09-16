import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { playLaserSound } from '../utils/audio';

const Hero = ({ openChat, isSpeaking }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorScreenPos, setCursorScreenPos] = useState({ x: 0, y: 0 });
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isJumpedOut, setIsJumpedOut] = useState(false);

  const heroPanelRef = useRef(null);
  const thirdEyePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isJumpedOut) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setMousePos({ x, y });
      setCursorScreenPos({ x: e.clientX, y: e.clientY });

      // Calculate position of third eye relative to window
      if (heroPanelRef.current) {
        const rect = heroPanelRef.current.getBoundingClientRect();
        // Approximating Third Eye near top center of character image
        thirdEyePosRef.current = {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.28,
        };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isJumpedOut]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowGreeting(true);
      setTimeout(() => setShowGreeting(false), 3000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = () => {
    setIsLaserActive(true);
    playLaserSound();
  };

  const handleMouseLeave = () => {
    setIsLaserActive(false);
  };

  const eyePos = thirdEyePosRef.current;

  return (
    <>
      <section className="hero-section" id="home">
        {/* Left content panel */}
        <div className="hero-content-panel animate-slide-up">
          <div className="wow-stamp">
            <span>★ NO.</span>
            <span style={{ fontSize: '1.5rem' }}>1</span>
          </div>
          <span className="hero-issue animate-slide-up delay-100">Issue #001 — Origin</span>
          <h1 className="hero-title animate-slide-up delay-200">
            CHA CHA
            <span>THE THIRD EYE</span>
          </h1>
          <p className="hero-subtitle animate-slide-up delay-300">
            Guardian of the Lost!
          </p>
          <p className="hero-desc animate-slide-up delay-400">
            A simple man, bestowed with an extraordinary gift — a mystical <strong>Third Eye</strong> that sees beyond lies, into the heart of one's struggle. His sworn mission: pull the youth and adults away from the jaws of drug addiction and forge stronger character within them.
          </p>
          <div className="hero-actions animate-slide-up delay-500">
            <button className="btn-comic btn-red" onClick={openChat}>
              <Shield size={20} />
              SEEK CHA CHA'S HELP
            </button>
            <a href="#history" className="btn-comic btn-purple">
              READ HIS STORY
            </a>
          </div>
        </div>

        {/* Right image panel */}
        <div
          ref={heroPanelRef}
          className="hero-image-panel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsJumpedOut(!isJumpedOut)}
          style={isJumpedOut ? {} : {
            transform: `perspective(800px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`
          }}
        >
          <div className="panel-bg-lines" />
          {showGreeting && !isJumpedOut && (
            <div className="greeting-bubble">✋ Hai!</div>
          )}
          <img
            src="/ruuki_hero.png"
            alt="Ruuki, guardian with the third eye"
            className={`hero-image animate-float ${isSpeaking ? 'is-speaking' : ''}`}
          />
        </div>
      </section>

      {/* Third Eye Laser Beam Overlay */}
      {isLaserActive && !isJumpedOut && (
        <svg
          className="third-eye-laser-svg"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 95,
          }}
        >
          <defs>
            <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4CC" stopOpacity="1" />
              <stop offset="50%" stopColor="#FFE033" stopOpacity="1" />
              <stop offset="100%" stopColor="#E8212A" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Core Beam */}
          <line
            x1={eyePos.x}
            y1={eyePos.y}
            x2={cursorScreenPos.x}
            y2={cursorScreenPos.y}
            stroke="url(#laserGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#laserGlow)"
          />

          {/* Outer Energy Pulse */}
          <line
            x1={eyePos.x}
            y1={eyePos.y}
            x2={cursorScreenPos.x}
            y2={cursorScreenPos.y}
            stroke="#00C4CC"
            strokeWidth="10"
            strokeOpacity="0.4"
            strokeDasharray="12 6"
            filter="url(#laserGlow)"
          />

          {/* Eye Energy Center Glow */}
          <circle cx={eyePos.x} cy={eyePos.y} r="12" fill="#00C4CC" filter="url(#laserGlow)" />
          <circle cx={eyePos.x} cy={eyePos.y} r="6" fill="#FFF" />

          {/* Target Impact Ring */}
          <circle cx={cursorScreenPos.x} cy={cursorScreenPos.y} r="16" fill="none" stroke="#FFE033" strokeWidth="3" filter="url(#laserGlow)" />
          <circle cx={cursorScreenPos.x} cy={cursorScreenPos.y} r="4" fill="#E8212A" />
        </svg>
      )}

      {/* Jump-out overlay */}
      {isJumpedOut && (
        <div className="jumped-out-overlay" onClick={() => setIsJumpedOut(false)}>
          <div className="boom-text">💥 BOOM! 💥</div>
          <img src="/ruuki_strong.png" alt="Ruuki strong pose" className="jumped-img" />
        </div>
      )}
    </>
  );
};

export default Hero;
