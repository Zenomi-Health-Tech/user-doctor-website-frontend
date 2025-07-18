import topresultimage from '@/assets/topResultImage.png'
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import tickmark from "@/assets/tickmark.svg"

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
  const { userName } = useAuth();

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await api.get('/users/analytics');
      setAnalytics(res.data.data);
    }
    fetchAnalytics();
  }, []);

  console.log(analytics);
  

  const checklist = [
    "Start Your Daily Mental Health Check-In",
    "Review Your Recent Test Results",
    "Talk to a Mental Health Expert",
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 p-2 sm:p-4 md:p-8 bg-gray-50 min-h-screen ">
      {/* Left Column */}
      <div className="flex-1 w-full max-w-full lg:max-w-[700px] font-['Urbanist'] flex flex-col">
        {analytics.length === 0 ? (
          <div>No results found.</div>
        ) : (
          analytics.map((result) => {
            let barData = [
              { label: "Sleep", value: result.normalizedScores?.Sleep },
              { label: "Nutrition", value: result.normalizedScores?.Nutrition },
              { label: "PHQ-9", value: result.normalizedScores?.["PHQ-9"] },
              { label: "Emotional-H", value: result.normalizedScores?.["Emotional Fitness"] },
              { label: "GAD-7", value: result.normalizedScores?.["GAD-7"] },
            ];
            // Ensure values are 0-100
            barData = barData.map(bar => ({
              ...bar,
              value: typeof bar.value === 'number' ? bar.value : 0
            }));
            const lastUpdated = new Date(result.updatedAt).toLocaleDateString();
            const testsCompleted = result.testsCompleted;
            const isOpen = openCycle === result.id;
            return (
              <div key={result.id} className="mb-4 sm:mb-6 border rounded-2xl bg-white shadow-sm">
                {/* Accordion Header */}
                <button
                  className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-4 text-left focus:outline-none"
                  onClick={() => setOpenCycle(isOpen ? null : result.id)}
                >
                  <span className="font-semibold text-base sm:text-lg">Cycle {result.cycle}</span>
                  <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">Last Updated: {lastUpdated}</span>
                  <span className="ml-0 sm:ml-4 text-lg sm:text-2xl">{isOpen ? '▲' : '▼'}</span>
                </button>
                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-2 sm:px-6 pb-4 sm:pb-6 pt-2">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-sm sm:text-base font-medium">{testsCompleted} of 5 tests completed</span>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-base sm:text-lg ${idx < testsCompleted ? 'bg-[#4E8041] text-white' : 'bg-gray-200 text-gray-400'}`}
                        >
                          <img src={tickmark} alt="tickmark" />
                        </span>
                      ))}
                    </div>
                    {/* Bar Chart */}
                    <div className="rounded-2xl p-2 sm:p-6 mb-4 sm:mb-6 min-h-[220px] sm:min-h-[400px] flex items-center justify-center overflow-x-auto">
                      <div className="w-[420px] sm:w-[700px]">
                        <svg width="100%" height="220" viewBox="0 0 700 220" className="hidden sm:block">
                          {/* Y axis grid lines */}
                          {[0, 20, 40, 60, 80, 100].map((y) => (
                            <line
                              key={y}
                              x1={60}
                              x2={660}
                              y1={200 - y * 2}
                              y2={200 - y * 2}
                              stroke="#E5E0EA"
                              strokeWidth={1}
                            />
                          ))}
                          {/* Bars */}
                          {barData.map((bar, i) => {
                            let barColor = '#4E8041'; // green
                            if (bar.value > 60) barColor = '#E74C3C'; // red
                            else if (bar.value > 40) barColor = '#F6C851'; // yellow
                            return (
                              <g key={bar.label}>
                                <rect
                                  x={90 + i * 110}
                                  y={200 - bar.value * 2}
                                  width={40}
                                  height={bar.value * 2}
                                  rx={12} // Slightly rounded ends
                                  fill={barColor}
                                />
                                <text
                                  x={120 + i * 110}
                                  y={200 - bar.value * 2 - 10}
                                  textAnchor="middle"
                                  fontSize="16"
                                  fill="#704180"
                                  fontWeight="bold"
                                >
                                  {/* {bar.value > 0 ? Math.round(bar.value) : ''} */}
                                </text>
                                <text
                                  x={110 + i * 110}
                                  y={220}
                                  textAnchor="middle"
                                  fontSize="14"
                                  fill="#231942"
                                  fontWeight="400"
                                >
                                  {bar.label}
                                </text>
                              </g>
                            );
                          })}
                          {/* Y axis labels */}
                          {[0, 20, 40, 60, 80, 100].map((y) => (
                            <text
                              key={y}
                              x={50}
                              y={200 - y * 2 + 8}
                              fontSize="12"
                              fill="#231942"
                              textAnchor="end"
                              fontWeight="600"
                            >
                              {y < 10 ? `0${y}` : y}
                            </text>
                          ))}
                        </svg>
                        {/* Mobile SVG */}
                        <svg width="100%" height="160" viewBox="0 0 420 160" className="block sm:hidden">
                          {[0, 20, 40, 60, 80, 100].map((y) => (
                            <line
                              key={y}
                              x1={40}
                              x2={400}
                              y1={140 - y * 1.2}
                              y2={140 - y * 1.2}
                              stroke="#E5E0EA"
                              strokeWidth={1}
                            />
                          ))}
                          {barData.map((bar, i) => {
                            let barColor = '#4E8041'; // green
                            if (bar.value > 60) barColor = '#E74C3C'; // red
                            else if (bar.value > 40) barColor = '#F6C851'; // yellow
                            return (
                              <g key={bar.label}>
                                <rect
                                  x={60 + i * 70}
                                  y={140 - bar.value * 1.2}
                                  width={36}
                                  height={bar.value * 1.2}
                                  rx={8} // Slightly rounded ends
                                  fill={barColor}
                                />
                                <text
                                  x={78 + i * 70}
                                  y={140 - bar.value * 1.2 - 6}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#704180"
                                  fontWeight="bold"
                                >
                                  {bar.value > 0 ? Math.round(bar.value) : ''}
                                </text>
                                <text
                                  x={78 + i * 70}
                                  y={158}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#231942"
                                  fontWeight="400"
                                >
                                  {bar.label}
                                </text>
                              </g>
                            );
                          })}
                          {[0, 20, 40, 60, 80, 100].map((y) => (
                            <text
                              key={y}
                              x={32}
                              y={140 - y * 1.2 + 5}
                              fontSize="9"
                              fill="#231942"
                              textAnchor="end"
                              fontWeight="600"
                            >
                              {y < 10 ? `0${y}` : y}
                            </text>
                          ))}
                        </svg>
                      </div>
                    </div>
                    {/* Report Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <a
                        href={result.reportView}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold text-base shadow hover:opacity-90 transition text-center"
                      >
                        Download Report
                      </a>
                      {/* <a
                        href={result.reportDownload}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-[#F6C851] to-[#F9D423] text-[#704180] font-semibold text-base shadow hover:opacity-90 transition text-center"
                      >
                        Download Report
                      </a> */}
                    </div>
                    
                    
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Right Column */}
      <div className="w-full lg:w-[350px] flex flex-col gap-4 sm:gap-6 font-['Poppins'] mt-4 lg:mt-0">
        {/* Therapist Card */}
        <div className="bg-white rounded-3xl shadow p-4 sm:p-6 flex flex-col items-center border border-[#BCBCBC]">
          <img src={topresultimage} alt="Therapist" className="w-36 h-20 sm:w-52 sm:h-32 object-cover rounded-xl mb-3 sm:mb-4" />
          <div className="font-semibold text-base sm:text-lg mb-1 text-center">Talk to a therapist?</div>
          <div className="text-gray-500 text-center mb-3 sm:mb-4">Book your session now</div>
          <button onClick={() => navigate('/appointments')} className="px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base text-white" style={{background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)'}}>Book now</button>
        </div>
        {/* Checklist Card */}
        <div className="bg-white rounded-3xl shadow p-6 sm:p-8 flex flex-col items-center border border-[#BCBCBC]">
          {/* Circular Progress */}
          <div className="mb-3 sm:mb-4">
            <svg width="60" height="60" className="sm:hidden">
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="#E5E0EA"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="#704180"
                strokeWidth="6"
                fill="none"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - 0 / 3)}
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                fontSize="0.9em"
                fill="#704180"
                fontWeight="bold"
              >
                0/3
              </text>
            </svg>
            <svg width="80" height="80" className="hidden sm:block">
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
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-center">Welcome to Zenomi ,<span className="text-[#8B2D6C]">{userName || 'there'}</span></h3>
          <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-base">Experience your AHA! moment by completing this simple steps</p>
          <ul className="w-full space-y-2 sm:space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-center justify-between px-2 sm:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs sm:text-base">
                <span>{item}</span>
                <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400">✔️</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}