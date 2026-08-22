/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api-website.ahinsandistrictypg.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setSent(true);
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Request failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="lg:hidden text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">YPG</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-navy-950/5 rounded-full flex items-center justify-center">
              <Mail className="w-7 h-7 text-gold-500" />
            </div>
            <h1 className="text-2xl font-bold text-navy-950 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 text-sm">
              Enter the email registered to your admin account and we&apos;ll
              send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                If that email is registered, a reset link is on its way. Check
                your inbox (and spam folder).
              </div>
              <Link
                href="/admin/login"
                className="block w-full bg-gold-500 hover:bg-gold-600 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-navy-950 placeholder-gray-400 transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-gray-500 hover:text-gold-500 text-sm font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Secure admin access. Unauthorized use is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
