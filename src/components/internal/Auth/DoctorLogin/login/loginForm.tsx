import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                const response = await axios.post('https://zenomi.elitceler.com/api/v1/doctors/google-signin', {
                    idToken: tokenResponse.access_token,
                });
                const token = response.data?.data?.token || response.data?.token;
                if (token) {
                    Cookies.set('userId', response.data?.data?.doctor?.id || '', { expires: 7 });
                    setAuthCookies({ token });
                    window.location.href = '/';
                }
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 404) {
                    toast({ title: "New Doctor", description: "Please register first.", className: "bg-blue-500 text-white" });
                    navigate('/doctor/register');
                } else if (status === 403) {
                    toast({ title: "Verification Pending", description: "Your account is under review.", className: "bg-yellow-500 text-white" });
                } else {
                    const errData = err.response?.data;
                    const msg = (errData && typeof errData === 'object' && errData.message) ? errData.message : 'Sign in failed';
                    toast({ title: "Error", description: msg, variant: "destructive" });
                }
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            toast({ title: "Error", description: "Google Sign-In failed", variant: "destructive" });
        },
    });

    return (
        <div className="w-full space-y-6 font-['Poppins']">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2">Sign in to your Account</h1>
                <p className="text-gray-600">Continue with your Google account</p>
            </div>

            <Button
                type="button"
                onClick={() => googleLogin()}
                disabled={googleLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200"
            >
                {googleLoading ? (
                    <Loader className="animate-spin h-5 w-5" />
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span>Continue with Google</span>
                    </div>
                )}
            </Button>
        </div>
    );
};

export default LoginForm;
