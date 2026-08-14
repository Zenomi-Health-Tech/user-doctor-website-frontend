import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTests } from '@/hooks/useTests';

// ─── Colours ───────────────────────────────────────────────
const BG = '#14152A';
const CARD = '#1E2040';
const GOLD = '#E5A030';
const TEAL = '#43C6AC';

// ─── Playable track (subset of app's AudioTrack fields) ────
type PlayableTrack = {
  title: string;
  audio?: string; // filename under /public/audio, e.g. 'calm_before_exam.mp3'
  isLooping?: boolean;
};

// ─── Data ──────────────────────────────────────────────────
const MICRO_SESSIONS = [
  { label: 'RESET', title: 'Calm Before Exam',     sub: 'Steady the racing thoughts before you walk in.', dur: '2 min', c: ['#3BA8B0','#2D7D82'], audio: 'calm_before_exam.mp3' },
  { label: 'RESET', title: 'Stop Overthinking',    sub: 'Cut the loop with a gentle attention reset.',   dur: '3 min', c: ['#7B5EA7','#9575CD'], audio: 'stop_overthinking.mp3' },
  { label: 'RESET', title: 'Reset After Fight',    sub: 'Soften the chest, drop the shoulders, breathe.', dur: '3 min', c: ['#D35F3E','#E57350'], audio: 'reset_after_fight.mp3' },
  { label: 'RESET', title: 'Panic Reset',          sub: 'Ground in 5 senses. You are safe right now.',   dur: '1 min', c: ['#D35F3E','#BF4F30'], audio: 'panic_reset.mp3' },
  { label: 'RESET', title: 'Social Anxiety Reset', sub: 'Walk in with steadier breath and softer eyes.', dur: '2 min', c: ['#3F51B5','#5C7BE0'], audio: 'social_anxiety_reset.mp3' },
];
const FEELING_MAP: Record<string, number[]> = {
  Anxious:[0,3], Tired:[1], Restless:[0,2], Sad:[1,2], Overwhelmed:[1,3], Foggy:[1,0], Tense:[2,4],
};

const BREATHING = [
  { title:'Box Breathing',          dur:'4 MIN', desc:'Soldier-tested focus and calm. Inhale, hold, exhale, hold.',              rhythm:'4 · 4 · 4 · 4',       phases:[4,4,4,4],   labels:['Inhale','Hold','Exhale','Hold'], audio:'box_breathing.mp3' },
  { title:'4-7-8 Breathing',        dur:'5 MIN', desc:"Dr. Weil's classic. Falls asleep fast, drops anxiety even faster.",       rhythm:'4 · 7 · 8',            phases:[4,7,8,0],   labels:['Inhale','Hold','Exhale',''], audio:'breathing_478.mp3' },
  { title:'Physiological Sigh',     dur:'1 MIN', desc:'Stanford-backed instant down-regulator. One minute, real shift.',         rhythm:'2 inhales · long exhale',phases:[2,0,8,0],  labels:['Inhale','Inhale 2','Exhale',''], audio:'physiological_sigh.mp3' },
  { title:'Resonance Breathing',    dur:'6 MIN', desc:'Heart and breath sync. Six breaths a minute, deep coherence.',            rhythm:'5.5 · 5.5',            phases:[5,0,5,0],   labels:['Inhale','','Exhale',''], audio:'resonance_breathing.mp3' },
  { title:'Deep Belly Breathing',   dur:'5 MIN', desc:'Re-teaches the body to breathe low, full and free.',                      rhythm:'Slow · diaphragmatic',  phases:[5,0,6,0],   labels:['Inhale','','Exhale',''], audio:'deep_belly_breathing.mp3' },
];

