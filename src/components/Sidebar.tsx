import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/useTheme";
import {
  LayoutDashboard,
  Database,
  Zap,
  DollarSign,
  AlertCircle,
  Shield,
  BookOpen,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Database, label: "Providers", path: "/providers" },
    { icon: Zap, label: "Cache", path: "/cache" },
    { icon: DollarSign, label: "Cost Analytics", path: "/cost" },
    { icon: AlertCircle, label: "Alerts", path: "/alerts" },
    { icon: Shield, label: "Rate Limits", path: "/rate-limits" },
    { icon: BookOpen, label: "Setup", path: "/setup" },
    { icon: Settings, label: "API Docs", path: "/docs" },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <h1 className={`text-2xl font-bold text-gradient-primary ${!isOpen && "hidden"}`}>
          Cognitude
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = window.location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`${!isOpen && "hidden"}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className={`${!isOpen && "hidden"}`}>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-danger-50 dark:hover:bg-danger-900/30 hover:text-danger-700 dark:hover:text-danger-300 transition-all`}
        >
          <LogOut className="w-5 h-5" />
          <span className={`${!isOpen && "hidden"}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}