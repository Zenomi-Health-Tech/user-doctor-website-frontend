import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import circles from '@/assets/Cricles.svg';
import TouchImage from '@/assets/mobileTouchRefer.svg';

const ReferralCard: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [freeReferralsUsed, setFreeReferralsUsed] = useState<number | null>(null);
  const maxFreeReferrals = 5;

  useEffect(() => {
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
          if (typeof response.data.data.freeReferralsUsed === 'number') {
            setFreeReferralsUsed(response.data.data.freeReferralsUsed);
          }
        }
      } catch (error) {
        setReferralCode(null);
      }
    };
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Free Referrals Status */}
      {freeReferralsUsed !== null && (
        <div className="mb-2 text-base font-semibold text-[#8B2D6C] text-center">
          {freeReferralsUsed < maxFreeReferrals
            ? `${freeReferralsUsed}/${maxFreeReferrals} Free Referrals Used`
            : 'No Free Referrals Left'}
        </div>
      )}
      {/* Referral Offer Card */}
      <div className="bg-[#8B2D6C] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden mb-4">
        <div className="flex-1">
          <div className="text-white text-2xl font-bold mb-2">Get 5 FREE referrals free</div>
          <div className="text-white text-base mb-4">You can onboard up to 5 patients via referral without any charges.</div>
          <button onClick={handleGenerateNow} className="px-6 py-2 cursor-pointer rounded-full bg-[#FCB35B] text-[#8B2D6C] font-semibold shadow hover:opacity-90 transition">Generate now</button>
        </div>
        <div className="hidden md:block flex-shrink-0 ml-8 relative" style={{ width: 120, height: 120 }}>
          <img src={circles} alt="" className='w-32 h-54' />
          <img src={TouchImage} alt="Referral Illustration" className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 object-contain" />
        </div>
      </div>
      {/* Referral Code Banner */}
      {referralCode && (
        <div className="bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] rounded-xl px-6 py-4 flex items-center justify-between shadow">
          <div className="text-white text-lg font-semibold">Your Referral Code:</div>
          <div className="text-[#FFD700] text-2xl font-bold tracking-widest">{referralCode}</div>
        </div>
      )}
    </div>
  );
};

export default ReferralCard; 