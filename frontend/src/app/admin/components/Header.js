import { Menu, LogOut } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen, onLogout, theme }) => {
  return (
    <header className="bg-navy-950/60 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors text-blue-100 hover:text-gold-300 hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            YPG Admin
          </h1>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-blue-100 hover:text-white hover:bg-white/10 border border-white/10 hover:border-gold-400/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
