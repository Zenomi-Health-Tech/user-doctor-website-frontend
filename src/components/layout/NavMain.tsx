import {
  Collapsible,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator"; // Import Separator from shadcn
import { useLocation } from "react-router-dom"; // Import useLocation to get the current page URL
import React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string | React.ElementType; // Accept string or component
    isActive?: boolean;
  }[];
}) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className="h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <SidebarMenu>
        {items.map((item, index) => {
          const isActivePage = location.pathname === item.url;
          return (
            <React.Fragment key={item.title}>
              <Collapsible
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem className="relative pl-0">
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-colors
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
                              : 'invert(34%) sepia(7%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(90%)',
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
              </Collapsible>
              {index !== items.length - 1 && (
                <Separator className="my-2 left-5 w-[185px] bg-[#235EDE]" />
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

