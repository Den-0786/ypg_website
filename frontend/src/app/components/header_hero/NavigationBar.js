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
    { name: "Contact", href: "#contact" },
  ];

  const allNavLinks = [...mainNavLinks];

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
    setDropdownOpen(false);
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
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label*="menu"]') // Don't close when clicking the hamburger button
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
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeSection === link.name
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}

            {/* Login Link */}
            <li>
              <a
                href="/admin/login"
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                Login
              </a>
            </li>
          </ul>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-md text-gray-700 hover:bg-gray-100 text-2xl font-bold"
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
            className="md:hidden bg-white border-t border-gray-200 max-h-[80vh] overflow-y-auto"
          >
            <ul className="flex flex-col py-2 px-4 space-y-2">
              {/* Main Navigation Links */}
              {mainNavLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      activeSection === link.name
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}

              {/* Login Link - Mobile */}
              <li>
                <a
                  href="/admin/login"
                  className="block py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                >
                  Login
                </a>
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
