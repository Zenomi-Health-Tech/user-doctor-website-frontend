import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";
import zenomiLogo from "@/assets/zenomiLogo.png";

const Component = () => {
  const { toast } = useToast();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" });
      return;
    }
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f6fa] to-[#ede7f3] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
        <img src={zenomiLogo} alt="Zenomi" className="h-10 mb-8" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-8 font-['Poppins']">Sign in as User to continue</p>
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" })}
            size="large"
            width="300"
            text="continue_with"
            shape="pill"
          />
        </div>
        <p className="text-xs text-gray-400 mt-8 text-center font-['Poppins']">
          By continuing, you agree to Zenomi's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Component;
