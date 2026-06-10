import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import zenomiLogo from '@/assets/zenomiLogo.png';

const Header: React.FC = () => {
  const [userInitial, setUserInitial] = useState('');
  const { isDoctor, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(isDoctor ? '/doctors/profile' : '/users/profile');
        if (res.data?.data?.name) setUserInitial(res.data.data.name.trim().charAt(0).toUpperCase());
      } catch { setUserInitial('Z'); }
    };
    fetchProfile();
  }, [isDoctor]);

  const handleLogout = () => {
    logout();
    navigate('/chooserole');
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-gray-100 w-full bg-white">
      <img src={zenomiLogo} alt="Zenomi" className="h-7 lg:hidden" />
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        {isDoctor && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors font-['Poppins']"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        )}
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#704180] to-[#8B2D6C] text-white text-sm font-bold">
          {userInitial || 'Z'}
        </div>
      </div>
    </header>
  );
};

export default Header;
