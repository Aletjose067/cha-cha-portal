import React from 'react';

const powers = [
  { icon: '👁️', name: 'Third Eye Vision', desc: 'Sees through lies and deception instantly' },
  { icon: '✨', name: 'Healing Aura', desc: 'Calms addiction cravings with his presence' },
  { icon: '🧠', name: 'Mind Shield', desc: 'Protects the vulnerable from mental manipulation' },
  { icon: '💪', name: 'Will Forger', desc: 'Builds iron willpower in those who seek help' },
];

const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">
        <div className="about-image-wrap animate-slide-up">
          <span className="sticker">WHO IS HE?</span>
          <img src="/ruuki_strong.png" alt="Ruuki strong and happy" />
        </div>

        <div className="about-content animate-slide-up delay-200">
          <h2>ABOUT CHA CHA</h2>

          <div className="about-speech">
            "I am not a god, I am not a saint. I am just a man who sees clearly — and what I see is that every person lost to addiction still has a light inside them waiting to shine."
            <strong> – CHA CHA</strong>
          </div>

          <div className="about-powers">
            {powers.map((p) => (
              <div className="power-card" key={p.name}>
                <span className="power-icon">{p.icon}</span>
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
