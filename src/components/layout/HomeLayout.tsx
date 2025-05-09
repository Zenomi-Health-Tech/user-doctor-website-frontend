import React from "react";

import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./sidebar";
import Header from "./header";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider> {/* Ensure the SidebarProvider wraps the entire layout */}
      <main className="flex h-screen w-full ">
        {/* Sidebar on the left */}
        <AppSidebar/>

        <div className="flex flex-col w-full">
          {/* Top Header */}
          <Header />
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-white p-4">
            {children}
          </div>
        </div>

      </main>
    </SidebarProvider>
  );
}
