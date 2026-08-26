import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, ChevronLeft, Lightbulb } from 'lucide-react';
import Lottie from 'lottie-react';
import LottieLoader from '@/components/shared/LottieLoader';

interface Analytics {
  id: string; cycle: string; updatedAt: string; testsCompleted: number;
  rawScores: Record<string, number>; normalizedScores: Record<string, number>;
  bandLabels: Record<string, string>; bandColors: Record<string, string>;
  reportView: string; reportDownload: string;
}

export default function Results() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [courses, setCourses] = useState<{id: string; title: string; category: string; courseLink: string}[]>([]);
  const [allTestsDone, setAllTestsDone] = useState(false);
  const navigate = useNavigate();
  useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/analytics');
        setAnalytics(res.data.data || []);
      } catch { }
      try {
        const res = await api.get('/users/get-all-courses');
        if (res.data?.success) setCourses(res.data.data || []);
      } catch { }
      // Check if all tests are completed. Same host/DB as the write
      // (update-test-score) - the scoring service's /api/testnames is a
      // separate service and can lag behind a just-completed write.
      try {
        const r = await api.get('/users/test-status');
        if (Array.isArray(r.data) && r.data.length > 0 && r.data.every((t: any) => t.testStatus === 'COMPLETED')) setAllTestsDone(true);
      } catch { }
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    })();
  }, []);

  if (loading) return <LottieLoader text="Loading your reports..." />;

  const selected = analytics[selectedIdx];
  const scores = selected?.normalizedScores || selected?.rawScores || {};
  const bandLabels = selected?.bandLabels || {};
  const bandColors = selected?.bandColors || {};
  const barData = Object.entries(scores).map(([key, value]) => ({ title: key, value: Number(value) || 0 }));

  // ── Empty State ──
  if (analytics.length === 0) {
    // All tests are done but no cycle came back — the report exists but is
    // still awaiting clinician/admin release, not "nothing completed yet".
    if (allTestsDone) {
      return (
        <div className="flex items-center justify-center min-h-[80vh] font-['Poppins']">
          <div className="text-center px-8 max-w-sm">
            <MeditationLottie />
            <h2 className="text-[22px] font-bold text-black mb-3">Report Under Review</h2>
            <p className="text-sm text-[#808080] leading-relaxed mb-6">
              Your clinician is reviewing your results. Your report will appear here as soon as it&apos;s shared with you.
            </p>
            <div className="bg-[#8B2D6C]/10 rounded-2xl p-4 flex items-start gap-3 text-left">
              <Lightbulb className="w-6 h-6 text-[#8B2D6C] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#8B2D6C] font-medium">
                No action needed — check back soon or refresh this page.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-[80vh] font-['Poppins']">
        <div className="text-center px-8 max-w-sm">
          <MeditationLottie />
          <h2 className="text-[22px] font-bold text-black mb-3">No Reports Yet</h2>
          <p className="text-sm text-[#808080] leading-relaxed mb-6">
            Complete your wellness assessments to see your personalized reports and insights here.
          </p>
          <div className="bg-[#8B2D6C]/10 rounded-2xl p-4 flex items-start gap-3 text-left">
            <Lightbulb className="w-6 h-6 text-[#8B2D6C] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#8B2D6C] font-medium">
              Start a test from the home screen to begin tracking your wellness journey.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Poppins'] bg-white">
      <div className="max-w-lg mx-auto px-2.5 sm:px-6 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-[#8B2D6C]/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#8B2D6C]" />
          </button>
          <h1 className="text-xl font-bold text-black">Reports</h1>
          <div className="w-10" />
        </div>

        {/* Cycle dropdown */}
        <div className="px-2.5 sm:px-0 mb-5">
          <select
            className="w-full rounded-2xl px-4 py-3 bg-[#F6F2F7] text-base border-0 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C] appearance-none"
            value={selectedIdx}
            onChange={e => { setSelectedIdx(+e.target.value); setAnimated(false); setTimeout(() => setAnimated(true), 50); }}
          >
            {analytics.map((a, i) => (
              <option key={a.id} value={i}>Assessment cycle {a.cycle || i + 1}</option>
            ))}
          </select>
        </div>

        {/* Cycle summary card — matches app's gradient card in StatisticsScreen */}
        {selected && (
          <div className="px-2.5 sm:px-0 mb-5">
            <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
              <div className="flex items-center gap-3">
                {/* assessment_rounded icon — square with bar chart bars, matches app */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{selected.cycle ? `Assessment ${selected.cycle}` : 'Assessment Cycle'}</p>
                  {selected.updatedAt && <p className="text-white/70 text-xs mt-0.5">{new Date(selected.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <span className="text-white font-semibold text-sm">{selected.testsCompleted ?? 0}/5</span>
              </div>
            </div>
          </div>
        )}

        {/* Overall Wellness card — matches app: purple gradient, large ring left, text right */}
        {barData.length > 0 && (() => {
          const avg = Math.round(barData.reduce((s, d) => s + d.value, 0) / barData.length);
          const r = 46; const circ = 2 * Math.PI * r;
          return (
            <div className="px-2.5 sm:px-0 mb-5">
              <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
                {/* Circular progress ring — 120×120 matching app */}
                <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                    <circle cx="60" cy="60" r={r} stroke="white" strokeWidth="8" fill="none"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - avg / 100)}
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="32" fill="white" fontWeight="bold">{avg}</text>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-[11px] font-semibold tracking-wider uppercase mb-1">Overall Wellness</p>
                  <p className="text-white text-2xl font-bold font-['Urbanist']">{avg}%</p>
                  <p className="text-white/70 text-xs mt-1">Normalized across all 5 scales</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tests completed */}
        <div className="px-2.5 sm:px-0">
          <p className="text-sm text-[#6C7278]">{selected?.testsCompleted ?? 0} of 5 tests completed</p>
          <div className="flex gap-2 mt-2.5 mb-[30px]">
            {[0, 1, 2, 3, 4].map(i => (
              <CheckCircle key={i} className={`w-7 h-7 sm:w-8 sm:h-8 ${(selected?.testsCompleted ?? 0) > i ? 'text-green-500' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mb-[30px]">
          {barData.length > 0 ? (
            <AnimatedBarChart data={barData} labels={bandLabels} colors={bandColors} animated={animated} />
          ) : (
            <div className="h-[220px] sm:h-[260px] flex items-center justify-center rounded-2xl bg-gray-50">
              <p className="text-sm text-gray-400">Complete tests to see your scores here</p>
            </div>
          )}
        </div>

        {/* Short Report CTA — matches app exactly */}
        <div className="px-2.5 sm:px-0">
          {selected?.reportView ? (
            <button
              onClick={async () => {
                try {
                  const res = await api.get('/users/analytics');
                  const freshData = res.data.data || [];
                  const fresh = freshData[selectedIdx];
                  const url = fresh?.reportView || selected.reportView;
                  window.open(url, '_blank');
                } catch {
                  window.open(selected.reportView, '_blank');
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-base hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download full report
            </button>
          ) : (selected?.testsCompleted ?? 0) > 0 && (
            /* Report generating indicator — matches app's orange spinner */
            <div className="w-full px-4 py-3.5 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)' }}>
              <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
              <p className="text-sm font-medium" style={{ color: '#e65100' }}>Your report is being generated. Pull down to refresh.</p>
            </div>
          )}

          {/* Zenomi Learn Courses Card - only when all tests done */}
          {allTestsDone && (
          <div className="rounded-[20px] overflow-hidden mt-[30px]" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.15] flex items-center justify-center text-xl">🎓</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-[15px] sm:text-[17px] font-['Urbanist']">Zenomi Learn Courses</h3>
                  <p className="text-white/50 text-[11px] sm:text-xs">Curated for your wellness journey</p>
                </div>
                {courses.length > 0 && <div className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold">{courses.length}</div>}
              </div>
              {courses.length > 0 && (
                <div className="space-y-2 mb-4">
                  {courses.map((course) => (
                    <a key={course.id} href={course.courseLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-white/10 hover:bg-white/[0.15] transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{course.title}</p>
                        <p className="text-white/50 text-[11px]">{course.category}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </a>
                  ))}
                </div>
              )}
              <a href="https://zenomilearn.zenomihealth.com" target="_blank" rel="noopener noreferrer"
                className="block w-full py-3.5 rounded-[14px] bg-white text-center text-[#704180] text-sm font-bold hover:bg-gray-50 transition">
                {courses.length > 0 ? 'View All Courses →' : 'View Courses →'}
              </a>
            </div>
          </div>
          )}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}

// ── Wellness Bar Chart — matches app WellnessBarChart exactly ──
const WELLNESS_KEYS = ['Sleep', 'Nutrition', 'Emotional'];
const ANXIETY_KEYS  = ['GAD-7', 'PHQ-9'];
// Sleep and Nutrition are stored as severity scores (higher = worse), same as
// GAD-7/PHQ-9 — only Emotional is a true higher-is-better score. See
// AI-Q-A-Report/app/services/test_config.py "higher_score_is_worse".
const SEVERITY_KEYS = ['Sleep', 'Nutrition', 'GAD-7', 'PHQ-9'];

function wellnessColor(v: number) {
  if (v >= 70) return '#00C48C';
  if (v >= 50) return '#F5A623';
  return '#FF5C5C';
}
function wellnessLabel(v: number) {
  if (v >= 70) return 'Thriving';
  if (v >= 50) return 'Fair';
  return 'Needs care';
}
function severityColor(v: number) {
  if (v <= 20) return '#00C48C';
  if (v <= 45) return '#F5A623';
  if (v <= 70) return '#FF8C00';
  return '#FF5C5C';
}
function severityLabel(v: number) {
  if (v <= 20) return 'Minimal';
  if (v <= 45) return 'Mild';
  if (v <= 70) return 'Moderate';
  return 'Severe';
}
function findKey(raw: string, keys: string[]) {
  const n = raw.toLowerCase().replace(/-/g,'').replace(/_/g,'');
  return keys.find(k => k.toLowerCase().replace(/-/g,'').replace(/_/g,'') === n
    || raw.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(raw.toLowerCase()));
}

function BarSection({ title, note, legend, entries, labels, colors, animated }:
  { title: string; note: string; legend: {label:string; color:string}[];
    entries: {key:string; value:number}[]; labels: Record<string, string>; colors: Record<string, string>; animated: boolean }) {
  const BAR_H = 140;
  return (
    <div className="mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-black">{title}</span>
        <span className="text-[11px] text-gray-400">{note}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {legend.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px] text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
      {/* Chart card — white with shadow like app */}
      <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex" style={{ height: BAR_H + 24 }}>
          {/* Y-axis */}
          <div className="flex flex-col justify-between pr-2 text-[10px] text-gray-400 text-right" style={{ width: 36, height: BAR_H }}>
            {['100%','75%','50%','25%','0%'].map(l => <span key={l}>{l}</span>)}
          </div>
          {/* Bars */}
          <div className="flex-1 relative" style={{ height: BAR_H }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0,1,2,3,4].map(i => <div key={i} className="border-b" style={{ borderColor:'rgba(0,0,0,0.07)' }} />)}
            </div>
            <div className="absolute inset-0 flex items-end justify-around px-1">
              {entries.map((e, i) => {
                const v = Math.max(e.value, 0);
                const inverted = SEVERITY_KEYS.includes(e.key);
                const color = colors[e.key] ?? (inverted ? severityColor(v) : wellnessColor(v));
                // Server labels are full clinical phrases ("Mild Emotional
                // Dysregulation") — too long for this narrow column. Just
                // the first word conveys severity and matches the old short
                // label vocabulary.
                const lbl   = labels[e.key] ? labels[e.key].split(' ')[0] : (inverted ? severityLabel(v)  : wellnessLabel(v));
                const barPx = Math.max((v / 100) * BAR_H, 4);
                return (
                  <div key={e.key} className="flex flex-col items-center justify-end" style={{ width: 48 }}>
                    <span className="text-[9px] font-bold mb-1 leading-tight text-center" style={{ color }}>{lbl}</span>
                    <div className="rounded-t-lg transition-all ease-out"
                      style={{
                        width: 36, height: animated ? barPx : 2,
                        background: color,
                        boxShadow: `0 2px 4px ${color}44`,
                        transitionDuration: `${600 + i * 120}ms`,
                      }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Metric name labels */}
        <div className="flex justify-around mt-2 pl-10">
          {entries.map(e => (
            <div key={e.key} className="text-center text-[10px] font-semibold text-gray-600 leading-tight" style={{ width: 48 }}>
              {(e.key === 'Emotional' ? 'Emotional\nWellness' : e.key).split('\n').map((w, wi) => <span key={wi}>{w}<br/></span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedBarChart({ data, labels, colors, animated }: { data: { title: string; value: number }[]; labels: Record<string, string>; colors: Record<string, string>; animated: boolean }) {
  const wellnessEntries = WELLNESS_KEYS
    .map(k => { const d = data.find(x => findKey(x.title, [k])); return { key: k, value: d?.value ?? 0 }; })
    .filter(e => e.value > 0);
  const anxietyEntries  = ANXIETY_KEYS
    .map(k => { const d = data.find(x => findKey(x.title, [k])); return { key: k, value: d?.value ?? 0 }; })
    .filter(e => e.value > 0);

  return (
    <div>
      {wellnessEntries.length > 0 && (
        <BarSection title="Wellness Scores" note="Green = good, red = needs attention"
          legend={[{label:'Good',color:'#00C48C'},{label:'Fair',color:'#F5A623'},{label:'Needs attention',color:'#FF5C5C'}]}
          entries={wellnessEntries} labels={labels} colors={colors} animated={animated} />
      )}
      {anxietyEntries.length > 0 && (
        <BarSection title="Depression & Anxiety" note="Higher = more severe"
          legend={[{label:'Minimal',color:'#00C48C'},{label:'Mild',color:'#F5A623'},{label:'Moderate',color:'#FF8C00'},{label:'Severe',color:'#FF5C5C'}]}
          entries={anxietyEntries} labels={labels} colors={colors} animated={animated} />
      )}
    </div>
  );
}

// ── Meditation Lottie ──
function MeditationLottie() {
  const [animData, setAnimData] = useState<any>(null);
  useEffect(() => {
    fetch('/meditation.json').then(r => r.json()).then(setAnimData).catch(() => {});
  }, []);
  if (!animData) return <div className="h-[200px]" />;
  return <Lottie animationData={animData} loop style={{ height: 200 }} />;
}
