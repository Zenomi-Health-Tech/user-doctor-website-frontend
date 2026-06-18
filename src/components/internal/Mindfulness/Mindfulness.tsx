import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Colours ───────────────────────────────────────────────
const BG = '#14152A';
const CARD = '#1E2040';
const GOLD = '#E5A030';
const TEAL = '#43C6AC';

// ─── Data ──────────────────────────────────────────────────
const MICRO_SESSIONS = [
  { label: 'RESET', title: 'Calm Before Exam',     sub: 'Steady the racing thoughts before you walk in.', dur: '2 min', c: ['#3BA8B0','#2D7D82'] },
  { label: 'RESET', title: 'Stop Overthinking',    sub: 'Cut the loop with a gentle attention reset.',   dur: '3 min', c: ['#7B5EA7','#9575CD'] },
  { label: 'RESET', title: 'Reset After Fight',    sub: 'Soften the chest, drop the shoulders, breathe.', dur: '3 min', c: ['#D35F3E','#E57350'] },
  { label: 'RESET', title: 'Sleep in 2 Minutes',  sub: 'A tiny ritual to slide into sleep.',             dur: '2 min', c: ['#2D6A4F','#3D8B67'] },
  { label: 'RESET', title: 'Panic Reset',          sub: 'Ground in 5 senses. You are safe right now.',   dur: '1 min', c: ['#D35F3E','#BF4F30'] },
  { label: 'RESET', title: 'Social Anxiety Reset', sub: 'Walk in with steadier breath and softer eyes.', dur: '2 min', c: ['#3F51B5','#5C7BE0'] },
];
const FEELING_MAP: Record<string, number[]> = {
  Anxious:[0,4], Tired:[3,1], Restless:[0,2], Sad:[1,2], Overwhelmed:[1,4], Foggy:[1,0], Tense:[2,5],
};

const BREATHING = [
  { title:'Box Breathing',          dur:'4 MIN', desc:'Soldier-tested focus and calm. Inhale, hold, exhale, hold.',              rhythm:'4 · 4 · 4 · 4',       phases:[4,4,4,4],   labels:['Inhale','Hold','Exhale','Hold'] },
  { title:'4-7-8 Breathing',        dur:'5 MIN', desc:"Dr. Weil's classic. Falls asleep fast, drops anxiety even faster.",       rhythm:'4 · 7 · 8',            phases:[4,7,8,0],   labels:['Inhale','Hold','Exhale',''] },
  { title:'Physiological Sigh',     dur:'1 MIN', desc:'Stanford-backed instant down-regulator. One minute, real shift.',         rhythm:'2 inhales · long exhale',phases:[2,0,8,0],  labels:['Inhale','Inhale 2','Exhale',''] },
  { title:'Resonance Breathing',    dur:'6 MIN', desc:'Heart and breath sync. Six breaths a minute, deep coherence.',            rhythm:'5.5 · 5.5',            phases:[5,0,5,0],   labels:['Inhale','','Exhale',''] },
  { title:'Deep Belly Breathing',   dur:'5 MIN', desc:'Re-teaches the body to breathe low, full and free.',                      rhythm:'Slow · diaphragmatic',  phases:[5,0,6,0],   labels:['Inhale','','Exhale',''] },
];

const SLEEP_STORIES = [
  { title:'Drift Over the Sea',       dur:'22 min', c:['#1A3A6C','#0D2137'] },
  { title:'The Quiet Cabin',          dur:'28 min', c:['#1A2E4A','#0D1B2A'] },
  { title:'Lantern Walk in Kyoto',    dur:'26 min', c:['#1E1A40','#0F0D25'] },
  { title:'Old Train, Soft Window',   dur:'30 min', c:['#1A2040','#101525'] },
];
const SOUNDSCAPES = [
  { title:'Rain on Window',  sub:'Loops · timer ready', icon:'🌧️', c:['#2A9D8F','#1E6D65'] },
  { title:'Brown Noise',     sub:'Loops · timer ready', icon:'🌊', c:['#8B6057','#5D3F38'] },
  { title:'Calming Music',   sub:'Loops · timer ready', icon:'🎵', c:['#7B5EA7','#5B3F7F'] },
  { title:'Forest at Night', sub:'Loops · timer ready', icon:'🌿', c:['#2D6A4F','#1A4030'] },
];
const WIND_DOWN = [
  { title:'Quiet Your Thoughts',             desc:"Gentle guidance to release the day's mental noise.",       dur:'8 min' },
  { title:'Progressive Muscle Relaxation',  desc:"Head to toe, melt the tension you didn't notice.",         dur:'12 min' },
  { title:'Nighttime Reflection',           desc:'Three soft prompts to close the day with kindness.',        dur:'6 min' },
];

