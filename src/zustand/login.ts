import { StateCreator } from "zustand";
import { handleApiError } from "../utils/errorHandler";
import {
  setAuthCookies,
  clearAuthCookies,
} from "../utils/cookies";
import Cookies from "js-cookie"; // Ensure Cookies is imported
import axios from "axios";
// Define the shape of the authentication state
export interface LoginAuthState {
  countryCode: string;
  phoneNumber: string;
  orderId: string | null;
  error: string | null;
  loading: boolean;
  updatePhoneDetails: (countryCode: string, phoneNumber: string) => void;
  requestOtp: () => Promise<void>;
  userRequestOtp: () => Promise<void>;
  resendOtpLogin: () => Promise<void>;
  validateOtp: (otp: string) => Promise<boolean>;
  userValidateOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
}

// Create the authentication slice
export const createLoginAuthSlice: StateCreator<LoginAuthState> = (
  set,
  get
) => ({
  countryCode: "+91",
  phoneNumber: "",
  orderId: null,
  error: null,
  loading: false,

  updatePhoneDetails: (countryCode: string, phoneNumber: string) =>
    set({ 
      countryCode, 
      phoneNumber,
    }),

  // Request OTP and store orderId from the response
  requestOtp: async () => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber } = get();
      const response = await axios.post<{
        message: string;
        data: { orderId: string };
      }>("https://apizenomiotp.zenomihealth.com/api/v1/doctors/login/send-otp", {
        countryCode,
        phoneNumber,
      });
      const { orderId } = response.data.data;
      set({ orderId });
    } catch (error: any) {
      set({ error: handleApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  userRequestOtp: async () => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber } = get();
      const response = await axios.post<{
        message: string;
        data: { orderId: string };
      }>("https://apizenomiotp.zenomihealth.com/api/v1/users/send-otp", {
        countryCode,
        phoneNumber,
      });
      const { orderId } = response.data.data;
      set({ orderId });
    } catch (error: any) {
      set({ error: handleApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Resend OTP request
  resendOtpLogin: async () => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber } = get();
      await axios.post("https://apizenomiotp.zenomihealth.com/api/v1/auth/resendOTP", { 
        countryCode,
        phoneNumber
      });
    } catch (error: any) {
      set({ error: handleApiError(error) });
    } finally {
      set({ loading: false });
    }
  },

  // Validate OTP with the orderId (Doctor)
  validateOtp: async (otp: string) => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber, orderId } = get();

      if (!orderId) {
        throw new Error("Order ID is missing. Please request OTP again.");
      }

      console.log("Validating OTP with:", { orderId, countryCode, phoneNumber, otp });

      const response = await axios.post("https://apizenomiotp.zenomihealth.com/api/v1/doctors/login/verify-otp", {
        otp,
        countryCode,
        phoneNumber,
        orderId,
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }

      const { token } = response.data.data;
      const { id } = response.data.data.doctor; 

      // Set cookies
      Cookies.set('userId', id, { expires: 7 });
      setAuthCookies({ token }); // Save token to cookies

      // Only set error to null here, AuthContext will manage user state
      set({ error: null });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify OTP";
      console.error("OTP validation error:", errorMessage);
      set({ error: errorMessage });
      clearAuthCookies();
      return false;
    } finally {
      set({ loading: false });
    }
  },

  userValidateOtp: async (otp: string) => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber, orderId } = get();

      if (!orderId) {
        throw new Error("Order ID is missing. Please request OTP again.");
      }

      const response = await axios.post("https://apizenomiotp.zenomihealth.com/api/v1/users/verify-otp", {
        otp,
        countryCode,
        phoneNumber,
        orderId,

      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }

      const { token } = response.data.data;
      const { id } = response.data.data.user;

      // Set cookies
      Cookies.set('userId', id, { expires: 7 });
      setAuthCookies({ token }); // Save token to cookies

      // Only set error to null here, AuthContext will manage user state
      set({ error: null });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify OTP";
      console.error("OTP validation error:", errorMessage);
      set({ error: errorMessage });
      clearAuthCookies();
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  logout: () => {
    clearAuthCookies();
    set({ 
      orderId: null,
      countryCode: "+91",
      phoneNumber: "",
    });
  },
});
