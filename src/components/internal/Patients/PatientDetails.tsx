import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { ChevronDown, Clock, Search, SlidersHorizontal, ArrowRight } from 'lucide-react'; // Import necessary icons

interface ScoreData {
  [key: string]: number;
}

interface TestReport {
  id: string;
  cycle: string;
  updatedAt: string;
  createdAt: string;
  testsCompleted: number;
  rawScores: ScoreData;
  normalizedScores: ScoreData;
  reportView: string | null;
  reportDownload: string | null;
  detailedReportView: string | null;
  detailedReportDownload: string | null;
}

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  dob: string;
  noOfTests: number;
  createdAt: string;
  updatedAt: string;
  profilePicture: string | null;
  tests: TestReport[];
}

interface CourseRecommendation {
  name: string;
  duration?: string;
  assignedDate?: string;
  icon: string; // Placeholder for icon path
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
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

        if (!id) {
          console.error('Patient ID is missing.');
          setLoading(false);
          return;
        }

        const response = await api.get<{ success: boolean; data: PatientDetail }>(`/doctors/user?userId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setPatient(response.data.data);
        } else {
          console.error('Failed to fetch patient details:', response.data);
          setPatient(null);
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Dummy data for AI and Doctor recommendations (replace with real data if available in API response)
  const aiRecommendations: CourseRecommendation[] = [
    {
      name: "Calm sleep routine",
      duration: "5 days . 10 min/day",
      icon: "/path/to/sleep-icon.png" // Placeholder
    }
  ];

  const doctorRecommendations: CourseRecommendation[] = [
    {
      name: "Meditation Marathon",
      assignedDate: "27 April 2025",
      icon: "/path/to/meditation-icon.png" // Placeholder
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-600">Patient not found or an error occurred.</div>;
  }

  return (
    <div className="p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Patient Details</h1>
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            {/* Search bar from previous page, re-added here for consistency with design */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your patients here"
                className="w-full py-3 pl-10 pr-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
              />
            </div>
          </div>
          <button className="p-3 rounded-full bg-white border border-gray-200 shadow-sm ml-4">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800 text-lg">{patient.name}</p>
              <p className="text-sm text-gray-500">Treated on {formatDate(patient.updatedAt)}</p>
            </div>
          </div>
          <span className="bg-[#A9F2001A] text-[#A9F200] px-4 py-1 rounded-full text-sm font-medium">Completed</span>
        </div>
      </div>

      {/* Tests Done Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Tests done ({patient.tests.length})</h2>
          <Link to="#" className="text-[#8B2D6C] font-medium flex items-center">View Reports <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </div>
        <div className="space-y-4">
          {patient.tests.map((test) => (
            <div key={test.id} className="bg-[#FBF9FF] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                {/* Placeholder for test icons, replace with actual image if available */}
                <img src={`/assets/${test.rawScores && Object.keys(test.rawScores).length > 0 ? Object.keys(test.rawScores)[0].toLowerCase().replace(' ','-') : 'default'}-icon.png`} alt="Test Icon" className="w-10 h-10" />
                <div>
                  <p className="font-medium text-gray-800">{Object.keys(test.rawScores)[0] || 'Test Name'}</p>
                  <p className="text-sm text-gray-500">Score {test.rawScores ? Object.values(test.rawScores)[0] : 'N/A'} /10</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500" /> {/* Assuming this is a dropdown/expand icon */}
            </div>
          ))}
        </div>
      </div>

      {/* Zenomi AI course recommendation */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Zenomi AI course recommendation ({aiRecommendations.length})</h2>
        <div className="space-y-4">
          {aiRecommendations.map((rec, index) => (
            <div key={index} className="bg-[#FBF9FF] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <img src={rec.icon} alt={rec.name} className="w-10 h-10" />
              <div>
                <p className="font-medium text-gray-800">{rec.name}</p>
                {rec.duration && <p className="text-sm text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1" /> {rec.duration}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses recommended by doctor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Courses recommended by doctor</h2>
        <div className="space-y-4">
          {doctorRecommendations.map((rec, index) => (
            <div key={index} className="bg-[#FBF9FF] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <img src={rec.icon} alt={rec.name} className="w-10 h-10" />
              <div>
                <p className="font-medium text-gray-800">{rec.name}</p>
                {rec.assignedDate && <p className="text-sm text-gray-500">Assigned on {rec.assignedDate}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails; 