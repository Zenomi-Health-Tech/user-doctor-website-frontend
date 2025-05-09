import React from 'react';
import { Search, Bell, Settings } from 'lucide-react'; // Use lucide-react icons or your own


const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between h-20 px-8 border-b w-full bg-white">
      {/* Search Bar */}
      <div className="flex items-center w-1/3 min-w-[300px]">
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
      <div className="flex items-center gap-6">
        {/* Settings Icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F5F9]">
          <Settings className="w-5 h-5 text-[#636363]" />
        </div>
        {/* Notification Icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F5F9]">
          <Bell className="w-5 h-5 text-[#636363]" />
        </div>
        {/* User Avatar */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7B2B6A] text-white text-lg font-semibold">
          L
        </div>
      </div>
    </header>
  );
};

export default Header;
