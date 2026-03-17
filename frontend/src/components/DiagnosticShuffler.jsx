import React, { useState, useEffect } from 'react';

const DiagnosticShuffler = () => {
  const initialCards = [
    { id: 1, label: "WIN RATE YIELD", value: "68.4%", color: "text-champagne" },
    { id: 2, label: "TROPHY VELOCITY", value: "+142/HR", color: "text-green-400" },
    { id: 3, label: "META ALIGNMENT", value: "92.1%", color: "text-blue-400" }
  ];

  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newArr = [...prev];
        const last = newArr.pop();
        newArr.unshift(last);
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-40 w-full flex items-center justify-center perspective-[1000px]">
      {cards.map((card, index) => {
        // Calculate stacking positions
        const isTop = index === 0;
        const isMiddle = index === 1;
        
        let yOffset = isTop ? 0 : isMiddle ? 15 : 30;
        let scale = isTop ? 1 : isMiddle ? 0.9 : 0.8;
        let opacity = isTop ? 1 : isMiddle ? 0.6 : 0.3;
        let zIndex = 10 - index;

        return (
          <div 
            key={card.id}
            className="absolute w-full bg-slate-light border border-slate/50 p-4 rounded-xl shadow-skeuo-outset flex flex-col items-center justify-center transition-all duration-[800ms] backdrop-blur-md"
            style={{
              transform: `translateY(${yOffset}px) scale(${scale})`,
              opacity: opacity,
              zIndex: zIndex,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <span className="font-mono text-[10px] text-slate-400 mb-1">{card.label}</span>
            <span className={`font-mono text-xl font-bold ${card.color}`}>{card.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DiagnosticShuffler;
