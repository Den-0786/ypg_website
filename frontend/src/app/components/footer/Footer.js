"use client";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import FAQ from "../faq/FAQ";
import { settingsAPI } from "../../../utils/api";

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsAPI.getWebsiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Error loading site settings:", error);
      }
    };

    const loadSocialMediaLinks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-media/`
        );
        const data = await response.json();
        if (data.success) {
          setSocialMediaLinks(data.social_media_links);
        }
      } catch (error) {
        console.error("Error loading social media links:", error);
      }
    };

    const loadData = async () => {
      await Promise.all([loadSettings(), loadSocialMediaLinks()]);
    };

    loadData();
  }, []);

  const phoneNumber = siteSettings?.phoneNumber || "";
  const contactEmail = siteSettings?.contactEmail || "";
  const locationAddress = siteSettings?.address || "";
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  // Enhanced Tooltip component
  const Tooltip = ({ children, content, position = "top" }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [hideTimeoutId, setHideTimeoutId] = useState(null);

    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-3",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-3",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-3",
      right: "left-full top-1/2 transform translate-x-3",
    };

    const arrowClasses = {
      top: "top-full left-1/2 -translate-x-1/2 -translate-y-1",
      bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1",
      left: "left-full top-1/2 -translate-y-1/2 translate-x-1",
      right: "right-full top-1/2 -translate-y-1/2 -translate-x-1",
    };

    return (
      <div className="relative inline-block group">
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => {
            // Show tooltip on tap/click for mobile
            e.preventDefault();
            setShowTooltip(true);
            if (hideTimeoutId) clearTimeout(hideTimeoutId);
            const id = setTimeout(() => setShowTooltip(false), 2000);
            setHideTimeoutId(id);
          }}
          onTouchStart={(e) => {
            // Ensure tooltip shows on touch devices without navigating
            e.preventDefault();
            setShowTooltip(true);
            if (hideTimeoutId) clearTimeout(hideTimeoutId);
            const id = setTimeout(() => setShowTooltip(false), 2000);
            setHideTimeoutId(id);
          }}
          className="cursor-help"
        >
          {children}
        </div>
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className={`absolute z-50 px-6 py-4 text-sm text-white bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl shadow-2xl border border-gold-500/20 backdrop-blur-sm ${positionClasses[position]} min-w-48 max-w-64`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="font-medium">{content}</span>
              </div>
              <div
                className={`absolute w-3 h-3 bg-gradient-to-r from-gold-500 to-gold-600 transform rotate-45 border-l border-t border-gold-500/20 ${arrowClasses[position]}`}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <footer className="bg-gradient-to-b from-navy-950 to-blue-950 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-wide mb-4">
              <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
                PCG Ahinsan District YPG
              </span>
            </h2>
            <p className="text-blue-100/90 mb-4">
              Rooted in Christ, Growing in Service. Connecting youth through
              faith, fellowship, and purpose.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="px-4 py-2 bg-navy-900 hover:bg-gold-600 rounded-lg text-sm font-medium transition"
              >
                Join Us
              </a>
              <Tooltip content="Click to go to our donation section">
                <a
                  href="#donate"
                  className="px-4 py-2 border border-gold-600 hover:bg-navy-900/30 rounded-lg text-sm font-medium transition"
                >
                  Donate
                </a>
              </Tooltip>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold mb-5 text-gold-300">
              Quick Links
            </h3>
            <ul className="space-y-3 text-blue-100/90">
              {[
                {
                  name: "Home",
                  href: "#home",
                  tooltip: "Return to the main page",
                },
                {
                  name: "About",
                  href: "#about",
                  tooltip: "Learn about our mission and values",
                },
                {
                  name: "Ministries",
                  href: "#ministries",
                  tooltip: "Explore our various ministry programs",
                },
                {
                  name: "Events",
                  href: "#events",
                  tooltip: "View upcoming and past events",
                },
                {
                  name: "Gallery",
                  href: "#gallery",
                  tooltip: "Browse photos and videos",
                },
                {
                  name: "Contact",
                  href: "#contact",
                  tooltip: "Get in touch with us",
                },
              ].map((link, index) => (
                <li key={index}>
                  <Tooltip content={link.tooltip}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        // Prevent navigation; only show tooltip and optionally scroll
                        e.preventDefault();
                        const el = document.querySelector(link.href);
                        if (el) {
                          window.scrollTo({
                            top: el.offsetTop - 80,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className="hover:text-gold-300 transition flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                      {link.name}
                    </a>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Ministries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-5 text-gold-300">
              Our Ministries
            </h3>
            <ul className="space-y-3 text-blue-100/90">
              {[
                {
                  name: "Y-Singers Choir",
                  tooltip: "Youth choir ministry for worship and praise",
                },
                {
                  name: "Y-Jama Troop",
                  tooltip: "Youth drama and theatrical performances",
                },
                {
                  name: "Choreography",
                  tooltip: "Dance ministry and creative arts",
                },
                {
                  name: "Evangelism Team",
                  tooltip: "Outreach and evangelism activities",
                },
                {
                  name: "Media Ministry",
                  tooltip: "Audio-visual and digital media services",
                },
              ].map((ministry, index) => (
                <li key={index}>
                  <Tooltip content={ministry.tooltip}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="hover:text-gold-300 transition flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                      {ministry.name}
                    </a>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-5 text-gold-300">
              Contact Us
            </h3>
            <ul className="text-blue-100/90 space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 flex-shrink-0 text-gold-300" size={18} />
                <div>
                  <p className="font-medium">Call Us</p>
                  <a
                    href={`tel:+${cleanPhone}`}
                    className="hover:text-gold-300 transition"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 flex-shrink-0 text-gold-300" size={18} />
                <div>
                  <p className="font-medium">Email Us</p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-gold-300 transition"
                  >
                    {contactEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-1 flex-shrink-0 text-gold-300"
                  size={18}
                />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{locationAddress}</p>
                </div>
              </li>
            </ul>

            {socialMediaLinks.length > 0 && (
            <div className="mt-6">
              <h4 className="text-gold-300 mb-3">Follow Us</h4>
              <div className="flex gap-4">
                {socialMediaLinks.map((link) => {
                  const getIcon = (platform) => {
                    switch (platform) {
                      case 'facebook':
                        return Facebook;
                      case 'instagram':
                        return Instagram;
                      case 'twitter':
                        return Twitter;
                      case 'youtube':
                        return Youtube;
                      default:
                        return Facebook;
                    }
                  };

                  const getColor = (platform) => {
                    switch (platform) {
                      case 'instagram':
                        return 'hover:text-pink-400';
                      case 'twitter':
                        return 'hover:text-sky-400';
                      case 'youtube':
                        return 'hover:text-red-400';
                      default:
                        return 'hover:text-gold-300';
                    }
                  };

                  const Icon = getIcon(link.platform_name);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 bg-navy-950/50 rounded-full ${getColor(link.platform_name)} transition`}
                      title={link.display_name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
            )}
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center border-t border-blue-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-gold-300/80 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Ahinsan District YPG. All rights
              reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <FAQ />
              <Link href="/privacy" className="hover:text-gold-300 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold-300 transition">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:text-gold-300 transition">
                Sitemap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
