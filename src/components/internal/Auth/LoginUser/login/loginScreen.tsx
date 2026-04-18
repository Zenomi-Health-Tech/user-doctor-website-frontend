import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ChevronLeft, Loader } from "lucide-react";
import Lottie from "lottie-react";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";

const Component = () => {
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anim, setAnim] = useState<any>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/meditation.json").then(r => r.json()).then(setAnim).catch(() => {});
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" });
      return;
    }
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

  const handleCustomClick = () => {
    const btn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (btn) btn.click();
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 font-['Urbanist'] relative"
      style={{ background: "linear-gradient(135deg, #704180, #8B2D6C)" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <div className="flex flex-col items-center w-full max-w-sm">
        {anim && (
          <div className="w-48 h-48 sm:w-56 sm:h-56 mb-6 sm:mb-9">
            <Lottie animationData={anim} loop />
          </div>
        )}

        <h1 className="text-2xl sm:text-[28px] font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-white/70 mb-6 sm:mb-8">Sign in with your Google account</p>

        {/* Hidden Google Login button */}
        <div ref={googleBtnRef} className="absolute opacity-0 pointer-events-none">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" })}
            size="large"
            text="continue_with"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin h-6 w-6 text-white" />
          </div>
        ) : (
          <button
            onClick={handleCustomClick}
            className="w-full h-[54px] bg-white rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-[0.98]"
          >
            <svg width="22" height="22" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[15px] font-semibold text-gray-800">Continue with Google</span>
          </button>
        )}
      </div>

      <p className="absolute bottom-4 left-6 right-6 text-center text-xs text-white/50">
        By continuing, you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
};

export default Component;
