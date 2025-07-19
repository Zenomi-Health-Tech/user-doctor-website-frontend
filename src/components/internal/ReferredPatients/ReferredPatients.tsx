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

// Add ReferralCode interface
interface ReferralCode {
  id: string;
  referralCode: string;
  expiresAt: string;
  createdAt: string;
  isUsed: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string | null;
    claimedAt: string;
  };
}

const ReferredPatientsList: React.FC = () => {
  const [patients, setPatients] = useState<ReferredPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [freeReferralsGenerated, setFreeReferralsGenerated] = useState<number>(0);
  const maxFreeReferrals = 5;
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);

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
   
       
     

    const fetchReferralCodes = async () => {
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
          setReferralCodes(response.data.data);
        }
      } catch (error) {
        setReferralCodes([]);
      }
    };
    fetchPatients();
    fetchDoctorProfile();
    fetchReferralCodes();
  }, []);


  const handleUpgradeNow = () => {
    setShowPlans(true);
  };

  const handlePlanCheckout = async (plan: 'starter' | 'referral' | 'pro') => {
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
      let endpoint = '';
      if (plan === 'starter') endpoint = '/stripe/create-referral-checkout';
      else if (plan === 'referral') endpoint = '/stripe/create-doctor-checkout';
      else if (plan === 'pro') endpoint = '/stripe/create-enterprise-checkout';
      const response = await api.post(endpoint, { amount: plan === 'starter' ? 1000 : plan === 'referral' ? 10000 : 50000 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      alert('Failed to generate checkout.');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredPatients);
  
  // Filter referralCodes by user name if searchTerm is present
  const filteredReferralCodes = referralCodes.filter(ref =>
    !searchTerm || (ref.isUsed && ref.user && ref.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading referred patients...</div>;
  }

  if (showPlans) {
    // Show plans UI only after clicking Upgrade now
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
      
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8 w-full md:justify-center md:gap-8 md:overflow-x-visible">
              {/* Starter Plan */}
              <div
                className="min-w-[320px] max-w-xs bg-white/10 rounded-3xl flex flex-col items-center snap-center shadow-lg border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#F6C851] hover:shadow-2xl cursor-pointer p-8 h-[420px] justify-between"
                tabIndex={0}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="text-xl font-bold mb-2 text-white">Starter Plan</div>
                  <div className="text-4xl font-bold text-white mb-1">1k</div>
                  <div className="text-white/80 mb-4 text-sm">/per patient after 5 referral used</div>
                  <ul className="text-white/90 text-left mb-6 space-y-2 w-full">
                    <li>✔️ Includes 5 free patients</li>
                    <li>✔️ Ideal for independent professionals</li>
                    <li>✔️ Scale as needed</li>
                    <li>✔️ Personalized training</li>
                  </ul>
                </div>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition mt-auto" onClick={() => handlePlanCheckout('starter')}>
                  Pay for plan
                </button>
              </div>
              {/* Referral Plan */}
              <div
                className="min-w-[320px] max-w-xs bg-white/10 rounded-3xl flex flex-col items-center snap-center shadow-lg border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#F6C851] hover:shadow-2xl cursor-pointer p-8 h-[420px] justify-between"
                tabIndex={0}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="text-2xl font-bold mb-2 text-white">Referral Plan</div>
                  <div className="text-5xl font-bold text-white mb-1">10k</div>
                  <div className="text-white/80 mb-4 text-lg">/onetime</div>
                  <ul className="text-white/90 text-left mb-6 space-y-2 w-full">
                    <li>✔️ Covers initial setup</li>
                    <li>✔️ System integration</li>
                    <li>✔️ Personalized onboarding</li>
                    <li>✔️ Personalized training</li>
                  </ul>
                </div>
                <button className="w-full py-4 rounded-full bg-white text-[#8B2D6C] font-semibold text-lg shadow hover:bg-[#F3EAF7] transition mt-auto" onClick={() => handlePlanCheckout('referral')}>
                  Pay for plan
                </button>
              </div>
              {/* Pro Plan */}
              <div
                className="min-w-[320px] max-w-xs bg-white/10 rounded-3xl flex flex-col items-center snap-center shadow-lg border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#F6C851] hover:shadow-2xl cursor-pointer p-8 h-[420px] justify-between"
                tabIndex={0}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="text-xl font-bold mb-2 text-white">Pro Plan</div>
                  <div className="text-4xl font-bold text-white mb-1">50k</div>
                  <div className="text-white/80 mb-4 text-sm">/onetime</div>
                  <ul className="text-white/90 text-left mb-6 space-y-2 w-full">
                    <li>✔️ Tailored for clinics/hospitals</li>
                    <li>✔️ High-capacity features + analytics</li>
                    <li>✔️ Multi-location / team access</li>
                  </ul>
                </div>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-semibold shadow hover:opacity-90 transition mt-auto" onClick={() => handlePlanCheckout('pro')}>
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
      
     
    );
  }

  return (
    <div className="p-8 min-h-screen font-['Poppins'] bg-[#FAF8FC]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">Referral patients</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your patients here"
              className="w-full py-3 pl-10 pr-4 rounded-full bg-[#F5F3F7] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B2D6C] text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 rounded-full bg-[#F5F3F7] border border-gray-200 shadow-sm">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      {/* Referral Offer Card at the top */}
      <div className="bg-[#8B2D6C] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between mb-8 relative overflow-hidden">
        <div className="flex-1">
          <div className="text-white text-2xl font-bold mb-2">Get 5 FREE referrals free</div>
          <div className="w-full h-4 bg-[#E6A94A]/40 rounded-full mb-2 mt-4">
            <div className="h-4 rounded-full bg-[#F6C851]" style={{ width: `${Math.min((freeReferralsGenerated / maxFreeReferrals) * 100, 100)}%` }} />
          </div>
          <div className="text-white text-base mb-4">{freeReferralsGenerated} out of {maxFreeReferrals} people referred</div>
          <button onClick={handleUpgradeNow} className="px-6 py-2 cursor-pointer rounded-full bg-[#FCB35B] text-[#8B2D6C] font-semibold shadow hover:opacity-90 transition text-base flex items-center gap-2">Upgrade now <ArrowRight className="w-5 h-5" /></button>
        </div>
        {/* Illustration */}
        <div className="hidden md:block flex-shrink-0 ml-8 relative" style={{ width: 180, height: 120 }}>
          <img src={circles} alt="" className='w-32 h-54' />
          <img src={TouchImage} alt="Referral Illustration" className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 object-contain" />
        </div>
      </div>
      {/* Referred Patients List below the card */}
      <div className="space-y-4">
        {filteredReferralCodes.length > 0 ? (
          filteredReferralCodes.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              style={{ cursor: ref.isUsed && ref.user ? 'pointer' : 'default' }}
              onClick={() => ref.isUsed && ref.user ? navigate(`/patients/${ref.user.id}`) : undefined}
            >
              <div className="flex items-center gap-4">
                {ref.isUsed && ref.user && ref.user.profilePicture ? (
                  <img
                    src={ref.user.profilePicture}
                    alt={ref.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#8B2D6C1A] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">
                    {ref.isUsed && ref.user && ref.user.name ? ref.user.name.charAt(0).toUpperCase() : ref.referralCode.slice(-2)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 text-lg">
                    {ref.isUsed && ref.user && ref.user.name ? ref.user.name : 'Unclaimed'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ref.isUsed && ref.user && ref.user.claimedAt ? `Joined on ${new Date(ref.user.claimedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}` : 'Not yet claimed'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#8B2D6C] font-medium text-base">Referral code - {ref.referralCode}</span>
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
