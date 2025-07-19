import api from "@/utils/api";
import Cookies from "js-cookie";

function PaymentScreen() {
  const handleCheckout = async () => {
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
      const res = await api.post("/stripe/create-doctor-checkout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      alert("Payment initiation failed. Please try again.");
    }
  };

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative font-['Poppins'] bg-gradient-to-b from-[#8B2D6C] to-[#C6426E] overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.2" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center w-full px-4">
          <div className="mt-12 mb-4 text-center">
            <div className="text-2xl md:text-3xl font-medium text-white mb-2 tracking-wide">Zenomi</div>
            <div className="text-[3rem] md:text-[4rem] font-bold text-[#FFD966] leading-none drop-shadow-lg" style={{ fontFamily: 'serif' }}>Elite</div>
          </div>
          {/* Pricing Card */}
          <div className="w-full max-w-md bg-gradient-to-b from-[#8B2D6C]/60 to-[#C6426E]/60 rounded-2xl border border-[#FFD966] p-8 flex flex-col items-center mb-8 shadow-lg relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <span className="px-6 py-1 rounded-full bg-[#FFD966] text-[#8B2D6C] font-semibold text-sm shadow border border-[#FFD966]">Plus Exclusive Access</span>
            </div>
            <div className="mt-8 text-4xl md:text-5xl font-bold text-[#FFD966] mb-2">10,000 INR</div>
            <div className="text-white text-base mb-4">One-Time Onboarding Fee</div>
            <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#FFD966] to-[#EAC96B] text-[#8B2D6C] font-semibold text-lg shadow hover:opacity-90 transition mb-2">Buy gold subscription now</button>
          </div>
          {/* Features Card */}
          <div className="w-full max-w-md bg-gradient-to-b from-[#8B2D6C]/60 to-[#C6426E]/60 rounded-2xl border border-[#FFD966] p-8 flex flex-col items-center mb-8 shadow-lg">
            <ul className="w-full flex flex-col gap-5 text-white text-lg">
              <li className="flex items-center gap-3">
                <span className="text-[#FFD966]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 12l2 2 4-4" /></svg>
                </span>
                Verified Doctor Profile
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FFD966]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a4 4 0 1 1 8 0v2" /></svg>
                </span>
                Access to Patient Appointments
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FFD966]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3V3z" opacity="0.2" /><path d="M7 17V7h10v10H7z" /></svg>
                </span>
                Personalized Dashboard
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FFD966]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v4l3 3" /></svg>
                </span>
              Secure Payments & Data
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FFD966]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8" /></svg>
                </span>
                Exclusive Platform Access
              </li>
            </ul>
          </div>
          {/* Pay Button */}
        <button
          className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-[#FFD966] to-[#EAC96B] text-[#8B2D6C] font-semibold text-xl shadow hover:opacity-90 transition mb-4"
          onClick={handleCheckout}
        >
          Pay & Continue
        </button>
          {/* Footer */}
          <div className="w-full max-w-md text-center text-white text-base mt-2">
            Have any doubts? <a href="#" className="text-[#FFD966] font-semibold hover:underline">Talk with an expert</a>
          </div>
        </div>
      </div>
  );
  }
  
export default PaymentScreen;
  