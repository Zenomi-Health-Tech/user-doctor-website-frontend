import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";
import { SidebarHeader } from "./SidebarHeader";
import { Bell, Settings, HelpCircle , User , CalendarDays , ChartPie , House } from 'lucide-react';
import UserAvatar from "./UserAvatar";

// This is sample data.
const data = {
  user: {
    name: "Lily",
    email: "lily@zenomi.health",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  navMain: [
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
