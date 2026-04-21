import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string | React.ElementType;
  }[];
}) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className="flex-1 overflow-y-auto px-3 py-4">
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
          const isSleep = item.url === '/sleep-tracker';
          return (
            <SidebarMenuItem key={item.title}>
              <Link
                to={item.url}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 font-['Poppins']
                  ${isSleep
                    ? isActive ? 'text-white shadow-sm' : 'text-white/70 hover:text-white'
                    : isActive
                      ? "bg-[#8B2D6C] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}
                `}
                style={isSleep
                  ? isActive
                    ? { background: 'linear-gradient(135deg, #E76F51, #9B59B6)' }
                    : { background: 'linear-gradient(135deg, rgba(231,111,81,0.4), rgba(155,89,182,0.4))', border: '1.5px solid rgba(155,89,182,0.4)' }
                  : undefined}
              >
                {item.icon && (
                  typeof item.icon === "string" ? (
                    <img src={item.icon} alt="" className="w-[18px] h-[18px]" />
                  ) : (
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : ''}`} />
                  )
                )}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
