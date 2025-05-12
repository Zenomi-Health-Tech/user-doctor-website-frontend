import React, { useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import useStore from "@/zustand/store";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleApiError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";
// Import the Loader icon from lucide-react
import { Loader } from "lucide-react";


// testing

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

    const userRequestOtp = useStore((state) => state.userRequestOtp);
    const loading = useStore((state) => state.loading);
    const updatePhoneDetails = useStore((state) => state.updatePhoneDetails);
    const { toast } = useToast();

    const onSubmit: SubmitHandler<FormData> = async () => {
        try {
            await userRequestOtp();
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
                className="w-full cursor-pointer h-12 font-['Poppins'] text-white rounded-xl transition-colors font-['Poppins']"
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
        </form>
    );
};

export default LoginForm;
