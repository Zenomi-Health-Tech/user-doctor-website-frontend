import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import TouchImage from '@/assets/mobileTouchRefer.svg'
import circles from '@/assets/Cricles.svg'

interface TestReport {
  id: string;
  cycle: string;
  updatedAt: string;
  createdAt: string;
  testsCompleted: number;
  rawScores: { [key: string]: number };
  normalizedScores: { [key: string]: number | null };
  reportView: string | null;
  reportDownload: string | null;
  detailedReportView: string | null;
  detailedReportDownload: string | null;
}

interface ReferredPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  profilePicture: string | null;
  claimedAt: string;
  referralCode: string;
  isUsed: boolean;
  tests: TestReport[];
}

const ReferredPatientsList: React.FC = () => {
  const [patients, setPatients] = useState<ReferredPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
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

        const response = await api.get<{ success: boolean; data: ReferredPatient[] }>('/doctors/referred-patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setPatients(response.data.data);
        } else {
          console.error('Failed to fetch referred patients:', response.data);
        }
      } catch (error) {
        console.error('Error fetching referred patients:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchReferralCode = async () => {
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
        const response = await api.get('/doctors/referral-code', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data) {
          setReferralCode(response.data.data.referralCode || response.data.data.code || null);
        }
      } catch (error) {
        setReferralCode(null);
      }
    };
    fetchPatients();
    fetchReferralCode();
  }, []);

  const handleGenerateNow = async () => {
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
      const response = await api.post('/stripe/create-doctor-checkout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      alert('Failed to generate checkout.');
    }
  };

  const handlePatientClick = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading referred patients...</div>;
  }

  return (
    <div className="p-8 min-h-screen font-['Poppins'] ">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Referral patients</h1>
      {/* Referral Offer Card */}
      <div className="bg-[#8B2D6C] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between mb-8 relative overflow-hidden">
        <div className="flex-1">
          <div className="text-white text-2xl font-bold mb-2">Get 5 FREE referrals free</div>
          <div className="text-white text-base mb-4">You can onboard up to 5 patients via referral without any charges.</div>
          <button onClick={handleGenerateNow} className="px-6 py-2 cursor-pointer rounded-full bg-[#FCB35B] text-[#8B2D6C] font-semibold shadow hover:opacity-90 transition">Generate now</button>
        </div>
        {/* Illustration (placeholder SVG) */}
        <div className="hidden md:block flex-shrink-0 ml-8 relative" style={{ width: 120, height: 120 }}>
          <img src={circles} alt="" className='w-32 h-54' />
          <img src={TouchImage} alt="Referral Illustration" className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 object-contain" />
        </div>
      </div>
      {/* Referral Code Banner */}
      {referralCode && (
        <div className="bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] rounded-xl px-6 py-4 mb-8 flex items-center justify-between shadow">
          <div className="text-white text-lg font-semibold">Your Referral Code:</div>
          <div className="text-[#FFD700] text-2xl font-bold tracking-widest">{referralCode}</div>
        </div>
      )}
      {/* Search Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your patients here"
            className="w-full py-3 pl-10 pr-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 rounded-full bg-white border border-gray-200 shadow-sm ml-4">
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              onClick={() => handlePatientClick(patient.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-4">
                {patient.profilePicture ? (
                  <img
                    src={patient.profilePicture}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 text-lg">{patient.name}</p>
                  <p className="text-sm text-gray-500">Joined on {formatDate(patient.claimedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#8B2D6C] font-medium text-base">Referral code - {patient.referralCode}</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8B2D6C1A] hover:bg-[#8B2D6C]/10 transition">
                  <ArrowRight className="w-6 h-6 text-[#8B2D6C]" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg mt-10">No referred patients found.</div>
        )}
      </div>
    </div>
  );
};

export default ReferredPatientsList;