const SLEEP_STORIES = [
  { title:'Drift Over the Sea',       dur:'22 min', c:['#1A3A6C','#0D2137'], audio:'drift_over_the_sea.mp3' },
  { title:'The Quiet Cabin',          dur:'28 min', c:['#1A2E4A','#0D1B2A'], audio:'the_quiet_cabin.mp3' },
  { title:'Lantern Walk in Kyoto',    dur:'26 min', c:['#1E1A40','#0F0D25'], audio:'lantern_walk_kyoto.mp3' },
  { title:'Old Train, Soft Window',   dur:'30 min', c:['#1A2040','#101525'], audio:'old_train_soft_window.mp3' },
];
// Mirrors app's `soundscapes` list in lib/modules/mindfulness/models/audio_track.dart
const SOUNDSCAPES = [
  { title:'Rain Window Drift',   sub:'Fades out automatically', icon:'🌧️', c:['#2A9D8F','#1E6D65'], audio:'rain_window_drift.mp3', isLooping:true },
  { title:'Earthy Drift',        sub:'Fades out automatically', icon:'🍂', c:['#8B6057','#5D3F38'], audio:'earthy_drift.mp3', isLooping:true },
  { title:'Sandalwood Drift',    sub:'Fades out automatically', icon:'🕯️', c:['#7B5EA7','#5B3F7F'], audio:'sandalwood_drift.mp3', isLooping:true },
  { title:'Cedar Drift',         sub:'Fades out automatically', icon:'🌲', c:['#2D6A4F','#1A4030'], audio:'cedar_drift.mp3', isLooping:true },
  { title:'Earthtone Drift',     sub:'Fades out automatically', icon:'🍁', c:['#6B4C2A','#3D2A15'], audio:'earthtone_drift.mp3', isLooping:true },
  { title:'Deep Focus',          sub:'Fades out automatically', icon:'🎯', c:['#1A3050','#0D1A2E'], audio:'deep_focus.mp3', isLooping:true },
  { title:'Rain on Moss',        sub:'Fades out automatically', icon:'🌿', c:['#2D5A27','#1A3518'], audio:'rain_on_moss.mp3', isLooping:true },
  { title:'Soft Rain Loom',      sub:'Fades out automatically', icon:'🌦️', c:['#334A6B','#1A2840'], audio:'soft_rain_loom.mp3', isLooping:true },
  { title:'Still Water Fade',    sub:'Fades out automatically', icon:'🌊', c:['#2A4A6B','#162A40'], audio:'still_water_fade.mp3', isLooping:true },
  { title:'Shaking Dawn Pulse',  sub:'Fades out automatically', icon:'🌅', c:['#4A3060','#251535'], audio:'shaking_dawn_pulse.mp3', isLooping:true },
];
const WIND_DOWN = [
  { title:'Quiet Your Thoughts',             desc:"Gentle guidance to release the day's mental noise.",       dur:'8 min' },
  { title:'Progressive Muscle Relaxation',  desc:"Head to toe, melt the tension you didn't notice.",         dur:'12 min' },
  { title:'Nighttime Reflection',           desc:'Three soft prompts to close the day with kindness.',        dur:'6 min' },
];

