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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative font-['Poppins'] bg-gradient-to-b from-[#8B2D6C] to-[#704180] overflow-hidden">
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
        <div className="mt-12 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg mb-4">
            <img src="/zenomiLogo.png" alt="Zenomi" className="h-10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-wide font-['Urbanist']">Zenomi</div>
        </div>
        {/* Features Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-[#8B2D6C]/60 to-[#704180]/60 rounded-2xl border border-[#FFD966] p-8 flex flex-col items-center mb-8 shadow-lg">
          <ul className="w-full flex flex-col gap-5 text-white text-lg">
            <li className="flex items-center gap-3">
              <span className="text-[#FFD966] shrink-0">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 12l2 2 4-4" /></svg>
              </span>
              <span>Verified Doctor Profile</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#FFD966] shrink-0">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a4 4 0 1 1 8 0v2" /></svg>
              </span>
              <span>Access to Patient Appointments</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#FFD966] shrink-0">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3V3z" opacity="0.2" /><path d="M7 17V7h10v10H7z" /></svg>
              </span>
              <span>Personalized Dashboard</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#FFD966] shrink-0">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v4l3 3" /></svg>
              </span>
              <span>Secure Payments & Data</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#FFD966] shrink-0">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8" /></svg>
              </span>
              <span>Appointment Management System</span>
            </li>
          </ul>
        </div>
        {/* Footer */}
        <div className="w-full max-w-md text-center text-white text-base mt-2 mb-8">
          Have any doubts? <a href="#" className="text-[#FFD966] font-semibold hover:underline">Talk with an expert</a>
        </div>
      </div>
    </div>
  );
}

export default PaymentScreen;
