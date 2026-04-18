/**
 * Onboarding/index.jsx
 * File: src/pages/onboarding/index.jsx
 *
 * Full-screen 3-slide onboarding with smooth transitions.
 * Migrated to Tailwind CSS for a spacious, beautiful, and responsive UI.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 0,
    badge: 'Project Management',
    title: 'Everything your\nteam needs,\nin one place.',
    description:
      'Karmayog brings tasks, sprints, departments, and deadlines together — so your team can focus on work that actually matters.',
    illustration: (
      <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[400px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {/* Background cards */}
        <rect x="20" y="60" width="140" height="90" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <rect x="180" y="40" width="140" height="70" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <rect x="60" y="170" width="220" height="70" rx="14" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
        {/* Card content */}
        <rect x="36" y="80" width="60" height="7" rx="3.5" fill="rgba(255,255,255,0.3)"/>
        <rect x="36" y="96" width="100" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
        <rect x="36" y="110" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.1)"/>
        {/* Progress bar */}
        <rect x="36" y="128" width="108" height="5" rx="2.5" fill="rgba(255,255,255,0.08)"/>
        <rect x="36" y="128" width="72" height="5" rx="2.5" fill="#f59e0b"/>
        <rect x="196" y="58" width="50" height="7" rx="3.5" fill="rgba(255,255,255,0.3)"/>
        <rect x="196" y="74" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
        <rect x="196" y="88" width="70" height="5" rx="2.5" fill="rgba(255,255,255,0.1)"/>
        {/* Big card */}
        <rect x="76" y="185" width="50" height="7" rx="3.5" fill="#f59e0b"/>
        <rect x="76" y="202" width="160" height="5" rx="2.5" fill="rgba(255,255,255,0.2)"/>
        <rect x="76" y="216" width="120" height="5" rx="2.5" fill="rgba(255,255,255,0.12)"/>
        {/* Floating dot badge */}
        <circle cx="300" cy="160" r="28" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5"/>
        <text x="300" y="164" textAnchor="middle" fontSize="18" fill="#f59e0b">✓</text>
        <circle cx="40" cy="170" r="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <text x="40" y="174" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.5)">40</text>
      </svg>
    ),
    accent: '#f59e0b',
  },
  {
    id: 1,
    badge: 'Team Collaboration',
    title: 'Built for teams\nthat move\nfast.',
    description:
      'Assign tasks, track performance by department, and stay on top of every deadline — with real-time updates your whole org can see.',
    illustration: (
      <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[400px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {/* Avatar ring */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const cx = 170 + Math.cos(angle) * 90;
          const cy = 140 + Math.sin(angle) * 90;
          const colors = ['#0d1b3e', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="22" fill={colors[i]} opacity="0.9" />
              <circle cx={cx} cy={cy} r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </g>
          );
        })}
        {/* Center circle */}
        <circle cx="170" cy="140" r="36" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />
        <text x="170" y="135" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)" fontWeight="600">TEAM</text>
        <text x="170" y="150" textAnchor="middle" fontSize="14" fill="#f59e0b" fontWeight="800">49</text>
        {/* Connecting lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1="170" y1="140" x2={170 + Math.cos(angle) * 68} y2={140 + Math.sin(angle) * 68} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />;
        })}
      </svg>
    ),
    accent: '#10b981',
  },
  {
    id: 2,
    badge: 'Analytics & Insights',
    title: 'Know exactly\nwhere things\nstand.',
    description:
      'From sprint velocity to department scores — Karmayog gives you the visibility to make decisions confidently and move your org forward.',
    illustration: (
      <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[400px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {/* Bar chart */}
        {[
          { x: 50, h: 80, color: '#6366f1' },
          { x: 100, h: 120, color: '#f59e0b' },
          { x: 150, h: 60, color: '#6366f1' },
          { x: 200, h: 150, color: '#f59e0b' },
          { x: 250, h: 100, color: '#6366f1' },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={220 - b.h} width="30" height={b.h} rx="6" fill={b.color} opacity="0.7" />
            <rect x={b.x} y={220 - b.h} width="30" height="4" rx="2" fill={b.color} />
          </g>
        ))}
        {/* Baseline */}
        <line x1="30" y1="222" x2="300" y2="222" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Trend line */}
        <polyline points="65,170 115,108 165,178 215,92 265,138" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {[{ x: 65, y: 170 }, { x: 115, y: 108 }, { x: 165, y: 178 }, { x: 215, y: 92 }, { x: 265, y: 138 }].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        ))}
        {/* Stat badge */}
        <rect x="200" y="50" width="90" height="38" rx="10" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
        <text x="245" y="67" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">Completion</text>
        <text x="245" y="82" textAnchor="middle" fontSize="13" fill="#f59e0b" fontWeight="800">87%</text>
      </svg>
    ),
    accent: '#6366f1',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState('in');
  const [key, setKey] = useState(0);

  const goTo = (idx) => {
    if (idx === current) return;
    setAnimDir(idx > current ? 'next' : 'prev');
    setKey((k) => k + 1);
    setCurrent(idx);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) goTo(current + 1);
    else navigate('/login');
  };

  const handleSkip = () => navigate('/login');

  const slide = SLIDES[current];

  return (
    <>
      {/* Required Fonts and Custom Animation Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        
        .anim-slide-next { animation: slideInRight 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) both; }
        .anim-slide-prev { animation: slideInLeft 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) both; }
        .anim-fade-next { animation: fadeUp 0.5s ease 0.1s both; }
        .anim-fade-prev { animation: fadeUpRight 0.5s ease 0.1s both; }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpRight {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="font-['DM_Sans',sans-serif] min-h-screen bg-[#060d1f] text-white flex flex-col relative overflow-hidden">
        
        {/* Background Gradients & Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />
        <div className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 md:px-12 md:py-8 relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-['Sora'] font-black text-lg text-white shadow-[0_4px_14px_rgba(245,158,11,0.35)]">
              K
            </span>
            <span className="font-['Sora'] font-bold text-xl text-white tracking-tight">
              Karmayog
            </span>
          </div>
          <button 
            onClick={handleSkip}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white/90 transition-all duration-200"
          >
            Skip
          </button>
        </div>

        {/* Main Body (Slide Area) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 w-full max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 lg:gap-32 w-full">
            
            {/* Illustration */}
            <div 
              key={`ill-${key}`} 
              className={`relative w-full max-w-[320px] md:max-w-[450px] lg:max-w-[500px] ${animDir === 'prev' ? 'anim-slide-prev' : 'anim-slide-next'}`}
            >
              <div 
                className="absolute inset-[-40px] rounded-full pointer-events-none transition-colors duration-500" 
                style={{ background: `radial-gradient(circle at 50% 50%, ${slide.accent}25, transparent 65%)` }} 
              />
              {slide.illustration}
            </div>

            {/* Text Content */}
            <div 
              key={`txt-${key}`} 
              className={`flex flex-col items-center md:items-start text-center md:text-left max-w-[500px] ${animDir === 'prev' ? 'anim-fade-prev' : 'anim-fade-next'}`}
            >
              <span 
                className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border mb-6 transition-colors duration-500"
                style={{ color: slide.accent, borderColor: `${slide.accent}40`, backgroundColor: `${slide.accent}15` }}
              >
                {slide.badge}
              </span>
              
              <h1 className="font-['Sora'] text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-white mb-6">
                {slide.title.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              
              <p className="text-base md:text-lg leading-relaxed text-white/50 font-normal mb-10">
                {slide.description}
              </p>

              {/* Controls (Dots + Button) */}
              <div className="flex items-center justify-between w-full">
                
                {/* Dots */}
                <div className="flex items-center gap-2">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 shadow-[0_0_12px_currentColor]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                      style={i === current ? { backgroundColor: slide.accent, color: slide.accent } : {}}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button 
                  onClick={handleNext}
                  className="group flex items-center gap-2 font-['DM_Sans'] text-[15px] font-bold text-white px-7 py-3.5 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)` }}
                >
                  {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                  <span className="text-lg group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Slide Counter (Bottom Right) */}
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-['Sora'] text-sm font-bold text-white/30 z-10 tracking-widest">
          <span style={{ color: slide.accent }} className="transition-colors duration-300">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="mx-1.5">/</span>
          <span>{String(SLIDES.length).padStart(2, '0')}</span>
        </div>

      </div>
    </>
  );
}