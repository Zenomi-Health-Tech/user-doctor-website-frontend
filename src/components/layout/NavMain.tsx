import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string | React.ElementType;
    isActive?: boolean;
  }[];
}) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className="h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
      <SidebarMenu className="px-4 py-2">
        {items.map((item) => {
          const isActivePage = location.pathname === item.url;
          return (
            <SidebarMenuItem key={item.title} className="mb-3">
              <Link
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-colors font-['Poppins']
                  ${isActivePage
                    ? "text-white"
                    : "text-[#636363] hover:bg-gray-100"}
                `}
                style={
                  isActivePage
                    ? {
                        background:
                          "linear-gradient(90deg, #704180 6.54%, #8B2D6C 90.65%)",
                      }
                    : {}
                }
              >
                {item.icon && (
                  typeof item.icon === "string" ? (
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-5 h-5"
                      style={{
                        filter: isActivePage
                          ? undefined
                          : 'brightness(0.6)',
                      }}
                    />
                  ) : (
                    <item.icon
                      className={`w-5 h-5 ${isActivePage ? 'text-white' : 'text-[#636363]'}`}
                    />
                  )
                )}
                {/* Only show text if not collapsed */}
                {!isCollapsed && (
                  <span className={`font-normal text-base ${isActivePage ? 'text-white' : 'text-[#636363]'}`}>{item.title}</span>
                )}
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