// ─── Breathing Orb ─────────────────────────────────────────
function BreathingOrb({ phases, labels }: { phases: number[]; labels: string[] }) {
  const [phase, setPhase] = useState(0);
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false); setPhase(0); setScale(1); setCountdown(0);
  };

  const start = () => {
    setRunning(true);
    let p = 0; let t = phases[0];
    setPhase(0); setCountdown(phases[0]);
    setScale(p === 0 ? 1.45 : p === 2 ? 0.75 : 1.1);
    timerRef.current = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) {
        p = (p + 1) % 4;
        while (phases[p] === 0) p = (p + 1) % 4;
        t = phases[p];
        setPhase(p);
        setCountdown(t);
        setScale(p === 0 ? 1.45 : p === 2 ? 0.75 : 1.1);
      }
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const phaseLabel = labels[phase] || '';

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Outer glow ring */}
        <div className="absolute rounded-full" style={{
          width: `${scale * 100}%`, height: `${scale * 100}%`,
          background: `radial-gradient(circle, rgba(67,198,172,0.15) 0%, transparent 70%)`,
          transition: `all ${phase === 0 ? phases[0] : phase === 2 ? phases[2] : 0.5}s ease-in-out`,
        }} />
        {/* Main orb */}
        <div className="rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={running ? stop : start}
          style={{
            width: `${scale * 68}%`, height: `${scale * 68}%`,
            background: `radial-gradient(circle at 35% 35%, ${TEAL}, #1A7A8A)`,
            boxShadow: `0 0 ${scale * 40}px rgba(67,198,172,0.5)`,
            transition: `all ${phase === 0 ? phases[0] : phase === 2 ? phases[2] : 0.5}s ease-in-out`,
          }}>
          {running ? (
            <>
              <span className="text-white text-3xl font-bold leading-none">{countdown}</span>
              <span className="text-white text-xs mt-1 opacity-80">{phaseLabel}</span>
            </>
          ) : (
            <span className="text-white text-sm font-semibold">Tap to start</span>
          )}
        </div>
      </div>
      {running && (
        <button onClick={stop} className="mt-4 text-xs px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
          Stop
        </button>
      )}
    </div>
  );
}

