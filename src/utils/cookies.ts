import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Define the name and options for the authentication cookie
const COOKIE_NAME = "auth";
const COOKIE_OPTIONS = {
  expires: 7, // Cookie expiration in days
  path: "/", // Ensure cookie is available across the entire domain
  secure: process.env.NODE_ENV === "production", // Use secure flag only in production
  sameSite: "Strict" as const, // Enforce same-site policy for security
};

// Define the shape of the authentication cookie
interface AuthUser {
  token: string;
  hospitalRole?: string | null;
  adminId?: string;
  adminEmail?: string;
  adminMobileNumber?: string;
  adminName?: string;
  iat?: number;
  exp?: number;
}

/**
 * Stores the authentication token and role in a cookie.
 * @param user - Object containing the token and optional role.
 */
export const setAuthCookies = (user: AuthUser) => {
  try {
    // Convert user object to JSON and set it in the cookie
    Cookies.set(COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
    console.log("Authentication cookie set successfully.");
  } catch (error) {
    console.error("Failed to set authentication cookie:", error);
  }
};

/**
 * Clears the authentication cookie.
 */
export const clearAuthCookies = () => {
  try {
    // Remove the authentication cookie
    Cookies.remove(COOKIE_NAME, COOKIE_OPTIONS);
    console.log("Authentication cookie cleared successfully.");
  } catch (error) {
    console.error("Failed to clear authentication cookie:", error);
  }
};

/**
 * Retrieves the authentication token and role from the cookie.
 * @returns The AuthUser object with decoded token if the cookie exists, otherwise null.
 */
export const getAuthCookies = (): AuthUser | null => {
  try {
    // Retrieve the cookie and parse it as JSON
    const cookie = Cookies.get(COOKIE_NAME);
    const authUser = cookie ? JSON.parse(cookie) : null;

    // If the cookie exists, decode the token to extract additional info
    if (authUser && authUser.token) {
      const decodedToken = jwtDecode<any>(authUser.token);

      // Merge the decoded token data into the authUser object
      return {
        ...authUser,
        adminEmail: decodedToken.adminEmail,
        adminMobileNumber: decodedToken.adminMobileNumber,
        adminName: decodedToken.hospitalName,
        hospitalRole: decodedToken.hospitalRole,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to retrieve authentication cookie:", error);
    return null;
  }
};
