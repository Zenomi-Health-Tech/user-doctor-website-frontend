import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { Search, SlidersHorizontal, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime: string;
  status?: string; // if available
  user: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  // add other fields as needed
}

const TABS = ['All', 'Completed', 'Rescheduled', 'Rejected', 'Upcoming'] as const;
type TabType = typeof TABS[number];

export default function Appointments() {
  const [appointments, setAppointments] = useState<{ previous: Appointment[]; upcoming: Appointment[] }>({ previous: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
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
        const response = await api.get('/doctors/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Appointments API response:', response.data);
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
  }, []);

  const filteredAppointments =
    activeTab === 'All'
      ? appointments.previous.filter(
          (appt) =>
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === 'Completed'
      ? appointments.previous.filter(
          (appt) =>
            appt.status === 'COMPLETED' &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === 'Rescheduled'
      ? appointments.previous.filter(
          (appt) =>
            appt.status === 'RESCHEDULED' &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : activeTab === 'Rejected'
      ? appointments.previous.filter(
          (appt) =>
            appt.status === 'REJECTED' &&
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : appointments.upcoming.filter(
          (appt) =>
            appt.user?.name &&
            appt.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Appointment Details</h1>
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
          <button onClick={() => navigate('/appointments/available-slots')} className="p-3 rounded-full bg-white border border-gray-200 shadow-sm">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          </button>
          <button
            className="p-3 rounded-full bg-white border border-gray-200 shadow-sm"
            onClick={() => navigate('/appointments/set-availability')}
          >
            <Calendar className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 pb-2 text-lg font-medium focus:outline-none ${
              activeTab === tab
                ? 'border-b-2 border-[#8B2D6C] text-[#8B2D6C]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40 text-xl">Loading appointments...</div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
                    {appt.user && appt.user.name
                      ? appt.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : ''}
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
                {appt.status === 'COMPLETED' && (
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Completed
                  </span>
                )}
                {appt.status === 'UPCOMING' && (
                  <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Upcoming
                  </span>
                )}
                {appt.status === 'RESCHEDULED' && (
                  <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Rescheduled
                  </span>
                )}
                {appt.status === 'REJECTED' && (
                  <span className="bg-red-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Rejected
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-lg mt-10">No appointments found.</div>
          )}
        </div>
      )}
    </div>
  );
}