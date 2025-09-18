"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const mobileMenuRef = useRef(null);

  const mainNavLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Quiz", href: "#quiz" },
    { name: "Contact", href: "#contact" },
  ];

  const dropdownLinks = [
    { name: "Gallery", href: "#gallery" },
    { name: "Blog", href: "#blog" },
    { name: "YStore", href: "#ystore" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Ministries", href: "#ministries" },
    { name: "Team", href: "#team" },
    { name: "Welfare", href: "#welfare" },
    { name: "Join Us", href: "#join" },
  ];

  const allNavLinks = [...mainNavLinks, ...dropdownLinks];

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setShowTopBtn(scrollY > 300);

      const sections = allNavLinks
        .map((link) => ({
          id: link.href,
          element: document.querySelector(link.href),
          name: link.name,
        }))
        .filter((section) => section.element);

      let current = "home";
      for (const section of sections) {
        const { top, height } = section.element.getBoundingClientRect();
        const offset = 150; // Increased offset for better detection
        if (top <= offset && top + height > offset) {
          current = section.name;
          break; // Use the first matching section
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (href) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logo/presby.jpeg"
              alt="Church Logo"
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
              priority
            />
            <Image
              src="/logo/ypg.jpeg"
              alt="Youth Logo"
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
              priority
            />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center space-x-2">
            {mainNavLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                    activeSection === link.name
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30"
                      : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}

            {/* Admin Link */}
            <li>
              <a
                href="/admin/login"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
              >
                Admin
              </a>
            </li>

            {/* Dropdown */}
            <li className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => {
                  if (dropdownTimeout) {
                    clearTimeout(dropdownTimeout);
                    setDropdownTimeout(null);
                  }
                  setDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => setDropdownOpen(false), 500);
                  setDropdownTimeout(timeout);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 flex items-center space-x-1 ${
                  dropdownLinks.some((link) => activeSection === link.name)
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30"
                    : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                }`}
              >
                <span>More</span>
                <span
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute top-full right-0 mt-1 w-56 bg-blue-50 rounded-xl shadow-xl border border-blue-200 py-3 z-50 backdrop-blur-sm"
                  onMouseEnter={() => {
                    if (dropdownTimeout) {
                      clearTimeout(dropdownTimeout);
                      setDropdownTimeout(null);
                    }
                    setDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(
                      () => setDropdownOpen(false),
                      500
                    );
                    setDropdownTimeout(timeout);
                  }}
                >
                  {dropdownLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                        setDropdownOpen(false);
                      }}
                      className={`block px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeSection === link.name
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400 shadow-lg shadow-green-500/30"
                          : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </li>
          </ul>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-blue-50 border-t border-blue-200"
          >
            <ul className="flex flex-col py-2 px-4">
              {/* Main Navigation Links */}
              {mainNavLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className={`block py-3 px-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                      activeSection === link.name
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30"
                        : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}

              {/* Admin Link - Mobile */}
              <li>
                <a
                  href="/admin/login"
                  className="block py-3 px-4 rounded-xl font-semibold border-2 transition-all duration-300 text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                >
                  Admin
                </a>
              </li>

              {/* Mobile Dropdown */}
              <li>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full text-left py-3 px-4 rounded-xl font-semibold border-2 transition-all duration-300 flex items-center justify-between ${
                    dropdownLinks.some((link) => activeSection === link.name)
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30"
                      : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                  }`}
                >
                  <span>More</span>
                  <span
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Mobile Dropdown Menu */}
                {dropdownOpen && (
                  <ul className="pl-4 border-l-2 border-gray-200 ml-4">
                    {dropdownLinks.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(link.href);
                          }}
                          className={`block py-2 px-4 rounded-lg font-medium text-sm border transition-all duration-200 ${
                            activeSection === link.name
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30"
                              : "text-white bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 hover:from-blue-500 hover:to-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
                          }`}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={handleBackToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-[9999] group flex items-center justify-center"
          aria-label="Back to Top"
          title="Back to Top"
        >
          <span className="text-xl font-bold">↑</span>
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Back to Top
          </div>
        </button>
      )}
    </>
  );
}
