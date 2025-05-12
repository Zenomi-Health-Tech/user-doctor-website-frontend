import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  initial: string;
  profileUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, initial, profileUrl = '/profile' }) => {
  return (
    <div className="px-4 py-3 mt-auto border-t">
      <Link to={profileUrl} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7B2B6A] text-white text-lg font-semibold font-['Poppins']">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-['Poppins']">Welcome <span className="inline-block">👋</span></span>
            <span className="text-base font-medium text-gray-800 font-['Poppins']">{name}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </Link>
    </div>
  );
};

export default UserAvatar; 