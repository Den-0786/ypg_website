import { Menu, LogOut } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen, onLogout, theme }) => {
  const isDark = theme === "dark";
  return (
    <header
      className={`backdrop-blur-md border-b px-6 py-4 shadow-lg transition-colors duration-200 ${
        isDark
          ? "bg-navy-950/60 border-white/10 text-white"
          : "bg-white/80 border-gray-200 text-navy-950"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isDark
                ? "text-blue-100 hover:text-gold-300 hover:bg-white/10"
                : "text-gray-600 hover:text-gold-500 hover:bg-gray-100"
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold tracking-wide">
            YPG Admin
          </h1>
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
            isDark
              ? "text-blue-100 hover:text-white hover:bg-white/10 border-white/10 hover:border-gold-400/50"
              : "text-gray-600 hover:text-navy-950 hover:bg-gray-100 border-gray-200 hover:border-gold-500"
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
