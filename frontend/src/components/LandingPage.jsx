import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import DiagnosticShuffler from './DiagnosticShuffler';
import TelemetryTypewriter from './TelemetryTypewriter';
import CursorProtocolScheduler from './CursorProtocolScheduler';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onLaunchApp }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo('.hero-text', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
      
      // Feature Cards Entrance
      gsap.fromTo('.feature-card',
        { y: 60, opacity: 0 },
        { 
          y: 0, opacity: 1, 
          duration: 1, stagger: 0.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 80%',
          }
        }
      );

      // Philosophy Reveal
      const philosophyTexts = gsap.utils.toArray('.philo-text');
      philosophyTexts.forEach((text) => {
        gsap.fromTo(text,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, y: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 85%'
            }
          }
        );
      });

      // Protocol Sticky Stacking Archive
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card, index) => {
        if (index < cards.length - 1) { // Apply to all but the last card
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.5,
            filter: 'blur(10px)',
            scrollTrigger: {
              trigger: cards[index + 1],
              start: 'top 50%',
              end: 'top top',
              scrub: true,
            }
          });
        }
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen text-ivory selection:bg-champagne selection:text-obsidian pb-24">
      
      {/* Floating Island Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 transition-all duration-500 rounded-full border border-slate-light/30 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 py-4 shadow-skeuo-outset">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-champagne animate-pulse text-glow-champagne"></div>
          <span className="font-sans font-bold tracking-tight text-lg text-ivory crt-text-drift">CRTRACKER</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-sm text-slate-400">
          <a href="#features" className="hover:text-champagne transition-colors">FEATURES</a>
          <a href="#protocol" className="hover:text-champagne transition-colors">PROTOCOL</a>
        </div>

        <button 
          onClick={onLaunchApp}
          className="relative overflow-hidden group rounded-full border border-champagne/40 bg-obsidian px-6 py-2 shadow-skeuo-button hover:shadow-skeuo-button-pressed transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2 font-mono text-sm tracking-widest text-champagne group-hover:text-white transition-colors">
            ENTER <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-champagne transition-transform duration-500 ease-in-out" />
        </button>
      </nav>

      {/* Hero Section - The Opening Shot */}
      <section className="relative h-screen flex flex-col justify-end pb-32 px-6 md:px-24 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <h1 className="hero-text text-5xl md:text-7xl font-sans font-bold tracking-tighter leading-none mb-4">
            Clash Royale Tracker <span className="text-slate-400">meets</span>
          </h1>
          <h2 className="hero-text text-6xl md:text-9xl font-drama italic text-champagne text-glow-champagne leading-none mb-12">
            Strategic Mastery.
          </h2>
          <p className="hero-text text-xl md:text-2xl font-mono text-slate-300 max-w-2xl mb-12">
            A free tactical instrument to examine your raw data, uncover meta-relevant decks, and dominate the arena.
          </p>
          
          <div className="hero-text flex flex-wrap gap-6 items-center">
            <button 
              onClick={onLaunchApp}
              className="group relative overflow-hidden rounded-[2rem] border-2 border-champagne bg-obsidian px-10 py-5 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)] transition-all duration-500 hover:scale-[1.03]"
            >
              <span className="relative z-10 font-sans font-bold text-lg text-champagne group-hover:text-obsidian transition-colors flex items-center gap-3">
                INITIALIZE APP <ChevronRight size={20} />
              </span>
              <div className="absolute inset-0 bg-champagne scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </button>
            <div className="font-mono text-xs text-slate-500 flex items-center gap-2">
              <Lock size={12} />
              NO REGISTRATION REQUIRED
            </div>
          </div>
        </div>
      </section>

      {/* Features - Functional Artifacts */}
      <section id="features" className="features-section py-32 px-6 md:px-24 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="feature-card bg-obsidian rounded-[2rem] border border-slate-light flex flex-col shadow-skeuo-outset group hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
            <div className="p-8 pb-4 flex-1">
              <div className="w-12 h-12 rounded-full border border-champagne/30 flex items-center justify-center mb-6 shadow-skeuo-inset bg-obsidian text-champagne">
                <Target size={20} />
              </div>
              <h3 className="font-sans font-bold text-2xl mb-4 text-ivory">Granular Statistics</h3>
              <p className="font-mono text-sm text-slate-400 leading-relaxed">
                Diagnostic shuffling of your combat history. Analyze win rates, trophy trajectories, and battle logs in real-time.
              </p>
            </div>
            <div className="p-4 bg-obsidian/50 border-t border-slate-light/50">
              <DiagnosticShuffler />
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card bg-obsidian rounded-[2rem] border border-slate-light flex flex-col shadow-skeuo-outset group hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
            <div className="p-8 pb-4 flex-1">
              <div className="w-12 h-12 rounded-full border border-champagne/30 flex items-center justify-center mb-6 shadow-skeuo-inset bg-obsidian text-champagne">
                <Zap size={20} />
              </div>
              <h3 className="font-sans font-bold text-2xl mb-4 text-ivory">Meta Telemetry</h3>
              <p className="font-mono text-sm text-slate-400 leading-relaxed">
                Live feed of the most potent deck configurations. Typewriter-fast updates on what's winning in the current metagame.
              </p>
            </div>
            <div className="p-4 bg-obsidian/50 border-t border-slate-light/50">
              <TelemetryTypewriter />
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card bg-obsidian rounded-[2rem] border border-slate-light flex flex-col shadow-skeuo-outset group hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
            <div className="p-8 pb-4 flex-1">
              <div className="w-12 h-12 rounded-full border border-champagne/30 flex items-center justify-center mb-6 shadow-skeuo-inset bg-obsidian text-champagne">
                <Lock size={20} />
              </div>
              <h3 className="font-sans font-bold text-2xl mb-4 text-ivory">Open Access</h3>
              <p className="font-mono text-sm text-slate-400 leading-relaxed">
                Instant cursor-protocol initialization. No logins, no paywalls. Just pure data access to the Clash API.
              </p>
            </div>
            <div className="p-4 bg-obsidian/50 border-t border-slate-light/50">
              <CursorProtocolScheduler />
            </div>
          </div>
          
        </div>
      </section>

      {/* Philosophy - The Manifesto */}
      <section className="py-32 bg-obsidian border-y border-champagne/10 relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-champagne/20 via-obsidian to-obsidian pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 md:px-24 flex flex-col justify-center min-h-[50vh] relative z-10">
          <p className="philo-text font-mono text-lg text-slate-400 mb-8 max-w-2xl border-l-2 border-slate-700 pl-6">
            Most trackers focus on: overwhelming spreadsheets and generic stat displays that feel more like accounting than strategic gaming.
          </p>
          <h2 className="philo-text font-drama italic text-4xl md:text-7xl leading-tight">
            We focus on: delivering a <span className="text-champagne font-sans font-bold not-italic tracking-tighter shadow-glow-champagne">precise tactical advantage</span> through an immersive instrument.
          </h2>
        </div>
      </section>

      {/* Protocol - Sticky Stacking Archive */}
      <section id="protocol" className="relative z-10 bg-obsidian pb-32">
        <div className="max-w-4xl mx-auto pt-32 px-6">
          <div className="font-mono text-sm tracking-widest text-champagne mb-16 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-champagne/50" />
            INITIALIZATION PROTOCOL
          </div>

          {[
            { step: "01", title: "API Handshake", desc: "Instantly connect to Supercell's data streams via pure REST architecture. No intermediaries." },
            { step: "02", title: "Data Parsing", desc: "Filter millions of raw telemetry events into actionable, combat-ready dashboard modules." },
            { step: "03", title: "Strategic Output", desc: "Deploy meta-aligned decks equipped directly from leaderboard analytics directly to your device." },
          ].map((item, index) => (
            <div 
              key={index}
              className="protocol-card sticky top-24 w-full min-h-[40vh] bg-[#12121A] border border-champagne/20 rounded-[3rem] p-12 md:p-20 shadow-skeuo-outset flex flex-col justify-center mb-12 origin-top"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between z-10">
                <div className="max-w-xl">
                  <span className="font-mono text-champagne text-glow-champagne text-2xl mb-4 block">STEP_{item.step} //</span>
                  <h3 className="font-sans font-bold text-4xl md:text-6xl text-ivory mb-6 tracking-tight">{item.title}</h3>
                  <p className="font-mono text-lg text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                
                {/* Abstract Data Visualizer */}
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-dashed border-champagne/30 flex items-center justify-center animate-spin-slow shadow-skeuo-inset bg-obsidian relative">
                   <div className="absolute inset-2 border border-slate/50 rounded-full animate-reverse-spin-slow"></div>
                   <div className="w-12 h-12 bg-champagne rounded-full shadow-glow-champagne animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-40 px-6 max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        <h2 className="font-drama italic text-5xl md:text-8xl text-ivory mb-8">
          Ready to <span className="text-champagne font-sans font-bold tracking-tighter not-italic text-glow-champagne">execute?</span>
        </h2>
        <p className="font-mono text-slate-400 mb-12 max-w-xl text-lg">
          Disengage from marketing pages. Initialize the terminal and access the Clash Royale tracking suite.
        </p>
        <button 
          onClick={onLaunchApp}
          className="group relative overflow-hidden rounded-full border border-champagne/50 bg-[#c9a84c] text-obsidian px-12 py-6 shadow-[0_0_40px_rgba(201,168,76,0.5)] hover:shadow-[0_0_60px_rgba(201,168,76,0.8)] transition-all duration-500 hover:scale-[1.05]"
        >
          <span className="relative z-10 font-sans font-bold tracking-widest flex items-center gap-3">
            LAUNCH APP SEQUENCE <Zap fill="currentColor" size={20} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
        </button>
      </section>

      {/* Footer / System Status */}
      <footer className="fixed bottom-6 left-0 w-full px-6 md:px-24 flex justify-between items-end pointer-events-none z-40">
        <div className="font-mono text-xs text-slate-500 backdrop-blur-md px-3 py-1 rounded-full border border-slate-light/30">
          SYS.V.1.0 // {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-champagne bg-obsidian/80 px-4 py-2 rounded-full border border-champagne/20 shadow-glow-champagne">
          <div className="w-2 h-2 rounded-full bg-champagne animate-ping" />
          SYSTEM OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
