import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import TouchImage from '@/assets/mobileTouchRefer.svg'
import circles from '@/assets/Cricles.svg'
import bgPlans from '@/assets/bgPlans.png';

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
  const [freeReferralsGenerated, setFreeReferralsGenerated] = useState<number>(0);
  const maxFreeReferrals = 5;
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
    const fetchDoctorProfile = async () => {
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
        const response = await api.get('/doctors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data) {
          setFreeReferralsGenerated(response.data.data.freeReferralsGenerated || 0);
        }
      } catch (error) {
        setFreeReferralsGenerated(0);
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
    fetchDoctorProfile();
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
      // NOTE: The payment amount should be set to 1,000 rupees in the backend for this endpoint.
      const response = await api.post('/stripe/create-doctor-checkout', { amount: 1000 }, {
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

  if (freeReferralsGenerated >= maxFreeReferrals) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-['Poppins'] relative w-full" style={{ position: 'relative' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${bgPlans})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.7)',
          }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B2D6C]/80 to-[#704180]/80 z-10" />
        <div className="relative z-20 w-full flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center">
            Select a Subscription Plan to Continue
          </h2>
          <p className="text-lg text-white/80 mb-8 text-center">
            Select our best plans catered for doctors
          </p>
          <div className="w-full max-w-5xl px-4 flex flex-col items-center">
            <div className="hidden md:flex w-full justify-center items-end gap-8 mb-8">
              {/* Pro Plan (left) */}
              <div className="flex-1 max-w-xs bg-white/10 rounded-3xl p-8 flex flex-col items-center shadow-lg border border-white/20 backdrop-blur-md scale-90 opacity-70 transition-all duration-300">
                <div className="text-xl font-bold mb-2 text-white">Pro Plan</div>
                <div className="text-4xl font-bold text-white mb-1">1k</div>
                <div className="text-white/80 mb-4 text-sm">/per patient after 5 referral used</div>
                <ul className="text-white/90 text-left mb-6 space-y-2">
                  <li>✔️ Includes 5 free patients</li>
                  <li>✔️ Ideal for independent professionals</li>
                  <li>✔️ Scale as needed</li>
                  <li>✔️ Personalized training</li>
                </ul>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition">
                  Pay for plan
                </button>
              </div>
              {/* Starter Plan (center, prominent) */}
              <div className="flex-1 max-w-md bg-white/20 rounded-3xl p-12 flex flex-col items-center shadow-2xl border border-white/30 backdrop-blur-md scale-105 z-10 transition-all duration-300">
                <div className="text-2xl font-bold mb-2 text-white">Starter Plan</div>
                <div className="text-5xl font-bold text-white mb-1">10k</div>
                <div className="text-white/80 mb-4 text-lg">/onetime</div>
                <ul className="text-white/90 text-left mb-8 space-y-3 text-lg">
                  <li>✔️ Covers initial setup</li>
                  <li>✔️ System integration</li>
                  <li>✔️ Personalized onboarding</li>
                  <li>✔️ Personalized training</li>
                </ul>
                <button className="w-full py-4 rounded-full bg-white text-[#8B2D6C] font-semibold text-lg shadow hover:bg-[#F3EAF7] transition">
                  Pay for plan
                </button>
              </div>
              {/* Enterprise Plan (right) */}
              <div className="flex-1 max-w-xs bg-white/10 rounded-3xl p-8 flex flex-col items-center shadow-lg border border-white/20 backdrop-blur-md scale-90 opacity-70 transition-all duration-300">
                <div className="text-xl font-bold mb-2 text-white">Enterprise Plan</div>
                <div className="text-4xl font-bold text-white mb-1">50k</div>
                <div className="text-white/80 mb-4 text-sm">/onetime</div>
                <ul className="text-white/90 text-left mb-6 space-y-2">
                  <li>✔️ Tailored for clinics/hospitals</li>
                  <li>✔️ High-capacity features + analytics</li>
                  <li>✔️ Multi-location / team access</li>
                </ul>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition">
                  Pay for plan
                </button>
              </div>
            </div>
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8 w-full">
              {/* Pro Plan */}
              <div className="min-w-[320px] max-w-xs bg-white/10 rounded-3xl p-8 flex flex-col items-center snap-center shadow-lg border border-white/20 backdrop-blur-md">
                <div className="text-xl font-bold mb-2 text-white">Pro Plan</div>
                <div className="text-4xl font-bold text-white mb-1">1k</div>
                <div className="text-white/80 mb-4 text-sm">/per patient after 5 referral used</div>
                <ul className="text-white/90 text-left mb-6 space-y-2">
                  <li>✔️ Includes 5 free patients</li>
                  <li>✔️ Ideal for independent professionals</li>
                  <li>✔️ Scale as needed</li>
                  <li>✔️ Personalized training</li>
                </ul>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition">
                  Pay for plan
                </button>
              </div>
              {/* Starter Plan */}
              <div className="min-w-[320px] max-w-xs bg-white/20 rounded-3xl p-12 flex flex-col items-center snap-center shadow-2xl border border-white/30 backdrop-blur-md">
                <div className="text-2xl font-bold mb-2 text-white">Starter Plan</div>
                <div className="text-5xl font-bold text-white mb-1">10k</div>
                <div className="text-white/80 mb-4 text-lg">/onetime</div>
                <ul className="text-white/90 text-left mb-8 space-y-3 text-lg">
                  <li>✔️ Covers initial setup</li>
                  <li>✔️ System integration</li>
                  <li>✔️ Personalized onboarding</li>
                  <li>✔️ Personalized training</li>
                </ul>
                <button className="w-full py-4 rounded-full bg-white text-[#8B2D6C] font-semibold text-lg shadow hover:bg-[#F3EAF7] transition">
                  Pay for plan
                </button>
              </div>
              {/* Enterprise Plan */}
              <div className="min-w-[320px] max-w-xs bg-white/10 rounded-3xl p-8 flex flex-col items-center snap-center shadow-lg border border-white/20 backdrop-blur-md">
                <div className="text-xl font-bold mb-2 text-white">Enterprise Plan</div>
                <div className="text-4xl font-bold text-white mb-1">50k</div>
                <div className="text-white/80 mb-4 text-sm">/onetime</div>
                <ul className="text-white/90 text-left mb-6 space-y-2">
                  <li>✔️ Tailored for clinics/hospitals</li>
                  <li>✔️ High-capacity features + analytics</li>
                  <li>✔️ Multi-location / team access</li>
                </ul>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition">
                  Pay for plan
                </button>
              </div>
            </div>
            {/* Scroll indicator dots */}
            <div className="flex justify-center gap-3 mt-4">
              <span className="w-8 h-3 rounded-full bg-[#F6C851] inline-block" />
              <span className="w-3 h-3 rounded-full bg-white/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-white/70 inline-block" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen font-['Poppins'] ">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Referral patients</h1>
      {/* Referral Status Banner */}
      {freeReferralsGenerated !== null && (
        freeReferralsGenerated >= maxFreeReferrals ? (
          <div className="mb-4 p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 text-center font-normal text-lg">
            You have used all your free referrals. To refer more patients, please upgrade your plan.
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-semibold text-lg">
            {maxFreeReferrals - freeReferralsGenerated} free referrals left.
          </div>
        )
      )}
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
