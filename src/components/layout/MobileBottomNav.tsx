import { useLocation, useNavigate } from "react-router-dom";
import { House, ChartPie, CalendarDays, User, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const userTabs = [
  { icon: House, label: "Home", path: "/dashboard" },
  { icon: ChartPie, label: "Results", path: "/results" },
  { icon: Moon, label: "Sleep", path: "/sleep-tracker" },
  { icon: CalendarDays, label: "Booking", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

const doctorTabs = [
  { icon: House, label: "Home", path: "/dashboard" },
  { icon: User, label: "Patients", path: "/patients" },
  { icon: CalendarDays, label: "Appts", path: "/appointments" },
  { icon: User, label: "Referrals", path: "/referred-patients" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const tabs = isDoctor ? doctorTabs : userTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive ? "text-[#8B2D6C]" : "text-gray-400"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
