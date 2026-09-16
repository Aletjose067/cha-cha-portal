import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import History from './components/History';
import About from './components/About';
import GameHub from './components/GameHub';
import Chatbot from './components/Chatbot';
import ComicVFX from './components/ComicVFX';
import { toggleMute, getMuteState, playZapSound } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';
import './styles/App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(getMuteState());

  useEffect(() => {
    const timer = setTimeout(() => setIsChatOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAudioToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) {
      playZapSound();
    }
  };

  return (
    <div className="app-wrapper">
      {/* Dynamic Comic Particle & Click Burst VFX */}
      <ComicVFX />

      {/* Sticky Comic Navbar */}
      <nav className="navbar">
        <div className="logo">⚡ CHA CHA</div>
        <ul className="nav-links">
          <li><a href="#home">HOME</a></li>
          <li><a href="#history">STORY</a></li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#game">GAMES</a></li>
          <li>
            <button
              onClick={handleAudioToggle}
              className="sound-toggle-btn"
              title="Toggle Comic SFX"
            >
              {muted ? (
                <>
                  <VolumeX size={18} color="#E8212A" />
                  <span>SFX OFF</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} color="#2ECC40" />
                  <span>SFX ON</span>
                </>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Page Sections */}
      <Hero openChat={() => setIsChatOpen(true)} isSpeaking={isSpeaking} />
      <History />
      <About />
      <GameHub openChat={() => setIsChatOpen(true)} />

      {/* Footer */}
      <footer className="comic-footer">
        ★ <span>CHA CHA</span> — THE THIRD EYE OF HOPE ★ &nbsp;|&nbsp; Fighting Drug Addiction, One Soul at a Time
      </footer>

      {/* Chatbot */}
      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} setIsSpeaking={setIsSpeaking} />
    </div>
  );
}

export default App;
