import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from '@/utils/api';
import { useNavigate } from "react-router-dom";

const QUALIFICATIONS = [
    'MBBS', 'MD (Psychiatry)', 'DNB (Psychiatry)', 'DM (Psychiatry)', 'MRCPsych',
    'M.Phil (Clinical Psychology)', 'Ph.D (Clinical Psychology)', 'M.Phil (Psychiatric Social Work)',
    'MA (Clinical Psychology)', 'MSc (Clinical Psychology)', 'MSW (Psychiatric Social Work)',
    'PG Diploma (Psychiatry)', 'PG Diploma (Clinical Psychology)', 'PG Diploma (Counseling)',
    'BAMS (Ayurveda)', 'BHMS (Homeopathy)', 'Other',
];

const SPECIALIZATIONS = [
    'General Psychiatry', 'Clinical Psychology', 'Counseling Psychology',
    'Child & Adolescent Psychiatry', 'Geriatric Psychiatry', 'Addiction Psychiatry / De-addiction',
    'Forensic Psychiatry', 'Neuropsychiatry', 'Consultation-Liaison Psychiatry',
    'Community Mental Health', 'Cognitive Behavioral Therapy (CBT)', 'Psychotherapy',
    'Psychiatric Social Work', 'Behavioral Medicine', 'Sleep Medicine',
    'Rehabilitation Psychology', 'Occupational Therapy (Mental Health)',
    'Art / Music / Dance Therapy', 'Sexology & Relationship Counseling', 'Other',
];

const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP'];

const doctorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
    qualification: z.string().min(1, 'Qualification is required'),
    additionalQualifications: z.array(z.string()),
    specialization: z.string().min(1, 'Specialization is required'),
    medicalLicenseNumber: z.string().min(1, 'Medical license number is required'),
    experience: z.string().min(1, 'Experience is required'),
    consultationFee: z.string().min(1, 'Consultation fee is required'),
    doctorPhoto: z.any().optional(),
    medicalLicense: z.any().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const steps = ['Personal Information', 'Professional Information', 'Practice & Fees'];

const selectClass = "w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] appearance-none transition-colors";
const inputClass = "w-full p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] transition-colors";
const fieldBg = { backgroundColor: '#FCF8FA' };

const selectClass = "w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50";
const inputClass = selectClass;

const DoctorRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [countryCode, setCountryCode] = useState('+91');
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [qualificationInput, setQualificationInput] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('₹ INR');

    const {
        register, handleSubmit, setValue, getValues, trigger, control,
        formState: { errors },
    } = useForm<DoctorFormData>({
        resolver: zodResolver(doctorSchema),
        shouldUnregister: false,
        defaultValues: { additionalQualifications: [] },
    });

    const handlePhoneChange = (value: string, country: { dialCode?: string }) => {
        if (!country.dialCode) return;
        setCountryCode(`+${country.dialCode}`);
        setValue("phoneNumber", value.replace(country.dialCode, ""));
    };

    // Create a tiny 1x1 transparent PNG as placeholder for govtId
    const createPlaceholderFile = (): File => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 1, 1);
        const dataUrl = canvas.toDataURL('image/png');
        const arr = dataUrl.split(',');
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        return new File([u8arr], 'placeholder.png', { type: 'image/png' });
    };

    const onSubmit = async (data: DoctorFormData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phoneNumber', data.phoneNumber);
            formData.append('countryCode', countryCode);
            formData.append('gender', data.gender);
            formData.append('qualification', data.qualification);
            formData.append('additionalQualifications', JSON.stringify(data.additionalQualifications));
            formData.append('specialization', data.specialization);
            formData.append('medicalLicenseNumber', data.medicalLicenseNumber);
            formData.append('experience', data.experience);
            formData.append('consultationFee', data.consultationFee);
            formData.append('currency', selectedCurrency);
            if (data.doctorPhoto) formData.append('doctorPhoto', data.doctorPhoto);
            if (data.medicalLicense) formData.append('medicalLicense', data.medicalLicense);

            const response = await axios.post(
                'https://zenomi.elitceler.com/api/v1/doctors/register',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast({ title: "Success", description: "Registration successful!", variant: "default", className: "bg-green-500 text-white" });
            if (response.status === 201) navigate('/doctor/login');
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || 'Registration failed', variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        let valid = false;
        if (step === 0) valid = await trigger(['name', 'email', 'phoneNumber', 'gender']);
        else if (step === 1) valid = await trigger(['qualification', 'specialization', 'experience', 'medicalLicenseNumber']);
        else if (step === 2) valid = await trigger(['consultationFee']);
        if (valid) setStep(s => s + 1);
    };

    const progress = ((step + 1) / steps.length) * 100;

    return (
        <div className="w-full">
            {/* Step indicators */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {steps.map((label, idx) => (
                        <div key={label} className="flex-1 flex flex-col items-center">
                            <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold ${idx <= step ? 'bg-[#704180]' : 'bg-gray-300'}`}>{idx + 1}</div>
                            <span className={`mt-2 text-xs font-medium text-center ${idx === step ? 'text-[#704180]' : 'text-gray-500'}`}>{label}</span>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                            <input {...register('name')} type="text" placeholder="Enter your name" className={inputClass} style={fieldBg} />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                            <input {...register('email')} type="email" placeholder="Enter your email" className={inputClass} style={fieldBg} />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                            <PhoneInput
                                country="in" onlyCountries={['in']} onChange={handlePhoneChange}
                                inputStyle={{ width: "100%", height: "48px", fontSize: "16px", borderRadius: "9999px", border: "2px solid transparent", backgroundColor: "#FCF8FA" }}
                                containerStyle={{ width: "100%" }}
                                buttonStyle={{ borderRadius: "9999px 0 0 9999px", border: "2px solid transparent", backgroundColor: "#FCF8FA" }}
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                        </div>
                        <div>
                            <select {...register('gender')} className={selectClass} style={fieldBg}>
                                <option value="">Select your gender*</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Photo*</label>
                            <Controller control={control} name="doctorPhoto" render={({ field }) => (
                                <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0] || null)} className="w-full p-2 border-2 border-transparent rounded-full" style={{ backgroundColor: '#FCF8FA' }} />
                            )} />
                        </div>
                    </div>
                )}

                {/* Step 2: Professional Information */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification*</label>
                            <select {...register('qualification')} className={selectClass} style={fieldBg}>
                                <option value="">Select your qualification*</option>
                                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                            {errors.qualification && <p className="text-red-500 text-sm mt-1">{errors.qualification.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Qualifications</label>
                            <div className="flex gap-2 flex-wrap mb-2">
                                {(getValues('additionalQualifications') || []).map((q, idx) => (
                                    <span key={idx} className="bg-[#704180] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {q}
                                        <button type="button" className="ml-1 text-xs hover:text-red-200" onClick={() => {
                                            const arr = getValues('additionalQualifications').filter((_, i) => i !== idx);
                                            setValue('additionalQualifications', arr);
                                        }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text" value={qualificationInput}
                                onChange={e => setQualificationInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ',') && qualificationInput.trim()) {
                                        e.preventDefault();
                                        setValue('additionalQualifications', [...(getValues('additionalQualifications') || []), qualificationInput.trim()]);
                                        setQualificationInput('');
                                    }
                                }}
                                placeholder="Enter any additional qualifications (comma-separated)"
                                className={inputClass} style={fieldBg}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization*</label>
                            <select {...register('specialization')} className={selectClass} style={fieldBg}>
                                <option value="">Select your specialization*</option>
                                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Number*</label>
                            <input {...register('medicalLicenseNumber')} type="text" placeholder="Enter your medical license number" className={inputClass} style={fieldBg} />
                            {errors.medicalLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.medicalLicenseNumber.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)*</label>
                            <input {...register('experience')} type="number" placeholder="Enter your years of experience" className={inputClass} style={fieldBg} max={99} />
                            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Document*</label>
                            <Controller control={control} name="medicalLicense" render={({ field }) => (
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => field.onChange(e.target.files?.[0] || null)} className="w-full p-2 border-2 border-transparent rounded-full" style={{ backgroundColor: '#FCF8FA' }} />
                            )} />
                        </div>
                    </div>
                )}

                {/* Step 3: Practice & Fees */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee*</label>
                            <div className="flex items-stretch gap-2">
                                <select
                                    value={selectedCurrency}
                                    onChange={e => setSelectedCurrency(e.target.value)}
                                    className="p-3 rounded-full border-2 border-transparent focus:outline-none focus:border-[#704180] text-sm font-semibold text-[#704180] min-w-[100px] appearance-none transition-colors"
                                    style={{ backgroundColor: '#FCF8FA' }}
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                    {...register('consultationFee')}
                                    type="number"
                                    placeholder="Enter fee"
                                    className={`flex-1 ${inputClass}`}
                                    style={fieldBg}
                                />
                            </div>
                            {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee.message}</p>}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    {step > 0 && (
                        <Button type="button" onClick={() => setStep(s => s - 1)} className="rounded-full px-8 py-3 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300">Back</Button>
                    )}
                    {step < steps.length - 1 && (
                        <Button type="button" onClick={handleNext} className="rounded-full px-8 py-3 text-white font-medium ml-auto" style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>Next</Button>
                    )}
                    {step === steps.length - 1 && (
                        <Button type="submit" disabled={loading} className="rounded-full px-8 py-3 text-white font-medium ml-auto" style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    <span>Registering...</span>
                                </div>
                            ) : "Register"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DoctorRegistrationForm;
