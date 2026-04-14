import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";
import { SidebarHeader } from "./SidebarHeader";
import {  User, CalendarDays, ChartPie, House, Users, Moon } from 'lucide-react';
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
      title: "Sleep Tracker",
      url: "/sleep-tracker",
      icon: Moon,
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

  // Sidebar context available via useSidebar() if needed

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

  // No hamburger or mobile drawer — bottom nav handles mobile navigation
  return (
    <>
      {/* Desktop sidebar only */}
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
