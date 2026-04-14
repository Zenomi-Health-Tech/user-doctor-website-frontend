import { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, ChevronLeft, Lightbulb } from 'lucide-react';
import Lottie from 'lottie-react';
import LottieLoader from '@/components/shared/LottieLoader';

interface Analytics {
  id: string; cycle: string; updatedAt: string; testsCompleted: number;
  rawScores: Record<string, number>; normalizedScores: Record<string, number>;
  reportView: string; reportDownload: string;
}

export default function Results() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const navigate = useNavigate();
  const { userName } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/analytics');
        setAnalytics(res.data.data || []);
      } catch { }
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    })();
  }, []);

  if (loading) return <LottieLoader text="Loading your reports..." />;

  const selected = analytics[selectedIdx];
  const scores = selected?.normalizedScores || {};
  const barData = Object.entries(scores).map(([key, value]) => ({ title: key, value: value as number }));

  // ── Empty State — matches app's Lottie + "No Reports Yet" ──
  if (analytics.length === 0) {
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

  // ── Stats UI — matches app's StatisticsScreen ──
  return (
    <div className="min-h-screen font-['Poppins'] bg-white">
      {/* Header: back + "Reports" */}
      <div className="px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-[#8B2D6C]/20 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#8B2D6C]" />
        </button>
        <h1 className="text-xl font-bold text-black">Reports</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 sm:px-6 pb-8">
        {/* Cycle dropdown */}
        <select
          className="w-full rounded-2xl px-4 py-3 bg-[#F6F2F7] text-base border-0 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C] mb-5 appearance-none"
          value={selectedIdx}
          onChange={e => { setSelectedIdx(+e.target.value); setAnimated(false); setTimeout(() => setAnimated(true), 50); }}
        >
          {analytics.map((a, i) => (
            <option key={a.id} value={i}>Assessment cycle {a.cycle || i + 1}</option>
          ))}
        </select>

        {/* "Your Wellness Report" + date */}
        <h2 className="text-lg font-bold text-black">Your Wellness Report</h2>
        {selected?.updatedAt && (
          <p className="text-xs text-[#808080] font-medium mt-1">
            Last Updated: {new Date(selected.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {/* Tests completed: "X of 5 tests completed" + check circles */}
        <p className="text-sm text-[#6C7278] mt-6">{selected?.testsCompleted ?? 0} of 5 tests completed</p>
        <div className="flex gap-2 mt-2.5 mb-8">
          {[0, 1, 2, 3, 4].map(i => (
            <CheckCircle key={i} className={`w-8 h-8 ${(selected?.testsCompleted ?? 0) > i ? 'text-green-500' : 'text-gray-300'}`} />
          ))}
        </div>

        {/* Animated Bar Chart — matches app's CustomBarGraph with gradient animated bars */}
        <div className="bg-white rounded-2xl p-4 mb-6">
          <AnimatedBarChart data={barData} animated={animated} />
        </div>

        {/* Download Report button */}
        {selected?.reportView && (
          <a
            href={selected.reportView}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-xl text-white font-semibold text-base text-center hover:opacity-90 transition"
            style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}
          >
            Download Report
          </a>
        )}

        {/* Recommended Courses */}
        <div className="mt-8">
          <h3 className="text-base font-medium text-black mb-3">Recommended Courses</h3>
          <div className="bg-gray-100 rounded-xl py-6 px-4 flex flex-col items-center text-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
            </svg>
            <p className="text-gray-600 font-medium">Your Doctor will suggest some courses soon</p>
            <p className="text-gray-500 text-[10px] mt-2">Check back later for personalized recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Animated Bar Chart — gradient bars that grow from 0 ──

function AnimatedBarChart({ data, animated }: { data: { title: string; value: number }[]; animated: boolean }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;

  return (
    <div>
      {/* Y-axis labels + bars */}
      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-[200px] pr-2 text-[10px] text-black font-normal w-10 text-right">
          {[100, 75, 50, 25, 0].map(v => <span key={v}>{v.toFixed(1)}</span>)}
        </div>
        {/* Bars area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-b border-blue-200/30" />)}
          </div>
          {/* Bars */}
          <div className="flex items-end justify-between h-[200px] gap-2 px-1 relative z-10">
            {data.map((bar, i) => {
              const pct = (bar.value / 100) * 100;
              return (
                <div key={bar.title} className="flex-1 flex flex-col items-center">
                  <div className="w-full max-w-[22px] mx-auto rounded-t-full transition-all ease-out"
                    style={{
                      height: animated ? `${Math.max(pct, 1)}%` : '1%',
                      background: 'linear-gradient(to bottom, #704180, #8B2D6C)',
                      transitionDuration: `${500 + i * 100}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {/* Bottom border */}
          <div className="border-t border-[#A3A3A3]" />
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex ml-10 mt-2">
        {data.map(bar => (
          <div key={bar.title} className="flex-1 text-center text-[10px] text-black leading-tight px-0.5">
            {bar.title.replace('Assessment', '').trim()}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Meditation Lottie — fetches from public folder ──

function MeditationLottie() {
  const [animData, setAnimData] = useState<any>(null);
  useEffect(() => {
    fetch('/meditation.json').then(r => r.json()).then(setAnimData).catch(() => {});
  }, []);
  if (!animData) return <div className="h-[200px]" />;
  return <Lottie animationData={animData} loop style={{ height: 200 }} />;
}
