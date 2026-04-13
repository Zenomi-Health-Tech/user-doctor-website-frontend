import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface SleepLog { id: string; hoursOfSleep: number; energyLevel: number; caffeineBeforeBed: boolean; screensInBed: boolean; nightWakeUps: number; createdAt: string; }
interface SleepSummary { avgSleepHours: number; avgEnergy: number; logCount: number; caffeinePercentage: number; screensPercentage: number; avgNightWakeUps: number; }

const ENERGY = [{ emoji: '😴', label: 'Dead tired' }, { emoji: '😫', label: 'Sleepy' }, { emoji: '😐', label: 'Okay' }, { emoji: '🙂', label: 'Good' }, { emoji: '🚀', label: 'Super!' }];

export default function SleepTracker() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [summary, setSummary] = useState<SleepSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [hours, setHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [caffeine, setCaffeine] = useState(false);
  const [screens, setScreens] = useState(false);
  const [wakeUps, setWakeUps] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lr, sr] = await Promise.all([api.get("/users/sleep-logs?page=1&limit=30"), api.get("/users/sleep-logs/summary?days=30")]);
      const d = lr.data?.data;
      setLogs(Array.isArray(d) ? d : d?.items || d?.logs || []);
      setSummary(sr.data?.data || null);
    } catch { }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/users/sleep-logs", { hoursOfSleep: hours, energyLevel: energy, caffeineBeforeBed: caffeine, screensInBed: screens, nightWakeUps: wakeUps });
      toast({ title: "✓ Logged!", description: "Sleep log saved", className: "bg-green-500 text-white" });
      setHours(7); setEnergy(3); setCaffeine(false); setScreens(false); setWakeUps(0);
      fetchData(); setTab(1);
    } catch { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]" style={{ background: '#12121F' }}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E76F51] animate-spin" />
      </div>
    </div>
  );

  const tabs = ['Log Sleep', 'Sleep History', 'Insights'];

  return (
    <div className="min-h-screen font-['Poppins']" style={{ background: '#12121F' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-xl font-bold text-white text-center mb-5">😴 Sleep Tracker</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-full mb-6" style={{ background: '#1E1E30' }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${tab === i ? 'text-white' : 'text-white/40'}`}
              style={tab === i ? { background: 'linear-gradient(135deg, #E76F51, #9B59B6)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* Log Sleep */}
        {tab === 0 && (
          <div className="space-y-5">
            {/* Hours */}
            <div className="rounded-2xl p-5" style={{ background: '#1E1E30' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/60 text-sm">Hours of Sleep</span>
                <span className="text-2xl font-bold text-white">{hours}h</span>
              </div>
              <input type="range" min={0} max={12} step={0.5} value={hours} onChange={e => setHours(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #E76F51 ${(hours/12)*100}%, #2a2a40 ${(hours/12)*100}%)` }} />
              <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>0h</span><span>6h</span><span>12h</span></div>
            </div>

            {/* Energy */}
            <div className="rounded-2xl p-5" style={{ background: '#1E1E30' }}>
              <span className="text-white/60 text-sm block mb-3">Energy Level</span>
              <div className="flex gap-2">
                {ENERGY.map((e, i) => (
                  <button key={i} onClick={() => setEnergy(i + 1)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${energy === i + 1 ? 'ring-2 ring-[#E76F51]' : ''}`}
                    style={{ background: energy === i + 1 ? 'linear-gradient(135deg, #E76F51, #9B59B6)' : '#2a2a40' }}>
                    <span className="text-xl">{e.emoji}</span>
                    <span className="text-[9px] text-white/70 mt-1">{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#1E1E30' }}>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">☕ Caffeine before bed</span>
                <button onClick={() => setCaffeine(!caffeine)} className={`w-12 h-7 rounded-full transition-all relative ${caffeine ? 'bg-[#E76F51]' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${caffeine ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">📱 Screens in bed</span>
                <button onClick={() => setScreens(!screens)} className={`w-12 h-7 rounded-full transition-all relative ${screens ? 'bg-[#E76F51]' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${screens ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Wake-ups */}
            <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#1E1E30' }}>
              <span className="text-white/60 text-sm">Night Wake-ups</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setWakeUps(Math.max(0, wakeUps - 1))} className="w-9 h-9 rounded-full bg-white/10 text-white text-lg flex items-center justify-center">−</button>
                <span className="text-xl font-bold text-white w-6 text-center">{wakeUps}</span>
                <button onClick={() => setWakeUps(wakeUps + 1)} className="w-9 h-9 rounded-full bg-white/10 text-white text-lg flex items-center justify-center">+</button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 rounded-2xl text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #E76F51, #9B59B6)' }}>
              {submitting ? 'Saving...' : 'Log Sleep 🌙'}
            </button>
          </div>
        )}

        {/* History */}
        {tab === 1 && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-white/30">No sleep logs yet</div>
            ) : logs.map(log => (
              <div key={log.id} className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1E1E30' }}>
                <div>
                  <div className="text-white text-sm font-medium">{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  <div className="text-white/40 text-xs mt-0.5">{log.hoursOfSleep}h · {ENERGY[log.energyLevel - 1]?.emoji || '😐'} · {log.nightWakeUps} wake-ups</div>
                </div>
                <div className="flex gap-1.5">
                  {log.caffeineBeforeBed && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">☕</span>}
                  {log.screensInBed && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">📱</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {tab === 2 && (
          <div className="space-y-4">
            {!summary || summary.logCount === 0 ? (
              <div className="text-center py-16 text-white/30">Log some sleep to see insights</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: `${summary.avgSleepHours?.toFixed(1)}h`, label: 'Avg Sleep', icon: '😴' },
                    { val: `${summary.avgEnergy?.toFixed(1)}/5`, label: 'Avg Energy', icon: '⚡' },
                    { val: `${summary.avgNightWakeUps?.toFixed(1)}`, label: 'Avg Wake-ups', icon: '🌙' },
                    { val: `${summary.logCount}`, label: 'Total Logs', icon: '📊' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-4 text-center" style={{ background: '#1E1E30' }}>
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-white">{s.val}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4" style={{ background: '#1E1E30' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs">☕ Caffeine Days</span>
                      <span className="text-white font-bold text-sm">{summary.caffeinePercentage?.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-[#E76F51]" style={{ width: `${summary.caffeinePercentage || 0}%` }} />
                    </div>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: '#1E1E30' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs">📱 Screen Days</span>
                      <span className="text-white font-bold text-sm">{summary.screensPercentage?.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-[#9B59B6]" style={{ width: `${summary.screensPercentage || 0}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
