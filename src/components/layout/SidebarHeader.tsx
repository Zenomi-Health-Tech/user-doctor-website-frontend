import {
    Collapsible,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator"; // Import Separator from shadcn
import React from "react";

export function SidebarHeader({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: string; // Image path
        isActive?: boolean;
    }[];
}) {
    return (
        <SidebarGroup className="overflow-hidden p-0">
            <SidebarMenu>
                {items.map((item, index) => {
                    return (
                        <React.Fragment key={item.title}>
                            <Collapsible
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                            >
                                <Link to={item.url}>
                                    <SidebarMenuButton
                                        size="md"
                                        tooltip={item.title}
                                    >
                                        {item.icon && (
                                            <img
                                                src={item.icon}
                                                alt={item.title}
                                                // className="w-12 h-40"
                                            />
                                        )}
                                    </SidebarMenuButton>
                                </Link>
                            </Collapsible>

                            {/* Add separator after each item except the last one */}
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
