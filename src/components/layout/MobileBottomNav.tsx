import { useLocation, useNavigate } from "react-router-dom";
import { House, Users, CalendarDays, User, ChartPie, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const doctorNav = [
  { icon: House, label: "Home", path: "/dashboard" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: CalendarDays, label: "Calendar", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

const userNav = [
  { icon: House, label: "Home", path: "/dashboard" },
  { icon: ChartPie, label: "Results", path: "/results" },
  { icon: Moon, label: "Sleep", path: "/sleep-tracker" },
  { icon: CalendarDays, label: "Calendar", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function MobileBottomNav() {
  const { isDoctor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = isDoctor ? doctorNav : userNav;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 lg:hidden">
      <div className="flex items-center justify-around rounded-full px-2 py-2 backdrop-blur-md shadow-lg"
        style={{ background: "rgba(120, 120, 120, 0.15)", backdropFilter: "blur(12px)" }}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-all duration-200 ${
                active ? "bg-[#704180] scale-105" : ""
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
              {active && (
                <span className="text-[10px] text-white font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
