import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";
import { SidebarHeader } from "./SidebarHeader";
import { Bell, Settings, HelpCircle, User, CalendarDays, ChartPie, House, Users } from 'lucide-react';
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/context/AuthContext";

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
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "/support",
      icon: HelpCircle,
    },
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
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "/support",
      icon: HelpCircle,
    },
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

  return (
    <Sidebar className="border-r font-['Poppins']" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader items={data.navMain2} />

      <SidebarContent className="flex flex-col h-full">
        <NavMain items={data.navMain} />
        <UserAvatar 
          name={data.user.name} 
          initial={data.user.name[0]} 
          profileUrl="/profile" 
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
