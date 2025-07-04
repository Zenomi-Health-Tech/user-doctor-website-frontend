import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";
import { SidebarHeader } from "./SidebarHeader";
import {  User, CalendarDays, ChartPie, House, Users, Menu } from 'lucide-react';
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from 'react';
import api from '@/utils/api';
import Cookies from 'js-cookie';

// This is sample data.
const getNavItems = (isDoctor: boolean) => ({
  user: {
    name: "Lily",
    email: "lily@zenomi.health",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  navMain: isDoctor ? [
    {
      title: "Home",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: Users,
    },
    {
      title: "Referred Patients",
      url: "/referred-patients",
      icon: Users,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: CalendarDays,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    // {
    //   title: "Notifications",
    //   url: "/notifications",
    //   icon: Bell,
    // },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: Settings,
    // },
    // {
    //   title: "Support",
    //   url: "/support",
    //   icon: HelpCircle,
    // },
  ] : [
    {
      title: "Home",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Results",
      url: "/results",
      icon: ChartPie,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: CalendarDays,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    // {
    //   title: "Notifications",
    //   url: "/notifications",
    //   icon: Bell,
    // },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: Settings,
    // },
    // {
    //   title: "Support",
    //   url: "/support",
    //   icon: HelpCircle,
    // },
  ],
  navMain2: [
    {
      title: "Logo",
      url: "/",
      icon: Logo,
      isActive: true,
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDoctor } = useAuth();
  const data = getNavItems(isDoctor);

  // Get sidebar context for mobile state
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const authCookie = Cookies.get('auth');
        let token = '';
        if (authCookie) {
          try {
            token = JSON.parse(authCookie).token;
          } catch (e) {
            token = '';
          }
        }
        const response = await api.get('/doctors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data && response.data.data.name) {
          // const name = response.data.data.name.trim();
        }
      } catch (error) {
      }
    };
    if (isDoctor) fetchDoctor();
  }, [isDoctor]);

  // Hamburger toggle for mobile
  return (
    <>
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md border border-gray-200 lg:hidden"
          aria-label="Open sidebar menu"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="w-6 h-6 text-[#8B2D6C]" />
        </button>
      )}
      {/* Sidebar Drawer for mobile, static for desktop */}
      {(isMobile && openMobile) && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 flex lg:hidden">
          <div className="relative w-64 max-w-full h-full bg-white shadow-lg flex flex-col">
            <button
              className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-md border border-gray-200"
              aria-label="Close sidebar"
              onClick={() => setOpenMobile(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarHeader items={data.navMain2} />
            <SidebarContent className="flex flex-col h-full">
              <NavMain items={data.navMain} />
              <UserAvatar profileUrl="/profile" />
            </SidebarContent>
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar className="border-r font-['Poppins'] h-full" {...props}>
          <SidebarHeader items={data.navMain2} />
          <SidebarContent className="flex flex-col h-full">
            <NavMain items={data.navMain} />
            <UserAvatar profileUrl="/profile" />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
      </div>
    </>
  );
}
