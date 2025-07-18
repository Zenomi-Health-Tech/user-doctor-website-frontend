import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const doctorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    qualification: z.string().min(1, 'Qualification is required'),
    additionalQualifications: z.array(z.string()),
    workLocation: z.string().min(1, 'Work location is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    medicalLicenseNumber: z.string().min(1, 'Medical license number is required'),
    experience: z.string().min(1, 'Experience is required'),
    consultationFee: z.string().min(1, 'Consultation fee is required'),
    doctorPhoto: z.any().optional(),
    medicalLicense: z.any().optional(),
    govtId: z.any().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const steps = [
    'Personal Information',
    'Professional Information',
    'Practice & Fees',
];

const DoctorRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [countryCode, setCountryCode] = useState('+91');
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        control,
        formState: { errors },
    } = useForm<DoctorFormData>({
        resolver: zodResolver(doctorSchema),
        shouldUnregister: false,
    });

    // For tag input
    const [qualificationInput, setQualificationInput] = useState('');

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

    const onSubmit = async (data: DoctorFormData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'additionalQualifications') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            });
            if (data.doctorPhoto) formData.append('doctorPhoto', data.doctorPhoto);
            if (data.medicalLicense) formData.append('medicalLicense', data.medicalLicense);
            if (data.govtId) formData.append('govtId', data.govtId);
            formData.append('countryCode', countryCode);
            const response = await axios.post(
                'https://zenomi.elitceler.com/api/v1/doctors/register',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            toast({
                title: "Success",
                description: "Registration successful!",
                variant: "default",
                className: "bg-green-500 text-white",
            });
            if(response.status === 201){
                navigate('/doctor/login');
            }
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

    // Step navigation handlers
    const handleNext = async () => {
        let valid = false;
        if (step === 0) {
            valid = await trigger(['name', 'email', 'gender', 'phoneNumber']);
            console.log('Step 0 valid:', valid, getValues());
        } else if (step === 1) {
            valid = await trigger(['qualification', 'additionalQualifications', 'specialization', 'experience']);
            console.log('Step 1 valid:', valid, getValues());
        } else if (step === 2) {
            valid = await trigger(['workLocation', 'consultationFee']);
            console.log('Step 2 valid:', valid, getValues());
        }
        if (valid) setStep((s) => s + 1);
    };
    const handleBack = () => setStep((s) => s - 1);

    // Progress bar width
    const progress = ((step + 1) / steps.length) * 100;

    return (
        <div className="w-full">
            {/* Progress Bar and Steps */}
            <div className="mb-8">
                {/* <h2 className="text-2xl font-semibold mb-4 text-center">
                    Register as <span style={{ color: '#704180' }}>Doctor</span>
                </h2> */}
                <div className="flex items-center justify-between mb-2">
                    {steps.map((label, idx) => (
                        <div key={label} className="flex-1 flex flex-col items-center">
                            <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold ${step === idx ? 'bg-[#704180]' : 'bg-gray-300'}`}>{idx + 1}</div>
                            <span className={`mt-2 text-xs font-medium ${step === idx ? 'text-[#704180]' : 'text-gray-500'}`}>{label}</span>
                        </div>
                    ))}
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-[#704180] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 font-['Poppins']">
                {/* Step 1: Personal Information */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="Full Name*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="Email Address*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <select
                                {...register('gender')}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            >
                                <option value="">Gender*</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            {errors.gender && (
                                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                            )}
                        </div>
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
                                    backgroundColor: "#f9fafb",
                                }}
                                containerStyle={{ width: "100%" }}
                                buttonStyle={{ borderRadius: "12px 0 0 12px", border: "1px solid #e2e8f0" }}
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Photo*</label>
                            <Controller
                                control={control}
                                name="doctorPhoto"
                                render={({ field }) => (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => field.onChange(e.target.files?.[0] || null)}
                                        className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Govt Issued ID*</label>
                            <Controller
                                control={control}
                                name="govtId"
                                render={({ field }) => (
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => field.onChange(e.target.files?.[0] || null)}
                                        className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50"
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}
                {/* Step 2: Professional Information */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <input
                                {...register('qualification')}
                                type="text"
                                placeholder="Qualification*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.qualification && (
                                <p className="text-red-500 text-sm mt-1">{errors.qualification.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Qualifications*</label>
                            <div className="flex gap-2 flex-wrap mb-2">
                                {getValues('additionalQualifications')?.map((q, idx) => (
                                    <span key={idx} className="bg-[#704180] text-white px-2 py-1 rounded-full flex items-center">
                                        {q}
                                        <button
                                            type="button"
                                            className="ml-2 text-xs"
                                            onClick={() => {
                                                const arr = getValues('additionalQualifications').filter((_, i) => i !== idx);
                                                setValue('additionalQualifications', arr, { shouldValidate: true });
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={qualificationInput}
                                onChange={e => setQualificationInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ',') && qualificationInput.trim()) {
                                        e.preventDefault();
                                        const arr = [...(getValues('additionalQualifications') || []), qualificationInput.trim()];
                                        setValue('additionalQualifications', arr, { shouldValidate: true });
                                        setQualificationInput('');
                                    }
                                }}
                                placeholder="Type and press Enter or comma"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.additionalQualifications && (
                                <p className="text-red-500 text-sm mt-1">{errors.additionalQualifications.message as string}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('specialization')}
                                type="text"
                                placeholder="Area of Specialization*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.specialization && (
                                <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('experience')}
                                type="number"
                                placeholder="Experience*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.experience && (
                                <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('medicalLicenseNumber')}
                                type="text"
                                placeholder="Medical License Number*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.medicalLicenseNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.medicalLicenseNumber.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Document*</label>
                            <Controller
                                control={control}
                                name="medicalLicense"
                                render={({ field }) => (
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => field.onChange(e.target.files?.[0] || null)}
                                        className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50"
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}
                {/* Step 3: Practice & Fees */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <input
                                {...register('workLocation')}
                                type="text"
                                placeholder="Work Location*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.workLocation && (
                                <p className="text-red-500 text-sm mt-1">{errors.workLocation.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('consultationFee')}
                                type="number"
                                placeholder="Consultation Fee*"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50"
                                style={{ '--tw-ring-color': '#704180' } as React.CSSProperties}
                            />
                            {errors.consultationFee && (
                                <p className="text-red-500 text-sm mt-1">{errors.consultationFee.message}</p>
                            )}
                        </div>
                    </div>
                )}
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {step > 0 && (
                        <Button type="button" onClick={handleBack} className="rounded-xl px-8 py-3 bg-gray-200 text-white font-medium">Back</Button>
                    )}
                    {step < steps.length - 1 && (
                        <Button type="button" onClick={handleNext} className="rounded-xl px-8 py-3 bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-medium ml-auto">Next</Button>
                    )}
                    {step === steps.length - 1 && (
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl px-8 py-3 bg-gradient-to-r from-[#704180] to-[#8B2D6C] text-white font-medium ml-auto"
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
                    )}
                </div>
            </form>
        </div>
    );
};

export default DoctorRegistrationForm; 