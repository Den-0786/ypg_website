"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const mobileMenuRef = useRef(null);

  const mainNavLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Ministries", href: "#ministries" },
    { name: "Contact", href: "#contact" },
  ];

  const allNavLinks = [...mainNavLinks];

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setVisible(scrollY > 0);
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
        const offset = 150;
        if (top <= offset && top + height > offset) {
          current = section.name;
          break;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label*="menu"]')
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
          visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          scrolled ? "bg-navy-950 shadow-lg border-b border-gold-500/20" : "bg-navy-950/95 backdrop-blur-sm"
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
              className="rounded-full object-cover w-10 h-10 border-2 border-gold-500"
              priority
            />
            <Image
              src="/logo/ypg.jpeg"
              alt="Youth Logo"
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10 border-2 border-gold-500"
              priority
            />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center space-x-8">
            {mainNavLinks.map((link) => (
              <li key={link.name} className="relative">
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-200 ${
                    activeSection === link.name
                      ? "text-gold-400"
                      : "text-white hover:text-gold-400"
                  }`}
                >
                  {link.name}
                </a>
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-gold-500 transition-all duration-300 ${
                    activeSection === link.name ? "w-full" : "w-0"
                  }`}
                />
              </li>
            ))}
          </ul>

          {/* Desktop CTA + Login */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/admin/login"
              className="text-sm font-bold text-white hover:text-gold-400 uppercase tracking-widest transition-colors"
            >
              Login
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold uppercase tracking-widest transition-colors"
            >
              Get Involved
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gold-400 hover:text-gold-300 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-navy-900 border-t border-gold-500/30 max-h-[80vh] overflow-y-auto"
          >
            <ul className="flex flex-col py-4 px-4 space-y-1">
              {mainNavLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className={`block py-3 px-4 font-bold uppercase tracking-widest text-sm transition-colors ${
                      activeSection === link.name
                        ? "text-gold-400 bg-gold-500/10 border-l-4 border-gold-500"
                        : "text-white hover:text-gold-400 hover:bg-gold-500/10"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <a
                  href="/admin/login"
                  className="block py-3 px-4 text-white font-bold uppercase tracking-widest text-sm hover:text-gold-400"
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
          className="fixed bottom-6 right-6 w-12 h-12 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-[9999] group flex items-center justify-center"
          aria-label="Back to Top"
          title="Back to Top"
        >
          <span className="text-xl font-bold">↑</span>
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-navy-950 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Back to Top
          </div>
        </button>
      )}
    </>
  );
}
