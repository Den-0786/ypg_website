import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      credentials.username === "admin" &&
      credentials.password === "password"
    ) {
      toast.success("Login successful! Welcome to YPG Admin Dashboard.");
      onLogin();
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">YPG Admin</h1>
            <p className="text-white/80 text-sm">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/20 backdrop-blur-sm text-white placeholder-white/70"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/20 backdrop-blur-sm text-white placeholder-white/70"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/80">
            <p>Demo credentials: admin / password</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
