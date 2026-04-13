import { useNavigate } from "react-router-dom";
import zenomiLogo from "@/assets/zenomiLogo.png";
import userAvatar from "@/assets/user_avatar.svg";
import doctorAvatar from "@/assets/doctor_avatar.svg";

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen font-['Poppins'] relative overflow-hidden bg-white lg:bg-[#f8f6fa]">
      {/* Left panel - branding (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative"
        style={{
          background: "linear-gradient(160deg, #704180 0%, #8B2D6C 60%, #C6426E 100%)",
        }}
      >
        <div className="absolute top-16 left-16 w-48 h-48 rounded-full border border-white/10" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-10 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative z-10 px-12 max-w-md">
          <div className="bg-white rounded-3xl px-8 py-4 inline-block mb-10 shadow-xl">
            <img src={zenomiLogo} alt="Zenomi" className="h-12 object-contain" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-4 leading-snug">
            Smarter health,<br />powered by AI.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-10">
            Your Zenomi Health AI companion for wellness assessments, sleep tracking and doctor consultations, all in one place.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><span className="text-sm">🧠</span></div>
              <p className="text-white/80 text-sm">Mental wellness assessments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><span className="text-sm">😴</span></div>
              <p className="text-white/80 text-sm">Sleep tracking & insights</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><span className="text-sm">📊</span></div>
              <p className="text-white/80 text-sm">AI generated health reports</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><span className="text-sm">👨‍⚕️</span></div>
              <p className="text-white/80 text-sm">Doctor consultations & referrals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel / Mobile full screen */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:justify-center relative">

        {/* ===== MOBILE VIEW (matches Flutter app exactly) ===== */}
        <div className="flex flex-col flex-1 lg:hidden relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[100px] left-5 w-10 h-10 rounded-full bg-[#FFE3D7]" />
          <div className="absolute top-[50px] right-5 w-6 h-6 rounded-full bg-[#FFEF99]" />
          <div className="absolute bottom-[180px] -right-4 w-[60px] h-[60px] rounded-full bg-[#E9E2F8]" />

          {/* Bottom pink circle */}
          <div
            className="absolute -bottom-[200px] -left-[150px] -right-[150px] h-[500px] rounded-full bg-[#FFEDEF]"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-5">
            <h1
              className="text-black text-[26px] font-bold text-center"
              style={{ lineHeight: "1.2", letterSpacing: "-0.52px" }}
            >
              Choose your role below
            </h1>
            <p
              className="text-[#393939] text-base font-light text-center mt-2.5"
              style={{ lineHeight: "2", letterSpacing: "-0.16px" }}
            >
              Tailor your experience based on your role.
            </p>

            {/* User button */}
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-8 mx-5 p-[7px] rounded-full border border-[#8B2D6C] flex items-center justify-between active:scale-[0.97] transition-transform"
            >
              <span
                className="text-black text-lg font-normal flex-1 text-center"
                style={{ lineHeight: "2.11", letterSpacing: "-0.18px" }}
              >
                Continue as User
              </span>
              <img src={userAvatar} alt="User" className="w-12 h-12 flex-shrink-0" />
            </button>

            {/* Doctor button */}
            <button
              onClick={() => navigate("/doctor/login")}
              className="w-full mt-5 mx-5 p-[7px] rounded-full border border-[#8B2D6C] flex items-center justify-between active:scale-[0.97] transition-transform"
            >
              <img src={doctorAvatar} alt="Doctor" className="w-12 h-12 flex-shrink-0" />
              <span
                className="text-black text-lg font-normal flex-1 text-center"
                style={{ lineHeight: "2.11", letterSpacing: "-0.18px" }}
              >
                Continue as Doctor
              </span>
            </button>
          </div>

          {/* Footer */}
          <p
            className="relative z-10 text-center text-[#393939] text-sm font-normal pb-5"
            style={{ lineHeight: "2.71", letterSpacing: "-0.14px" }}
          >
            Empowering better health choices.
          </p>
        </div>

        {/* ===== DESKTOP VIEW ===== */}
        <div className="hidden lg:flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-[#8B2D6C]/10 text-[#8B2D6C] text-xs font-medium mb-4">
                👋 Get Started
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Choose your role</h1>
              <p className="text-gray-400 text-sm">Pick your role to personalize your experience</p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate("/login")}
                className="group relative w-full p-5 bg-white rounded-2xl border-2 border-transparent shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#8B2D6C]/20 hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px rgba(112, 65, 128, 0.08)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #fce4ec 0%, #f3e8f9 100%)" }}>
                    <svg className="w-8 h-8 text-[#8B2D6C]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-gray-900 font-bold text-base">I'm a User</p>
                    <p className="text-gray-400 text-xs mt-0.5">Wellness, sleep tracking & consultations</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-[#8B2D6C] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => navigate("/doctor/login")}
                className="group relative w-full p-5 bg-white rounded-2xl border-2 border-transparent shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#8B2D6C]/20 hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px rgba(112, 65, 128, 0.08)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #e8eaf6 0%, #ede7f6 100%)" }}>
                    <svg className="w-8 h-8 text-[#704180]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75V4.5a1.5 1.5 0 0 1 3 0v2.25M10.5 6.75V4.5a1.5 1.5 0 0 1 3 0v2.25" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75a4.5 4.5 0 0 0 9 0" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.25v3a3.75 3.75 0 0 0 7.5 0v-1.5" />
                      <circle cx="18" cy="12" r="1.5" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-gray-900 font-bold text-base">I'm a Doctor</p>
                    <p className="text-gray-400 text-xs mt-0.5">Manage patients, referrals & appointments</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-[#8B2D6C] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            </div>
            <p className="text-center text-gray-300 text-xs mt-10">Empowering better health choices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
