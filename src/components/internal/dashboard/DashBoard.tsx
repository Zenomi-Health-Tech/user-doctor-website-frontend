import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import  userTick  from '@/assets/user-tick.png'
import  yellowcal  from '@/assets/yellowcal.png'
import  purplecal  from '@/assets/purplecal.png'
import  greencal  from '@/assets/greencal.png'
import { useNavigate } from 'react-router-dom';

// Import the WellnessReport component
import { useAuth } from '@/context/AuthContext'; // Import useAuth from the new context
import api from '@/utils/api';

interface Test {
  id: string;
  name: string;
  testStatus: string;
  image_url: string;
  description: string | null;
  question_count: number;
}

// Define the WebSocket report data interface here or import if defined elsewhere

// Define interface for Doctor Analytics Response
interface DoctorAnalyticsData {
  totalReferredPatients: number;
  reportsGeneratedCount: number;
  appointmentsTodayCount: number;
  pendingAppointmentsCount: number;
}

// Add Appointment type
interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: string;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
  };
}

const checklist = [
  "Start Your Daily Mental Health Check-In",
  "Review Your Recent Test Results",
  "Talk to a Mental Health Expert",
];

export default function Dashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false); // Add loading state for questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: any }[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  // Add state to store the received report data
  const [doctorAnalytics, setDoctorAnalytics] = useState<DoctorAnalyticsData | null>(null); // New state for doctor analytics
  const { isDoctor , userName } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const navigate = useNavigate();
