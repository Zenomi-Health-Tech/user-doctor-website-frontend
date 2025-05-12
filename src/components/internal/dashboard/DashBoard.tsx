
import testImage1 from "@/assets/testImage1.png";
import testImage2 from "@/assets/testImage2.png";
import testImage3 from "@/assets/testImage3.png";

const tests = [
  {
    key: "sleep",
    title: "Sleep test",
    description: "Track your sleep quality in 3 minutes.",
    locked: false,
    image: testImage1,
  },
  {
    key: "nutrition",
    title: "Nutrition Check",
    description: "See how your food fuels your body.",
    locked: true,
    image: testImage2,
    lockMsg: "Complete the Nutrition test to unlock",
  },
  {
    key: "emotional",
    title: "Emotional Wellness",
    description: "Check how are you feeling, What's on your mind?",
    locked: true,
    image: testImage3,
    lockMsg: "Complete the Emotional Wellness test to unlock",
  },
];

const checklist = [
  "Start Your Daily Mental Health Check-In",
  "Review Your Recent Test Results",
  "Talk to a Mental Health Expert",
];

export default function Dashboard() {
  return (
    <div className="flex gap-8 p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      {/* Left Column */}
      <div className="flex-1 max-w-[650px] font-['Poppins']">
        <h2 className="text-2xl font-semibold mb-2 font-['Urbanist']">
          <span role="img" aria-label="wave">👋</span>
          {" "}
          Hey <span className="text-[#8B2D6C] font-bold font-['Urbanist']">Lily</span>, ready to check in with yourself today?
        </h2>
        {/* Progress Bar */}
        <div className="mb-6 font-['Poppins']">
          <div className="flex justify-between text-sm text-gray-500 mb-1 font-['Poppins']">
            <span>0 of 5 completed</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] w-1/12" />
          </div>
        </div>
        {/* Test Cards */}
        <div className="flex flex-col gap-6 font-['Poppins']">
          {tests.map((test) => (
            <div
              key={test.key}
              className={`rounded-3xl p-6 relative font-['Poppins'] ${test.locked
                ? "bg-gradient-to-r from-[#704180] to-[#2D133B] opacity-80"
                : "bg-gradient-to-r from-[#704180] to-[#8B2D6C]"
                }`}
            >
              <div className="flex items-center gap-6 font-['Poppins']">
                <img src={test.image} alt={test.title} className="w-28 h-28 rounded-2xl" />
                <div>
                  <h3 className={`text-xl font-bold font-['Poppins'] ${test.locked ? "text-gray-300" : "text-white"}`}>{test.title}</h3>
                  <p className={`text-base font-['Poppins'] ${test.locked ? "text-gray-300" : "text-white"}`}>{test.description}</p>
                  <button
                    className={`mt-4 px-6 py-2 rounded-full font-semibold text-base font-['Poppins']
                      ${test.locked
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-white text-[#704180] hover:bg-gray-100"
                      }`}
                    disabled={test.locked}
                  >
                    Take test
                  </button>
                </div>
              </div>
              {test.locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 rounded-3xl font-['Poppins']">
                  <span className="text-white text-lg font-bold font-['Poppins']">
                    <span role="img" aria-label="lock">🔒</span> {test.lockMsg}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Right Column */}
      <div className="w-[450px] bg-white rounded-3xl shadow p-8 flex flex-col items-center font-['Poppins']">
        {/* Circular Progress */}
        <div className="mb-4 font-['Poppins']">
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
              className="font-['Poppins']"
            >
              0/3
            </text>
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-center font-['Poppins']">Welcome to Zenomi ,<span className="text-[#8B2D6C] font-['Poppins']">Lily</span></h3>
        <p className="text-gray-500 text-center mb-6 font-['Poppins']">Experience your AHA! moment by completing this simple steps</p>
        <ul className="w-full space-y-3 font-['Poppins']">
          {checklist.map((item) => (
            <li key={item} className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-['Poppins']">
              <span>{item}</span>
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400 font-['Poppins']">✔️</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}