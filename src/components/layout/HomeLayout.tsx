import React from "react";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./sidebar";
import Header from "./header";
import MobileBottomNav from "./MobileBottomNav";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <main className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col w-full">
          {/* Header only on desktop */}
          <div className="hidden lg:block">
            <Header />
          </div>
          <div className="flex-1 overflow-auto pt-2 lg:pt-0 pb-28 lg:pb-4 bg-transparent">
            {children}
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
