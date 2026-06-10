import zenomiLogo from "@/assets/zenomiLogo.png";

export default function PendingApproval() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f6fa] to-[#ede7f3] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center text-center">
        <img src={zenomiLogo} alt="Zenomi" className="h-10 mb-6" />

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, #fef9e7, #fdebd0)" }}
        >
          <svg className="w-10 h-10 text-[#f39c12]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 font-['Poppins']">
          Registration Submitted!
        </h1>

        <div
          className="w-full rounded-2xl px-5 py-4 mb-6"
          style={{ background: "linear-gradient(135deg, #fef9e7, #fdebd0)", border: "1px solid #f8e09a" }}
        >
          <p className="text-sm font-semibold text-[#c0750a] font-['Poppins'] mb-1">
            Verification Pending
          </p>
          <p className="text-xs text-[#9a6010] font-['Poppins'] leading-relaxed">
            Your profile is currently under review by the Zenomi admin team. This usually takes 1–2 business days.
          </p>
        </div>

        <div className="w-full space-y-3 mb-8 text-left">
          {[
            { step: "1", label: "Registration submitted", done: true },
            { step: "2", label: "Admin review in progress", done: false, active: true },
            { step: "3", label: "Profile approved & account activated", done: false },
          ].map(({ step, label, done, active }) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-['Poppins']"
                style={{
                  background: done
                    ? "linear-gradient(90deg, #704180, #8B2D6C)"
                    : active
                    ? "#fff3cd"
                    : "#f3f4f6",
                  color: done ? "white" : active ? "#c0750a" : "#9ca3af",
                  border: active ? "1.5px solid #f8e09a" : "none",
                }}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className="text-sm font-['Poppins']"
                style={{ color: done ? "#111" : active ? "#c0750a" : "#9ca3af", fontWeight: active || done ? 500 : 400 }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 font-['Poppins'] mb-6 leading-relaxed">
          You'll receive an email at your registered address once your profile is approved. After approval, you can log in and start managing patients.
        </p>

        <button
          onClick={() => (window.location.href = "/doctor/login")}
          className="w-full h-12 rounded-full text-white font-semibold text-sm font-['Poppins']"
          style={{ background: "linear-gradient(90deg, #704180, #8B2D6C)" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
