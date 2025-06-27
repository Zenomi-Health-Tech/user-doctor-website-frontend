import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";
import { SidebarHeader } from "./SidebarHeader";
import {  User, CalendarDays, ChartPie, House, Users } from 'lucide-react';
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from 'react';
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

  // Doctor name state
  const [doctorName, setDoctorName] = useState<string>('');
  const [doctorInitial, setDoctorInitial] = useState<string>('');

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
          const name = response.data.data.name.trim();
          setDoctorName(name);
          setDoctorInitial(name.charAt(0).toUpperCase());
        }
      } catch (error) {
        setDoctorName('Doctor');
        setDoctorInitial('D');
      }
    };
    if (isDoctor) fetchDoctor();
  }, [isDoctor]);

  return (
    <Sidebar className="border-r font-['Poppins']" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader items={data.navMain2} />

      <SidebarContent className="flex flex-col h-full">
        <NavMain items={data.navMain} />
        <UserAvatar 
          name={isDoctor ? doctorName : data.user.name} 
          initial={isDoctor ? doctorInitial : data.user.name[0]} 
          profileUrl="/profile" 
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