// ─── Tab: Today ────────────────────────────────────────────
function TodayTab({ onNavigate }: { onNavigate: (t: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = () => { const h = new Date().getHours(); return h < 12 ? "Good morning — let's start calm" : h < 17 ? 'Good afternoon — take a breath' : "Good evening — let's soften the day"; };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const stars = Array.from({ length: 45 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height * 0.75, r: Math.random() * 1.5 + 0.4, a: Math.random(), d: Math.random() > .5 ? 1 : -1 }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => { s.a += s.d * 0.007; if (s.a >= 1 || s.a <= 0.1) s.d *= -1; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill(); });
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);

  const picks = [
    { tag:'TODAY',   title:'Calm Before Exam',  sub:'3 min · Micro',     emoji:'🧘', tab:1, c:['#4A4080','#2A2050'] },
    { tag:'DAILY',   title:'4-7-8 Breathing',   sub:'5 min · Breathwork', emoji:'🌊', tab:2, c:['#2D5A6B','#1A3A4A'] },
    { tag:'TONIGHT', title:'Drift Over the Sea', sub:'22 min · Sleep',    emoji:'🌙', tab:3, c:['#1A2A4A','#0D1A30'] },
  ];
  const explore = [
    { icon:'✨', title:'Micro Mindfulness',  desc:'60–180 sec resets for exams, panic, overthinking.',   c:['#E8956D','#D4516A'], tab:1 },
    { icon:'💨', title:'Breathing Exercises', desc:'Box, 4-7-8, physiological sigh — guided visually.',  c:[TEAL,'#1A7A8A'],      tab:2 },
    { icon:'🌙', title:'Sleep & Night Calm',  desc:'Sleep stories, soundscapes, quiet-your-thoughts.',   c:['#2D2B55','#0F0E1A'], tab:3, border:true },
  ];

  return (
    <div className="overflow-y-auto" style={{ flex: 1 }}>
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background:'linear-gradient(180deg,#1A1B35 0%,#252250 50%,#1A1B35 100%)', minHeight:280 }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <svg className="absolute bottom-0 w-full pointer-events-none" viewBox="0 0 400 70" preserveAspectRatio="none" style={{height:55}}>
          <path d="M0,70 L0,28 Q60,5 120,25 Q180,-2 220,18 Q280,32 340,10 Q372,-2 400,20 L400,70 Z" fill="#0F1020"/>
        </svg>
        <svg className="absolute pointer-events-none" style={{top:24,right:48,width:50,height:50,animation:'float 4s ease-in-out infinite'}} viewBox="0 0 80 80">
          <defs><mask id="cm"><circle cx="40" cy="40" r="30" fill="white"/><circle cx="57" cy="37" r="24" fill="black"/></mask></defs>
          <circle cx="40" cy="40" r="30" fill="#E8D5A3" mask="url(#cm)"/>
        </svg>
        <div className="relative z-10 px-5 pt-6 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{background:'#252745'}}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"/>
            <span className="text-white text-xs">{g()}</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight" style={{fontFamily:'Georgia,serif'}}>A calmer mind,</h1>
          <h1 className="text-3xl font-bold italic leading-tight mb-3" style={{fontFamily:'Georgia,serif',color:GOLD}}>in just a few breaths.</h1>
          <p className="text-sm leading-relaxed mb-5 max-w-md" style={{color:'rgba(255,255,255,0.6)'}}>Micro mindfulness, guided breathwork and dreamy sleep stories — designed for the way young minds actually live.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>onNavigate(1)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-sm font-semibold" style={{background:GOLD}}>▶ Begin 3-min reset</button>
            <button onClick={()=>onNavigate(2)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm" style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.85)',border:'1px solid rgba(255,255,255,0.25)'}}>Try a breath →</button>
          </div>
        </div>
      </div>

      {/* Handpicked */}
      <div className="px-5 pt-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs font-medium tracking-widest mb-1" style={{color:'rgba(255,255,255,0.4)'}}>FOR YOU · TODAY</p>
            <h2 className="text-lg font-bold text-white">Hand-picked for tonight</h2>
          </div>
          <span className="text-xs hidden sm:block" style={{color:'rgba(255,255,255,0.4)'}}>⏱ 30 min total</span>
        </div>
        <div className="flex gap-3 pb-2 overflow-x-auto lg:grid lg:grid-cols-3 lg:overflow-visible" style={{scrollbarWidth:'none'}}>
          {picks.map((p,i)=>(
            <button key={i} onClick={()=>onNavigate(p.tab)} className="flex-shrink-0 w-44 sm:w-48 lg:w-auto rounded-2xl p-4 text-left hover:opacity-90 transition-opacity" style={{background:`linear-gradient(135deg,${p.c[0]},${p.c[1]})`,minHeight:170}}>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded" style={{background:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.7)'}}>{p.tag}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:'rgba(255,255,255,0.15)'}}>▶</div>
              </div>
              <div className="mt-7">
                <div className="text-2xl mb-2">{p.emoji}</div>
                <p className="text-white font-bold text-sm">{p.title}</p>
                <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.55)'}}>{p.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explore */}
      <div className="px-5 py-7">
        <p className="text-xs font-medium tracking-widest mb-1" style={{color:'rgba(255,255,255,0.4)'}}>EXPLORE</p>
        <h2 className="text-lg font-bold text-white mb-4">Three ways to feel better</h2>
        <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          {explore.map((e,i)=>(
            <button key={i} onClick={()=>onNavigate(e.tab)} className="w-full text-left rounded-2xl p-5 hover:opacity-90 transition-opacity"
              style={{background:`linear-gradient(135deg,${e.c[0]},${e.c[1]})`, ...(e.border ? {border:'1px solid rgba(255,255,255,0.1)'} : {})}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4" style={{background:'rgba(255,255,255,0.15)'}}>{e.icon}</div>
              <p className="text-white font-bold text-base mb-2">{e.title}</p>
              <p className="text-sm leading-relaxed mb-4" style={{color:'rgba(255,255,255,0.7)'}}>{e.desc}</p>
              <span className="text-white text-sm font-semibold">Explore →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Micro ────────────────────────────────────────────
function MicroTab() {
  const [feeling, setFeeling] = useState<string|null>(null);
  const sessions = feeling ? (FEELING_MAP[feeling]??[]).map(i=>MICRO_SESSIONS[i]) : MICRO_SESSIONS;

  return (
    <div className="overflow-y-auto" style={{flex:1}}>
      <div className="px-5 pt-6 pb-7" style={{background:'linear-gradient(180deg,#4A2020 0%,#2A1515 60%,#14152A 100%)'}}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{background:'rgba(255,255,255,0.12)'}}>
          <span className="text-sm">✨</span><span className="text-white text-xs">Micro Mindfulness</span>
        </div>
        <h2 className="text-2xl font-bold text-white leading-tight" style={{fontFamily:'Georgia,serif'}}>Tiny resets for the</h2>
        <h2 className="text-2xl font-bold italic text-white leading-tight mb-3" style={{fontFamily:'Georgia,serif'}}>in-between moments.</h2>
        <p className="text-sm leading-relaxed mb-5 max-w-md" style={{color:'rgba(255,255,255,0.6)'}}>Short sessions outperform long meditations for young minds. Pick a feeling — leave 90 seconds later with a softer nervous system.</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(FEELING_MAP).map(f=>(
            <button key={f} onClick={()=>setFeeling(feeling===f?null:f)} className="px-3.5 py-2 rounded-full text-sm transition-all"
              style={{background:feeling===f?GOLD:'rgba(255,255,255,0.1)',color:'white',border:`1px solid ${feeling===f?GOLD:'rgba(255,255,255,0.2)'}`,fontWeight:feeling===f?600:400}}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s,i)=>(
          <button key={i} className="text-left rounded-2xl p-3.5 hover:opacity-90 transition-opacity" style={{background:`linear-gradient(135deg,${s.c[0]},${s.c[1]})`,minHeight:150}}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded" style={{background:'rgba(0,0,0,0.3)',color:'white'}}>{s.label}</span>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:'rgba(0,0,0,0.3)'}}>▶</div>
            </div>
            <div className="mt-6">
              <p className="text-white font-bold text-sm leading-tight">{s.title}</p>
              <p className="text-xs mt-1.5 leading-snug" style={{color:'rgba(255,255,255,0.7)'}}>{s.sub}</p>
              <p className="text-xs mt-2 font-medium" style={{color:'rgba(255,255,255,0.7)'}}>{s.dur}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="h-8"/>
    </div>
  );
}

// ─── Tab: Breathing ────────────────────────────────────────
function BreathingTab() {
  const [active, setActive] = useState<number|null>(null);

  return (
    <div className="overflow-y-auto" style={{flex:1}}>
      <div className="px-5 pt-6 pb-0" style={{background:'linear-gradient(135deg,#1A3A4A 0%,#1E2A50 50%,#14152A 100%)'}}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{background:'rgba(255,255,255,0.12)'}}>
          <span className="text-sm">💨</span><span className="text-white text-xs">Breathwork</span>
        </div>
        <h2 className="text-2xl font-bold text-white" style={{fontFamily:'Georgia,serif'}}>Breathe in. <span className="italic">Soften.</span> Breathe out.</h2>
        <p className="text-sm leading-relaxed mt-2 mb-5 max-w-md" style={{color:'rgba(255,255,255,0.6)'}}>The fastest way to change how you feel is to change how you breathe. Follow the orb — your body will do the rest.</p>
        {active !== null && (
          <button onClick={()=>setActive(null)} className="mb-2 text-xs px-4 py-2 rounded-full" style={{background:GOLD,color:'white',fontWeight:600}}>
            ✕ Stop session
          </button>
        )}
        {active !== null ? (
          <BreathingOrb phases={BREATHING[active].phases} labels={BREATHING[active].labels} />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="rounded-full flex items-center justify-center" style={{width:120,height:120,background:`radial-gradient(circle at 35% 35%,${TEAL},#1A7A8A)`,boxShadow:`0 0 40px rgba(67,198,172,0.4)`}}>
              <span className="text-white text-sm font-semibold text-center px-4 leading-tight">Pick an exercise below</span>
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pt-6 pb-4">
        <p className="text-xs font-medium tracking-widest mb-1" style={{color:'rgba(255,255,255,0.4)'}}>LIBRARY</p>
        <h3 className="text-lg font-bold text-white mb-4">Find your rhythm</h3>
        <div className="space-y-3">
          {BREATHING.map((e,i)=>(
            <button key={i} onClick={()=>setActive(active===i?null:i)} className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all"
              style={{background:active===i?'#252760':CARD,border:active===i?`1px solid ${TEAL}`:'1px solid transparent'}}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{e.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.6)'}}>{e.dur}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>{e.desc}</p>
                <p className="text-xs mt-2 font-medium" style={{color:GOLD}}>{e.rhythm}</p>
              </div>
              <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center" style={{background:active===i?TEAL:GOLD}}>
                <span className="text-white text-lg">{active===i?'■':'▶'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="h-8"/>
    </div>
  );
}

// ─── Tab: Sleep ────────────────────────────────────────────
function SleepTab() {
  return (
    <div className="overflow-y-auto" style={{flex:1}}>
      <div className="px-5 pt-6 pb-7 relative overflow-hidden" style={{background:'linear-gradient(180deg,#141830 0%,#0D1020 50%,#14152A 100%)'}}>
        {/* Stars */}
        {Array.from({length:16},(_,i)=>(
          <div key={i} className="absolute rounded-full" style={{left:`${(i*37+13)%93}%`,top:`${(i*53+7)%55}%`,width:Math.floor(i%3)+1,height:Math.floor(i%3)+1,background:'rgba(255,255,255,0.6)',pointerEvents:'none'}}/>
        ))}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{background:'rgba(255,255,255,0.1)'}}>
            <span className="text-sm">🌙</span><span className="text-white text-xs">Sleep & Night Calm</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight" style={{fontFamily:'Georgia,serif'}}>Stories and sounds that</h2>
          <h2 className="text-2xl font-bold italic text-white leading-tight mb-3" style={{fontFamily:'Georgia,serif'}}>walk you to sleep.</h2>
          <p className="text-sm leading-relaxed max-w-md" style={{color:'rgba(255,255,255,0.6)'}}>Slow narrations, gentle soundscapes and nighttime reflections — built for the most tender part of your day.</p>
        </div>
      </div>

      {/* Sleep stories */}
      <div className="pt-6 px-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Tonight's sleep stories</h3>
          <span className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Fade out automatically</span>
        </div>
        <div className="flex gap-3 pb-2 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible" style={{scrollbarWidth:'none'}}>
          {SLEEP_STORIES.map((s,i)=>(
            <button key={i} className="flex-shrink-0 w-40 lg:w-auto rounded-2xl p-3 text-left hover:opacity-90 transition-opacity"
              style={{background:`linear-gradient(180deg,${s.c[0]},${s.c[1]})`,minHeight:180}}>
              <div className="flex justify-between items-start mb-auto">
                <span className="text-[8px] font-bold tracking-wider px-2 py-1 rounded" style={{background:'rgba(0,0,0,0.4)',color:'white'}}>SLEEP STORY</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{background:'rgba(0,0,0,0.4)'}}>▶</div>
              </div>
              <div className="mt-10">
                <span style={{color:'#E8D5A3',fontSize:18}}>🌙</span>
                <p className="text-white font-semibold text-sm mt-2">{s.title}</p>
                <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.55)'}}>{s.dur} · Narrated</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Soundscapes */}
      <div className="px-5 pt-6">
        <h3 className="text-base font-bold text-white mb-4">Soundscapes</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SOUNDSCAPES.map((s,i)=>(
            <button key={i} className="text-left rounded-2xl p-4 hover:opacity-90 transition-opacity" style={{background:`linear-gradient(135deg,${s.c[0]},${s.c[1]})`,minHeight:100}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-3" style={{background:'rgba(255,255,255,0.15)'}}>{s.icon}</div>
              <p className="text-white font-semibold text-sm">{s.title}</p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.6)'}}>{s.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Wind down */}
      <div className="px-5 pt-6 pb-8">
        <h3 className="text-base font-bold text-white mb-4">Wind down</h3>
        <div className="space-y-3">
          {WIND_DOWN.map((w,i)=>(
            <button key={i} className="w-full text-left rounded-2xl p-4 flex items-start gap-3 hover:opacity-90 transition-opacity" style={{background:CARD}}>
              <div className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#9575CD,#7B5EA7)'}}>
                <span className="text-lg">🧘</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{w.title}</p>
                <p className="text-xs mt-1 leading-snug" style={{color:'rgba(255,255,255,0.55)'}}>{w.desc}</p>
                <p className="text-xs mt-2 font-medium" style={{color:GOLD}}>{w.dur}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Mindfulness Component ────────────────────────────
const TABS = ['Today', 'Micro', 'Breathing', 'Sleep'];

export default function Mindfulness() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: '#14152A' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg,#9575CD,#5C6BC0)' }}>
            🧘
          </div>
          <span className="text-white font-medium text-sm tracking-wide">mindfulness</span>
        </div>

        {/* Tab pills */}
        <div className="flex p-1 rounded-full" style={{ background: '#1E2040' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className="flex-1 py-2 rounded-full text-center text-sm transition-all duration-200"
              style={{
                background: tab === i ? 'white' : 'transparent',
                color: tab === i ? BG : 'rgba(255,255,255,0.5)',
                fontWeight: tab === i ? 600 : 400,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 0 && <TodayTab onNavigate={setTab} />}
        {tab === 1 && <MicroTab />}
        {tab === 2 && <BreathingTab />}
        {tab === 3 && <SleepTab />}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
