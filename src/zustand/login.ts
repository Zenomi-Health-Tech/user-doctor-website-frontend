import { StateCreator } from "zustand";
import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";
import {
  setAuthCookies,
  clearAuthCookies,
  getAuthCookies,
} from "../utils/cookies";

// Define the shape of the authentication state
export interface LoginAuthState {
  countryCode: string;
  phoneNumber: string;
  user: { token: string } | null;
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
  user: getAuthCookies() || null,
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
      const response = await api.post<{
        message: string;
        data: { orderId: string };
      }>("/doctors/login/send-otp", {
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
      const response = await api.post<{
        message: string;
        data: { orderId: string };
      }>("/users/send-otp", {
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
      await api.post("/auth/resendOTP", { 
        countryCode,
        phoneNumber
      });
    } catch (error: any) {
      set({ error: handleApiError(error) });
    } finally {
      set({ loading: false });
    }
  },

  // Validate OTP with the orderId
  validateOtp: async (otp: string) => {
    set({ loading: true, error: null });
    try {
      const { countryCode, phoneNumber, orderId } = get();

      if (!orderId) {
        throw new Error("Order ID is missing. Please request OTP again.");
      }

      const response = await api.post("/doctors/login/verify-otp", {
        otp,
        countryCode,
        phoneNumber,
        orderId,
      });

      const { token } = response.data.data;
      console.log(token);

      setAuthCookies({
        token,
      });

      return true;
    } catch (error: any) {
      set({ error: handleApiError(error) });
      clearAuthCookies();
      set({ user: null, orderId: null });
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

      const response = await api.post("/users/verify-otp", {
        otp,
        countryCode,
        phoneNumber,
        orderId,
      });

      const { token } = response.data.data;
      console.log(token);

      setAuthCookies({
        token,
      });

      return true;
    } catch (error: any) {
      set({ error: handleApiError(error) });
      clearAuthCookies();
      set({ user: null, orderId: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  logout: () => {
    clearAuthCookies();
    set({ 
      user: null, 
      orderId: null,
      countryCode: "+91",
      phoneNumber: "",
    });
  },
});