console.log(isDoctor , "isDoctor");

  


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const authCookie = Cookies.get('auth');
        let token = '';
        if (authCookie) {
          try {
            token = JSON.parse(authCookie).token;
          } catch (e) {
            token = '';
          }
        }
        console.log('isDoctor value:', isDoctor);
        console.log('Token:', token);

        if (isDoctor) {
          console.log('Attempting to fetch doctor analytics...');
          try {
            const res = await api.get("/doctors/analytics/home", {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Doctor analytics response:', res);
            console.log('Response data:', res.data);
            setDoctorAnalytics(res.data.data);
          } catch (error) {
            console.error('Error fetching doctor analytics:', error);
            if (axios.isAxiosError(error)) {
              console.error('Axios error details:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
              });
            }
          }
        } else {
          const res = await axios.get("https://zenomiai.elitceler.com/api/testnames", {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('API Response:', res.data);

          if (Array.isArray(res.data)) {
            setTests(res.data);
          } else {
            console.error('Unexpected API response format:', res.data);
            setTests([]);
          }
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // WebSocket connection only for non-doctors
  }, [isDoctor]); // Dependency on isDoctor to re-run when type changes

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const response = await api.get('/admin/get-todays-appointments');
        if (response.data.success) {
          setAppointments(response.data.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, []);

  // Add a useEffect to trigger PDF download when reportData is received (only for users)
 

  const completedCount = tests?.filter(t => t?.testStatus === 'COMPLETED')?.length || 0;
  console.log(completedCount);

  const handleStartTest = async () => {
    if (!selectedTest) return;
    setLoadingQuestions(true);
    try {
      const authCookie = Cookies.get('auth');
      let token = '';
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = '';
        }
      }
      const res = await axios.get(`https://zenomiai.elitceler.com/questions/${selectedTest.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data, "res of questions");

      if (res.data && Array.isArray(res.data)) {
        setQuestions(res.data);
        setCurrentTestId(selectedTest.id);
        setShowQuiz(true);
        setCurrentQuestion(0);
        setAnswers([]);
        setSelectedTest(null);
      } else {
        console.error('Invalid questions data format:', res.data);
        alert('Failed to load questions. Please try again.');
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      alert('Failed to load questions. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = (answer: any) => {
    const q = questions[currentQuestion];
    // Ensure answers array has a placeholder for the current question if it's the first time answering it
    const newAnswers = [...answers];
    if (newAnswers.length <= currentQuestion) {
      newAnswers.length = currentQuestion + 1;
    }

    // Handle different answer types
    let answerValue = answer;
    if (q.questionType === 'SCALE') {
      // For scale options, take only the text part before the colon
      answerValue = answer.split(':')[0];
    } else if (Array.isArray(answer)) {
      // If it's an array, take the first element
      answerValue = answer[0];
    }

    newAnswers[currentQuestion] = {
      question: q.question,
      answer: answerValue
    };
    setAnswers(newAnswers);
  };


  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Check if the current question has been answered before moving next
      if (!answers[currentQuestion] || !answers[currentQuestion].answer) {
        // Prevent moving to the next question if the current one is not answered
        alert("Please answer the current question before proceeding.");
        return;
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Check if the last question is answered before submitting
      if (!answers[currentQuestion] || !answers[currentQuestion].answer) {
        alert("Please answer the last question before submitting.");
        return;
      }
      handleSubmitQuiz();
    }
  };


  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };
  const handleHomeScreen = () => {
    setShowQuiz(false);
    setShowCompletionDialog(false);
    setSelectedTest(null);
    // Reloading the page might not be the best UX, consider re-fetching data instead
    window.location.reload();
  }

  const handleSubmitQuiz = async () => {
    if (!currentTestId) return;
    const authCookie = Cookies.get('auth');
    let token = '';
    if (authCookie) {
      try {
        token = JSON.parse(authCookie).token;
      } catch (e) {
        token = '';
      }
    }
    try {
      // Format answers to match API expectations
      const formattedAnswers = answers.map(a => ({
        question: a.question,
        answer: a.answer
      }));

      console.log('Submitting answers:', formattedAnswers); // Debug log

      await axios.post(
        `https://zenomiai.elitceler.com/score-test/${currentTestId}`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowQuiz(false);
      setShowCompletionDialog(true);
      // Re-fetch tests after submission to update completed count
      const res = await axios.get("https://zenomiai.elitceler.com/api/testnames", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(res.data);
      setCurrentTestId(null);

    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  console.log(selectedTest?.id);

  const handlePatientClick = (id: string) => {
    navigate(`/patients/${id}`);
  };


  if (loading) return <div>Loading...</div>;

  // Ensure tests is an array before proceeding
  if (!Array.isArray(tests) && !isDoctor) {
    console.error('Tests is not an array:', tests);
    return <div>Error loading tests. Please try again.</div>;
  }
  console.log(doctorAnalytics , "doctorAnalytics");
  

  return (
    <div className="flex justify-center gap-8 p-8  min-h-screen font-['Poppins']">
      {/* Conditionally render content based on user type */}
      {isDoctor ? (
        <div className="w-full font-['Poppins']">
          <h2 className="text-2xl font-semibold mb-6 font-['Urbanist']">
            <span role="img" aria-label="wave">👋</span> Hey Dr. {userName || 'Joseph'}
          </h2>
          {/* Analytics Cards */}
          {doctorAnalytics && (
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#8B2D6C05] rounded-2xl p-6 flex flex-col items-center justify-center shadow">
                <img src={userTick} alt="Patients" className="w-12 h-12 mb-2" />
                <span className="text-2xl font-medium text-[#5E5F60]">{doctorAnalytics.totalReferredPatients}</span>
                <p className="text-gray-600 text-md">Total patients</p>
              </div>
              <div className="bg-[#FBF9FF] rounded-2xl p-6 flex flex-col items-center justify-center shadow">
                <img src={purplecal} alt="Reports" className="w-12 h-12 mb-2" />
                <span className="text-2xl font-medium text-[#5E5F60]">{doctorAnalytics.reportsGeneratedCount}</span>
                <p className="text-gray-600 text-md">Reports generated</p>
              </div>
              <div className="bg-[#FCB35B14] rounded-2xl p-6 flex flex-col items-center justify-center shadow">
                <img src={yellowcal} alt="Appointments" className="w-12 h-12 mb-2" />
                <span className="text-2xl font-medium text-[#5E5F60]">{doctorAnalytics.appointmentsTodayCount}</span>
                <p className="text-gray-600 text-md">Appointments</p>
              </div>
              <div className="bg-[#A9F20014] rounded-2xl p-6 flex flex-col items-center justify-center shadow">
                <img src={greencal} alt="Referral Patients" className="w-12 h-12 mb-2" />
                <span className="text-2xl font-medium text-[#5E5F60]">{doctorAnalytics.pendingAppointmentsCount}</span>
                <p className="text-gray-600 text-md">Referral patients</p>
              </div>
            </div>
          )}

          {/* Today's Appointments */}
          <h3 className="text-xl font-semibold mb-4">Today's Appointments</h3>
          <div className="space-y-4">
            {loadingAppointments ? (
              <div className="text-gray-500">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="text-gray-500">No appointments for today.</div>
            ) : (
              appointments.map((appt) => (
                <div key={appt.id}  onClick={() => handlePatientClick(appt.userId)} className="bg-[#F8F3FA] cursor-pointer rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#E5E0EA] p-3 rounded-full">
                      <svg className="w-6 h-6 text-[#704180]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{appt.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{new Date(appt.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">{appt.status}</span>
                  <button className="p-2 rounded-full bg-[#E5E0EA] text-[#8B2D6C] hover:bg-[#D5CCD6]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-[650px] font-['Poppins']">
          <h2 className="text-2xl font-semibold mb-2 font-['Urbanist']">
            <span role="img" aria-label="wave">👋</span>
            {" "}
            Hey <span className="text-[#8B2D6C] font-bold font-['Urbanist']">{userName || 'there'}</span>, ready to check in with yourself today?
          </h2>
          {/* Progress Bar */}
          <div className="mb-6 font-['Poppins']">
            <div className="flex justify-between text-sm text-gray-500 mb-1 font-['Poppins']">
              <span>{completedCount} of {tests.length} completed</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C]"
                style={{ width: `${tests.length ? (completedCount / tests.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          {/* Test Cards */}
          <div className="flex flex-col gap-6 font-['Poppins']">
            {tests?.map((test) => (
              <div
                key={test.id}
                className={`rounded-3xl p-6 relative font-['Poppins'] ${test.testStatus === 'COMPLETED'
                    ? 'bg-gradient-to-r from-[#704180] to-[#8B2D6C]'
                    : test.testStatus === 'UNLOCKED'
                      ? 'bg-gradient-to-r from-[#704180] to-[#8B2D6C] opacity-80'
                      : 'bg-gray-200 opacity-80'
                  }`}
              >
                <div className="flex items-center gap-6 font-['Poppins']">
                  <img src={test.image_url} alt={test.name} className="w-28 h-28 rounded-2xl object-cover" />
                  <div>
                    <h3 className={`text-xl font-bold font-['Poppins'] ${test.testStatus === 'COMPLETED' ? 'text-white' : 'text-gray-300'}`}>{test.name}</h3>
                    <p className={`text-base font-['Poppins'] ${test.testStatus === 'COMPLETED' ? 'text-white' : 'text-gray-300'}`}>{test.description || 'No description available'}</p>
            <button
                      className={`mt-4 px-6 py-2 rounded-full font-semibold text-base font-['Poppins']
                        ${(test.testStatus === 'COMPLETED' || test.testStatus === 'UNLOCKED')
                          ? 'bg-white text-[#704180] hover:bg-gray-100'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      onClick={() => setSelectedTest(test)}
                      disabled={!(test.testStatus === 'COMPLETED' || test.testStatus === 'UNLOCKED')}
                    >
                      Take test
            </button>
                  </div>
                </div>
                {(test.testStatus !== 'COMPLETED' && test.testStatus !== 'UNLOCKED') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 rounded-3xl font-['Poppins']">
                    <span className="text-white text-lg font-bold font-['Poppins']">
                      <span role="img" aria-label="lock">🔒</span> {test.testStatus === 'UNLOCKED' ? `Complete the ${test.name} to unlock` : 'Locked'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Right Column (for regular users) */}
      {!isDoctor && (
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
          <h3 className="text-lg font-semibold mb-2 text-center font-['Poppins']">Welcome to Zenomi ,<span className="text-[#8B2D6C] font-bold font-['Poppins']">{userName || 'Lily'}</span></h3>
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
      )}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-lg flex flex-col items-center relative font-['Urbanist']">
            {/* Close button (optional) */}
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedTest(null)}
            >
              &times;
            </button>
            <img src={selectedTest.image_url} alt={selectedTest.name} className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-center">Ready for Your {selectedTest.name}?</h2>
            <p className="text-gray-600 text-center mb-6">{selectedTest.description || 'No description available'}</p>
            <div className="flex justify-center flex-wrap gap-3 mb-8">
              <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                <span role="img" aria-label="timer">⏱</span> Takes 3 mins
              </span>
              <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                <span role="img" aria-label="questions">📋</span> {selectedTest.question_count} Questions
              </span>
              <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                <span role="img" aria-label="results">🎯</span> Personalized Results
              </span>
            </div>
            <button
              className="w-full py-3 rounded-full text-white font-semibold text-lg mb-3"
              style={{ background: 'linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)' }}
              onClick={handleStartTest}
            >
              Start test
            </button>
            <button
              className="w-full py-3 rounded-full border border-[#8B2D6C] text-[#8B2D6C] font-semibold text-lg"
              onClick={() => setSelectedTest(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto py-8">
          <div className="bg-[#F8F3FA] rounded-3xl p-10 w-full max-w-2xl shadow-lg flex flex-col items-center relative my-8">
            <h2 className="text-2xl font-bold mb-2 text-left w-full">{selectedTest?.name || 'Test'} Quiz</h2>
            {loadingQuestions ? (
              <div className="flex items-center justify-center h-[350px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B2D6C] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading questions...</p>
                </div>
              </div>
            ) : questions.length > 0 ? (
              <>
                {/* Progress bar */}
                <div className="w-full flex items-center mb-6">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#F3C96B] to-[#E5E0EA]"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-full bg-[#F8F3FA] rounded-2xl p-8 flex flex-col items-center">
                  <div className="text-center mb-4 text-gray-700 font-semibold">
                    Question {String(currentQuestion + 1).padStart(2, '0')}/{questions.length}
                  </div>
                  <div className="text-center text-xl font-bold mb-8">{questions[currentQuestion]?.question}</div>
                  <div className="flex flex-col gap-4 w-full max-w-xl">
                    {/* Render input based on type */}
                    {(() => {
                      const q = questions[currentQuestion];
                      if (!q) return null;
                      if (q.questionType === 'NUMBER') {
                        return (
                          <input
                            type="number"
                            className="w-full py-4 rounded-full border-2 border-[#8B2D6C] text-lg font-medium px-6"
                            value={answers[currentQuestion]?.answer || ''}
                            onChange={e => handleAnswer(e.target.value)}
                          />
                        );
                      }
                      if (q.questionType === 'BOOLEAN') {
                        return (
                          <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                              <button
                                key={option}
                                className={`flex-1 py-4 rounded-full border-2 text-lg font-medium ${answers[currentQuestion]?.answer === option
                                    ? 'bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white'
                                    : 'border-[#8B2D6C] text-[#704180] bg-white'
                                  }`}
                                onClick={() => handleAnswer(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      if (q.questionType === 'TEXT') {
                        return (
                          <textarea
                            className="w-full py-4 rounded-2xl border-2 border-[#8B2D6C] text-lg font-medium px-6"
                            rows={4}
                            value={answers[currentQuestion]?.answer || ''}
                            onChange={e => handleAnswer(e.target.value)}
                          />
                        );
                      }
                      return (q.scaleOptions || []).map((option: string) => (
                        <button
                          key={option}
                          className={`w-full py-4 rounded-full border-2 text-lg font-medium ${answers[currentQuestion]?.answer === option.split(':')[0]
                              ? 'bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white'
                              : 'border-[#8B2D6C] text-[#704180] bg-white'
                            }`}
                          onClick={() => handleAnswer(option)}
                        >
                          {option.split(':')[0]}
                        </button>
                      ));
                    })()}
                  </div>
                  <div className="flex justify-between w-full mt-8">
                    <button
                      className="px-8 py-2 rounded-full border-2 border-[#8B2D6C] text-[#8B2D6C] font-medium"
                      onClick={handlePrev}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="px-8 py-2 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-medium"
                      onClick={handleNext}
                      disabled={!answers[currentQuestion] || !answers[currentQuestion].answer}
                    >
                      {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[350px]">
                <p className="text-gray-600">No questions available</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-lg flex flex-col items-center relative">
            <h2 className="text-2xl font-bold mb-2 text-center">You've Completed the Sleep Test!</h2>
            <p className="text-gray-600 text-center mb-6">Your results are ready and personalized just for you.</p>
            <button
              className="w-full py-3 rounded-full text-white font-semibold text-lg mb-3"
              style={{ background: 'linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)' }}
              onClick={() => handleHomeScreen()}
            >
              Back to homescreen
            </button>
            <button
              className="w-full py-3 rounded-full border border-[#8B2D6C] text-[#8B2D6C] font-semibold text-lg"
              onClick={() => setShowCompletionDialog(false)}
            >
              Take next test
            </button>
         
          </div>
      </div>
      )}
    </div>
  );
}