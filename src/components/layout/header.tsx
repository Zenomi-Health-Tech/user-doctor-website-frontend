import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import zenomiLogo from '@/assets/zenomiLogo.png';

const Header: React.FC = () => {
  const [userInitial, setUserInitial] = useState('');
  const { isDoctor } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(isDoctor ? '/doctors/profile' : '/users/profile');
        if (res.data?.data?.name) setUserInitial(res.data.data.name.trim().charAt(0).toUpperCase());
      } catch { setUserInitial('Z'); }
    };
    fetchProfile();
  }, [isDoctor]);

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-gray-100 w-full bg-white">
      <img src={zenomiLogo} alt="Zenomi" className="h-7 lg:hidden" />
      <div className="hidden lg:block" />
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#704180] to-[#8B2D6C] text-white text-sm font-bold">
        {userInitial || 'Z'}
      </div>
    </header>
  );
};

export default Header;
