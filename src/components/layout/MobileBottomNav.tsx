import { useLocation, useNavigate } from "react-router-dom";
import { House, ChartPie, CalendarDays, User, Brain, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const userTabs = [
  { icon: House,      label: "Home",    path: "/dashboard" },
  { icon: ChartPie,   label: "Stats",   path: "/results" },
  { icon: Brain,      label: "Mind",    path: "/mindfulness", isSpecial: true },
  { icon: CalendarDays, label: "Calendar", path: "/appointments" },
  { icon: User,       label: "Profile", path: "/profile" },
];

const doctorTabs = [
  { icon: House, label: "Home", path: "/dashboard" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: CalendarDays, label: "Calendar", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const tabs = isDoctor ? doctorTabs : userTabs;

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 lg:hidden">
      <div
        className="h-[68px] rounded-full flex items-center px-1 backdrop-blur-md"
        style={{ background: "rgba(120,120,120,0.15)", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          const isSpecial = (tab as any).isSpecial;
          const Icon = tab.icon;
          return (
            <div key={tab.path} className="flex-1 h-full flex items-center justify-center px-0.5 py-1">
              <button
                onClick={() => navigate(tab.path)}
                className="w-full h-full flex flex-col items-center justify-center rounded-full transition-all duration-300"
                style={
                  isSpecial
                    ? isActive
                      ? { background: 'linear-gradient(135deg, #9575CD, #5C6BC0)' }
                      : { background: 'linear-gradient(135deg, rgba(149,117,205,0.35), rgba(92,107,192,0.35))', border: '1.5px solid rgba(149,117,205,0.4)' }
                    : isActive
                      ? { background: '#704180' }
                      : {}
                }
              >
                <Icon className="w-5 h-5" style={{ color: isSpecial ? (isActive ? 'white' : 'rgba(255,255,255,0.7)') : isActive ? 'white' : '#888' }} />
                {(isActive || isSpecial) && <span className="text-[9px] font-semibold mt-0.5 leading-none" style={{ color: isSpecial ? (isActive ? 'white' : 'rgba(255,255,255,0.7)') : 'white' }}>{tab.label}</span>}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
