
// Define the shape of the authentication cookie
export interface AuthUser {
    token: string;
    phoneNumber?: string; // Optional field for phoneNumber if needed
  }
  
  // Define the shape of the profile data used in createProfile
  export interface CreateProfileData {
    country: string;
    businessEmail: string;
    businessWebsite: string;
    businessName: string;
    taxNumber: string;
    TermsAndConditions:boolean;
    logo: File | null;
    gstDocument: File | null;
  }
  
  
  // Define the parameters for sending OTP
  export interface SendOtpParams {
    countryCode: string;
    phoneNumber: string;
  }
  
  // Define the response for sending OTP
  export interface SendOtpResponse {
    message: string;
    data: {
      orderId: string;
    };
  }
  
  // Define the parameters for verifying OTP
  export interface VerifyOtpParams {
    countryCode: string;
    phoneNumber: string;
    otp: string;
    orderId: string;
  }
  
  // Define the response for verifying OTP
  export interface VerifyOtpResponse {
    message: string;
    phoneNumber: string;
    token: string;
  }
  
  
  
  // types/vatTypes.ts
  export interface VatData {
    city: string;
    companyName: string;
    streetAddress1: string;
    streetAddress2?: string; // Optional field
    taxStatus: "Business" | "Personal"; // Limited to "Business" or "Personal"
  }
  
  
  