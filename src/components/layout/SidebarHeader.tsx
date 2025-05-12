import {
    SidebarGroup,
    SidebarMenu,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function SidebarHeader({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: string;
        isActive?: boolean;
    }[];
}) {
    return (
        <SidebarGroup className="overflow-hidden p-4">
            <SidebarMenu>
                {items.map((item) => (
                    <div key={item.title} className="flex items-center mb-4">
                        <Link to={item.url} className="flex items-center">
                            {item.icon && (
                                <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="max-h-10"
                                />
                            )}
                         
                        </Link>
                    </div>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
