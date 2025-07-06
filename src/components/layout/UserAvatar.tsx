import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

interface UserAvatarProps {
  profileUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ profileUrl = '/profile' }) => {
  const [userInitial, setUserInitial] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
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
          setUserName(response.data.data.name);
          setUserInitial(response.data.data.name.trim().charAt(0).toUpperCase());
        }
      } catch (error) {
        setUserName('User');
        setUserInitial('L');
      }
    };
    fetchProfile();
  }, [isDoctor]);

  return (
    <div className="px-4 py-3 mt-auto border-t">
      <Link to={profileUrl} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7B2B6A] text-white text-lg font-semibold font-['Poppins']">
            {userInitial || 'L'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-['Poppins']">Welcome <span className="inline-block">👋</span></span>
            <span className="text-base font-medium text-gray-800 font-['Poppins']">{userName || 'User'}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </Link>
    </div>
  );
};

export default UserAvatar; 