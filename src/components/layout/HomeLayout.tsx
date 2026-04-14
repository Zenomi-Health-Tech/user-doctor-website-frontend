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
          <Header />
          <div className="flex-1 overflow-auto bg-white p-4 pb-24 lg:pb-4">
            {children}
          </div>
        </div>
        <MobileBottomNav />
      </main>
    </SidebarProvider>
  );
}
