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
      // Check if all tests are completed
      try {
        const Cookies = (await import('js-cookie')).default;
        const authCookie = Cookies.get('auth');
        let token = ''; if (authCookie) { try { token = JSON.parse(authCookie).token; } catch { } }
        if (token) {
          const axios = (await import('axios')).default;
          const r = await axios.get('https://zenomiai.elitceler.com/api/testnames', { headers: { Authorization: `Bearer ${token}` } });
          if (Array.isArray(r.data) && r.data.length > 0 && r.data.every((t: any) => t.testStatus === 'COMPLETED')) setAllTestsDone(true);
        }
      } catch { }
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    })();
  }, []);

  if (loading) return <LottieLoader text="Loading your reports..." />;

  const selected = analytics[selectedIdx];
  const scores = selected?.normalizedScores || selected?.rawScores || {};
  const barData = Object.entries(scores).map(([key, value]) => ({ title: key, value: Number(value) || 0 }));

  // ── Empty State ──
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

        {/* Report content */}
        <div className="px-2.5 sm:px-0">
          <h2 className="text-lg font-bold text-black">Your Wellness Report</h2>
          {selected?.updatedAt && (
            <p className="text-xs text-[#808080] font-medium mt-1">
              Last Updated: {new Date(selected.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}

          {/* Tests completed */}
          <p className="text-sm text-[#6C7278] mt-6">{selected?.testsCompleted ?? 0} of 5 tests completed</p>
          <div className="flex gap-2 mt-2.5 mb-[30px]">
            {[0, 1, 2, 3, 4].map(i => (
              <CheckCircle key={i} className={`w-7 h-7 sm:w-8 sm:h-8 ${(selected?.testsCompleted ?? 0) > i ? 'text-green-500' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mb-[30px]">
          {barData.length > 0 ? (
            <AnimatedBarChart data={barData} animated={animated} />
          ) : (
            <div className="h-[220px] sm:h-[260px] flex items-center justify-center rounded-2xl bg-gray-50">
              <p className="text-sm text-gray-400">Complete tests to see your scores here</p>
            </div>
          )}
        </div>

        {/* Download Report */}
        <div className="px-2.5 sm:px-0">
          {selected?.reportView && (
            <button
              onClick={async () => {
                try {
                  const res = await api.get('/users/analytics');
                  const freshData = res.data.data || [];
                  const fresh = freshData[selectedIdx];
                  const url = fresh?.reportView || selected.reportView;
                  // Test if URL is accessible before opening
                  const check = await fetch(url, { method: 'HEAD' }).catch(() => null);
                  if (check && check.ok) {
                    window.open(url, '_blank');
                  } else {
                    alert('Your report is still being generated. Please check back in a few minutes.');
                  }
                } catch {
                  alert('Your report is still being generated. Please check back in a few minutes.');
                }
              }}
              className="block w-full py-3 rounded-full text-white font-medium text-base text-center hover:opacity-90 transition"
              style={{ background: '#704180' }}
            >
              Download Report
            </button>
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

// ── Animated Bar Chart ──
function AnimatedBarChart({ data, animated }: { data: { title: string; value: number }[]; animated: boolean }) {
  const chartH = 220;
  return (
    <div>
      <div className="flex">
        <div className="flex flex-col justify-between pr-2 text-[10px] text-black font-normal w-10 text-right" style={{ height: chartH }}>
          {[100, 75, 50, 25, 0].map(v => <span key={v}>{v.toFixed(1)}</span>)}
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-b border-blue-200/30" />)}
          </div>
          <div className="flex items-end gap-1.5 sm:gap-2 px-1 relative z-10" style={{ height: chartH }}>
            {data.map((bar, i) => {
              const pct = Math.max((bar.value / 100), 0.01);
              return (
                <div key={bar.title} className="flex-1 flex justify-center items-end" style={{ height: '100%' }}>
                  <div className="w-full max-w-[18px] sm:max-w-[22px] rounded-t-full transition-all ease-out"
                    style={{
                      height: animated ? `${pct * 100}%` : '1px',
                      background: 'linear-gradient(to bottom, #704180, #8B2D6C)',
                      transitionDuration: `${500 + i * 100}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#A3A3A3]" />
        </div>
      </div>
      <div className="flex ml-10 mt-2">
        {data.map(bar => (
          <div key={bar.title} className="flex-1 text-center text-[9px] sm:text-[10px] text-black leading-tight px-0.5">
            {bar.title.replace('Assessment', '').trim().split(' ').map((word, wi) => <span key={wi}>{word}<br/></span>)}
          </div>
        ))}
      </div>
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
