import { Menu, LogOut } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen, onLogout, theme }) => {
  return (
    <header
      className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 shadow-sm transition-colors duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            YPG Admin
          </h1>
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
