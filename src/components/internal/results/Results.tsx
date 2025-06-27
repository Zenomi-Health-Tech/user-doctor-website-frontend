import topresultimage from '@/assets/topResultImage.png'
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';

interface Analytics {
  id: string;
  cycle: string;
  updatedAt: string;
  createdAt: string;
  testsCompleted: number;
  rawScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  reportView: string;
  reportDownload: string;
  courseRecommendations: {
    courseName: string;
    courseLink: string;
  }[];
}

export default function Results() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [openCycle, setOpenCycle] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await api.get('/users/analytics');
      setAnalytics(res.data.data);
    }
    fetchAnalytics();
  }, []);

  const checklist = [
    "Start Your Daily Mental Health Check-In",
    "Review Your Recent Test Results",
    "Talk to a Mental Health Expert",
  ];

  return (
    <div className="flex gap-8 p-8 bg-gray-50 min-h-screen ">
      {/* Left Column */}
      <div className="flex-1 max-w-[700px] font-['Urbanist'] flex flex-col">
        {analytics.length === 0 ? (
          <div>No results found.</div>
        ) : (
          analytics.map((result) => {
            const barData = [
              { label: "Sleep", value: result.normalizedScores?.Sleep },
              { label: "Nutrition", value: result.normalizedScores?.Nutrition },
              { label: "PHQ-9", value: result.normalizedScores?.["PHQ-9"] },
              { label: "Emotional-H", value: result.normalizedScores?.["Emotional Intelligence"] },
              { label: "GAD-7", value: result.normalizedScores?.["GAD-7"] },
            ];
            const lastUpdated = new Date(result.updatedAt).toLocaleDateString();
            const testsCompleted = result.testsCompleted;
            const isOpen = openCycle === result.id;
            return (
              <div key={result.id} className="mb-6 border rounded-2xl bg-white shadow-sm">
                {/* Accordion Header */}
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                  onClick={() => setOpenCycle(isOpen ? null : result.id)}
                >
                  <span className="font-semibold text-lg">Cycle {result.cycle}</span>
                  <span className="text-gray-500 text-sm">Last Updated: {lastUpdated}</span>
                  <span className="ml-4 text-2xl">{isOpen ? '▲' : '▼'}</span>
                </button>
                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base font-medium">{testsCompleted} of 3 tests completed</span>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4E8041] text-white text-lg">✔</span>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4E8041] text-white text-lg">✔</span>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-400 text-lg">✔</span>
                    </div>
                    {/* Bar Chart */}
                    <div className="rounded-2xl p-6 mb-6 min-h-[400px] flex items-center justify-center" style={{ boxShadow: '0px 6.58px 6.58px 0px #00000040' }}>
                      <svg width="700" height="400" viewBox="0 0 700 400">
                        {/* Y axis grid lines */}
                        {[0, 2, 4, 6, 8, 10].map((y) => (
                          <line
                            key={y}
                            x1={60}
                            x2={660}
                            y1={360 - y * 32}
                            y2={360 - y * 32}
                            stroke="#E5E0EA"
                            strokeWidth={1}
                          />
                        ))}
                        {/* Bars */}
                        {barData.map((bar, i) => (
                          <g key={bar.label}>
                            <rect
                              x={90 + i * 110}
                              y={360 - (bar.value ?? 0) * 32}
                              width={60}
                              height={(bar.value ?? 0) * 32}
                              rx={18}
                              fill="url(#barGradient)"
                            />
                            <text
                              x={120 + i * 110}
                              y={360 - (bar.value ?? 0) * 32 - 16}
                              textAnchor="middle"
                              fontSize="22"
                              fill="#704180"
                              fontWeight="bold"
                            >
                              {(bar.value ?? 0) > 0 ? bar.value : ''}
                            </text>
                            <text
                              x={120 + i * 110}
                              y={390}
                              textAnchor="middle"
                              fontSize="20"
                              fill="#231942"
                              fontWeight="400"
                            >
                              {bar.label}
                            </text>
                          </g>
                        ))}
                        {/* Y axis labels */}
                        {[0, 2, 4, 6, 8, 10].map((y) => (
                          <text
                            key={y}
                            x={50}
                            y={360 - y * 32 + 10}
                            fontSize="18"
                            fill="#231942"
                            textAnchor="end"
                            fontWeight="600"
                          >
                            {y < 10 ? `0${y}` : y}
                          </text>
                        ))}
                        {/* Gradient */}
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#704180" />
                            <stop offset="95%" stopColor="#8B2D6C" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* Recommended Courses */}
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold mb-3">Recommended Courses</h3>
                      <div className="flex flex-col gap-3">
                        {result.courseRecommendations && result.courseRecommendations.length > 0 ? (
                          result.courseRecommendations.map((course, idx) => (
                            <div key={idx} className="flex items-center bg-white rounded-xl shadow p-4 max-w-lg border border-gray-100">
                              <div className="flex-1">
                                <div className="font-bold text-base mb-1">{course.courseName}</div>
                                <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                                  <a href={course.courseLink.split(',')[0]} target="_blank" rel="noopener noreferrer" className="text-[#704180] font-semibold text-sm underline">Go to Course</a>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No course recommendations.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Right Column */}
      <div className="w-[350px] flex flex-col gap-6 font-['Poppins']">
        {/* Therapist Card */}
        <div className="bg-white rounded-3xl shadow p-6 flex flex-col items-center border border-[#BCBCBC]">
          <img src={topresultimage} alt="Therapist" className="w-52 h-32 object-cover rounded-xl mb-4" />
          <div className="font-semibold text-lg mb-1 text-center">Talk to a therapist?</div>
          <div className="text-gray-500 text-center mb-4">Book your session now</div>
          <button onClick={() => navigate('/appointments/set-availability-user')} className="px-6 py-2 rounded-full font-medium text-base text-white" style={{background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)'}}>Book now</button>
        </div>
        {/* Checklist Card */}
        <div className="bg-white rounded-3xl shadow p-8 flex flex-col items-center border border-[#BCBCBC]">
          {/* Circular Progress */}
          <div className="mb-4">
            <svg width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#E5E0EA"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#704180"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 * (1 - 0 / 3)}
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                fontSize="1.2em"
                fill="#704180"
                fontWeight="bold"
              >
                0/3
              </text>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-center">Welcome to Zenomi ,<span className="text-[#8B2D6C]">Lily</span></h3>
          <p className="text-gray-500 text-center mb-6">Experience your AHA! moment by completing this simple steps</p>
          <ul className="w-full space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
                <span>{item}</span>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400">✔️</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}