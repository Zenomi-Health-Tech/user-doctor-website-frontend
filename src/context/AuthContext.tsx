import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Make sure you have this installed: npm install jwt-decode
import { getAuthCookies, setAuthCookies, clearAuthCookies } from '@/utils/cookies';

// 1. Define the interface for your decoded token payload
interface DecodedUserToken {
  doctorId?: string; // Optional, present if type is 'DOCTOR'
  userId?: string;    // Optional, present if type is 'USER'
  phoneNumber: string;
  name: string;
  type: 'DOCTOR' | 'USER'; // Your specific user types
  iat: number;
  exp: number;
  isPaid: boolean;
}




// 2. Define the shape of your context value
interface AuthContextType {
  user: DecodedUserToken | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isUser: boolean;
  userName: string | null;
  userType: 'DOCTOR' | 'USER' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DecodedUserToken | null>(null);

  // On mount, check for existing token in cookies
  useEffect(() => {
    const auth = getAuthCookies();
    if (auth && auth.token) {
      try {
        const decoded = jwtDecode<DecodedUserToken>(auth.token);
        // Check if token is expired (optional but good practice)
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          console.warn('Authentication token expired.');
          clearAuthCookies(); // Clear expired token
        }
      } catch (error) {
        console.error('Error decoding or validating token from cookies:', error);
        clearAuthCookies(); // Clear invalid token
      }
    }
  }, []);

  // Function to handle user login (sets token in cookies and updates state)
  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedUserToken>(token);
      setUser(decoded);
      setAuthCookies({ token }); // Save token to cookies
    } catch (error) {
      console.error('Failed to decode and set user token on login:', error);
      setUser(null);
      clearAuthCookies(); // Ensure no bad token is saved
    }
  };

  // Function to handle user logout (clears cookies and state)
  const logout = () => {
    setUser(null);
    clearAuthCookies(); // Clear authentication cookies
  };

  // Derived state for convenience
  const isAuthenticated = !!user;
  const isDoctor = user?.type === 'DOCTOR';
  const isUser = user?.type === 'USER';
  const userName = user?.name || null;
  const userType = user?.type || null;

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    isDoctor,
    isUser,
    userName,
    userType,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom hook to consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 