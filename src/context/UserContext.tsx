import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { getAuthCookies } from '@/utils/cookies';

interface AdminUser {
  hospitalId: string;
  hospitalName: string | null;
  hospitalPhoneNumber: string | null;
  hospitalRole: 'ADMIN' | 'NURSING';
}

interface UserContextType {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
  isAdmin: boolean;
  isNurse: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check for existing auth token on mount
    const auth = getAuthCookies();
    if (auth?.token) {
      try {
        const decoded = jwtDecode<AdminUser>(auth.token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // If hospitalRole is not present, consider as admin
  const isAdmin = !user?.hospitalRole || user?.hospitalRole === 'ADMIN';
  const isNurse = user?.hospitalRole === 'NURSING';

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, isNurse }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};