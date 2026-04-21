import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from '@/utils/api';
import { useNavigate } from "react-router-dom";


const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dob: z.string().min(1, 'Date of birth is required'),
    referralCode: z.string().min(1, 'Referral code is required'),
});
type UserFormData = z.infer<typeof userSchema>;

const UserRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [countryCode, setCountryCode] = useState('+91');
    const navigate = useNavigate();
    const [referralCodeDigits, setReferralCodeDigits] = useState("");


    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema)
    });

    const handlePhoneChange = (value: string, country: { dialCode?: string }) => {
        if (!country.dialCode) {
            toast({
                title: "Error",
                description: "Invalid country code.",
                variant: "destructive",
            });
            return;
        }

        const phoneNumber = value.replace(country.dialCode, "");
        const formattedCountryCode = `+${country.dialCode}`;
        setCountryCode(formattedCountryCode);
        setValue("phoneNumber", phoneNumber);
    };

    const onSubmit = async (data: UserFormData) => {
        setLoading(true);
        try {
            // Compose the full referral code
            const referralCode = referralCodeDigits ? `Zenomi-${referralCodeDigits}` : undefined;
            const payload = { ...data, countryCode, dob: new Date(data.dob).toISOString(), referralCode };

            const response = await api.post('/users/register-user', payload);

            toast({
                title: "Success",
                description: "Registration successful!",
                variant: "default",
                className: "bg-green-500 text-white",
            });

            if(response.status === 201){
              navigate('/login')
            }

            console.log('Success:', response.data);
        } catch (error: any) {
            const errData = error.response?.data;
            const errorMessage = (errData && typeof errData === 'object' && errData.message) ? errData.message : 'Registration failed. Please try again.';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 font-['Poppins']">
            <div className="space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Name*</label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder="Enter your name"
                        maxLength={20}
                        className="w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] transition-colors"
                        style={{ backgroundColor: '#FCF8FA' }}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address*</label>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] transition-colors"
                        style={{ backgroundColor: '#FCF8FA' }}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Gender Selection */}
                <div>
                    <select
                        {...register('gender')}
                        className="w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] appearance-none transition-colors"
                        style={{ backgroundColor: '#FCF8FA' }}
                    >
                        <option value="">Select your gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                    {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                </div>

                {/* Phone Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number*</label>
                    <PhoneInput
                        country="in"
                        onlyCountries={['in']}
                        onChange={handlePhoneChange}
                        inputStyle={{
                            width: "100%",
                            height: "48px",
                            fontSize: "16px",
                            borderRadius: "9999px",
                            border: "2px solid transparent",
                            backgroundColor: "#FCF8FA",
                        }}
                        containerStyle={{
                            width: "100%"
                        }}
                        buttonStyle={{
                            borderRadius: "9999px 0 0 9999px",
                            border: "2px solid transparent",
                            backgroundColor: "#FCF8FA",
                        }}
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                    )}
                </div>

                {/* Doctor Referral Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Doctor Referral Code*</label>
                    <div className="flex items-center">
                        <span className="px-4 py-3 rounded-l-full border-2 border-transparent text-[#704180] font-semibold select-none" style={{ backgroundColor: '#FCF8FA' }}>
                            ZENOMI-
                        </span>
                    <input
                        type="text"
                            maxLength={6}
                            inputMode="numeric"
                            className="w-full p-3 rounded-r-full border-2 border-transparent focus:outline-none focus:border-[#704180] transition-colors"
                            style={{ backgroundColor: '#FCF8FA' }}
                            placeholder="Enter doctor referral code"
                            value={referralCodeDigits}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                setReferralCodeDigits(val);
                                setValue("referralCode", val, { shouldValidate: true });
                            }}
                    />
                    </div>
                    {errors.referralCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.referralCode.message}</p>
                    )}
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth*</label>
                    <input
                        {...register('dob')}
                        type="date"
                        className="w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] transition-colors"
                        style={{ backgroundColor: '#FCF8FA' }}
                    />
                    {errors.dob && (
                        <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white rounded-full transition-colors font-medium"
                style={{
                    background: 'linear-gradient(89.79deg, #704180 5.07%, #8B2D6C 95.83%)',
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        <span>Registering...</span>
                    </div>
                ) : (
                    "Register"
                )}
            </Button>
        </form>
    );
};

export default UserRegistrationForm; 