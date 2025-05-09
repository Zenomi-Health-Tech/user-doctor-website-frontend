import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dob: z.string().min(1, 'Date of birth is required'),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
});
type UserFormData = z.infer<typeof userSchema>;

const UserRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [countryCode, setCountryCode] = useState('+91');
    const navigate = useNavigate();


    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
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
            const response = await axios.post('http://ec2-3-109-123-74.ap-south-1.compute.amazonaws.com:3000/api/v1/users/register-user', {
                ...data,
                countryCode,
                dob: new Date(data.dob).toISOString(),
            });

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
            const errorMessage = error.response?.data?.message || 'Registration failed';
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
                    <input
                        {...register('name')}
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Input */}
                <div>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone Input */}
                <div>
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
                            backgroundColor: "#ffffff",
                        }}
                        containerStyle={{
                            width: "100%"
                        }}
                        buttonStyle={{
                            borderRadius: "12px 0 0 12px",
                            border: "1px solid #e2e8f0"
                        }}
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                    )}
                </div>

                {/* Gender Selection */}
                <div>
                    <select
                        {...register('gender')}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                    >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                    {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                </div>

                {/* Date of Birth */}
                <div>
                    <input
                        {...register('dob')}
                        type="date"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                    />
                    {errors.dob && (
                        <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                    )}
                </div>

                {/* Blood Group */}
                <div>
                    <select
                        {...register('bloodGroup')}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && (
                        <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>
                    )}
                </div>
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