// ─── Breathing Orb (matches app MindBreathingOrb) ──────────
// Auto-cycles 4-7-8 by default; selecting an exercise overrides timing.
function BreathingOrb({ phases, labels }: { phases: number[]; labels: string[] }) {
  const [phaseLabel, setPhaseLabel] = useState('Inhale');
  const [scale, setScale] = useState(0.85);
  const [glow, setGlow] = useState(0.4);
  const [countdown, setCountdown] = useState(phases[0] || 4);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleRef = useRef(false);

  // Orbiting dot positions (5 dots)
  const dots = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * 2 * Math.PI;
    const r = 130 * scale;
    return { x: 130 + r * Math.cos(angle), y: 130 + r * Math.sin(angle) };
  });

  const runCycle = () => {
    cycleRef.current = true;
    let pi = 0;
    const nextPhase = () => {
      if (!cycleRef.current) return;
      while (phases[pi] === 0) pi = (pi + 1) % 4;
      const dur = phases[pi];
      setPhaseLabel(labels[pi] || '');
      setCountdown(dur);
      setScale(pi === 0 ? 1.15 : pi === 2 ? 0.85 : 1.0);
      let t = dur;
      timerRef.current = setInterval(() => {
        t--;
        setCountdown(t);
        if (t <= 0) {
          clearInterval(timerRef.current!);
          pi = (pi + 1) % 4;
          if (cycleRef.current) nextPhase();
        }
      }, 1000);
    };
    nextPhase();
  };

  // Glow pulse independent of breathing
  useEffect(() => {
    let g = 0.4; let dir = 1;
    const id = setInterval(() => {
      g += dir * 0.02;
      if (g >= 0.8 || g <= 0.4) dir *= -1;
      setGlow(g);
    }, 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    runCycle();
    return () => { cycleRef.current = false; if (timerRef.current) clearInterval(timerRef.current); };
  }, [phases.join(',')]);

  const dur = `${phaseLabel.includes('Inhale') ? (phases[0] || 4) : phaseLabel === 'Hold' ? (phases[1] || 7) : (phases[2] || 8)}s`;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative" style={{ width: 260, height: 260 }}>
        {/* Outermost glow */}
        <div className="absolute rounded-full pointer-events-none" style={{
          width: `${scale * 200}px`, height: `${scale * 200}px`,
          left: `${130 - scale * 100}px`, top: `${130 - scale * 100}px`,
          background: `rgba(149,117,205,${glow * 0.25})`,
          transition: `all ${dur} ease-in-out`,
        }} />
        {/* Outer pulse ring */}
        <div className="absolute rounded-full pointer-events-none" style={{
          width: `${scale * 170}px`, height: `${scale * 170}px`,
          left: `${130 - scale * 85}px`, top: `${130 - scale * 85}px`,
          background: 'rgba(179,157,219,0.35)',
          boxShadow: `0 0 30px 10px rgba(149,117,205,${glow * 0.5})`,
          transition: `all ${dur} ease-in-out`,
        }} />
        {/* Middle ring */}
        <div className="absolute rounded-full pointer-events-none" style={{
          width: `${scale * 148}px`, height: `${scale * 148}px`,
          left: `${130 - scale * 74}px`, top: `${130 - scale * 74}px`,
          background: 'rgba(149,117,205,0.5)',
          transition: `all ${dur} ease-in-out`,
        }} />
        {/* Inner core */}
        <div className="absolute rounded-full flex flex-col items-center justify-center" style={{
          width: 110, height: 110, left: 75, top: 75,
          background: 'radial-gradient(circle at 35% 35%, #CE93D8, #9575CD)',
          boxShadow: '0 0 20px rgba(123,94,167,0.6)',
        }}>
          <span className="text-white font-semibold text-sm tracking-wide">{phaseLabel || 'Inhale'}</span>
          <span className="text-white/70 text-xs mt-0.5">{countdown}s</span>
        </div>
        {/* Orbiting dots */}
        <svg className="absolute inset-0 pointer-events-none" width="260" height="260">
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="3" fill="rgba(255,255,255,0.6)" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Player Bar (bottom-docked, mirrors app's AudioPlayerScreen) ──
function PlayerBar({ playlist, index, onIndexChange, onClose }: {
  playlist: PlayableTrack[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const track = playlist[index];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track?.audio) return;
    a.src = `/audio/${track.audio}`;
    a.loop = !!track.isLooping;
    a.currentTime = 0;
    setTime(0);
    a.play().catch(() => {});
    setPlaying(true);
  }, [track]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => {
      if (!track.isLooping && index < playlist.length - 1) onIndexChange(index + 1);
      else setPlaying(false);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, [track, index, playlist.length, onIndexChange]);

  if (!track) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { a.play().catch(() => {}); setPlaying(true); }
  };
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setTime(t);
  };
  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  return (
    <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3" style={{ background: '#1E2040', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <audio ref={audioRef} />
      <button onClick={() => index > 0 && onIndexChange(index - 1)} disabled={index <= 0} className="text-white/60 disabled:opacity-30 text-lg px-1">⏮</button>
      <button onClick={toggle} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GOLD }}>
        <span className="text-white text-base">{playing ? '⏸' : '▶'}</span>
      </button>
      <button onClick={() => index < playlist.length - 1 && onIndexChange(index + 1)} disabled={index >= playlist.length - 1} className="text-white/60 disabled:opacity-30 text-lg px-1">⏭</button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{track.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmt(time)}</span>
          <input type="range" min={0} max={dur || 0} value={Math.min(time, dur || 0)} onChange={seek} className="flex-1" style={{ height: 4, accentColor: GOLD }} />
          <span className="text-[10px] w-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmt(dur)}</span>
        </div>
      </div>
      <button onClick={onClose} className="text-lg px-1" style={{ color: 'rgba(255,255,255,0.5)' }}>✕</button>
    </div>
  );
}

