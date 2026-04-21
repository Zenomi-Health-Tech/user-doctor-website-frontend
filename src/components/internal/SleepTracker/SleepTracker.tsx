import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";



interface SleepLog { id: string; hoursOfSleep: number; energyLevel: number; caffeineBeforeBed: boolean; screensInBed: boolean; nightWakeUps: number; createdAt: string; }
interface SleepSummary { avgSleepHours: number; avgEnergy: number; logCount: number; caffeinePercentage: number; screensPercentage: number; avgNightWakeUps: number; }
interface Reminder { enabled: boolean; reminderTimeLocal: string; scheduleStartDate?: string; reminderDays?: number; }

const ENERGY = [
  { emoji: '😴', label: 'Dead tired' }, { emoji: '😫', label: 'Sleepy' },
  { emoji: '😐', label: 'Okay' }, { emoji: '🙂', label: 'Good' }, { emoji: '🚀', label: 'Super!' },
];
const BG = '#12121F'; const CARD = '#1E1E30'; const TEAL = '#2A9D8F'; const ORANGE = '#E76F51'; const PURPLE = '#9B59B6';

export default function SleepTracker() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [summary, setSummary] = useState<SleepSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Log form
  const [hours, setHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [caffeine, setCaffeine] = useState(false);
  const [screens, setScreens] = useState(false);
  const [wakeUps, setWakeUps] = useState(0);
  const logDate = new Date().toISOString().split('T')[0];

  // Reminder
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [remTime, setRemTime] = useState("22:00");
  const [remEnabled, setRemEnabled] = useState(false);
  const [remStart, setRemStart] = useState("");
  const [remEnd, setRemEnd] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);

  // Insights — multi-date comparison
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const loggedDates = [...new Set(logs.map(l => new Date(l.createdAt).toISOString().split('T')[0]))].sort().reverse();

  // Already logged for selected date?
  const loggedForDate = logs.some(l => new Date(l.createdAt).toISOString().split('T')[0] === logDate);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lr, sr] = await Promise.all([api.get("/users/sleep-logs?page=1&limit=30"), api.get("/users/sleep-logs/summary?days=30")]);
      const d = lr.data?.data;
      const logsList: SleepLog[] = Array.isArray(d) ? d : d?.items || d?.logs || [];
      setLogs(logsList);

      const s = sr.data?.data;
      // Compute caffeine/screens/wakeups from logs if API doesn't return them
      if (s && logsList.length > 0) {
        const cafCount = logsList.filter(l => l.caffeineBeforeBed).length;
        const scrCount = logsList.filter(l => l.screensInBed).length;
        const totalWake = logsList.reduce((sum, l) => sum + (l.nightWakeUps || 0), 0);
        setSummary({
          ...s,
          caffeinePercentage: s.caffeinePercentage || (cafCount / logsList.length * 100),
          screensPercentage: s.screensPercentage || (scrCount / logsList.length * 100),
          avgNightWakeUps: s.avgNightWakeUps || (totalWake / logsList.length),
        });
      } else {
        setSummary(s || null);
      }
    } catch { }
    // Load reminder
    try { const r = await api.get("/users/sleep-reminder"); if (r.data?.data) { setReminder(r.data.data); setRemEnabled(r.data.data.enabled); setRemTime(r.data.data.reminderTimeLocal || "22:00"); } } catch { }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (loggedForDate) { toast({ title: "Already logged", description: "You can only log once per day", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await api.post("/users/sleep-logs", { hoursOfSleep: hours, energyLevel: energy, caffeineBeforeBed: caffeine, screensInBed: screens, nightWakeUps: wakeUps });
      toast({ title: "✓ Logged!", description: "Sleep logged! 🌙", className: "bg-green-500 text-white" });
      setHours(7); setEnergy(3); setCaffeine(false); setScreens(false); setWakeUps(0);
      fetchData(); setTab(1);
    } catch (e: any) { toast({ title: "Error", description: e.response?.data?.message || "Failed to save", variant: "destructive" }); }
    setSubmitting(false);
  };

  const saveReminder = async () => {
    setSavingReminder(true);
    try {
      const body: any = { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reminderTimeLocal: remTime, enabled: remEnabled };
      if (remStart) body.scheduleStartDate = remStart;
      if (remStart && remEnd) {
        const d1 = new Date(remStart); const d2 = new Date(remEnd);
        body.reminderDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / 86400000));
      }
      await api.put("/users/sleep-reminder", body);
      toast({ title: "✓", description: remEnabled ? `Reminder set for ${remTime}` : "Reminder disabled", className: "bg-green-500 text-white" });
      setShowReminder(false);
      setReminder({ enabled: remEnabled, reminderTimeLocal: remTime, scheduleStartDate: remStart, reminderDays: body.reminderDays });
    } catch { toast({ title: "Error", description: "Failed to update reminder", variant: "destructive" }); }
    setSavingReminder(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-white text-lg">Loading sleep data...</div></div>;

  // Compute insights from selected dates (or all logs)
  const filteredLogs = selectedDates.size > 0
    ? logs.filter(l => selectedDates.has(new Date(l.createdAt).toISOString().split('T')[0]))
    : logs;
  const computeStats = (list: SleepLog[]) => {
    if (list.length === 0) return { avgSleep: 0, avgEnergy: 0, count: 0, avgWakeUps: 0, caffeinePct: 0, screensPct: 0 };
    const n = list.length;
    return {
      avgSleep: list.reduce((s, l) => s + l.hoursOfSleep, 0) / n,
      avgEnergy: list.reduce((s, l) => s + l.energyLevel, 0) / n,
      count: n,
      avgWakeUps: list.reduce((s, l) => s + l.nightWakeUps, 0) / n,
      caffeinePct: list.filter(l => l.caffeineBeforeBed).length / n * 100,
      screensPct: list.filter(l => l.screensInBed).length / n * 100,
    };
  };
  const filteredSummary = computeStats(filteredLogs);

  // Per-date breakdown for comparison
  const perDateStats = selectedDates.size > 1
    ? [...selectedDates].sort().map(d => ({
        date: d,
        ...computeStats(logs.filter(l => new Date(l.createdAt).toISOString().split('T')[0] === d)),
      }))
    : [];

  const TABS = ['Log Sleep', 'Sleep History', 'Insights'];

  return (
    <div className="min-h-full font-['Poppins'] relative" style={{ background: BG }}>
      <style>{`
        .sleepScroll::-webkit-scrollbar { height: 4px; }
        .sleepScroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .sleepScroll::-webkit-scrollbar-thumb { background: ${PURPLE}66; border-radius: 4px; }
        .sleepScroll { scrollbar-width: thin; scrollbar-color: ${PURPLE}66 rgba(255,255,255,0.05); }
      `}</style>
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
      <div className="max-w-2xl mx-auto" style={{ background: BG, minHeight: '100vh' }}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[22px] font-bold text-white">Sleep Tracker</h1>
          <button onClick={() => setShowReminder(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <span className={`text-lg ${reminder?.enabled ? '' : 'opacity-50'}`}>🔔</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 py-2.5">
          <div className="h-[45px] rounded-[25px] flex overflow-hidden" style={{ background: CARD }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`flex-1 text-[13px] font-semibold rounded-[25px] transition-all ${tab === i ? 'text-white' : 'text-white/40'}`}
                style={tab === i ? { background: `linear-gradient(135deg, ${ORANGE}, ${PURPLE})` } : {}}>{t}</button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6">
          {/* ── LOG SLEEP ── */}
          {tab === 0 && (
            <div className="space-y-4 pt-2">
              {/* Reminder Card — inline in Log Sleep, matches app */}
              {!reminder?.enabled ? (
                <div className="w-full p-5 rounded-[20px] border" style={{ background: `linear-gradient(135deg, ${TEAL}26, ${PURPLE}26)`, borderColor: `${TEAL}4D` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔔</span>
                    <div><p className="text-white text-[15px] font-semibold">Sleep Reminder</p><p className="text-white/50 text-xs">Get reminded to log your sleep</p></div>
                  </div>
                  <button onClick={() => setShowReminder(true)} className="w-full py-3.5 rounded-[14px] text-white text-sm font-semibold" style={{ background: TEAL }}>⏰  Enable Reminder</button>
                </div>
              ) : (
                <div className="w-full p-4 rounded-[20px] flex items-center gap-3.5" style={{ background: CARD }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${TEAL}33` }}>⏰</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Daily Reminder</p>
                    <button onClick={() => setShowReminder(true)} className="flex items-center gap-1.5">
                      <span className="text-lg font-bold" style={{ color: TEAL }}>{reminder.reminderTimeLocal}</span>
                      <span className="text-white/30 text-xs">✏️</span>
                    </button>
                  </div>
                  <button onClick={async () => { try { await api.put("/users/sleep-reminder", { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reminderTimeLocal: reminder.reminderTimeLocal, enabled: false }); setReminder({ ...reminder, enabled: false }); toast({ title: "Reminder disabled", className: "bg-green-500 text-white" }); } catch {} }}
                    className="w-12 h-7 rounded-full relative" style={{ background: TEAL }}>
                    <div className="w-5 h-5 rounded-full bg-white absolute top-1 left-6 transition-all" />
                  </button>
                </div>
              )}

              {loggedForDate && (
                <div className="p-4 rounded-2xl text-center" style={{ background: `${TEAL}22` }}>
                  <p className="text-white/70 text-sm">✅ You've already logged sleep for {logDate === new Date().toISOString().split('T')[0] ? 'today' : logDate}</p>
                </div>
              )}

              <Card emoji="🌙" title="Hours of Sleep" subtitle="How long did you sleep?">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input type="range" min={0} max={14} step={0.5} value={hours} onChange={e => setHours(+e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${ORANGE} ${(hours/14)*100}%, rgba(255,255,255,0.1) ${(hours/14)*100}%)` }} />
                  </div>
                  <div className="min-w-[56px] h-[56px] rounded-2xl flex items-center justify-center" style={{ background: `${ORANGE}22` }}>
                    <span className="text-2xl font-bold" style={{ color: ORANGE }}>{hours}<span className="text-base">h</span></span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-white/30 mt-1.5 px-0.5"><span>0h</span><span>7h</span><span>14h</span></div>
                <style>{`
                  input[type="range"] { -webkit-appearance: none; outline: none; }
                  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${ORANGE}; cursor: grab; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: transform 0.1s ease; }
                  input[type="range"]::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
                  input[type="range"]::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: ${ORANGE}; cursor: grab; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
                  input[type="range"]::-moz-range-track { background: transparent; }
                `}</style>
              </Card>

              <Card emoji="⚡" title="Energy Level" subtitle="How did you feel after waking up?">
                <div className="grid grid-cols-5 gap-2">
                  {ENERGY.map((e, i) => {
                    const sel = energy === i + 1;
                    return (
                      <button key={i} onClick={() => setEnergy(i + 1)}
                        className={`flex flex-col items-center py-3 rounded-2xl transition-all ${sel ? 'border-2 border-[#E9C46A]' : 'border border-transparent'}`}
                        style={{ background: sel ? 'rgba(233,196,106,0.15)' : 'rgba(255,255,255,0.05)' }}>
                        <span className="text-2xl sm:text-3xl">{e.emoji}</span>
                        <span className={`text-[10px] sm:text-[11px] mt-1.5 leading-tight text-center ${sel ? 'text-white' : 'text-white/40'}`}>{e.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <YesNoCard emoji="☕" title="Caffeine Before Bed?" subtitle="Energy drinks or coffee within 4hrs of bed?" value={caffeine} onChange={setCaffeine} />
              <YesNoCard emoji="📱" title="Screens in Bed?" subtitle="Phone, tablet, or laptop in bed?" value={screens} onChange={setScreens} />

              <Card emoji="⏰" title="Night Wake-Ups" subtitle="How many times did you wake up?">
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setWakeUps(Math.max(0, wakeUps - 1))} className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>−</button>
                  <span className="text-white text-[32px] font-bold w-8 text-center">{wakeUps}</span>
                  <button onClick={() => setWakeUps(wakeUps + 1)} className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>+</button>
                </div>
              </Card>

              <button onClick={handleSubmit} disabled={submitting || loggedForDate} className="w-full py-[18px] rounded-2xl text-white font-semibold text-base disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, #3498DB)` }}>
                {submitting ? 'Saving...' : loggedForDate ? 'Already Logged' : "🌙 Log Tonight's Sleep"}
              </button>
            </div>
          )}

          {/* ── SLEEP HISTORY ── */}
          {tab === 1 && (
            logs.length === 0 ? <EmptyDark emoji="😴" title="No sleep logs yet" subtitle="Log your first sleep to start tracking." /> : (
              <div className="space-y-3 pt-2 sleepScroll">
                {logs.map(log => {
                  const eIdx = Math.max(0, Math.min(4, log.energyLevel - 1));
                  const date = new Date(log.createdAt);
                  return (
                    <div key={log.id} className="p-5 rounded-[20px]" style={{ background: CARD }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${TEAL}33` }}>📅</div>
                          <div className="min-w-0">
                            <p className="text-white text-[15px] font-semibold truncate">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <p className="text-white/40 text-xs truncate">{log.hoursOfSleep}h of sleep · Logged {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
                        <div className="text-center ml-2">
                          <span className="text-[28px]">{ENERGY[eIdx].emoji}</span>
                          <p className="text-white/40 text-[10px]">{ENERGY[eIdx].label}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Pill emoji="🌙" text={`${log.hoursOfSleep}h`} bg={TEAL} />
                        <Pill emoji="⚡" text={`${ENERGY[eIdx].label}`} bg="#E9C46A33" />
                        <Pill emoji="⏰" text={`${log.nightWakeUps}x woke`} bg="rgba(255,255,255,0.15)" />
                        {log.caffeineBeforeBed && <Pill emoji="☕" text="Caffeine" bg={`${ORANGE}4D`} />}
                        {log.screensInBed && <Pill emoji="📱" text="Screens" bg={`${PURPLE}4D`} />}
                        {!log.caffeineBeforeBed && <Pill emoji="☕" text="No caffeine" bg={`${TEAL}33`} />}
                        {!log.screensInBed && <Pill emoji="📱" text="No screens" bg={`${TEAL}33`} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── INSIGHTS ── */}
          {tab === 2 && (
            !summary || summary.logCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-16"><div className="text-6xl mb-4">🧘</div><p className="text-lg font-bold text-white mb-2">No Summary Yet</p><p className="text-[13px] text-white/40">Log your sleep for a few days to see insights.</p></div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Date selector */}
                {loggedDates.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs">Tap dates to compare</p>
                      {selectedDates.size > 0 && (
                        <button onClick={() => setSelectedDates(new Set())} className="text-xs font-medium" style={{ color: ORANGE }}>Clear ({selectedDates.size})</button>
                      )}
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sleepScroll">
                      {loggedDates.map(d => {
                        const dt = new Date(d + 'T00:00:00');
                        const picked = selectedDates.has(d);
                        return (
                          <button key={d} onClick={() => { const next = new Set(selectedDates); if (next.has(d)) next.delete(d); else next.add(d); setSelectedDates(next); }}
                            className={`min-w-[48px] py-2 px-1.5 rounded-xl text-center text-[10px] transition-all border-2 ${picked ? 'text-white' : 'text-white/50 border-transparent'}`}
                            style={{ background: picked ? ORANGE : 'rgba(255,255,255,0.05)', borderColor: picked ? ORANGE : 'transparent' }}>
                            <div className="font-bold text-xs">{dt.getDate()}</div>
                            <div>{dt.toLocaleDateString(undefined, { month: 'short' })}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hero card */}
                <div className="w-full p-6 rounded-[20px] text-center" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, #3498DB)` }}>
                  <div className="text-4xl mb-2">🌙</div>
                  <p className="text-white/70 text-sm">Average Sleep</p>
                  <p className="text-white text-5xl font-bold my-1">{filteredSummary.avgSleep.toFixed(1)}h</p>
                  <p className="text-white/50 text-xs">{selectedDates.size > 0 ? `across ${selectedDates.size} selected date${selectedDates.size > 1 ? 's' : ''}` : `across all ${filteredSummary.count} logs`}</p>
                </div>

                {/* Comparison table — when 2+ dates selected */}
                {perDateStats.length > 1 && (
                  <div className="p-4 rounded-[20px]" style={{ background: CARD }}>
                    <p className="text-white font-semibold mb-3">🔄 Date Comparison</p>
                    <div className="overflow-x-auto sleepScroll">
                      <table className="w-full text-xs text-white/80">
                        <thead>
                          <tr className="text-white/40 border-b border-white/10">
                            <th className="text-left py-2 pr-3 font-medium">Date</th>
                            <th className="py-2 px-2 font-medium">🌙 Sleep</th>
                            <th className="py-2 px-2 font-medium">⚡ Energy</th>
                            <th className="py-2 px-2 font-medium">⏰ Wakes</th>
                            <th className="py-2 px-2 font-medium">☕</th>
                            <th className="py-2 px-2 font-medium">📱</th>
                          </tr>
                        </thead>
                        <tbody>
                          {perDateStats.map(s => {
                            const dt = new Date(s.date + 'T00:00:00');
                            return (
                              <tr key={s.date} className="border-b border-white/5">
                                <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td>
                                <td className="py-2.5 px-2 text-center font-bold" style={{ color: s.avgSleep >= 7 ? TEAL : ORANGE }}>{s.avgSleep.toFixed(1)}h</td>
                                <td className="py-2.5 px-2 text-center">{ENERGY[Math.min(4, Math.max(0, Math.round(s.avgEnergy) - 1))].emoji}</td>
                                <td className="py-2.5 px-2 text-center">{s.avgWakeUps.toFixed(0)}x</td>
                                <td className="py-2.5 px-2 text-center">{s.caffeinePct > 0 ? '☕' : '✅'}</td>
                                <td className="py-2.5 px-2 text-center">{s.screensPct > 0 ? '📱' : '✅'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Energy & Activity */}
                <div className="p-5 rounded-[20px]" style={{ background: CARD }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#E9C46A33' }}>⚡</div>
                    <div><p className="text-white font-semibold">Energy & Activity</p><p className="text-white/40 text-[13px]">Your sleep patterns</p></div>
                  </div>
                  <div className="flex">
                    <MiniStat emoji="⚡" value={`${filteredSummary.avgEnergy.toFixed(1)}/5`} label="Energy" />
                    <div className="w-px bg-white/10 mx-1" />
                    <MiniStat emoji="📊" value={`${filteredSummary.count}`} label="Logs" />
                    <div className="w-px bg-white/10 mx-1" />
                    <MiniStat emoji="⏰" value={`${filteredSummary.avgWakeUps.toFixed(1)}`} label="Wake-ups" />
                  </div>
                </div>

                {/* Habits */}
                <div className="p-5 rounded-[20px]" style={{ background: CARD }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>📋</div>
                    <div><p className="text-white font-semibold">Sleep Habits</p><p className="text-white/40 text-[13px]">How your habits affect sleep</p></div>
                  </div>
                  <HabitRow emoji="☕" label="Caffeine before bed" pct={filteredSummary.caffeinePct} />
                  <div className="h-3" />
                  <HabitRow emoji="📱" label="Screens in bed" pct={filteredSummary.screensPct} />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Reminder Modal ── */}
      {/* Reminder Modal — centered within sleep tracker content */}
      {showReminder && (
        <div className="absolute inset-0 z-[9999] flex items-start justify-center pt-16 bg-black/60 p-4" onClick={() => setShowReminder(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: '#252840' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔔</span>
              <h3 className="text-white text-xl font-bold">Sleep Reminder</h3>
            </div>
            <p className="text-white/50 text-sm mb-5">Get a reminder to log your sleep</p>

            <div className="flex items-center justify-between p-4 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white text-[15px] font-medium">Enable Reminder</span>
              <button onClick={() => setRemEnabled(!remEnabled)} className="w-12 h-7 rounded-full relative transition-all" style={{ background: remEnabled ? TEAL : 'rgba(255,255,255,0.1)' }}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${remEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-white text-[15px] font-medium">Reminder Time</span>
              <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)}
                className="bg-transparent text-lg font-bold outline-none [color-scheme:dark]" style={{ color: TEAL }} />
            </div>

            <p className="text-white/50 text-xs mb-2">Schedule dates (optional)</p>
            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <label className="text-white/40 text-[11px]">From</label>
                <input type="date" value={remStart} onChange={e => setRemStart(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm outline-none border border-white/10 [color-scheme:dark]" style={{ background: 'rgba(255,255,255,0.05)', color: TEAL }} />
              </div>
              <div className="flex-1">
                <label className="text-white/40 text-[11px]">To</label>
                <input type="date" value={remEnd} onChange={e => setRemEnd(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm outline-none border border-white/10 [color-scheme:dark]" style={{ background: 'rgba(255,255,255,0.05)', color: TEAL }} />
              </div>
            </div>

            <button onClick={saveReminder} disabled={savingReminder} className="w-full py-4 rounded-2xl text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, #3498DB)` }}>
              {savingReminder ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function Card({ emoji, title, subtitle, children }: { emoji: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-5 rounded-[20px]" style={{ background: CARD }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>{emoji}</div>
        <div><p className="text-white font-semibold">{title}</p><p className="text-white/50 text-[13px]">{subtitle}</p></div>
      </div>
      {children}
    </div>
  );
}

function YesNoCard({ emoji, title, subtitle, value, onChange }: { emoji: string; title: string; subtitle: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Card emoji={emoji} title={title} subtitle={subtitle}>
      <div className="flex gap-3">
        <button onClick={() => onChange(false)} className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition ${!value ? 'text-white' : 'text-white/40'}`} style={{ background: !value ? TEAL : 'rgba(255,255,255,0.05)' }}>
          {!value ? '🚫 ' : ''}Nope!
        </button>
        <button onClick={() => onChange(true)} className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition ${value ? 'text-white' : 'text-white/40'}`} style={{ background: value ? ORANGE : 'rgba(255,255,255,0.05)' }}>
          {value ? `${emoji} ` : ''}Yeah...
        </button>
      </div>
    </Card>
  );
}

function Pill({ emoji, text, bg }: { emoji: string; text: string; bg: string }) {
  return <span className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs text-white font-semibold" style={{ background: bg }}>{emoji} {text}</span>;
}

function EmptyDark({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return <div className="flex flex-col items-center justify-center py-20"><span className="text-[56px] mb-4">{emoji}</span><p className="text-lg font-bold text-white mb-2">{title}</p><p className="text-[13px] text-white/40">{subtitle}</p></div>;
}

function MiniStat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return <div className="flex-1 text-center"><span className="text-xl">{emoji}</span><p className="text-white text-xl font-bold mt-1">{value}</p><p className="text-white/40 text-[11px]">{label}</p></div>;
}

function HabitRow({ emoji, label, pct }: { emoji: string; label: string; pct: number }) {
  const color = pct > 50 ? ORANGE : TEAL;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-white text-sm font-medium">{label}</span>
          <span className="text-sm font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

