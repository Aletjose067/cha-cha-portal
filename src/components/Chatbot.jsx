import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { playChimeSound } from '../utils/audio';

const SECRET_PHRASE = 'wastgona huyeee';

const Chatbot = ({ isOpen, setIsOpen, setIsSpeaking }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(0); // 0=waiting phrase, 1=name, 2=age, 3=issue, 4=done
  const [userData, setUserData] = useState({ name: '', age: '', issue: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          sender: 'chacha',
          text: "🌟 Greetings! I am CHA CHA, Guardian with the Third Eye!\n\nType 'Wastgona huyeee' to seek help of Cha Cha 👁️"
        }]);
      }, 500);
    }
  }, [isOpen]);

  // Trigger speaking animation & chime SFX when CHA CHA sends a message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'chacha') {
      playChimeSound();
      if (setIsSpeaking) {
        setIsSpeaking(true);
        const t = setTimeout(() => setIsSpeaking(false), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [messages, setIsSpeaking]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (msgs) => setMessages(prev => [...prev, ...msgs]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    addMsg([{ sender: 'user', text }]);
    setTimeout(() => processStep(text), 800);
  };

  const processStep = async (text) => {
    if (!unlocked) {
      // Waiting for secret phrase
      if (text.toLowerCase() === SECRET_PHRASE) {
        setUnlocked(true);
        setStep(1);
        addMsg([{ sender: 'chacha', text: "🔓 Ah, you know the words! My Third Eye sees you need help.\n\nFirst, tell me your NAME, brave soul!" }]);
      } else {
        addMsg([{ sender: 'chacha', text: "❌ Hmm... those aren't the right words.\n\nType 'Wastgona huyeee' to seek my help! 👁️" }]);
      }
      return;
    }

    switch (step) {
      case 1: // Name
        setUserData(prev => ({ ...prev, name: text }));
        setStep(2);
        addMsg([{ sender: 'chacha', text: `Nice to meet you, ${text}! 💪\n\nHow old are you?` }]);
        break;
      case 2: // Age
        setUserData(prev => ({ ...prev, age: text }));
        setStep(3);
        addMsg([{ sender: 'chacha', text: `Got it! My Third Eye is wide open for you.\n\nWhat is your ISSUE? Tell me everything — I am here to listen! 👁️` }]);
        break;
      case 3: // Issue — submit
        setUserData(prev => ({ ...prev, issue: text }));
        setStep(4);
        addMsg([{ sender: 'chacha', text: `💬 I understand deeply. Channeling my energy...` }]);
        await submitForm({ ...userData, issue: text });
        break;
      default:
        addMsg([{ sender: 'chacha', text: `My Third Eye continues to watch over you. Stay strong! 💪` }]);
    }
  };

  const submitForm = async (data) => {
    setIsSubmitting(true);
    const accessKey = 'd86b5f25-41d0-49c8-9089-1579de8c2832';
    try {
      if (accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `CHA CHA Help Request from ${data.name}`,
            from_name: 'Cha Cha Portal',
            name: data.name,
            age: data.age,
            issue: data.issue,
          })
        });
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
    addMsg([{
      sender: 'chacha',
      text: `✅ Message received, ${data.name}!\n\n🦸 Don't worry — CHA CHA is on my way! 💥`
    }]);
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-hero-info">
              <img src="/ruuki_hero.png" alt="Cha Cha Avatar" className="chatbot-avatar" />
              <div>
                <h3 className="chatbot-name">CHA CHA</h3>
                <span className="chatbot-status">⚡ Awakened</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === 'chacha' ? 'ruuki' : 'user'}`} style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            {isSubmitting && (
              <div className="message ruuki">💭 ...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <form onSubmit={handleSend} className="chatbot-form">
              <input
                type="text"
                className="chatbot-input"
                placeholder={step === 0 ? "Type the secret phrase..." : "Your answer..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={step >= 4 || isSubmitting}
              />
              <button type="submit" className="chatbot-submit" disabled={!inputValue.trim() || step >= 4 || isSubmitting}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
