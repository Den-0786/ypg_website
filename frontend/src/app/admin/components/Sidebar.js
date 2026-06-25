import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Sun,
  Moon,
  BookOpen,
  MessageCircle,
  FileText,
  Image,
  Video,
  Mail,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShoppingCart,
  UserCheck,
  Crown,
  History,
  Tag,
  Eye,
  Share2,
} from "lucide-react";
import { useEffect } from "react";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  setSettingsOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const isDark = theme === "dark";

  const navigation = [
    { id: "overview", name: "Overview", icon: Home },
    { id: "team", name: "District Executives", icon: Users },
    { id: "events", name: "Events", icon: Calendar },
    { id: "donations", name: "Finance", icon: DollarSign },
    { id: "ministry", name: "Ministry", icon: BookOpen },
    { id: "council", name: "Council Members", icon: Crown },
    { id: "past-executives", name: "Past Executives", icon: History },
    { id: "advertisements", name: "Advertisements", icon: Tag },
    { id: "ystore", name: "Y-Store", icon: ShoppingCart },
    { id: "blog", name: "Blog", icon: FileText },
    { id: "testimonials", name: "Testimonials", icon: MessageCircle },
    { id: "media", name: "Media", icon: Image },
    { id: "social-media", name: "Social Media", icon: Share2 },
    { id: "vision-mission", name: "Vision & Mission", icon: Eye },
    { id: "communication", name: "Contact Messages", icon: Mail },
    { id: "branch-presidents", name: "Branch Presidents", icon: UserCheck },
    { id: "trash", name: "Trash", icon: Trash2 },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector("aside");
      if (sidebarOpen && !sidebar.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay with reduced blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative lg:top-60px top-0 lg:translate-x-0 z-50 h-full transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : sidebarCollapsed ? "w-16" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} backdrop-blur-xl border-r shadow-xl lg:shadow-lg ${
          isDark
            ? "bg-navy-950/50 border-white/10"
            : "bg-white/90 border-gray-200"
        }`}
        style={{
          height: "calc(100vh - 60px)",
          top: "10px",
          maxHeight: "calc(100vh - 60px)",
        }}
      >
        <div className="flex flex-col h-full">
          <div className={`hidden lg:flex items-center justify-end p-2 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-blue-100 hover:text-gold-300 hover:bg-white/10"
                  : "text-gray-600 hover:text-gold-500 hover:bg-gray-100"
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 p-4 space-y-2 overflow-y-auto"
            style={{
              height: "calc(100vh - 280px)",
              overflowY: "auto",
            }}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? isDark
                        ? "bg-white/10 text-gold-300 border border-gold-500/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                        : "bg-gold-100 text-navy-950 border border-gold-500/50"
                      : isDark
                        ? "text-blue-100 hover:bg-white/10 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-navy-950"
                  }`}
                  title={sidebarCollapsed ? item.name : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(sidebarOpen || !sidebarCollapsed) && (
                    <span className="font-medium truncate text-base">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className={`p-4 border-t space-y-3 flex-shrink-0 mt-auto backdrop-blur-md ${
              isDark
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {/* Theme toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors shadow-sm ${
                isDark
                  ? "bg-white/10 text-blue-100 hover:bg-white/15 hover:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-navy-950"
              }`}
              title={sidebarCollapsed ? "Theme" : ""}
            >
              {(sidebarOpen || !sidebarCollapsed) && (
                <span className="font-medium text-base">Theme</span>
              )}
              {theme === "dark" ? (
                <Moon className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Sun className="w-5 h-5 flex-shrink-0" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen(true);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors shadow-sm ${
                isDark
                  ? "bg-white/10 text-blue-100 hover:bg-white/15 hover:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-navy-950"
              }`}
              title={sidebarCollapsed ? "Settings" : ""}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || !sidebarCollapsed) && (
                <span className="font-medium text-base">Settings</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
