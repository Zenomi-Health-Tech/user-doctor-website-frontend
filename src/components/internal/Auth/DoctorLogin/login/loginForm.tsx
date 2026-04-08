import React, { useCallback, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import useStore from "@/zustand/store";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleApiError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { setAuthCookies } from "@/utils/cookies";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Define validation schema using Zod
const schema = z.object({
    phoneNumber: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(10, "Phone number must be exactly 10 digits"),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
    onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const requestOtp = useStore((state) => state.requestOtp);
    const loading = useStore((state) => state.loading);
    const updatePhoneDetails = useStore((state) => state.updatePhoneDetails);
    const { toast } = useToast();
    const navigate = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                // Get user info from Google
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                // Get ID token by exchanging access token
                const idTokenRes = await axios.get(
                    `https://oauth2.googleapis.com/tokeninfo?access_token=${tokenResponse.access_token}`
                );

                // Try signing in with the backend
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
                }
            } catch (error) {
                toast({ title: "Error", description: "Google Sign-In failed", variant: "destructive" });
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            toast({ title: "Error", description: "Google Sign-In failed", variant: "destructive" });
        },
    });

    const onSubmit: SubmitHandler<FormData> = async () => {
        try {
            await requestOtp();
            toast({
                title: "Success",
                description: "OTP sent successfully",
                variant: "default",
                className: "bg-green-500 text-white",
            });
            onSuccess();
        } catch (error) {
            const errorMessage = handleApiError(error);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handlePhoneChange = useCallback(
        (value: string, country: { dialCode?: string }) => {
            if (!country.dialCode) {
                toast({
                    title: "Error",
                    description: "Invalid country code.",
                    variant: "destructive",
                });
                return;
            }

            // Remove the country code from the value to get just the phone number
            const phoneNumber = value.replace(country.dialCode, "");
            
            // Add + to the country code
            const countryCode = `+${country.dialCode}`;
            
            // Update both country code and phone number in the store
            updatePhoneDetails(countryCode, phoneNumber);
            
            // Update form value with just the phone number
            setValue("phoneNumber", phoneNumber);
        },
        [setValue, updatePhoneDetails, toast]
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 font-['Poppins']">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2 font-['Poppins']">Sign in to your Account</h1>
                <p className="text-gray-600 font-['Poppins']">Enter your mobile number to get started</p>
            </div>
            
            <div className="space-y-4">
                <PhoneInput
                    country="in"
                    onlyCountries={['in']}
                    onChange={handlePhoneChange}
                    inputStyle={{
                        width: "100%",
                        height: "48px",
                        fontSize: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        fontFamily: "Poppins, sans-serif"
                    }}
                    containerStyle={{
                        width: "100%"
                    }}
                    buttonStyle={{
                        borderRadius: "12px 0 0 12px",
                        border: "1px solid #e2e8f0",
                        fontFamily: "Poppins, sans-serif"
                    }}
                />
                {errors.phoneNumber && (
                    <p className="text-red-500 text-sm text-center font-['Poppins']">
                        {errors.phoneNumber.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer h-12 text-white rounded-xl transition-colors font-['Poppins']"
                style={{
                    background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)',
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        <span className="font-['Poppins']">Sending OTP...</span>
                    </div>
                ) : (
                    "Send OTP"
                )}
            </Button>

            <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
                type="button"
                onClick={() => googleLogin()}
                disabled={googleLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 font-['Poppins']"
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
        </form>
    );
};

export default LoginForm;
