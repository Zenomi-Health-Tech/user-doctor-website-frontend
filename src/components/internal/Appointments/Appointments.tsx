import { useEffect, useState } from "react";
import api from "@/utils/api";
import Cookies from "js-cookie";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import topresultimage from '@/assets/topResultImage.png'

// Doctor types and tabs
interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime: string;
  status?: string;
  user: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}
const DOCTOR_TABS = [
  "All",
  "Completed",
  "Rescheduled",
  "Rejected",
  "Upcoming",
] as const;
type DoctorTabType = (typeof DOCTOR_TABS)[number];

// User types and tabs
interface UserAppointment {
  id: string;
  doctorId: string;
  userId: string;
  preferredDate: string;
  preferredTime: string;
  status?: string;
  reason?: string;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    photoUrl: string | null;
    consultationFee: number;
  };
}

export default function Appointments() {
  const { isDoctor, isUser, userName } = useAuth();
  const navigate = useNavigate();

  // --- Doctor State & Logic ---
  const [appointments, setAppointments] = useState<{
    previous: Appointment[];
    upcoming: Appointment[];
  }>({ previous: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<DoctorTabType>("All");

  const handlePatientClick = (id: string) => {
    navigate(`/patients/${id}`);
  };
  const checklist = [
    "Start Your Daily Mental Health Check-In",
    "Review Your Recent Test Results",
    "Talk to a Mental Health Expert",
  ];

  useEffect(() => {
    if (!isDoctor) return;
    const fetchAppointments = async () => {
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
        const response = await api.get("/doctors/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (
          response.data.success &&
          response.data.data &&
          Array.isArray(response.data.data.previous_appointments) &&
          Array.isArray(response.data.data.upcoming_appointments)
        ) {
          setAppointments({
            previous: response.data.data.previous_appointments,
            upcoming: response.data.data.upcoming_appointments,
          });
        } else {
          setAppointments({ previous: [], upcoming: [] });
        }
      } catch (error) {
        setAppointments({ previous: [], upcoming: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [isDoctor]);

  const filteredAppointments =
    activeTab === "All"
      ? appointments.previous.filter(
          (appt) =>
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === "Completed"
      ? appointments.previous.filter(
          (appt) =>
            appt.status === "COMPLETED" &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === "Rescheduled"
      ? appointments.previous.filter(
          (appt) =>
            appt.status === "RESCHEDULED" &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === "Rejected"
      ? appointments.previous.filter(
          (appt) =>
            appt.status === "REJECTED" &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : appointments.upcoming.filter(
          (appt) =>
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // --- User State & Logic ---
  const [userAppointments, setUserAppointments] = useState<{
    previous: UserAppointment[];
    upcoming: UserAppointment[];
  }>({ previous: [], upcoming: [] });
  const [userLoading, setUserLoading] = useState(true);
  const [userActiveTab, setUserActiveTab] = useState<'Upcoming' | 'Previous'>('Upcoming');

  useEffect(() => {
    if (!isUser) return;
    const fetchAppointments = async () => {
      setUserLoading(true);
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
        const response = await api.get("/users/get-user-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        
        if (
          response.data.success &&
          response.data.data &&
          Array.isArray(response.data.data.previous_appointments) &&
          Array.isArray(response.data.data.upcoming_appointments)
        ) {
          setUserAppointments({
            previous: response.data.data.previous_appointments,
            upcoming: response.data.data.upcoming_appointments,
          });
        } else {
          setUserAppointments({ previous: [], upcoming: [] });
        }
      } catch (error) {
        setUserAppointments({ previous: [], upcoming: [] });
      } finally {
        setUserLoading(false);
      }
    };
    fetchAppointments();
  }, [isUser]);

  const userAppointmentsToShow = userActiveTab === 'Upcoming' ? userAppointments.upcoming : userAppointments.previous;



  // --- Render ---
  if (isDoctor) {
    return (
      <div className="p-8  min-h-screen font-['Poppins']">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Appointment Details
        </h1>
        <div className="flex justify-end mb-4">
          <button
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition"
            onClick={() => navigate('/appointments/set-availability')}
          >
            Set Availability
          </button>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your appointments here"
              className="w-full py-3 pl-10 pr-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 ml-4">
           
            {/* <button
              className="p-3 rounded-full bg-white border border-gray-200 shadow-sm"
              onClick={() => navigate("/appointments/set-availability")}
            >
              <Calendar className="w-5 h-5 text-gray-500" />
            </button> */}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b mb-6">
          {DOCTOR_TABS.map((tab) => (
            <button
              key={tab}
              className={`px-4 pb-2 text-lg font-medium focus:outline-none ${
                activeTab === tab
                  ? "border-b-2 border-[#8B2D6C] text-[#8B2D6C]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40 text-xl">
            Loading appointments...
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => handlePatientClick(appt.userId)}
                  className="bg-white cursor-pointer rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
                      {appt.user && appt.user.name
                        ? appt.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : ""}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-lg">
                        {appt.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {formatDate(appt.preferredDate)} Time: {formatTime(appt.preferredTime)}
                      </p>
                    </div>
                  </div>
                  {appt.status === "COMPLETED" && (
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  )}
                  {appt.status === "UPCOMING" && (
                    <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Upcoming
                    </span>
                  )}
                  {appt.status === "RESCHEDULED" && (
                    <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Rescheduled
                    </span>
                  )}
                  {appt.status === "REJECTED" && (
                    <span className="bg-red-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Rejected
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-lg mt-10">
                No appointments found.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- User UI ---
  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-screen font-['Poppins'] ">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-800">Appointments</h1>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
        {/* Left: Appointments List */}
        <div className="flex-grow w-full max-w-full lg:max-w-[800px] min-w-0">
          {/* Tabs */}
          <div className="flex mb-6 sm:mb-8 w-full max-w-xl rounded-full overflow-hidden bg-[#F6EEF3]" style={{height: 48}}>
            <button
              className={`w-1/2 py-3 text-lg font-normal transition-all focus:outline-none ${userActiveTab === 'Upcoming' ? 'text-white' : 'text-black'}`}
              style={userActiveTab === 'Upcoming'
                ? { background: 'linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)', borderRadius: '9999px 0 0 9999px' }
                : { background: '#F6EEF3', borderRadius: '9999px 0 0 9999px' }}
              onClick={() => setUserActiveTab('Upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`w-1/2 py-3 text-lg font-normal transition-all focus:outline-none ${userActiveTab === 'Previous' ? 'text-white' : 'text-black'}`}
              style={userActiveTab === 'Previous'
                ? { background: 'linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)', borderRadius: '0 9999px 9999px 0' }
                : { background: '#F6EEF3', borderRadius: '0 9999px 9999px 0' }}
              onClick={() => setUserActiveTab('Previous')}
            >
              Previous
            </button>
          </div>
          {/* Scrollable appointments list */}
          <div className="overflow-y-auto max-h-[70vh] pr-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
            {userLoading ? (
              <div className="flex  h-40 text-xl">Loading appointments...</div>
            ) : userAppointmentsToShow.length === 0 ? (
              <div className=" text-gray-500 text-lg mt-10">No appointments found.</div>
            ) : (
              <div className="space-y-6">
                {userAppointmentsToShow.map((appt) => {
                  // Get initials
                  const initials = appt.doctor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  // Format date (e.g., Sunday, 12 June)
                  const dateObj = new Date(appt.preferredDate);
                  const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
                  // Format time range (for now, just show start time)
                  const start = appt.preferredTime.slice(11,16); // 'HH:mm'
                  // Helper to add 30 minutes to 'HH:mm' string
                  function add30Minutes(timeStr: string) {
                    const [h, m] = timeStr.split(':').map(Number);
                    const date = new Date(0, 0, 0, h, m + 30, 0, 0);
                    const hh = date.getHours().toString().padStart(2, '0');
                    const mm = date.getMinutes().toString().padStart(2, '0');
                    return `${hh}:${mm}`;
                  }
                  const end = add30Minutes(start);
                  const startTimeStr = start;
                  const endTimeStr = end;
                  return (
                    <div
                      key={appt.id}
                      className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-4 sm:p-6 flex flex-col gap-4 max-w-full sm:max-w-xl "
                      style={{ boxShadow: '0px 2px 12px 0px #0000000A' }}
                    >
                      <div className="flex items-center gap-4">
                        {appt.doctor.photoUrl ? (
                          <img
                            src={appt.doctor.photoUrl}
                            alt={appt.doctor.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover bg-[#F8F2F9]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#F8F2F9] text-[#B06AB3] text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col justify-center ml-2">
                          <div className="text-lg sm:text-2xl font-bold text-[#1A2343]" style={{ fontFamily: 'Poppins, sans-serif' }}>{appt.doctor.name}</div>
                          <div className="text-base sm:text-lg text-gray-500 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Specialist in {appt.doctor.specialization}
                          </div>
                        </div>
                      </div>
                      <hr className="my-2 border-[#ECECEC]" />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-8 text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <svg width="20" height="20" fill="none" stroke="#1A2343" strokeWidth="2"><rect x="3" y="5" width="16" height="14" rx="4" /><path d="M8 3v4M14 3v4" /></svg>
                          <span className="text-sm sm:text-base font-medium">{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg width="20" height="20" fill="none" stroke="#1A2343" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M11 7v4l2 2" /></svg>
                          <span className="text-sm sm:text-base font-medium">{startTimeStr} - {endTimeStr}</span>
                        </div>
                      </div>
                      {/* <button
                        className="w-full mt-2 py-4 rounded-full text-white font-semibold text-lg shadow hover:opacity-90 transition"
                        style={{ background: 'linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)' }}
                      >
                        Reschedule
                      </button> */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Right: Cards */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 sm:gap-6 font-['Poppins'] mt-6 lg:mt-0">
          {/* Doctor Card */}
          <div className="bg-white rounded-3xl shadow p-4 sm:p-6 flex flex-col items-center border border-[#BCBCBC]">
            <img src={topresultimage} alt="Doctor" className="w-36 h-20 sm:w-52 sm:h-32 object-cover rounded-xl mb-3 sm:mb-4" />
            <div className="font-semibold text-base sm:text-lg mb-1 text-center">Talk to a Doctor?</div>
            <div className="text-gray-500 text-center mb-3 sm:mb-4">Book your session now</div>
            <button onClick={() => navigate('/appointments/set-availability-user')} className="px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base text-white" style={{background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)'}}>Book now</button>
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
    </div>
  );
}
