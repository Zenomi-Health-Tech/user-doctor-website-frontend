import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface Analytics {
  id: string;
  cycle: string;
  updatedAt: string;
  testsCompleted: number;
  rawScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  reportView: string;
  reportDownload: string;
}

const COLORS = ['#8B2D6C', '#F7C569', '#00D4AA', '#6366F1', '#E74C3C'];
const LABELS: Record<string, string> = { 'Sleep': 'Sleep', 'Nutrition': 'Nutrition', 'PHQ-9': 'PHQ-9', 'GAD-7': 'GAD-7', 'Emotional Fitness': 'Emotional' };

export default function Results() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userName } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/analytics');
        setAnalytics(res.data.data || []);
      } catch { }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#F0EBF4]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B2D6C] animate-spin" />
      </div>
    </div>
  );

  const selected = analytics[selectedIdx];
  const scores = selected?.normalizedScores || {};
  const barData = Object.entries(LABELS).map(([key, label]) => ({
    label, value: scores[key] ?? 0,
  }));
  const maxBar = Math.max(...barData.map(b => b.value), 1);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-h-[80vh] font-['Poppins'] bg-white">
      {/* Main */}
      <div className="flex-1 max-w-3xl">
        <h1 className="text-2xl font-bold mb-1">📊 Your Results</h1>
        <p className="text-sm text-gray-500 mb-6">Track your wellness journey across cycles</p>

        {analytics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Complete all your assessments to see your personalized results here.</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 rounded-full text-white text-sm font-semibold" style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>Go to Assessments</button>
          </div>
        ) : (
          <>
            {/* Cycle selector */}
            {analytics.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {analytics.map((a, i) => (
                  <button key={a.id} onClick={() => setSelectedIdx(i)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${i === selectedIdx ? 'bg-[#8B2D6C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Cycle {a.cycle}
                  </button>
                ))}
              </div>
            )}

            {/* Score card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Cycle {selected?.cycle}</h3>
                  <p className="text-xs text-gray-400">{selected?.testsCompleted} of 5 tests · Updated {new Date(selected?.updatedAt || '').toLocaleDateString()}</p>
                </div>
                {selected?.reportView && (
                  <a href={selected.reportView} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>
                    Download Report
                  </a>
                )}
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-3 sm:gap-6 h-48 mt-6 px-2">
                {barData.map((bar, i) => {
                  const height = maxBar > 0 ? (bar.value / 100) * 100 : 0;
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-700">{bar.value > 0 ? Math.round(bar.value) : ''}</span>
                      <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(height, 4)}%`, background: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] text-gray-500 mt-1 text-center">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4">
        {/* Book therapy */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
          <div className="p-5 text-white">
            <div className="text-lg font-bold mb-1">Need to talk?</div>
            <p className="text-white/70 text-sm mb-4">Book a session with a mental health expert</p>
            <button onClick={() => navigate('/appointments')} className="px-5 py-2 rounded-full bg-white text-[#8B2D6C] text-sm font-semibold hover:bg-gray-100 transition">Book Appointment →</button>
          </div>
        </div>
        {/* Welcome card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Welcome, <span className="text-[#8B2D6C]">{userName || 'there'}</span> 👋</h3>
          <p className="text-xs text-gray-400">Your wellness journey is tracked here. Complete all tests to unlock your full report.</p>
        </div>
      </div>
    </div>
  );
}
