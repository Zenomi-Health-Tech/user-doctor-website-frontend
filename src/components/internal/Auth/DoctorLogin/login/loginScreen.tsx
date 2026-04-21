import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";
import zenomiLogo from "@/assets/zenomiLogo.png";

const Component = () => {
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const res = await axios.post("https://zenomi.elitceler.com/api/v1/doctors/google-signin", {
          idToken: tokenResponse.access_token,
          email: userInfo.data.email,
          name: userInfo.data.name,
          picture: userInfo.data.picture,
        });
        const token = res.data?.data?.token || res.data?.token;
        const doctorId = res.data?.data?.doctor?.id || res.data?.data?.id;
        if (token) {
          setAuthCookies({ token });
          if (doctorId) Cookies.set("userId", doctorId, { expires: 7 });
          login(token);
          window.location.href = "/dashboard";
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          window.location.href = "/doctor/register";
        } else {
          toast({ title: "Error", description: error.response?.data?.message || "Sign-in failed", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f6fa] to-[#ede7f3] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
        <img src={zenomiLogo} alt="Zenomi" className="h-10 mb-6" />
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #e8eaf6, #ede7f6)' }}>
          <svg className="w-7 h-7 text-[#704180]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-1 font-['Poppins']">Sign in as <span className="text-[#704180] font-semibold">Doctor</span> to continue</p>
        <p className="text-xs text-gray-400 mb-8 font-['Poppins']">Manage patients, referrals & appointments</p>
        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-full border border-gray-200 flex items-center justify-center gap-3 font-medium text-sm font-['Poppins'] transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#704180] rounded-full animate-spin" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        <button onClick={() => window.location.href = '/chooserole'} className="text-xs text-[#704180] mt-6 font-medium font-['Poppins'] hover:underline">
          ← Not a doctor? Choose a different role
        </button>
        <p className="text-xs text-gray-400 mt-4 text-center font-['Poppins']">
          By continuing, you agree to Zenomi's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Component;
