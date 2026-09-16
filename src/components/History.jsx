import React from 'react';

const panels = [
  {
    num: '01',
    caption: 'The Origin',
    title: 'An Ordinary Boy',
    text: 'Born into a humble village, Ruuki was an ordinary young man — kind, soft-spoken, and deeply caring. But fate had other plans for him.',
    bg: '#fff8dc',
  },
  {
    num: '02',
    caption: 'The Awakening',
    title: 'The Third Eye Opens',
    text: 'During a meditation retreat, a bolt of cosmic energy struck him. When he opened his eyes, a glowing third eye had appeared on his forehead, granting him the power to see truth.',
    bg: '#e8f4fd',
  },
  {
    num: '03',
    caption: 'The Dark Times',
    title: 'The Drug Demon',
    text: 'He witnessed his city\'s youth falling prey to a sinister shadow — addiction. The "Drug Demon" corrupted minds and destroyed families. Ruuki knew he had to act.',
    bg: '#fde8e8',
  },
  {
    num: '04',
    caption: 'The Mission Begins',
    title: 'Rise of the Guardian',
    text: 'Using his Third Eye to see through deception and his healing aura to mend broken spirits, Ruuki declared war on addiction and vowed to build stronger character in every soul he met.',
    bg: '#e8fde8',
  },
];

const History = () => {
  return (
    <section className="history-section" id="history">
      <div className="section-header">
        <h2 data-text="THE CHA CHA CHRONICLES">THE CHA CHA CHRONICLES</h2>
        <p className="section-tagline">📖 The story of how an ordinary man became an extraordinary guardian</p>
      </div>

      <div className="comic-strip">
        {panels.map((panel) => (
          <div className="strip-panel" key={panel.num} style={{ background: panel.bg }}>
            <span className="strip-panel-num">{panel.num}</span>
            <img
              src="/ruuki_hero.png"
              alt={panel.title}
              className="strip-panel-img"
            />
            <div className="strip-panel-text">
              <span className="strip-panel-caption">{panel.caption}</span>
              <h3 className="strip-panel-title">{panel.title}</h3>
              <p>{panel.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default History;
