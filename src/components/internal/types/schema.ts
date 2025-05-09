import { z } from 'zod';

export const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  email: z.string().email('Invalid email address'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits'),
  dateOfBirth: z.string().nonempty('Date of birth is required'),
  age: z
    .string()
    .min(1, 'Age is required')
    .regex(/^\d+$/, 'Age must be a valid number'), // Age as string
  panCard: z
    .string()
    .min(10, 'PAN Card must be 10 characters')
    .max(10, 'PAN Card must be 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN Card format'),
  aadhaarCard: z
    .string()
    .length(12, 'Aadhaar Card must be exactly 12 digits')
    .regex(/^\d+$/, 'Aadhaar Card must be a valid number'),
  roleName: z.string().min(1, 'Role Name is required'),
});

export const profileFormSchema = z.object({
  hospitalName: z.string().min(1, { message: 'Hospital name is required' }),
  hospitalLocation: z.string().min(1, { message: 'Location is required' }),
  hospitalPhoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 characters' }),
  hospitalDateOfRegistration: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
  hospitalDMHORegistration: z
    .string()
    .min(1, { message: 'DMHO Registration is required' }),
  hospitalCompanyDetails: z
    .string()
    .min(1, { message: 'Company details are required' }),
  hospitalCompanyPAN: z.string().min(1, { message: 'Company PAN is required' }),
  hospitalOwnerDetails: z
    .string()
    .min(1, { message: 'Owner details are required' }),
  hospitalServicesOffered: z
    .string()
    .min(1, { message: 'Services offered are required' }),
  hospitalSpecialistServices: z
    .string()
    .min(1, { message: 'Specialist services are required' }),
  hospitalNumberOfBeds: z
    .number()
    .min(1, { message: 'Number of beds must be greater than 0' }),
  hospitalAreasOfInterest: z
    .string()
    .min(1, { message: 'Areas of interest are required' }),
  hospitalIncorporatingCertificate: z
    .instanceof(FileList, { message: 'Incorporating certificate is required' })
    .optional(),
  Address: z.string().min(1, { message: 'Address is required' }),
});

export const Patientsschema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  email: z.string().email('Invalid email address'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits'),
  dateOfBirth: z.string().nonempty('Date of birth is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], {
    errorMap: () => ({ message: 'Please select a blood group' }),
  }),
  age: z
    .string()
    .min(1, 'Age is required')
    .regex(/^\d+$/, 'Age must be a valid number'), // Age as string
  chiefComplaints: z.string().min(1, 'Chief complaints are required'),
});
export const DischargePatientsschema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  email: z.string().email('Invalid email address'),
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number cannot exceed 15 digits'),
  whatsappNumber: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .max(15, 'WhatsApp number cannot exceed 15 digits'),
  guardianMobileNumber: z
    .string()
    .min(10, 'Guardian mobile number must be at least 10 digits')
    .max(15, 'Guardian mobile number cannot exceed 15 digits'),
  dateOfBirth: z.string().nonempty('Date of birth is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], {
    errorMap: () => ({ message: 'Please select a blood group' }),
  }),
  age: z
    .string()
    .min(1, 'Age is required')
    .regex(/^\d+$/, 'Age must be a valid number'),
  dischargeSummary: z.string().min(1, 'Discharge summary is required'),
  dischargeSummaryPdf: z.any().refine((files) => {
    if (!(files instanceof FileList)) return false;
    if (files.length === 0) return false;
    const file = files[0];
    return file instanceof File && file.type === 'application/pdf';
  }, 'Please upload a valid PDF file'),
  govtIDPdf: z.any().refine((files) => {
    if (!(files instanceof FileList)) return false;
    if (files.length === 0) return false;
    const file = files[0];
    return file instanceof File && file.type === 'application/pdf';
  }, 'Please upload a valid PDF file'),
  bp: z.string(),
  sugar: z.string(),
  historyOfIllness: z.string().min(1, 'History of illness is required'),
  recentHospitalVisited: z
    .string()
    .min(1, 'Recent hospital visited is required'),
});

export const hospitalSchema = z.object({
  hospitalName: z.string().nonempty('Hospital Name is required'),
  hospitalLocation: z.string().nonempty('Hospital Location is required'),
  hospitalPhoneNumber: z.string().nonempty('Phone Number is required'),
  hospitalDateOfRegistration: z
    .string()
    .nonempty('Date of Registration is required'),
  hospitalDMHORegistration: z
    .string()
    .nonempty('DMHO Registration is required'),
  hospitalCompanyDetails: z.string().nonempty('Company Details are required'),
  hospitalCompanyPAN: z.string().nonempty('Company PAN is required'),
  hospitalOwnerDetails: z.string().nonempty('Owner Details are required'),
  hospitalServicesOffered: z.string().nonempty('Services Offered are required'),
  hospitalSpecialistServices: z
    .string()
    .nonempty('Specialist Services are required'),
  hospitalNumberOfBeds: z.string().nonempty('Number of Beds is required'),
  hospitalAreasOfInterest: z
    .string()
    .nonempty('Areas of Interest are required'),
  images: z.custom<FileList>(
    (val) => val instanceof FileList && val.length > 0,
    {
      message: 'Images are required',
    }
  ),
  address: z.string().nonempty('Address is required'),
  city: z.string().nonempty('City is required'),
});
