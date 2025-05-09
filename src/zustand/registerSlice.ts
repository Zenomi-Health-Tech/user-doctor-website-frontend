import { StateCreator } from "zustand";
import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";
import {
  setAuthCookies,
  clearAuthCookies,
  getAuthCookies,
} from "../utils/cookies";
import { setUserInfoInLocalStorage, clearUserInfoFromLocalStorage } from "../utils/localStorage";
import { AuthUser } from "./registerTypes";

export interface RegisterAuthState {
  phoneNumber: string;
  countryCode: string;
  user: AuthUser | null;
  tempToken: string | null;
  error: string | null;
  loading: boolean;
  orderId: string | null;
  setPhoneNumber: (phoneNumber: string) => void;
  setCountryCode: (countryCode: string) => void;
  sendOtp: (countryCode: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  createProfile: (profileData: FormData) => Promise<boolean>;
  logout: () => void;
}

export const createRegisterAuthSlice: StateCreator<RegisterAuthState> = (
  set,
  get
) => ({
  phoneNumber: "",
  countryCode: "",
  user: getAuthCookies() || null,
  tempToken: null,
  error: null,
  loading: false,
  orderId: null,

  setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),
  setCountryCode: (countryCode: string) => set({ countryCode }),

  sendOtp: async (countryCode: string) => {
    set({ loading: true, error: null });
    try {
      const { phoneNumber } = get();
      const params = { countryCode, phoneNumber };
      const response = await api.post("otp-service/send-otp", params);
      const { orderId } = response.data.data;
      set({ orderId });
      console.log(response.data.data);
    } catch (error: any) {
      set({ error: handleApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resendOtp: async () => {
    set({ loading: true, error: null });
    try {
      const { phoneNumber, countryCode } = get();
      const params = { countryCode, phoneNumber };
      await api.post("/otp-service/resend-otp-register", params);
    } catch (error: any) {
      set({ error: handleApiError(error) });
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (otp: string) => {
    set({ loading: true, error: null });
    try {
      const { phoneNumber, countryCode, orderId } = get();
      if (!orderId) {
        throw new Error("Order ID is missing. Please request OTP again.");
      }
      const params = { countryCode, phoneNumber, otp, orderId };
      const response = await api.post("/otp-service/verify-otp", params);
      const { token } = response.data;
      set({ tempToken: token });
      console.log(response.data.message);
      return true;
    } catch (error: any) {
      set({ error: handleApiError(error) });
      clearAuthCookies();
      set({ user: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  createProfile: async (profileData: FormData) => {
    set({ loading: true, error: null });
    try {
      const { tempToken } = get();
      if (!tempToken) {
        throw new Error("No token found. Please verify OTP first.");
      }

      const response = await api.post("/profile/createProfile", profileData, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const { businessName, buisnessEmail, logo } = response.data.data;

      // Store companyName, email, and logo in local storage
      setUserInfoInLocalStorage(businessName, buisnessEmail
        , logo);

      set({ user: { ...response.data.data, token: tempToken }, tempToken: null });
      setAuthCookies({ token: tempToken });

      return true;
    } catch (error: any) {
      set({ error: handleApiError(error) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    clearAuthCookies();               // Clear authentication cookies
    clearUserInfoFromLocalStorage();   // Clear company info, email, and logo from local storage
    set({ user: null, tempToken: null, orderId: null });
  },
});
