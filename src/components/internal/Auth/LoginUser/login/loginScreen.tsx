import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";
import zenomiLogo from "@/assets/zenomiLogo.png";

const Component = () => {
  const { toast } = useToast();
  const { login } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // If GoogleLogin iframe doesn't render within 3s, show fallback button
  useEffect(() => {
    timerRef.current = setTimeout(() => setShowFallback(true), 3000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSignIn = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await axios.post("https://zenomi.elitceler.com/api/v1/users/google-signin", { idToken });
      const token = res.data?.data?.token || res.data?.token;
      const userId = res.data?.data?.user?.id || res.data?.data?.id;
      if (token) {
        setAuthCookies({ token });
        if (userId) Cookies.set("userId", userId, { expires: 7 });
        login(token);
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        window.location.href = "/user/register";
      } else {
        toast({ title: "Error", description: error.response?.data?.message || "Sign-in failed", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Popup fallback — gets access_token, exchanges for id_token via Google's tokeninfo
  const popupLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await handleSignIn(tokenResponse.access_token);
      } catch {
        toast({ title: "Error", description: "Sign-in failed. Please try again.", variant: "destructive" });
        setLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Google sign-in failed.", variant: "destructive" });
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f6fa] to-[#ede7f3] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
        <img src={zenomiLogo} alt="Zenomi" className="h-10 mb-6" />
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #fce4ec, #f3e8f9)' }}>
          <svg className="w-7 h-7 text-[#8B2D6C]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-1 font-['Poppins']">Sign in as <span className="text-[#8B2D6C] font-semibold">User</span> to continue</p>
        <p className="text-xs text-gray-400 mb-8 font-['Poppins']">Wellness assessments, sleep tracking & more</p>

        {/* Primary: Google's iframe button */}
        <div className="w-full flex justify-center" onMouseEnter={() => clearTimeout(timerRef.current)}>
          <GoogleLogin
            onSuccess={(resp) => { clearTimeout(timerRef.current); if (resp.credential) handleSignIn(resp.credential); }}
            onError={() => setShowFallback(true)}
            size="large"
            width="300"
            text="continue_with"
            shape="pill"
          />
        </div>

        {/* Fallback: custom button using popup for browsers that block the iframe */}
        {showFallback && (
          <button
            onClick={() => popupLogin()}
            disabled={loading}
            className="w-full h-12 mt-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full border border-gray-200 flex items-center justify-center gap-3 font-medium text-sm font-['Poppins'] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8B2D6C] rounded-full animate-spin" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google (popup)
              </>
            )}
          </button>
        )}

        <button onClick={() => window.location.href = '/chooserole'} className="text-xs text-[#8B2D6C] mt-6 font-medium font-['Poppins'] hover:underline">
          ← Not a user? Choose a different role
        </button>
        <p className="text-xs text-gray-400 mt-4 text-center font-['Poppins']">
          By continuing, you agree to Zenomi's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Component;
