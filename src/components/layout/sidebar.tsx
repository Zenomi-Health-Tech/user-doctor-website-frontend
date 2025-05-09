import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,// Import SidebarHeader
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Logo from "@/assets/zenomiLogo.png";  // Logo import
import dashBoardIcon from "@/assets/ic_Dashboard.svg";  // Dashboard icon import
import AppointmentIcon from "@/assets/Apointment.svg";  // Appointment icon import
import PatientIcon from "@/assets/Patient.svg";  // Patient icon import
import ProfileIcon from "@/assets/Profile.svg"
import { SidebarHeader } from "./SidebarHeader";
import { Bell, Settings } from 'lucide-react';

// This is sample data.
const data = {
  user: {
    name: "Liv Med",
    email: "livmed@gmail.com",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/dashboard",  // Updated URL
      icon: dashBoardIcon,  // Image icon
    },
    {
      title: "Patients",
      url: "/patients",  // Updated URL
      icon: PatientIcon,  // Image icon
    },
    {
      title: "Appointments",
      url: "/appointments",  // Updated URL
      icon: AppointmentIcon,  // Image icon
    },
    {
      title: "Profile",
      url: "/profile",  // Updated URL
      icon: ProfileIcon,  // Keeping default icon for profile (can replace with image as well)
    },
  
    {
      title: "Notifications",
      url: "/notifications",  // Updated URL
      icon: Bell,  // Keeping default icon for profile (can replace with image as well)
    },
  
    {
      title: "Settings",
      url: "/settings",  // Updated URL
      icon: Settings,  // Keeping default icon for profile (can replace with image as well)
    },
  
    {
      title: "Support",
      url: "/support",  // Updated URL
      icon: ProfileIcon,  // Keeping default icon for profile (can replace with image as well)
    },
  
 
  ],
  navMain2: [
    {
      title: "Logo",
      url: "/",  // Updated URL
      icon: Logo,  // Image icon
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} >
      {/* Sidebar Header */}
      <SidebarHeader items={data.navMain2} />

      <SidebarContent >
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
