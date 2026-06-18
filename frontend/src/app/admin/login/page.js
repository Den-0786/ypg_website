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
    <div className="min-h-screen flex">
      {/* Left Side - Dark Navy Background with decorative elements */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gray-800 relative items-center justify-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-700/50 rounded-full blur-2xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white">YPG</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            Sign in to access your admin dashboard and manage your youth ministry platform
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              Manage Events
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              Track Donations
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              Member Database
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - White Card with Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-gray-50 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Mobile logo - only visible on small screens */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">YPG</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
              <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
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

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <a
                href="/"
                className="inline-flex items-center text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Website
              </a>
            </div>
          </div>

          {/* Security note */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Secure admin access. Unauthorized use is prohibited.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
