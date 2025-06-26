import React, { useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import useStore from "@/zustand/store";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define schema for OTP validation
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP must only contain digits" }),
});

// Type for form values inferred from the schema
type OTPFormValues = z.infer<typeof otpSchema>;

// Props type for OTPForm component
interface OTPFormProps {
  onSuccess: () => void; // Callback for successful verification
}

const OTPForm: React.FC<OTPFormProps> = ({ onSuccess }) => {
  // Initialize form handling
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Extract Zustand store hooks
  const resendOtpLogin = useStore((state) => state.resendOtpLogin);
  const validateOtp = useStore((state) => state.validateOtp);
  const error = useStore((state) => state.error);
  const loading = useStore((state) => state.loading);
  const phoneNumber = useStore((state) => state.phoneNumber);

  const { toast } = useToast(); // Initialize Shadcn's toast

  // Create refs for the input elements
  const inputRefs = Array(6).fill(0).map(() => useRef<HTMLInputElement>(null));

  const { user } = useAuth();
  const navigate = useNavigate();

  // Form submission handler
  const onSubmit: SubmitHandler<OTPFormValues> = async ({ otp }) => {
    try {
      const success = await validateOtp(otp);
      console.log("OTP validation result:", success);
      
      if (success) {
        toast({
          title: "Success",
          description: "OTP verified successfully!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        if (user && user.type === 'DOCTOR' && user.isPaid === false) {
          navigate('/doctor/payment-onboard');
        } else {
          onSuccess();
          window.location.reload();
        }
      } else {
        const errorMessage = error || "Invalid OTP. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.log("OTP verification failed:", { otp, error: errorMessage });
      }
    } catch (err) {
      console.error("Unexpected error during OTP verification:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for resending OTP
  const handleResend = async () => {
    try {
      await resendOtpLogin();
      toast({
        title: "Success",
        description: "OTP sent again successfully!",
        variant: "default", // Use 'default' for success
      });
    } catch (err) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to resend OTP.",
        variant: "destructive", // Use 'destructive' for error
      });
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    // Update the form value
    const currentOtp = watch("otp") || "";
    const newOtp = currentOtp.split("");
    newOtp[index] = value;
    setValue("otp", newOtp.join(""));

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !watch("otp")[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 font-['Poppins']">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Verify your OTP</h1>
        <p className="text-gray-600">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {Array(6).fill(0).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            ref={inputRefs[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-semibold border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        ))}
      </div>

      {errors.otp && (
        <p className="text-red-500 text-sm text-center">
          {errors.otp.message}
        </p>
      )}

      <div className="text-center text-sm">
        <span className="text-gray-600">Didn't get it? </span>
        <button
          type="button"
          onClick={handleResend}
          className="text-purple-600 font-medium hover:text-purple-700"
        >
          Resend
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-white rounded-xl transition-colors font-medium"
        style={{
          background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin h-5 w-5 mr-2" />
            <span>Verifying...</span>
          </div>
        ) : (
          "Send OTP"
        )}
      </Button>
    </form>
  );
};

export default OTPForm;
