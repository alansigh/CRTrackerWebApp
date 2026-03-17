import React, { useState, useEffect } from 'react';

const TelemetryTypewriter = () => {
  const messages = [
    "> DEPLOY: Log Bait variants achieving 54% WR...",
    "> DETECT: Hog Rider usage spiking in Arena 15...",
    "> SYNC: Royal Giant evolution data normalized.",
    "> ANALYZE: Defensive cycle decks optimal for current meta."
  ];

  const [text, setText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const currentMsg = messages[msgIndex];

    if (isTyping) {
      if (text.length < currentMsg.length) {
        timeout = setTimeout(() => {
          setText(currentMsg.slice(0, text.length + 1));
        }, Math.random() * 50 + 30); // Random typing speed
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000); // Wait before clearing
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 20); // Fast clear
      } else {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isTyping, msgIndex]);

  return (
    <div className="w-full bg-[#0a0a0f] border border-champagne/20 rounded-xl p-4 shadow-skeuo-inset h-40 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 border-b border-slate/30 pb-2">
        <span className="font-mono text-[10px] text-champagne flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse shadow-glow-champagne" />
          LIVE TELEMETRY
        </span>
        <span className="font-mono text-[10px] text-slate-500">SYS_H9</span>
      </div>
      <div className="font-mono text-sm text-green-400 flex-1 leading-relaxed">
        {text}
        <span className="inline-block w-2 h-4 bg-champagne animate-pulse ml-1 align-middle" />
      </div>
    </div>
  );
};

export default TelemetryTypewriter;
