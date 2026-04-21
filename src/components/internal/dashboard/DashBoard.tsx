import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import LottieLoader from "@/components/shared/LottieLoader";
import NutritionQuiz from "./NutritionQuiz";
import userTick from "@/assets/user-tick.png";
import yellowcal from "@/assets/yellowcal.png";
import purplecal from "@/assets/purplecal.png";
import greencal from "@/assets/greencal.png";
import { useNavigate } from "react-router-dom";

// Import the WellnessReport component
import { useAuth } from "@/context/AuthContext"; // Import useAuth from the new context
import api from "@/utils/api";

interface Test {
  id: string;
  name: string;
  testStatus: string;
  image_url: string;
  description: string | null;
  question_count: number;
  splash_image_s3_key?: string; // Add splash_image_s3_key to the Test interface
  unlockDependency?: string;
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

interface Course {
  id: string;
  title: string;
  category: string;
  courseLink: string;
  // add other fields if needed
}

export default function Dashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false); // Add loading state for questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: any }[]>(
    []
  );
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  // Add state to store the received report data
  const [doctorAnalytics, setDoctorAnalytics] =
    useState<DoctorAnalyticsData | null>(null); // New state for doctor analytics
  const { isDoctor, userName } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submittingQuiz] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  console.log(isDoctor, "isDoctor");
  // Add a state to track the last completed test name
  const [lastCompletedTestName, setLastCompletedTestName] = useState<string | null>(null);
  const SLEEP_TEST_ID = 'cmb7mnl5e0000qelpn6yjmyt0';
  const NUTRITION_TEST_ID = 'cmb7mnl8x0001qelpyyqkwk31';
  const isSleepQuiz = currentTestId === SLEEP_TEST_ID;
  const isNutritionQuiz = currentTestId === NUTRITION_TEST_ID;
  const GAD7_TEST_ID = 'cmb7mnlch0002qelp5tpv8v09';
  const PHQ9_TEST_ID = 'cmb7mnlfq0003qelptwtfniai';
  const isGad7Quiz = currentTestId === GAD7_TEST_ID;
  const isPhq9Quiz = currentTestId === PHQ9_TEST_ID;
  const isEmotionalQuiz = currentTestId ? tests.find(t => t.id === currentTestId)?.name?.toUpperCase().includes('EMOTIONAL') ?? false : false;
  const [sleepPart, setSleepPart] = useState(0);
  const [sleepExitOpen, setSleepExitOpen] = useState(false);
  const [sleepResults, setSleepResults] = useState<{score: number, max: number, assessment: string, sentiment: string} | null>(null);
  const [gad7Results, setGad7Results] = useState<{score: number, max: number, label: string, description: string} | null>(null);
  const [phq9Results, setPhq9Results] = useState<{score: number, max: number, label: string, description: string} | null>(null);
  const [emotionalResults, setEmotionalResults] = useState<{score: number, max: number, categories: {name: string, emoji: string, score: number, max: number, label: string}[]} | null>(null);
  const [hasSleepLog, setHasSleepLog] = useState(false);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [postTestLoading, setPostTestLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const authCookie = Cookies.get("auth");
        let token = "";
        if (authCookie) {
          try {
            token = JSON.parse(authCookie).token;
          } catch (e) {
            token = "";
          }
        }
        console.log("isDoctor value:", isDoctor);
        console.log("Token:", token);

        if (isDoctor) {
          console.log("Attempting to fetch doctor analytics...");
          try {
            const res = await api.get("/doctors/analytics/home", {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Doctor analytics response:", res);
            console.log("Response data:", res.data);
            setDoctorAnalytics(res.data.data);
          } catch (error) {
            console.error("Error fetching doctor analytics:", error);
            if (axios.isAxiosError(error)) {
              console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
              });
            }
          }
        } else {
          const res = await axios.get(
            "https://zenomiai.elitceler.com/api/testnames",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("API Response:", res.data);

          if (Array.isArray(res.data)) {
            setTests(res.data);
          } else {
            console.error("Unexpected API response format:", res.data);
            setTests([]);
          }
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Re-fetch tests when user returns to the tab (e.g., after retest assignment)
    const onFocus = () => { if (!isDoctor) fetchData(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isDoctor]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const response = await api.get("/admin/get-todays-appointments");
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

  useEffect(() => {
    if (!isDoctor) {
      const fetchCourses = async () => {
        try {
          const authCookie = Cookies.get("auth");
          let token = "";
          if (authCookie) {
            try { token = JSON.parse(authCookie).token; } catch { token = ""; }
          }
          const res = await api.get("/users/get-all-courses", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data && res.data.success) {
            setCourses(res.data.data || []);
          }
        } catch { }
      };
      fetchCourses();
    }
  }, [isDoctor]);

  // Fetch checklist status
  useEffect(() => {
    if (!isDoctor) {
      api.get('/users/sleep-logs?page=1&limit=1').then(res => {
        const data = res.data?.data;
        const logs = Array.isArray(data) ? data : data?.items || data?.logs || [];
        setHasSleepLog(logs.length > 0);
      }).catch(() => {});
      api.get('/users/get-user-appointments').then(res => {
        const upcoming = res.data?.data?.upcoming_appointments || [];
        const previous = res.data?.data?.previous_appointments || [];
        setHasAppointment(upcoming.length > 0 || previous.length > 0);
      }).catch(() => {});
    }
  }, [isDoctor]);

  const completedCount =
    tests?.filter((t) => t?.testStatus === "COMPLETED")?.length || 0;
  console.log(completedCount);

  const handleStartTest = async () => {
    if (!selectedTest) return;
    setLoadingQuestions(true);
    try {
      const authCookie = Cookies.get("auth");
      let token = "";
      if (authCookie) {
        try {
          token = JSON.parse(authCookie).token;
        } catch (e) {
          token = "";
        }
      }
      const res = await axios.get(
        `https://zenomiai.elitceler.com/api/questions/${selectedTest.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res.data, "res of questions");

      if (res.data && Array.isArray(res.data)) {
        setQuestions(res.data.filter((q: any) => q.questionStatus === 'ACTIVE'));
        setCurrentTestId(selectedTest.id);
        setShowQuiz(true);
        setSleepPart(0);
        setCurrentQuestion(0);
        setAnswers([]);
        setSelectedTest(null);
      } else {
        console.error("Invalid questions data format:", res.data);
        alert("Failed to load questions. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      alert("Failed to load questions. Please try again.");
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
    if (q.questionType === "SCALE") {
      // For scale options, store the full option string (not just the label)
      answerValue = answer; // answer is already the full option string from the button
    } else if (Array.isArray(answer)) {
      // If it's an array, take the first element
      answerValue = answer[0];
    }

    newAnswers[currentQuestion] = {
      question: q.question,
      answer: answerValue,
    };
    setAnswers(newAnswers);

    // Auto-advance for BOOLEAN and SCALE questions
    if (
      (q.questionType === "BOOLEAN" || q.questionType === "SCALE") &&
      currentQuestion < questions.length - 1
    ) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 200); // slight delay for UX
    } else if (
      (q.questionType === "BOOLEAN" || q.questionType === "SCALE") &&
      currentQuestion === questions.length - 1
    ) {
      // If last question, auto-submit
      setTimeout(() => {
        handleSubmitQuiz();
      }, 200);
    }
  };

  const handleScrollableAnswer = (idx: number, answer: string) => {
    const newAnswers = [...answers];
    if (newAnswers.length <= idx) newAnswers.length = idx + 1;
    newAnswers[idx] = { question: questions[idx].question, answer };
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

  const handleHomeScreen = async () => {
    setShowQuiz(false);
    setShowCompletionDialog(false);
    setSelectedTest(null);
    setSleepResults(null);
    setGad7Results(null);
    setPhq9Results(null);
    setEmotionalResults(null);
    setPostTestLoading(true);

    // Poll until next test unlocks or max 15 seconds
    const authCookie = Cookies.get("auth");
    let token = "";
    if (authCookie) { try { token = JSON.parse(authCookie).token; } catch { token = ""; } }
    const prevCompleted = tests.filter(t => t.testStatus === "COMPLETED").length;

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const res = await axios.get("https://zenomiai.elitceler.com/api/testnames", { headers: { Authorization: `Bearer ${token}` } });
        if (Array.isArray(res.data)) {
          const newCompleted = res.data.filter((t: any) => t.testStatus === "COMPLETED").length;
          if (newCompleted > prevCompleted || newCompleted === res.data.length) {
            setTests(res.data);
            setPostTestLoading(false);
            setCurrentTestId(null);
            return;
          }
        }
      } catch { }
    }
    // Fallback: reload after max attempts
    window.location.reload();
  };

  const handleSubmitQuiz = async () => {
    if (!currentTestId) return;
    const authCookie = Cookies.get("auth");
    let token = "";
    if (authCookie) {
      try {
        token = JSON.parse(authCookie).token;
      } catch (e) {
        token = "";
      }
    }
    const hasCustomResults = currentTestId === SLEEP_TEST_ID || currentTestId === GAD7_TEST_ID || currentTestId === PHQ9_TEST_ID || (tests.find(t => t.id === currentTestId)?.name?.toUpperCase().includes('EMOTIONAL'));
    if (!hasCustomResults) setShowProcessing(true);
    setShowQuiz(false);
    try {
      // Find the current test object
      const currentTest = tests.find(t => t.id === currentTestId);
      const isPHQorGAD = currentTest && (currentTest.name?.toUpperCase().includes('PHQ') || currentTest.name?.toUpperCase().includes('GAD'));
      // Debug log
      console.log('Submitting quiz:', { answers, questions });
      // Format answers to match API expectations
      const formattedAnswers = answers.map((a, idx) => {
        const q = questions[idx];
        if (q && q.questionType === "SCALE" && typeof a.answer === "string") {
          if (isPHQorGAD && Array.isArray(q.scaleOptions)) {
            // For PHQ and GAD, use the index of the selected option (compare full string)
            const selectedIdx = q.scaleOptions.findIndex((opt: string) => opt === a.answer);
            if (selectedIdx === -1) {
              alert('Please answer all questions before submitting.');
              throw new Error('Invalid answer for PHQ/GAD: ' + a.answer);
            }
            return { question: a.question, answer: String(selectedIdx) };
          } else {
            // For all other SCALE quizzes, submit only the label before the colon
            const label = a.answer.split(":")[0];
            return { question: a.question, answer: label };
          }
        }
        return { question: a.question, answer: a.answer };
      });

      // For GAD-7 test, compute score locally and show results immediately
      if (currentTestId === GAD7_TEST_ID) {
        let total = 0;
        formattedAnswers.forEach((a: any) => { total += parseInt(a.answer) || 0; });
        const max = 21;
        const label = total <= 4 ? 'Minimal Anxiety' : total <= 9 ? 'Mild Anxiety' : total <= 14 ? 'Moderate Anxiety' : 'Severe Anxiety';
        const description = total <= 4 ? 'Your anxiety levels appear minimal. Keep maintaining healthy habits!' : total <= 9 ? 'You may be experiencing mild anxiety. Consider relaxation techniques.' : total <= 14 ? 'Moderate anxiety detected. Consider speaking with a professional.' : 'Your responses suggest severe anxiety. Please consult a healthcare provider.';
        setGad7Results({ score: total, max, label, description });
        setShowQuiz(false);
        axios.post(`https://zenomiai.elitceler.com/api/score-test/${currentTestId}`, { answers: formattedAnswers }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
      // For PHQ-9 test, compute score locally and show results immediately
      else if (currentTestId === PHQ9_TEST_ID) {
        let total = 0;
        formattedAnswers.forEach((a: any) => { total += parseInt(a.answer) || 0; });
        const max = 27;
        const label = total <= 4 ? 'Minimal Depression' : total <= 9 ? 'Mild Depression' : total <= 14 ? 'Moderate Depression' : total <= 19 ? 'Moderately Severe' : 'Severe Depression';
        const description = total <= 4 ? 'Your responses suggest minimal depression. Keep up the good work!' : total <= 9 ? 'Mild depression indicated. Self-care and monitoring recommended.' : total <= 14 ? 'Moderate depression detected. Consider professional support.' : total <= 19 ? 'Moderately severe depression. Professional consultation recommended.' : 'Severe depression indicated. Please seek professional help promptly.';
        setPhq9Results({ score: total, max, label, description });
        setShowQuiz(false);
        axios.post(`https://zenomiai.elitceler.com/api/score-test/${currentTestId}`, { answers: formattedAnswers }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
      // For Emotional Health test
      else if (tests.find(t => t.id === currentTestId)?.name?.toUpperCase().includes('EMOTIONAL')) {
        const catNames = [{ name: 'Self-Awareness', emoji: '🧠' }, { name: 'Self-Regulation', emoji: '🎯' }, { name: 'Motivation', emoji: '🚀' }];
        let totalScore = 0;
        const categories = catNames.map((cat, ci) => {
          let catScore = 0;
          for (let i = 0; i < 5; i++) {
            const qIdx = ci * 5 + i;
            const q = questions[qIdx];
            const optCount = q?.scaleOptions?.length || 5;
            const ansIdx = parseInt(formattedAnswers[qIdx]?.answer) || 0;
            catScore += (optCount - 1) - ansIdx;
          }
          const catMax = 5 * ((questions[ci * 5]?.scaleOptions?.length || 5) - 1);
          totalScore += catScore;
          const catLabel = catScore <= 8 ? 'Needs Attention' : catScore <= 16 ? 'Growing Stronger' : 'Thriving';
          return { ...cat, score: catScore, max: catMax, label: catLabel };
        });
        const max = categories.reduce((s, c) => s + c.max, 0);
        setEmotionalResults({ score: totalScore, max, categories });
        setShowQuiz(false);
        axios.post(`https://zenomiai.elitceler.com/api/score-test/${currentTestId}`, { answers: formattedAnswers }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
      // For sleep test, compute score locally and show results immediately
      else if (currentTestId === SLEEP_TEST_ID) {
        const scaleMap: Record<string, number> = { 'None': 0, 'Rarely': 1, 'Moderate': 2, 'Severe': 3, 'Very Severe': 4 };
        let total = 0;
        formattedAnswers.forEach((a: any) => { total += scaleMap[a.answer] || 0; });
        setSleepResults({ score: total, max: questions.length * 4, assessment: '', sentiment: '' });
        setShowQuiz(false);
        // Fire API in background
        axios.post(
          `https://zenomiai.elitceler.com/api/score-test/${currentTestId}`,
          { answers: formattedAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
          if (res.data) {
            setSleepResults({
              score: res.data.user_score ?? total,
              max: res.data.max_score_for_test ?? questions.length * 4,
              assessment: res.data.assessment ?? '',
              sentiment: res.data.sentiment ?? '',
            });
          }
        }).catch(() => {});
      } else {
        await axios.post(
          `https://zenomiai.elitceler.com/api/score-test/${currentTestId}`,
          { answers: formattedAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Find the test name for the just-completed test
      const completedTest = tests.find(t => t.id === currentTestId);
      setLastCompletedTestName(completedTest?.name || null);
      if (currentTestId !== SLEEP_TEST_ID && currentTestId !== GAD7_TEST_ID && currentTestId !== PHQ9_TEST_ID && !tests.find(t => t.id === currentTestId)?.name?.toUpperCase().includes('EMOTIONAL')) {
        setShowCompletionDialog(true);
      }
      // Re-fetch tests after submission to update completed count
      const res = await axios.get(
        "https://zenomiai.elitceler.com/api/testnames",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTests(res.data);
      setCurrentTestId(null);
      setShowProcessing(false); // Hide processing card when API returns
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
      setShowProcessing(false);
    } finally {
      setLoading(false);
    }
  };
  console.log(selectedTest?.id);

  const handlePatientClick = (id: string) => {
    navigate(`/patients/${id}`);
  };

  // Ensure processingTime is set to 30 whenever showProcessing becomes true
  useEffect(() => {
    if (showProcessing) {
      setProcessingTime(30);
    }
  }, [showProcessing]);

  // The countdown effect (should not set to 30, just decrease)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showProcessing) {
      interval = setInterval(() => {
        setProcessingTime((prev) => {
          if (prev <= 1) {
            setShowProcessing(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showProcessing]);

  // useEffect(() => {
  //   if (
  //     isDoctor &&
  //     isPaid === false &&
  //     location.pathname !== "/doctor/payment-onboard"
  //   ) {
  //     navigate("/doctor/payment-onboard", { replace: true });
  //   }
  // }, []);

  if (loading) return <LottieLoader text="Loading your dashboard..." />;
  if (postTestLoading) return <LottieLoader text="Preparing your next test..." />;

  // Ensure tests is an array before proceeding
  if (!Array.isArray(tests) && !isDoctor) {
    console.error("Tests is not an array:", tests);
    return <div>Error loading tests. Please try again.</div>;
  }

  // Checklist items - functional based on actual data
  const checklistItems = [
    { label: `Complete all ${tests.length || 5} assessments`, done: completedCount === tests.length && tests.length > 0, action: () => {} },
    { label: "Log your sleep in Sleep Tracker", done: hasSleepLog, action: () => navigate('/sleep-tracker') },
    { label: "Book a doctor consultation", done: hasAppointment, action: () => navigate('/appointments') },
  ];
  const checklistDone = checklistItems.filter(c => c.done).length;

  return (
    <div className="relative w-full h-full">
      {/* Blur overlay when modal or quiz is open */}
      {(selectedTest || showQuiz) && (
        <div className="fixed inset-0 z-40 backdrop-blur-md bg-black bg-opacity-20 transition-all duration-300"></div>
      )}
      <div className={
        (selectedTest || showQuiz)
          ? "relative z-30 pointer-events-none select-none"
          : "relative z-10"
      }>
        <div className="flex flex-col lg:flex-row justify-center gap-4 lg:gap-8 px-3 py-1 sm:p-4 md:p-8 min-h-screen font-['Poppins'] w-full overflow-x-hidden">
          {/* Conditionally render content based on user type */}
          {isDoctor ? (
            <div className="w-full font-['Poppins']">
              {/* <button onClick={() => navigate('/doctor/payment-onboard')}>Navigate</button> */}
              <h2 className="text-2xl font-semibold mb-6 font-['Urbanist']">
                <span role="img" aria-label="wave">
                  👋
                </span>{" "}
                Hey Dr. {userName || "Joseph"}
              </h2>
              {/* Analytics Cards */}
              {doctorAnalytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  <div
                    className="bg-[#8B2D6C05] rounded-2xl p-6 flex flex-col items-center justify-center shadow cursor-pointer"
                    onClick={() => navigate("/patients")}
                  >
                    <img src={userTick} alt="Patients" className="w-12 h-12 mb-2" />
                    <span className="text-2xl font-medium text-[#5E5F60]">
                      {doctorAnalytics.totalReferredPatients}
                    </span>
                    <p className="text-gray-600 text-md">Total patients</p>
                  </div>
                  <div
                    className="bg-[#FBF9FF] rounded-2xl p-6 flex flex-col items-center justify-center shadow cursor-pointer"
                    onClick={() => navigate("/results")}
                  >
                    <img src={purplecal} alt="Reports" className="w-12 h-12 mb-2" />
                    <span className="text-2xl font-medium text-[#5E5F60]">
                      {doctorAnalytics.reportsGeneratedCount}
                    </span>
                    <p className="text-gray-600 text-md">Reports generated</p>
                  </div>
                  <div
                    className="bg-[#FCB35B14] rounded-2xl p-6 flex flex-col items-center justify-center shadow cursor-pointer"
                    onClick={() => navigate("/appointments")}
                  >
                    <img
                      src={yellowcal}
                      alt="Appointments"
                      className="w-12 h-12 mb-2"
                    />
                    <span className="text-2xl font-medium text-[#5E5F60]">
                      {doctorAnalytics.appointmentsTodayCount}
                    </span>
                    <p className="text-gray-600 text-md">Appointments</p>
                  </div>
                  <div
                    className="bg-[#A9F20014] rounded-2xl p-6 flex flex-col items-center justify-center shadow cursor-pointer"
                    onClick={() => navigate("/referred-patients")}
                  >
                    <img
                      src={greencal}
                      alt="Referral Patients"
                      className="w-12 h-12 mb-2"
                    />
                    <span className="text-2xl font-medium text-[#5E5F60]">
                      {doctorAnalytics.pendingAppointmentsCount}
                    </span>
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
                    <div
                      key={appt.id}
                      onClick={() => handlePatientClick(appt.userId)}
                      className="bg-[#F8F3FA] cursor-pointer rounded-2xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#E5E0EA] p-3 rounded-full">
                          <svg
                            className="w-6 h-6 text-[#704180]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {appt.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(appt.preferredTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">{appt.status}</span>
                      <button className="p-2 rounded-full bg-[#E5E0EA] text-[#8B2D6C] hover:bg-[#D5CCD6]">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto mt-2 sm:mt-6">
              {/* Left Column: Tests and Courses */}
              <div className="flex-1 w-full max-w-[650px] font-['Poppins'] mx-auto">
                <h2 className="text-lg sm:text-2xl font-semibold mb-2 font-['Urbanist'] truncate">
                  <span role="img" aria-label="wave">👋</span>{" "}
                  Hey <span className="text-[#8B2D6C] font-bold font-['Urbanist']">{userName || "there"}</span>, ready to check in?
                </h2>
                {showProcessing && (
                  <div className="my-4 w-full max-w-xl mx-auto">
                    <div className="bg-white rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <img
                          src="https://zenomi.s3.ap-south-1.amazonaws.com/testanimations/WhatsApp_Image_2025-06-16_at_15.32.46_e9afbbd2.webp"
                          alt="Processing"
                          style={{ width: "48px", height: "48px", objectFit: "contain", display: "block" }}
                          className="sm:!w-[64px] sm:!h-[64px]"
                        />
                        <span className="text-sm sm:text-lg font-semibold">Zenomi AI is processing</span>
                      </div>
                      <span className="text-xl font-bold">{processingTime}s</span>
                    </div>
                  </div>
                )}
                {/* Tests Section */}
                {completedCount === tests.length && tests.length > 0 ? (
                  <>
                    {/* All Complete Card - matches app */}
                    <div className="rounded-[20px] relative overflow-hidden mb-4 w-full" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)', height: 'auto', minHeight: '160px' }}>
                      {/* Decorative circles */}
                      <div className="absolute top-[-10px] right-[80px] w-[60px] h-[60px] rounded-full bg-white/[0.07]" />
                      <div className="absolute bottom-[20px] right-[40px] w-[100px] h-[100px] rounded-full bg-white/[0.05]" />
                      <div className="absolute top-[40px] right-[120px] w-[30px] h-[30px] rounded-full bg-white/[0.06]" />

                      <div className="flex items-center justify-between p-5 relative z-10">
                        <div className="flex-1">
                          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight font-['Urbanist']">All your tests are<br/>complete!</h2>
                          <div className="w-[180px] sm:w-[200px] h-1.5 bg-white/20 rounded-full mt-3 mb-1.5">
                            <div className="h-1.5 rounded-full bg-[#F8AE0E]" style={{ width: '100%' }} />
                          </div>
                          <p className="text-white/70 text-xs sm:text-sm font-['Urbanist']">{completedCount} of {tests.length} tests completed</p>
                        </div>
                        {/* Clipboard illustration */}
                        <div className="relative w-[90px] h-[120px] flex-shrink-0 ml-4">
                          <div className="absolute inset-0 rounded-xl border border-white/20 bg-white/[0.15] px-2.5 py-4 flex flex-col justify-evenly">
                            {[0,1,2,3].map(i => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-[#F8AE0E] flex items-center justify-center flex-shrink-0">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div className="flex-1 h-1.5 rounded-full bg-white/30" />
                              </div>
                            ))}
                          </div>
                          <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-9 h-3 rounded bg-white/25" />
                        </div>
                      </div>
                    </div>

                    {/* Zenomi Learn moved outside ternary */}
                  </>
                ) : (
                  <div className="flex flex-col gap-4 font-['Poppins']">
                    {/* Progress Bar */}
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">{completedCount} of {tests.length} completed</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="h-2 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C]" style={{ width: `${tests.length ? (completedCount / tests.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    {tests?.map((test) => (
                      <div
                        key={test.id}
                        className="rounded-2xl relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}
                      >
                        {/* Corner badge */}
                        {test.testStatus === "UNLOCKED" && (
                          <div className="absolute top-0 right-0 z-20 px-4 py-1 text-white text-[10px] font-bold" style={{ background: '#F8AE0E', borderRadius: '0 16px 0 20px' }}>Pending</div>
                        )}
                        {test.testStatus === "COMPLETED" && (
                          <div className="absolute top-0 right-0 z-20 px-4 py-1 text-white text-[10px] font-bold" style={{ background: '#009511', borderRadius: '0 16px 0 20px' }}>Completed</div>
                        )}

                        <div className="flex items-center gap-3 p-3 sm:p-5">
                          <img src={test.image_url} alt={test.name} className="w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-white truncate">{test.name}</h3>
                              <p className="text-xs text-white/50 line-clamp-2 mt-0.5">{test.description || "No description"}</p>
                            </div>
                            {test.testStatus === "UNLOCKED" && (!showProcessing || currentTestId !== test.id) && (
                              <button onClick={() => setSelectedTest(test)} className="self-start px-6 py-1.5 rounded-full bg-white/25 text-white text-xs font-bold hover:bg-white/35 transition">
                                Take test
                              </button>
                            )}
                            {test.testStatus === "COMPLETED" && (
                              <span className="self-start inline-flex items-center gap-1.5 px-6 py-1.5 rounded-full bg-white/25 text-white text-xs font-bold">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Completed ✓
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lock overlay */}
                        {test.testStatus !== "COMPLETED" && test.testStatus !== "UNLOCKED" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-2xl z-10">
                            <svg className="w-6 h-6 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="7" y="11" width="10" height="7" rx="2" />
                              <path d="M8 11V8a4 4 0 018 0v3" />
                            </svg>
                            <span className="text-white text-sm text-center px-4">Complete <strong>{test.unlockDependency || 'previous test'}</strong> to unlock</span>
                          </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Zenomi Learn Courses Card - only when all tests done */}
                {completedCount === tests.length && tests.length > 0 && (
                <div className="rounded-[20px] overflow-hidden mt-4 w-full" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
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
              {/* Right Column */}
              <div className="hidden lg:flex w-full lg:w-[340px] flex-col gap-4 font-['Poppins']">
                {/* Book Therapy Card */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
                  <div className="p-5 text-white">
                    <div className="text-lg font-bold mb-1">Need to talk?</div>
                    <p className="text-white/70 text-sm mb-4">Book a session with a mental health expert</p>
                    <button onClick={() => navigate("/appointments")} className="px-5 py-2 rounded-full bg-white text-[#8B2D6C] text-sm font-semibold hover:bg-gray-100 transition">
                      Book Appointment →
                    </button>
                  </div>
                </div>
                {/* Progress Checklist */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <svg width="56" height="56" className="flex-shrink-0">
                      <circle cx="28" cy="28" r="24" stroke="#F0EBF4" strokeWidth="5" fill="none" />
                      <circle cx="28" cy="28" r="24" stroke="#8B2D6C" strokeWidth="5" fill="none"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={2 * Math.PI * 24 * (1 - checklistDone / 3)}
                        strokeLinecap="round" transform="rotate(-90 28 28)" />
                      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="14" fill="#8B2D6C" fontWeight="bold">{checklistDone}/3</text>
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">Your Progress</div>
                      <div className="text-xs text-gray-400">Complete all steps for your AHA! moment</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklistItems.map((item, i) => (
                      <div key={i} onClick={!item.done ? item.action : undefined} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${item.done ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500 text-white' : 'border-2 border-gray-300'}`}>
                          {item.done && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`flex-1 ${item.done ? 'text-green-700 line-through' : 'text-gray-700'}`}>{item.label}</span>
                        {!item.done && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Zenomi Learn Courses - shown in left column when all tests done */}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedTest && selectedTest.id === SLEEP_TEST_ID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: '#12132A' }}>
          {/* Stars */}
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{
              width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.3,
            }} />
          ))}
          <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
            <button onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="text-6xl mb-6">🌙</div>
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#D4BBFF] via-[#9B8FFF] to-[#6C8AFF] bg-clip-text text-transparent">How's Your Sleep Game?</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Answer {selectedTest.question_count} quick questions about your sleep. Get your personalized score + tips to level up your rest. 😴✨</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">⏱ Takes 2 mins</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">📋 {selectedTest.question_count} Questions</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">🎯 Personalized</span>
            </div>
            <button onClick={handleStartTest} className="w-full py-3.5 rounded-2xl text-white font-bold text-lg mb-3" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1, #4F8AFF)', boxShadow: '0 10px 30px rgba(99,102,241,0.4)' }}>
              {loadingQuestions ? 'Loading...' : "Let's Go 🚀"}
            </button>
            <button onClick={() => setSelectedTest(null)} className="text-white/40 text-sm hover:text-white/60">← Back</button>
          </div>
        </div>
      )}
      {selectedTest && selectedTest.id === NUTRITION_TEST_ID && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: '#0F1A15' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
            <button onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="text-6xl mb-6">🥑</div>
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#2D9F83] to-[#1A7A63] bg-clip-text text-transparent">Nutrition Check-Up</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Discover how your daily eating habits stack up. Takes about 2 minutes — let's see your score! 🔬</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">⏱ Takes 2 mins</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">📋 {selectedTest.question_count} Questions</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">🎯 Personalized</span>
            </div>
            <button onClick={handleStartTest} className="w-full py-3.5 rounded-2xl text-white font-bold text-lg mb-3" style={{ background: 'linear-gradient(135deg, #2D9F83, #1A7A63)', boxShadow: '0 10px 30px rgba(45,159,131,0.4)' }}>
              {loadingQuestions ? 'Loading...' : "Let's Go 🚀"}
            </button>
            <button onClick={() => setSelectedTest(null)} className="text-white/40 text-sm hover:text-white/60">← Back</button>
          </div>
        </div>
      )}
      {selectedTest && selectedTest.id === GAD7_TEST_ID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: '#1A1D2E' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
            <button onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#FF6B8A] to-[#FF8E53] bg-clip-text text-transparent">GAD-7 Assessment</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Over the last 2 weeks, how often have you been bothered by anxiety symptoms? Answer {selectedTest.question_count} quick questions.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">⏱ Takes 2 mins</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">📋 {selectedTest.question_count} Questions</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">🎯 Personalized</span>
            </div>
            <button onClick={handleStartTest} className="w-full py-3.5 rounded-2xl text-white font-bold text-lg mb-3" style={{ background: 'linear-gradient(135deg, #FF6B8A, #FF8E53)', boxShadow: '0 10px 30px rgba(255,107,138,0.4)' }}>
              {loadingQuestions ? 'Loading...' : "Let's Go 🚀"}
            </button>
            <button onClick={() => setSelectedTest(null)} className="text-white/40 text-sm hover:text-white/60">← Back</button>
          </div>
        </div>
      )}
      {selectedTest && selectedTest.id === PHQ9_TEST_ID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: '#1A1D2E' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
            <button onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">PHQ-9 Assessment</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Over the last 2 weeks, how often have you been bothered by these problems?</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">⏱ Takes 3 mins</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">📋 {selectedTest.question_count} Questions</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">🎯 Depression Screening</span>
            </div>
            <button onClick={handleStartTest} className="w-full py-3.5 rounded-2xl text-white font-bold text-lg mb-3" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', boxShadow: '0 10px 30px rgba(139,92,246,0.4)' }}>
              {loadingQuestions ? 'Loading...' : "Let's Go 🚀"}
            </button>
            <button onClick={() => setSelectedTest(null)} className="text-white/40 text-sm hover:text-white/60">← Back</button>
          </div>
        </div>
      )}
      {selectedTest && selectedTest.name?.toUpperCase().includes('EMOTIONAL') && selectedTest.id !== SLEEP_TEST_ID && selectedTest.id !== NUTRITION_TEST_ID && selectedTest.id !== GAD7_TEST_ID && selectedTest.id !== PHQ9_TEST_ID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: '#1A1D2E' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
            <button onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="text-6xl mb-6">🌈</div>
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#FF6B9D] to-[#C850C0] bg-clip-text text-transparent">Emotional Health Assessment</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Over the last 2 weeks, how often have you been experiencing the following?</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">⏱ Takes 3 mins</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">📋 {selectedTest.question_count} Questions</span>
              <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs">🎯 Emotional Wellness</span>
            </div>
            <button onClick={handleStartTest} className="w-full py-3.5 rounded-2xl text-white font-bold text-lg mb-3" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C850C0)', boxShadow: '0 10px 30px rgba(255,107,157,0.4)' }}>
              {loadingQuestions ? 'Loading...' : "Let's Go 🚀"}
            </button>
            <button onClick={() => setSelectedTest(null)} className="text-white/40 text-sm hover:text-white/60">← Back</button>
          </div>
        </div>
      )}
      {selectedTest && selectedTest.id !== SLEEP_TEST_ID && selectedTest.id !== NUTRITION_TEST_ID && selectedTest.id !== GAD7_TEST_ID && selectedTest.id !== PHQ9_TEST_ID && !selectedTest.name?.toUpperCase().includes('EMOTIONAL') && (
        <div 
        style={{
          backgroundImage: `url(${selectedTest.splash_image_s3_key})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 50,
        }}
        className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#fff7fa] to-[#f8f3fa] p-0 m-0 fixed top-0 left-0 z-50">
          <div
            className="w-full max-w-xl rounded-3xl shadow-lg flex flex-col items-center relative  p-0 sm:p-8 min-h-[500px] mx-auto"
           
          >
            {/* Optional: overlay for readability */}
            <div className="absolute inset-0 rounded-3xl" style={{ background: selectedTest.splash_image_s3_key ? 'rgba(255,255,255,0.85)' : 'transparent', zIndex: 1 }}></div>
            <div className="relative z-10 w-full flex flex-col items-center">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 z-10"
                onClick={() => setSelectedTest(null)}
              >
                &times;
              </button>
              <div className="flex flex-col items-center justify-center w-full">
                {selectedTest.image_url && (
                  <img
                    src={selectedTest.image_url}
                    alt="Splash"
                    className="w-24 h-24 object-contain mb-6 mt-8"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2 text-center z-10 mt-4">
                  Ready for Your {selectedTest.name}?
                </h2>
                <p className="text-gray-600 text-center mb-6 z-10">
                  {selectedTest.description || "No description available"}
                </p>
                <div className="flex justify-center flex-wrap gap-3 mb-8 z-10">
                  <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                    <span role="img" aria-label="timer">
                      ⏱
                    </span>{" "}
                    Takes 3 mins
                  </span>
                  <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                    <span role="img" aria-label="questions">
                      📋
                    </span>{" "}
                    {selectedTest.question_count} Questions
                  </span>
                  <span className="bg-[#F3EAF7] text-[#704180] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                    <span role="img" aria-label="results">
                      🎯
                    </span>{" "}
                    Personalized Results
                  </span>
                </div>
                <button
                  className="w-full py-2 rounded-full text-white font-semibold text-lg mb-3 z-10"
                  style={{
                    background:
                      "linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)",
                  }}
                  onClick={handleStartTest}
                >
                  Start test
                </button>
                <button
                  className="w-full py-2 rounded-full border border-[#8B2D6C] text-[#8B2D6C] font-semibold text-lg z-10"
                  onClick={() => setSelectedTest(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showQuiz && isSleepQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSleepExitOpen(true)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <span className="text-xs text-gray-500 bg-[#2D3048] px-3 py-1 rounded-full">{sleepPart + 1} / 2</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">{sleepPart === 0 ? '😴 Sleep Quality' : '🌙 Lifestyle & Impact'}</h2>
            <p className="text-sm text-gray-400 text-center mb-4">{sleepPart === 0 ? "How's your actual sleep been?" : 'How sleep affects your daily life'}</p>
            {/* Progress */}
            <div className="h-1 bg-[#2D3048] rounded-full mb-1">
              <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(answers.filter(a => a?.answer).length / questions.length) * 100}%`, background: 'linear-gradient(90deg, #7C5CFC, #6C8AFF)' }} />
            </div>
            <p className="text-xs text-gray-500 text-right mb-6">{answers.filter(a => a?.answer).length} / {questions.length}</p>
            {/* Questions */}
            {(() => {
              const mid = Math.ceil(questions.length / 2);
              const partQuestions = sleepPart === 0 ? questions.slice(0, mid) : questions.slice(mid);
              const emojis = ['😴', '👀', '🌅', '😤', '🔍', '📱', '☕', '😠', '📉', '💤'];
              return partQuestions.map((q: any, idx: number) => {
                const globalIdx = sleepPart === 0 ? idx : idx + mid;
                const emoji = emojis[globalIdx] || '❓';
                const selected = answers[globalIdx]?.answer;
                return (
                  <div key={q.id || idx} className="mb-3 p-4 rounded-2xl" style={{ background: '#252840' }}>
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-lg">{emoji}</span>
                      <span className="text-white text-sm font-semibold leading-snug">{q.question}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {(q.scaleOptions || []).map((option: string, i: number) => (
                        <button key={option} onClick={() => handleScrollableAnswer(globalIdx, option)} className={`py-3 rounded-xl text-center transition-all ${selected === option ? 'text-white' : 'text-gray-400 border border-white/10'}`} style={selected === option ? { background: 'linear-gradient(135deg, #7C5CFC, #6C8AFF)' } : { background: '#2D3048' }}>
                          <div className="text-lg font-bold">{i}</div>
                          <div className="text-[10px] mt-0.5">{option}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
            {/* Bottom buttons */}
            <div className="flex gap-3 mt-6 pb-8">
              {sleepPart > 0 && (
                <button onClick={() => setSleepPart(0)} className="flex-1 py-4 rounded-2xl border border-white/20 text-white font-semibold">Back</button>
              )}
              {sleepPart === 0 ? (
                <button onClick={() => {
                  const mid = Math.ceil(questions.length / 2);
                  const allPartAnswered = answers.slice(0, mid).every(a => a?.answer);
                  if (allPartAnswered) setSleepPart(1);
                }} className="flex-1 py-4 rounded-2xl text-white font-semibold" style={{ background: answers.slice(0, Math.ceil(questions.length / 2)).every(a => a?.answer) ? 'linear-gradient(135deg, #7C5CFC, #6C8AFF)' : '#2D3048', color: answers.slice(0, Math.ceil(questions.length / 2)).every(a => a?.answer) ? 'white' : '#8E8EA0' }}>Next →</button>
              ) : (
                <button onClick={() => { if (answers.every(a => a?.answer)) handleSubmitQuiz(); }} className="flex-1 py-4 rounded-2xl text-white font-semibold" style={{ background: answers.every(a => a?.answer) ? 'linear-gradient(135deg, #7C5CFC, #6C8AFF)' : '#2D3048', color: answers.every(a => a?.answer) ? 'white' : '#8E8EA0' }}>Submit Answers ✨</button>
              )}
            </div>
          </div>
          {/* Exit confirmation */}
          {sleepExitOpen && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50">
              <div className="w-full max-w-sm mx-4 mb-8 sm:mb-0 rounded-3xl p-6" style={{ background: '#252840' }}>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">Leave Test?</h3>
                  <p className="text-gray-400 text-sm text-center mb-6">Your answers won't be saved and you'll need to start over.</p>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setSleepExitOpen(false)} className="flex-1 py-3 rounded-2xl text-white font-semibold" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C8AFF)' }}>Keep Going</button>
                    <button onClick={() => { setSleepExitOpen(false); setShowQuiz(false); setSleepPart(0); setAnswers([]); }} className="flex-1 py-3 rounded-2xl text-red-400 font-semibold bg-red-500/15">Leave</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showQuiz && isNutritionQuiz && (
        <NutritionQuiz
          questions={questions}
          onClose={() => handleHomeScreen()}
          onSubmit={async (formatted, onResult) => {
            try {
              const authCookie = Cookies.get("auth");
              let token = "";
              if (authCookie) { try { token = JSON.parse(authCookie).token; } catch { token = ""; } }
              const response = await axios.post(`https://zenomiai.elitceler.com/api/score-test/${currentTestId}`, { answers: formatted }, { headers: { Authorization: `Bearer ${token}` } });
              const d = response.data || {};
              onResult({
                score: d.user_score ?? d.score ?? 0,
                maxScore: d.max_score_for_test ?? d.maxScore ?? 100,
                label: d.label ?? '',
                categories: d.categories ?? [],
                recommendations: d.recommendations ?? [],
              });
              const res = await axios.get("https://zenomiai.elitceler.com/api/testnames", { headers: { Authorization: `Bearer ${token}` } });
              setTests(res.data);
            } catch {
              // Still show results even if API fails
              onResult({ score: 0, maxScore: 100, label: '', categories: [], recommendations: [] });
            }
          }}
        />
      )}
      {showQuiz && isGad7Quiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setShowQuiz(false); setAnswers([]); }} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <span className="text-xs text-gray-500 bg-[#2D3048] px-3 py-1 rounded-full">{answers.filter(a => a?.answer).length} / {questions.length}</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">🧠 GAD-7 Assessment</h2>
            <p className="text-sm text-gray-400 text-center mb-4">Over the last 2 weeks, how often have you been bothered by the following?</p>
            <div className="h-1 bg-[#2D3048] rounded-full mb-6">
              <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(answers.filter(a => a?.answer).length / questions.length) * 100}%`, background: 'linear-gradient(90deg, #FF6B8A, #FF8E53)' }} />
            </div>
            {questions.map((q: any, idx: number) => {
              const selected = answers[idx]?.answer;
              return (
                <div key={q.id || idx} className="mb-3 p-4 rounded-2xl" style={{ background: '#252840' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#22C55E' }}>{idx + 1}</span>
                    <span className="text-white text-sm font-semibold leading-snug">{q.question}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(q.scaleOptions || []).map((option: string, i: number) => {
                      const emojis = ['😌', '😐', '😟', '😰'];
                      const selectedBgs = ['linear-gradient(135deg, #22C55E, #16A34A)', 'linear-gradient(135deg, #EAB308, #CA8A04)', 'linear-gradient(135deg, #F97316, #EA580C)', 'linear-gradient(135deg, #EF4444, #DC2626)'];
                      return (
                        <button key={option} onClick={() => handleScrollableAnswer(idx, option)} className={`min-h-[72px] h-full flex flex-col items-center justify-center rounded-xl text-center transition-all ${selected === option ? 'text-white' : 'text-gray-400 border border-white/10'}`} style={selected === option ? { background: selectedBgs[i] } : { background: '#2D3048' }}>
                          <div className="text-lg">{emojis[i]}</div>
                          <div className="text-[10px] mt-0.5 px-1 leading-tight">{option}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button onClick={() => { if (answers.filter(a => a?.answer).length === questions.length) handleSubmitQuiz(); }} className="w-full py-4 rounded-2xl text-white font-bold text-lg mt-6" style={{ background: answers.filter(a => a?.answer).length === questions.length ? 'linear-gradient(135deg, #FF6B8A, #FF8E53)' : '#2D3048', color: answers.filter(a => a?.answer).length === questions.length ? 'white' : '#8E8EA0' }}>
              Submit Answers ✨
            </button>
          </div>
        </div>
      )}
      {showQuiz && isPhq9Quiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setShowQuiz(false); setAnswers([]); }} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <span className="text-xs text-gray-500 bg-[#2D3048] px-3 py-1 rounded-full">{answers.filter(a => a?.answer).length} / {questions.length}</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">💜 PHQ-9 Assessment</h2>
            <p className="text-sm text-gray-400 text-center mb-4">Over the last 2 weeks, how often have you been bothered by these problems?</p>
            <div className="h-1 bg-[#2D3048] rounded-full mb-6">
              <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(answers.filter(a => a?.answer).length / questions.length) * 100}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }} />
            </div>
            {questions.map((q: any, idx: number) => {
              const selected = answers[idx]?.answer;
              return (
                <div key={q.id || idx} className="mb-3 p-4 rounded-2xl" style={{ background: '#252840' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#8B5CF6' }}>{idx + 1}</span>
                    <span className="text-white text-sm font-semibold leading-snug">{q.question}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(q.scaleOptions || []).map((option: string, i: number) => {
                      const emojis = ['😌', '😐', '😟', '😰'];
                      return (
                        <button key={option} onClick={() => handleScrollableAnswer(idx, option)} className={`min-h-[72px] h-full flex flex-col items-center justify-center rounded-xl text-center transition-all ${selected === option ? 'text-white' : 'text-gray-400 border border-white/10'}`} style={selected === option ? { background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' } : { background: '#2D3048' }}>
                          <div className="text-lg">{emojis[i]}</div>
                          <div className="text-[10px] mt-0.5 px-1 leading-tight">{option}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button onClick={() => { if (answers.filter(a => a?.answer).length === questions.length) handleSubmitQuiz(); }} className="w-full py-4 rounded-2xl text-white font-bold text-lg mt-6" style={{ background: answers.filter(a => a?.answer).length === questions.length ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' : '#2D3048', color: answers.filter(a => a?.answer).length === questions.length ? 'white' : '#8E8EA0' }}>
              Submit Answers ✨
            </button>
          </div>
        </div>
      )}
      {showQuiz && isEmotionalQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setShowQuiz(false); setAnswers([]); }} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <span className="text-xs text-gray-500 bg-[#2D3048] px-3 py-1 rounded-full">{answers.filter(a => a?.answer).length} / {questions.length}</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">💚 Emotional Health</h2>
            <p className="text-sm text-gray-400 text-center mb-2">Explore your emotional well-being across 3 dimensions</p>
            <div className="h-1 bg-[#2D3048] rounded-full mb-6">
              <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(answers.filter(a => a?.answer).length / questions.length) * 100}%`, background: 'linear-gradient(90deg, #FF6B8A, #E040FB)' }} />
            </div>
            {[{ title: 'Self-Awareness 🧠', start: 0 }, { title: 'Self-Regulation 🎯', start: 5 }, { title: 'Motivation 🚀', start: 10 }].map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-white font-bold text-lg mb-3">{section.title}</h3>
                {questions.slice(section.start, section.start + 5).map((q: any, idx: number) => {
                  const globalIdx = section.start + idx;
                  const selected = answers[globalIdx]?.answer;
                  const emojis = ['🌟', '😊', '😐', '😟', '😣'];
                  return (
                    <div key={q.id || globalIdx} className="mb-3 p-4 rounded-2xl" style={{ background: '#252840' }}>
                      <p className="text-white text-sm font-semibold mb-3">{q.question}</p>
                      <div className="grid grid-cols-5 gap-2">
                        {(q.scaleOptions || []).map((option: string, i: number) => (
                          <button key={option} onClick={() => handleScrollableAnswer(globalIdx, option)} className={`min-h-[72px] h-full flex flex-col items-center justify-center rounded-xl text-center transition-all ${selected === option ? 'text-white' : 'text-gray-400 border border-white/10'}`} style={selected === option ? { background: 'linear-gradient(135deg, #FF6B8A, #E040FB)' } : { background: '#2D3048' }}>
                            <div className="text-lg">{emojis[i] || '❓'}</div>
                            <div className="text-[10px] mt-0.5 px-1 leading-tight">{option}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <button onClick={() => { if (answers.filter(a => a?.answer).length === questions.length) handleSubmitQuiz(); }} className="w-full py-4 rounded-2xl text-white font-bold text-lg mt-4" style={{ background: answers.filter(a => a?.answer).length === questions.length ? 'linear-gradient(135deg, #FF6B8A, #E040FB)' : '#2D3048', color: answers.filter(a => a?.answer).length === questions.length ? 'white' : '#8E8EA0' }}>
              Submit Answers ✨
            </button>
          </div>
        </div>
      )}
      {showQuiz && !isSleepQuiz && !isNutritionQuiz && !isGad7Quiz && !isPhq9Quiz && !isEmotionalQuiz && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#fff7fa] to-[#f8f3fa] p-0 m-0 fixed top-0 left-0 z-50">
          <div
            className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen"
          >
            <div
              className="w-full bg-white rounded-3xl shadow-lg flex flex-col items-center relative font-['Urbanist'] p-0 sm:p-6"
              style={{ minHeight: '500px' }}
            >
              <h2 className="text-2xl font-bold mb-2 text-left w-full px-8 pt-8">
                {selectedTest?.name || "Test"} Quiz
              </h2>
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
                  <div className="w-full flex items-center mb-6 px-8">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-[#F3C96B] to-[#E5E0EA]"
                        style={{
                          width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full bg-[#F8F3FA] rounded-2xl p-8 flex flex-col items-center">
                    <div className="text-center mb-4 text-gray-700 font-semibold">
                      Question {String(currentQuestion + 1).padStart(2, "0")}/{questions.length}
                    </div>
                    <div className="text-center text-xl font-bold mb-8">
                      {questions[currentQuestion]?.question}
                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-xl">
                      {/* Render input based on type */}
                      {(() => {
                        const q = questions[currentQuestion];
                        if (!q) return null;
                        if (q.questionType === "NUMBER") {
                          return (
                            <input
                              type="number"
                              className="w-full py-4 rounded-full border-2 border-[#8B2D6C] text-lg font-medium px-6"
                              value={answers[currentQuestion]?.answer || ""}
                              onChange={(e) => handleAnswer(e.target.value)}
                            />
                          );
                        }
                        if (q.questionType === "BOOLEAN") {
                          return (
                            <div className="flex gap-4">
                              {["Yes", "No"].map((option) => (
                                <button
                                  key={option}
                                  className={`flex-1 py-4 rounded-full border-2 text-lg font-medium ${
                                    answers[currentQuestion]?.answer === option
                                      ? "bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white"
                                      : "border-[#8B2D6C] text-[#704180] bg-white"
                                  }`}
                                  onClick={() => handleAnswer(option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          );
                        }
                        if (q.questionType === "TEXT") {
                          return (
                            <textarea
                              className="w-full py-4 rounded-2xl border-2 border-[#8B2D6C] text-lg font-medium px-6"
                              rows={4}
                              value={answers[currentQuestion]?.answer || ""}
                              onChange={(e) => handleAnswer(e.target.value)}
                            />
                          );
                        }
                        // SCALE question
                        return (q.scaleOptions || []).map((option: string) => (
                          <button
                            key={option}
                            className={`w-full py-4 rounded-full border-2 text-lg font-medium ${
                              answers[currentQuestion]?.answer === option
                                ? "bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white"
                                : "border-[#8B2D6C] text-[#704180] bg-white"
                            }`}
                            onClick={() => handleAnswer(option)} // Pass the full option string
                          >
                            {option.includes(':') ? option.split(':').slice(1).join(':').trim() : option}
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
                        disabled={
                          submittingQuiz ||
                          !answers[currentQuestion] ||
                          !answers[currentQuestion].answer
                        }
                      >
                        {submittingQuiz
                          ? "Submitting..."
                          : currentQuestion === questions.length - 1
                          ? "Submit"
                          : "Next"}
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
        </div>
      )}

      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #704180, #8B2D6C)' }}>
          <div className="w-full max-w-lg px-6 flex flex-col items-center text-center">
            <svg className="w-20 h-20 text-white mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="text-2xl font-bold mb-3 text-white">
              You've Completed the {lastCompletedTestName || 'Test'}!
            </h2>
            <p className="text-white/80 text-base mb-8">
              Your results are ready and personalized just for you.
            </p>
            <button
              className="w-full py-4 rounded-full bg-white text-[#704180] font-bold text-lg mb-4"
              onClick={() => handleHomeScreen()}
            >
              Done
            </button>
            {completedCount !== tests.length && (
              <button
                className="w-full py-4 rounded-full bg-white text-[#704180] font-bold text-lg"
                onClick={() => {
                  setShowCompletionDialog(false);
                  const nextTest = tests.find(t => t.testStatus === 'UNLOCKED');
                  if (nextTest) setSelectedTest(nextTest);
                }}
              >
                Take next test
              </button>
            )}
          </div>
        </div>
      )}
      {/* Sleep Results Screen */}
      {sleepResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-lg mx-auto px-4 py-8 pb-24">
            <h1 className="text-2xl font-bold text-center mb-1" style={{ color: '#7C5CFC' }}>Your Sleep Report</h1>
            <p className="text-sm text-gray-400 text-center mb-8">Here's what your answers tell us 🔍</p>

            {/* Global Score */}
            <div className="rounded-2xl p-8 mb-4 flex flex-col items-center" style={{ background: '#252840' }}>
              <svg width="130" height="130" className="mb-3">
                <circle cx="65" cy="65" r="55" stroke="#00D4AA22" strokeWidth="10" fill="none" />
                <circle cx="65" cy="65" r="55" stroke="#00D4AA" strokeWidth="10" fill="none"
                  strokeDasharray={2 * Math.PI * 55}
                  strokeDashoffset={2 * Math.PI * 55 * (1 - (sleepResults.score / sleepResults.max))}
                  strokeLinecap="round" transform="rotate(-90 65 65)" />
                <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="32" fill="white" fontWeight="bold">{sleepResults.score}</text>
              </svg>
              <p className="text-xs text-gray-400 tracking-wider mb-2">GLOBAL SCORE / {sleepResults.max}</p>
              <p className="text-sm text-gray-400 text-center">{sleepResults.assessment || (sleepResults.score <= 10 ? "Your sleep health looks great! 🌟" : sleepResults.score <= 20 ? "Your sleep health looks decent! Keep building good habits." : "Your sleep could use some improvement.")}</p>
            </div>

            {/* Sub scores */}
            {(() => {
              const sleepSev = Math.ceil(sleepResults.score / 2);
              const lifImp = sleepResults.score - sleepSev;
              const halfMax = Math.ceil(sleepResults.max / 2);
              const sevLabel = sleepSev <= 5 ? 'Healthy Sleep' : sleepSev <= 10 ? 'Mild Insomnia' : 'Moderate Insomnia';
              const lifLabel = lifImp <= 5 ? 'Healthy Habits' : lifImp <= 10 ? 'Mild Impact' : 'Moderate Impact';
              return (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: '#252840' }}>
                    <svg width="80" height="80" className="mb-2">
                      <circle cx="40" cy="40" r="32" stroke="#F7C56922" strokeWidth="7" fill="none" />
                      <circle cx="40" cy="40" r="32" stroke="#F7C569" strokeWidth="7" fill="none"
                        strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - sleepSev / halfMax)}
                        strokeLinecap="round" transform="rotate(-90 40 40)" />
                      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="20" fill="white" fontWeight="bold">{sleepSev}</text>
                    </svg>
                    <p className="text-[10px] text-gray-400 tracking-wider">SLEEP SEVERITY / {halfMax}</p>
                    <p className="text-lg mt-1">🌙</p>
                    <p className="text-xs text-white font-semibold">{sevLabel}</p>
                  </div>
                  <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: '#252840' }}>
                    <svg width="80" height="80" className="mb-2">
                      <circle cx="40" cy="40" r="32" stroke="#00D4AA22" strokeWidth="7" fill="none" />
                      <circle cx="40" cy="40" r="32" stroke="#00D4AA" strokeWidth="7" fill="none"
                        strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - lifImp / (sleepResults.max - halfMax))}
                        strokeLinecap="round" transform="rotate(-90 40 40)" />
                      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="20" fill="white" fontWeight="bold">{lifImp}</text>
                    </svg>
                    <p className="text-[10px] text-gray-400 tracking-wider">LIFESTYLE / {sleepResults.max - halfMax}</p>
                    <p className="text-lg mt-1">💚</p>
                    <p className="text-xs text-white font-semibold">{lifLabel}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tips */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#252840' }}>
              <h3 className="text-white font-bold mb-2">💡 What This Means For You</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{sleepResults.assessment && sleepResults.sentiment ? `${sleepResults.assessment} — Outlook: ${sleepResults.sentiment} ✨` : 'Keep building healthy sleep habits. Small tweaks like a consistent schedule will keep you at your best. ✨'}</p>
            </div>
            <div className="rounded-2xl p-5 mb-6" style={{ background: '#252840' }}>
              <h3 className="text-white font-bold mb-3">🚀 Quick Wins</h3>
              {['🚫 Put your phone on "Do Not Disturb" 30 min before bed', '🧊 Keep your room cool — 65–68°F is the sweet spot', '☕ No caffeine after 2pm', '⏰ Same wake-up time every day — even weekends'].map((tip, i) => (
                <p key={i} className="text-sm text-gray-400 mb-2">{tip}</p>
              ))}
            </div>

            <button onClick={() => handleHomeScreen()} className="w-full py-4 rounded-2xl text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C8AFF)' }}>
              Done 🏠
            </button>
          </div>
        </div>
      )}
      {/* GAD-7 Results Screen */}
      {gad7Results && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-lg mx-auto px-4 py-8 pb-24">
            <h1 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-[#FF6B8A] to-[#FF8E53] bg-clip-text text-transparent">GAD-7 Results</h1>
            <p className="text-sm text-gray-400 text-center mb-8">Here's what your answers tell us 🔍</p>
            <div className="rounded-2xl p-8 mb-4 flex flex-col items-center" style={{ background: '#252840' }}>
              <div className="text-5xl mb-4">⛅</div>
              <span className="text-[56px] font-bold leading-none mb-1 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${gad7Results.score <= 4 ? '#4CAF50, #66BB6A' : gad7Results.score <= 9 ? '#FFC107, #FFD54F' : gad7Results.score <= 14 ? '#FF9800, #FFB74D' : '#FF6B6B, #FF4444'})` }}>{gad7Results.score}</span>
              <p className="text-sm text-gray-500 mb-4">out of 21</p>
              <span className="px-4 py-1.5 rounded-full text-white text-sm font-bold mb-3" style={{ background: 'linear-gradient(135deg, #FF6B8A, #FF8E53)' }}>{gad7Results.label}</span>
              <p className="text-sm text-gray-400 text-center">{gad7Results.description}</p>
            </div>
            <div className="rounded-2xl p-4 mb-6" style={{ background: '#252840' }}>
              <p className="text-xs text-gray-500 text-center">⚠️ This is a screening tool, not a diagnosis. Please consult a healthcare professional for clinical evaluation.</p>
            </div>
            <button onClick={() => handleHomeScreen()} className="w-full py-4 rounded-2xl text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #FF6B8A, #FF8E53)' }}>
              Done 🏠
            </button>
          </div>
        </div>
      )}
      {/* PHQ-9 Results Screen */}
      {phq9Results && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-lg mx-auto px-5 py-6 pb-24">
            {/* Main card */}
            <div className="rounded-[20px] overflow-hidden mb-4" style={{ background: '#252840' }}>
              {/* Gradient header with score */}
              <div className="w-full py-8 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #FF8E53, #8B5CF6)' }}>
                <div className="text-5xl mb-3">⛅</div>
                <span className="text-[48px] font-bold text-white leading-none">{phq9Results.score}</span>
                <p className="text-sm text-white/70 mt-1">out of 27</p>
                <p className="text-xl font-bold text-white mt-2 text-center px-4">{phq9Results.label}</p>
              </div>
              {/* Description */}
              <div className="p-5">
                <p className="text-sm text-gray-400 text-center leading-relaxed">{phq9Results.description}</p>
              </div>
            </div>
            {/* Disclaimer */}
            <div className="rounded-2xl p-4 mb-6 border border-white/10">
              <p className="text-xs text-gray-500 text-center leading-relaxed">Disclaimer: This is a screening tool, not a diagnosis. Please consult a qualified healthcare professional for clinical evaluation.</p>
            </div>
            <button onClick={() => handleHomeScreen()} className="w-full py-4 rounded-2xl text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
              Done 🏠
            </button>
          </div>
        </div>
      )}
      {/* Emotional Health Results Screen */}
      {emotionalResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#1A1D2E' }}>
          <div className="max-w-lg mx-auto px-5 py-6 pb-24">
            {/* Score card with gradient header */}
            <div className="rounded-[20px] overflow-hidden mb-4" style={{ background: '#252840' }}>
              <div className="w-full py-7 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #FF8E53, #FF6B9D)' }}>
                <div className="text-4xl mb-3">🌱</div>
                <h1 className="text-[28px] font-bold text-white">{emotionalResults.score <= 25 ? 'Needs Attention' : emotionalResults.score <= 50 ? 'Growing Stronger' : 'Thriving'}</h1>
              </div>
              <div className="p-5 text-center">
                <p className="text-base font-semibold text-white mb-2">Total Score: {emotionalResults.score} / {emotionalResults.max}</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {emotionalResults.score <= 25
                    ? "Your emotional well-being could use some extra care right now. Consider reaching out to a counselor or someone you trust. 💙"
                    : emotionalResults.score <= 50
                      ? "You're making good progress with your emotional skills. Keep building on what's working for you! 🌱"
                      : "Your emotional well-being is in a great place! Your self-awareness and resilience are shining through. 🌟"}
                </p>
              </div>
            </div>
            {/* Category cards in a row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {emotionalResults.categories.map((cat) => (
                <div key={cat.name} className="rounded-2xl p-3 flex flex-col items-center" style={{ background: '#252840' }}>
                  <div className="text-2xl mb-1.5">{cat.emoji}</div>
                  <p className="text-[11px] font-semibold text-white text-center mb-2.5">{cat.name}</p>
                  <div className="w-full h-1.5 rounded-full bg-[#1A1D2E] mb-2">
                    <div className="h-1.5 rounded-full" style={{ width: `${(cat.score / cat.max) * 100}%`, background: 'linear-gradient(90deg, #FF6B9D, #C850C0)' }} />
                  </div>
                  <p className="text-sm font-bold text-white">{cat.score}/{cat.max}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{cat.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => handleHomeScreen()} className="w-full py-4 rounded-2xl text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C850C0)' }}>
              Done 🏠
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
