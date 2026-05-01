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
          const codes = response.data.data;
          // data is an array of referral codes — show the latest unused one, or latest overall
          if (Array.isArray(codes) && codes.length > 0) {
            const unused = codes.find((c: any) => !c.isUsed);
            const latest = unused || codes[0];
            setReferralCode(latest.referralCode || latest.code || null);
            setFreeReferralsUsed(codes.filter((c: any) => c.isUsed === false && !c.user?.id).length >= 0 ? codes.length : 0);
          } else if (codes.referralCode || codes.code) {
            setReferralCode(codes.referralCode || codes.code || null);
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
      const response = await api.post('/stripe/create-doctor-checkout', { amount: 1000 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.url) {
        // Paid flow — redirect to Stripe checkout
        window.location.href = response.data.url;
      } else if (response.data?.data?.code) {
        // Free referral generated — show it immediately
        setReferralCode(response.data.data.code);
        alert(`Referral code generated: ${response.data.data.code}`);
      }
    } catch (error) {
      alert('Failed to generate referral code.');
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
      <div className="bg-[#8B2D6C] rounded-2xl p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden mb-4">
        <div className="flex-1 min-w-0">
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
        <div className="bg-gradient-to-r from-[#8B2D6C] to-[#704180] rounded-xl px-6 py-4 flex items-center justify-between shadow gap-4">
          <div className="text-white text-lg font-semibold shrink-0">Your Referral Code:</div>
          <div className="text-[#FFD700] text-2xl font-bold tracking-widest truncate min-w-0">{referralCode}</div>
        </div>
      )}
    </div>
  );
};

export default ReferralCard; 