// ─── Tab: Today ────────────────────────────────────────────
function TodayTab({ onNavigate }: { onNavigate: (t: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { tests } = useTests();
  const mindfulnessTest = tests.find(t => t.name?.toLowerCase().includes('mindful'));
  const testCompleted = mindfulnessTest?.testStatus === 'COMPLETED';
  const testLocked = mindfulnessTest?.testStatus === 'LOCKED';
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

      {/* Assessment card — matches app _buildAssessmentCard */}
      {mindfulnessTest && (
        <div className="px-5 pt-6">
          <button
            onClick={() => { if (!testCompleted && !testLocked) navigate('/dashboard'); }}
            disabled={testCompleted || testLocked}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3.5 disabled:cursor-default"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${testCompleted ? 'rgba(67,198,172,0.5)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <div className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center text-xl" style={{
              background: testCompleted ? 'linear-gradient(135deg,#43C6AC,#704180)' : 'rgba(255,255,255,0.1)',
            }}>
              {testCompleted ? '✅' : testLocked ? '🔒' : '🧘'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{mindfulnessTest.name}</p>
              <p className="text-xs mt-0.5" style={{ color: testCompleted ? TEAL : 'rgba(255,255,255,0.4)' }}>
                {testCompleted ? 'Assessment complete — great work!' : testLocked ? 'Complete previous tests to unlock' : 'Take your mindfulness assessment'}
              </p>
            </div>
            {!testCompleted && !testLocked && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />}
          </button>
        </div>
      )}

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
function MicroTab({ onPlay }: { onPlay: (playlist: PlayableTrack[], index: number) => void }) {
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
          <button key={i} onClick={()=>s.audio && onPlay(sessions, i)} disabled={!s.audio}
            className="text-left rounded-2xl p-3.5 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{background:`linear-gradient(135deg,${s.c[0]},${s.c[1]})`,minHeight:150}}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded" style={{background:'rgba(0,0,0,0.3)',color:'white'}}>{s.label}</span>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{background:'rgba(0,0,0,0.3)'}}>{s.audio ? '▶' : '…'}</div>
            </div>
            <div className="mt-6">
              <p className="text-white font-bold text-sm leading-tight">{s.title}</p>
              <p className="text-xs mt-1.5 leading-snug" style={{color:'rgba(255,255,255,0.7)'}}>{s.sub}</p>
              <p className="text-xs mt-2 font-medium" style={{color:'rgba(255,255,255,0.7)'}}>{s.audio ? s.dur : 'Coming soon'}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="h-8"/>
    </div>
  );
}

// ─── Tab: Breathing ────────────────────────────────────────
function BreathingTab({ onPlay }: { onPlay: (playlist: PlayableTrack[], index: number) => void }) {
  const [active, setActive] = useState(1); // default 4-7-8 like app

  return (
    <div className="overflow-y-auto" style={{flex:1}}>
      <div className="px-5 pt-6 pb-2" style={{background:'linear-gradient(135deg,#1A3A4A 0%,#1E2A50 50%,#14152A 100%)'}}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{background:'rgba(255,255,255,0.12)'}}>
          <span className="text-sm">💨</span><span className="text-white text-xs">Breathwork</span>
        </div>
        <h2 className="text-2xl font-bold text-white" style={{fontFamily:'Georgia,serif'}}>Breathe in. <span className="italic">Soften.</span> Breathe out.</h2>
        <p className="text-sm leading-relaxed mt-2 mb-4 max-w-md" style={{color:'rgba(255,255,255,0.6)'}}>The fastest way to change how you feel is to change how you breathe. Follow the orb — your body will do the rest.</p>
        {/* Orb always visible, auto-cycling — matches app */}
        <BreathingOrb phases={BREATHING[active].phases} labels={BREATHING[active].labels} />
        <p className="text-center text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.5)'}}>{BREATHING[active].title} · {BREATHING[active].rhythm}</p>
      </div>
      <div className="px-5 pt-4 pb-4">
        <p className="text-xs font-medium tracking-widest mb-1" style={{color:'rgba(255,255,255,0.4)'}}>LIBRARY</p>
        <h3 className="text-lg font-bold text-white mb-4">Find your rhythm</h3>
        <div className="space-y-3">
          {BREATHING.map((e,i)=>(
            <button key={i} onClick={()=>{ setActive(i); onPlay(BREATHING, i); }} className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all"
              style={{background:active===i?'#252760':CARD,border:active===i?`1px solid #9575CD`:'1px solid transparent'}}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{e.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.6)'}}>{e.dur}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>{e.desc}</p>
                <p className="text-xs mt-2 font-medium" style={{color:GOLD}}>{e.rhythm}</p>
              </div>
              <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center" style={{background:active===i?'#9575CD':GOLD}}>
                <span className="text-white text-base">{active===i?'●':'▶'}</span>
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
function SleepTab({ onPlay }: { onPlay: (playlist: PlayableTrack[], index: number) => void }) {
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
            <button key={i} onClick={()=>onPlay(SLEEP_STORIES, i)} className="flex-shrink-0 w-40 lg:w-auto rounded-2xl p-3 text-left hover:opacity-90 transition-opacity"
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
            <button key={i} onClick={()=>onPlay(SOUNDSCAPES, i)} className="text-left rounded-2xl p-4 hover:opacity-90 transition-opacity" style={{background:`linear-gradient(135deg,${s.c[0]},${s.c[1]})`,minHeight:100}}>
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
  const [nowPlaying, setNowPlaying] = useState<{ playlist: PlayableTrack[]; index: number } | null>(null);
  const play = (playlist: PlayableTrack[], index: number) => setNowPlaying({ playlist, index });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      {/* Dark sidebar — same as Sleep Tracker */}
      <style>{`
        body { background: ${BG} !important; }
        .flex-1.overflow-auto { background: ${BG} !important; }
        header { background: ${BG} !important; border-color: rgba(255,255,255,0.1) !important; }
        header * { color: white !important; }
        :root {
          --sidebar-background: 230 20% 10%;
          --sidebar-foreground: 0 0% 85%;
          --sidebar-border: 0 0% 20%;
          --sidebar-accent: 230 20% 15%;
          --sidebar-accent-foreground: 0 0% 90%;
          --sidebar-primary: 270 50% 45%;
          --sidebar-primary-foreground: 0 0% 100%;
        }
        aside, [data-sidebar] { background: ${BG} !important; }
        aside [class*="bg-white"], [data-sidebar] [class*="bg-white"] { background: ${BG} !important; color: rgba(255,255,255,0.7) !important; }
        aside *, [data-sidebar] * { color: rgba(255,255,255,0.7) !important; }
        aside a:hover, aside button:hover, [data-sidebar] a:hover, [data-sidebar] button:hover { background: rgba(255,255,255,0.08) !important; }
        aside [data-active="true"], [data-sidebar] [data-active="true"] { background: rgba(255,255,255,0.12) !important; color: white !important; }
        aside hr, aside [role="separator"], [data-sidebar] hr, [data-sidebar] [role="separator"] { display: none !important; }
        aside .border-t, aside .border-gray-200 { border-color: rgba(255,255,255,0.1) !important; }
        [data-sidebar="sidebar"] { border-right: 1px solid rgba(255,255,255,0.1) !important; }
        [data-sidebar="rail"]::after { background: rgba(255,255,255,0.1) !important; opacity: 1 !important; }
      `}</style>
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
        {tab === 1 && <MicroTab onPlay={play} />}
        {tab === 2 && <BreathingTab onPlay={play} />}
        {tab === 3 && <SleepTab onPlay={play} />}
      </div>

      {nowPlaying && (
        <PlayerBar
          playlist={nowPlaying.playlist}
          index={nowPlaying.index}
          onIndexChange={(i) => setNowPlaying((np) => (np ? { ...np, index: i } : null))}
          onClose={() => setNowPlaying(null)}
        />
      )}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
