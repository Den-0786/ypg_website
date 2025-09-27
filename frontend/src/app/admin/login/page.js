/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const authenticated = localStorage.getItem("ypg_admin_authenticated");
      const user = localStorage.getItem("ypg_admin_user");
      const loginTime = localStorage.getItem("ypg_admin_login_time");

      if (authenticated === "true" && user && loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          router.push("/admin");
          return;
        } else {
          localStorage.removeItem("ypg_admin_authenticated");
          localStorage.removeItem("ypg_admin_user");
          localStorage.removeItem("ypg_admin_login_time");
        }
      }
    };

    checkAuthentication();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/auth/login/`,
        {
          method: "POST",
          credentials: 'include', // Include cookies for session authentication
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("ypg_admin_authenticated", "true");
        localStorage.setItem("ypg_admin_user", data.user.username);
        localStorage.setItem("ypg_admin_login_time", data.user.loginTime);
        localStorage.setItem("ypg_admin_session_token", data.user.session_token);

        toast.success("Login successful! Redirecting...");

        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        toast.error(data.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              ← Back to Website
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
