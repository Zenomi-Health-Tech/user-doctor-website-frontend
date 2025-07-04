import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react'; // Use lucide-react icons or your own
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const [userInitial, setUserInitial] = useState<string>('');
  const { isDoctor } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authCookie = Cookies.get('auth');
        let token = '';
        if (authCookie) {
          try {
            const parsed = JSON.parse(authCookie);
            token = parsed.token;
          } catch (e) {
            token = '';
          }
        }
        let response;
        if (isDoctor) {
          response = await api.get('/doctors/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (response.data && response.data.data && response.data.data.name) {
          setUserInitial(response.data.data.name.trim().charAt(0).toUpperCase());
        }
      } catch (error) {
        setUserInitial('L'); // fallback
      }
    };
    fetchProfile();
  }, [isDoctor]);

  return (
    <header className="flex flex-col sm:flex-row items-center sm:justify-between h-16 sm:h-20 px-4 mt-4 sm:px-8 border-b w-full bg-white gap-4 sm:gap-0">
      {/* Search Bar */}
      <div className="flex items-center w-full sm:w-1/2 md:w-1/3 min-w-0 mb-2 sm:mb-0">
        <div className="flex items-center w-full bg-white border border-[#C7BFCB] rounded-full px-4 py-2">
          <Search className="text-[#C7BFCB] w-5 h-5 mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none border-none text-[#C7BFCB] placeholder-[#C7BFCB] w-full text-base"
          />
        </div>
      </div>
      {/* Right Side Icons */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* User Avatar */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#7B2B6A] text-white text-base sm:text-lg font-semibold">
          {userInitial || 'L'}
        </div>
      </div>
    </header>
  );
};

export default Header;
