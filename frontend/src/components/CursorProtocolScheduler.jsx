import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CursorProtocolScheduler = () => {
  const cursorRef = useRef(null);
  const saveBtnRef = useRef(null);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      // Select a random day to click
      const targetIndex = 2; // Fixed to Tuesday for predictable animation, or use Math.floor(Math.random()*7)
      const targetDay = dayRefs.current[targetIndex];
      
      // Move to day
      tl.to(cursorRef.current, {
        x: targetDay.offsetLeft + 10,
        y: targetDay.offsetTop + 10,
        duration: 1,
        ease: "power2.inOut"
      });

      // Click down
      tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 });
      
      // Highlight day
      tl.to(targetDay, { 
        backgroundColor: '#C9A84C', 
        color: '#0D0D12',
        boxShadow: '0 0 10px rgba(201, 168, 76, 0.5)',
        duration: 0.2 
      }, "<");

      // Click up
      tl.to(cursorRef.current, { scale: 1, duration: 0.1 });

      // Move to Save
      tl.to(cursorRef.current, {
        x: saveBtnRef.current.offsetLeft + 20,
        y: saveBtnRef.current.offsetTop + 10,
        duration: 0.8,
        ease: "power2.inOut"
      }, "+=0.3");

      // Click save
      tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 });
      tl.to(saveBtnRef.current, { scale: 0.95, duration: 0.1 }, "<");
      tl.to(cursorRef.current, { scale: 1, duration: 0.1 });
      tl.to(saveBtnRef.current, { scale: 1, duration: 0.1 }, "<");

      // Reset day highlight for next loop
      tl.to(targetDay, {
        backgroundColor: 'transparent',
        color: '#e6edf3', // ivory
        boxShadow: 'none',
        duration: 0.5
      }, "+=0.5");

      // Move cursor offscreen right before loop restarts
      tl.to(cursorRef.current, { x: 200, y: 150, duration: 0.8, opacity: 0 });
      tl.set(cursorRef.current, { x: -50, y: 150, opacity: 1 });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full h-40 bg-[#0a0a0f] border border-slate-light p-4 rounded-xl shadow-skeuo-inset flex flex-col justify-between overflow-hidden">
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div 
            key={i} 
            ref={el => dayRefs.current[i] = el}
            className="w-full aspect-square border border-slate/30 rounded flex items-center justify-center font-mono text-[10px] transition-colors"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="font-mono text-[10px] text-slate-500">AUTO-SYNC</div>
        <button 
          ref={saveBtnRef}
          className="text-[10px] font-mono bg-slate/20 border border-slate/50 px-3 py-1 rounded"
        >
          SAVE
        </button>
      </div>

      {/* SVG Cursor */}
      <svg 
        ref={cursorRef}
        className="absolute top-0 left-0 w-6 h-6 text-ivory z-10" 
        viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="1"
        style={{ transform: 'translate(-50px, 150px)' }}
      >
        <path d="M4 2l6.86 19.34L14 14l7.34-3.14L4 2z" />
      </svg>
    </div>
  );
};

export default CursorProtocolScheduler;
