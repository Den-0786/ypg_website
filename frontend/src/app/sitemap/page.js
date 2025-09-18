"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function Sitemap() {
  const pages = [
    {
      title: "Home",
      description: "Main landing page with overview and navigation",
      href: "/",
    },
    {
      title: "About Us",
      description: "Information about Ahinsan District YPG",
      href: "/#about",
    },
    {
      title: "Our Team",
      description: "Current leadership and team members",
      href: "/#team",
    },
    {
      title: "Ministries",
      description: "Various ministry activities and programs",
      href: "/#ministries",
    },
    {
      title: "Events",
      description: "Upcoming and past events",
      href: "/#events",
    },
    {
      title: "Blog",
      description: "Latest news and articles",
      href: "/#blog",
    },
    {
      title: "Y-Store",
      description: "Youth merchandise and products",
      href: "/#ystore",
    },
    {
      title: "Contact",
      description: "Get in touch with us",
      href: "/#contact",
    },
    {
      title: "Admin Dashboard",
      description: "Administrative panel (login required)",
      href: "/admin",
    },
  ];

  const sections = [
    {
      title: "Main Pages",
      pages: pages.slice(0, 8),
    },
    {
      title: "Administrative",
      pages: pages.slice(8),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
          <p className="text-xl text-blue-100">
            Navigate through all pages of our website
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-6xl mx-auto">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                {section.title}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.pages.map((page, pageIndex) => (
                  <motion.div
                    key={page.href}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + pageIndex * 0.05 }}
                    className="group"
                  >
                    <Link
                      href={page.href}
                      className="block p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                          {page.title}
                        </h3>
                        <ExternalLink
                          size={16}
                          className="text-gray-400 group-hover:text-blue-500 transition"
                        />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {page.description}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Quick Links
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                  Legal Pages
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-purple-50 rounded-xl">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">
                  Contact Information
                </h3>
                <ul className="space-y-2 text-purple-700">
                  <li>Email: ahinsandistrictypg@gmail.com</li>
                  <li>Phone: +233 531427671</li>
                  <li>Address: PCG, Emmanuel Congregation Ahinsan - Kumasi P.O Box AH 8224 </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}








