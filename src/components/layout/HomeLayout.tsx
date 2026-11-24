import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackPageView } from "@/utils/track";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./sidebar";
import Header from "./header";
import MobileBottomNav from "./MobileBottomNav";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { isDoctor, user } = useAuth();
  // Teen section views for analytics; clinicians are not tracked here.
  useEffect(() => {
    if (user && !isDoctor) trackPageView(pathname);
  }, [pathname, user, isDoctor]);

  return (
    <SidebarProvider>
      <main className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col w-full">
          {/* Header only on desktop */}
          <div className="hidden lg:block">
            <Header />
          </div>
          <div className="flex-1 overflow-auto pb-28 lg:pb-4 bg-transparent">
            {children}
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </SidebarProvider>
  );
}