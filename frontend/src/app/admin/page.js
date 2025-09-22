/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewDashboard from "./components/OverviewDashboard";
import TeamManagement from "./components/TeamManagement";
import EventsManagement from "./components/EventsManagement";
import DonationsManagement from "./components/DonationsManagement";
import MinistryManagement from "./components/MinistryManagement";
import BlogManagement from "./components/BlogManagement";
import TestimonialsManagement from "./components/TestimonialsManagement";
import MediaManagement from "./components/MediaManagement";
import PeopleManagement from "./components/PeopleManagement";
import ContentManagement from "./components/ContentManagement";
import Settings from "./components/Settings";
import AnalyticsSettings from "./components/AnalyticsSettings";
import FinancialManagement from "./components/FinancialManagement";
import TrashManagement from "./components/TrashManagement";
import CommunicationManagement from "./components/CommunicationManagement";
import YStoreManagement from "./components/YStoreManagement";
import BranchPresidentsManagement from "./components/BranchPresidentsManagement";
import CouncilManagement from "./components/CouncilManagement";
import PastExecutivesManagement from "./components/PastExecutivesManagement";
import AdvertisementManagement from "./components/AdvertisementManagement";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Valid tab names for validation
  const validTabs = [
    "overview",
    "team",
    "events",
    "donations",
    "ministry",
    "blog",
    "testimonials",
    "media",
    "people",
    "content",
    "settings",
    "analytics",
    "financial",
    "trash",
    "communication",
    "ystore",
    "branch-presidents",
    "council",
    "past-executives",
    "advertisements",
  ];

  // UI state - Initialize from URL parameter
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get("tab");
    // Validate that the tab from URL is valid
    return validTabs.includes(tabFromUrl) ? tabFromUrl : "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // Function to handle tab changes with URL updates
  const handleTabChange = (newTab) => {
    // Validate the tab before setting
    if (validTabs.includes(newTab)) {
      setActiveTab(newTab);
      // Update URL without page refresh
      const url = new URL(window.location);
      url.searchParams.set("tab", newTab);
      window.history.replaceState({}, "", url);
    }
  };

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const tabFromUrl = searchParams.get("tab");
      if (
        tabFromUrl &&
        validTabs.includes(tabFromUrl) &&
        tabFromUrl !== activeTab
      ) {
        setActiveTab(tabFromUrl);
      } else if (!tabFromUrl && activeTab !== "overview") {
        // If no tab in URL, go to overview
        setActiveTab("overview");
      }
    };

    // Listen for popstate events (back/forward button)
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [searchParams, activeTab, validTabs]);

  // Data state
  const [teamMembers, setTeamMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [ministryRegistrations, setMinistryRegistrations] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [media, setMedia] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalMedia: 0,
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authenticated = localStorage.getItem("ypg_admin_authenticated");
    const user = localStorage.getItem("ypg_admin_user");
    const loginTime = localStorage.getItem("ypg_admin_login_time");

    if (authenticated === "true" && user && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        setIsAuthenticated(true);
        setUser(user);
        setSessionExpired(false);
        setIsLoading(false);

        const isFromLogin = sessionStorage.getItem("ypg_fresh_login");
        if (isFromLogin) {
          sessionStorage.removeItem("ypg_fresh_login");
          setTimeout(() => {
            toast.success(
              `Welcome back, ${user}! Dashboard loaded successfully.`
            );
          }, 500);
        }
      } else {
        handleLogout();
        setSessionExpired(true);
        toast.error("Session expired. Please login again.");
        router.push("/admin/login");
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      router.push("/admin/login");
    }
  };

  const handleLogin = () => {
    const user = localStorage.getItem("ypg_admin_user");
    setIsAuthenticated(true);
    setUser(user);
    setSessionExpired(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/auth/logout`,
        {
          method: "POST",
        }
      );
    } catch (error) {
    } finally {
      localStorage.removeItem("ypg_admin_authenticated");
      localStorage.removeItem("ypg_admin_user");
      localStorage.removeItem("ypg_admin_login_time");

      setIsAuthenticated(false);
      setUser(null);
      setActiveTab("overview");
      // Reset URL to remove tab parameter
      const url = new URL(window.location);
      url.searchParams.delete("tab");
      window.history.replaceState({}, "", url);

      toast.success(
        "Logged out successfully! Thank you for using YPG Admin Dashboard."
      );
      router.push("/admin/login");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("ypg_theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("ypg_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          setter(data);
        } else if (data.success && Array.isArray(data.donations)) {
          setter(data.donations);
        } else if (data.success && Array.isArray(data.events)) {
          setter(data.events);
        } else if (data.success && Array.isArray(data.team)) {
          setter(data.team);
        } else if (data.success && Array.isArray(data.ministry)) {
          setter(data.ministry);
        } else if (data.success && Array.isArray(data.posts)) {
          setter(data.posts);
        } else if (data.success && Array.isArray(data.testimonials)) {
          setter(data.testimonials);
        } else if (data.success && Array.isArray(data.messages)) {
          setter(data.messages);
        } else if (data.success && Array.isArray(data.media)) {
          setter(data.media);
        } else if (data.success && data.analytics) {
          setter(data.analytics);
        } else {
          setter([]);
        }
      } else {
        setter([]);
      }
    } catch (error) {
      setter([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      import("../utils/config.js").then(({ buildApiUrl }) => {
        fetchData(buildApiUrl("api/team"), setTeamMembers);
        fetchData(buildApiUrl("api/events"), setEvents);
        fetchData(buildApiUrl("api/donations"), setDonations);
        fetchData(buildApiUrl("api/ministry"), setMinistryRegistrations);
        fetchData(buildApiUrl("api/blog/"), (data) => {
          console.log("Blog posts data:", data);
          setBlogPosts(data);
        });
        fetchData(buildApiUrl("api/testimonials"), setTestimonials);
        fetchData(buildApiUrl("api/gallery/"), setMedia);
        fetchData(buildApiUrl("api/contact"), (data) => {
          // Transform the data to match dashboard expectations
          const transformedData = data.map((message) => ({
            ...message,
            date: message.created_at,
            status: message.is_read ? "read" : "unread",
          }));
          setContactMessages(transformedData);
        });
        fetchData(buildApiUrl("api/analytics"), setAnalytics);
        updateStats();
      });
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    import("../utils/config.js").then(({ buildApiUrl }) => {
      const id = setInterval(() => {
        fetchData(buildApiUrl("api/ministry"), setMinistryRegistrations);
        fetchData(buildApiUrl("api/contact"), (data) => {
          // Transform the data to match dashboard expectations
          const transformedData = data.map((message) => ({
            ...message,
            date: message.created_at,
            status: message.is_read ? "read" : "unread",
          }));
          setContactMessages(transformedData);
        });
      }, 10000);
      return () => clearInterval(id);
    });
  }, [isAuthenticated]);

  // Refresh contact messages when page becomes visible
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contact`,
          (data) => {
            // Transform the data to match dashboard expectations
            const transformedData = data.map((message) => ({
              ...message,
              date: message.created_at,
              status: message.is_read ? "read" : "unread",
            }));
            setContactMessages(transformedData);
          }
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let channel;
    try {
      channel = new BroadcastChannel("ypg_ministry");
      channel.onmessage = (event) => {
        if (event?.data?.type === "registration_created") {
          fetchData(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministry`,
            setMinistryRegistrations
          );
        }
      };
    } catch (e) {}
    return () => {
      try {
        channel && channel.close();
      } catch (e) {}
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      updateStats();
    }
  }, [
    teamMembers,
    events,
    donations,
    ministryRegistrations,
    blogPosts,
    testimonials,
    media,
    analytics,
    isAuthenticated,
  ]);

  const updateStats = () => {
    const totalDonations = donations.reduce((sum, donation) => {
      const amount = parseFloat(donation.amount || 0);
      return isNaN(amount) ? sum : sum + amount;
    }, 0);
    setStats({
      totalVisitors: analytics?.analytics?.visitors?.total || 0,
      totalDonations: isNaN(totalDonations) ? 0 : totalDonations,
      totalEvents: events.length,
      totalMedia: media.length,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          theme={theme}
          user={user}
        />
      </div>

      {/* Main layout with top padding for header */}
      <div className="flex pt-16">
        <div className="fixed left-0 top-16 bottom-0 z-[60]">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            theme={theme}
            toggleTheme={toggleTheme}
            setSettingsOpen={setSettingsOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main content - With left margin for sidebar */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          }`}
        >
          {/* Content Area */}
          <div className="p-6 w-full max-w-full">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <OverviewDashboard
                  stats={stats}
                  theme={theme}
                  setActiveTab={handleTabChange}
                  teamMembers={teamMembers}
                  events={events}
                  donations={donations}
                  media={media}
                  contactMessages={contactMessages}
                />
              )}
              {activeTab === "team" && (
                <TeamManagement
                  teamMembers={teamMembers}
                  setTeamMembers={setTeamMembers}
                  theme={theme}
                />
              )}
              {activeTab === "events" && (
                <EventsManagement
                  events={events}
                  setEvents={setEvents}
                  theme={theme}
                />
              )}
              {activeTab === "donations" && (
                <DonationsManagement
                  donations={donations}
                  setDonations={setDonations}
                  theme={theme}
                />
              )}
              {activeTab === "ministry" && (
                <MinistryManagement
                  ministryRegistrations={ministryRegistrations}
                  setMinistryRegistrations={setMinistryRegistrations}
                  theme={theme}
                />
              )}
              {activeTab === "council" && <CouncilManagement theme={theme} />}
              {activeTab === "past-executives" && (
                <PastExecutivesManagement theme={theme} />
              )}
              {activeTab === "ystore" && <YStoreManagement theme={theme} />}
              {activeTab === "blog" && (
                <BlogManagement
                  blogPosts={blogPosts}
                  setBlogPosts={setBlogPosts}
                  theme={theme}
                />
              )}
              {activeTab === "testimonials" && (
                <TestimonialsManagement
                  testimonials={testimonials}
                  setTestimonials={setTestimonials}
                  theme={theme}
                />
              )}
              {activeTab === "media" && (
                <MediaManagement
                  media={media}
                  setMedia={setMedia}
                  theme={theme}
                />
              )}
              {activeTab === "people" && (
                <PeopleManagement
                  teamMembers={teamMembers}
                  setTeamMembers={setTeamMembers}
                  testimonials={testimonials}
                  setTestimonials={setTestimonials}
                  ministryRegistrations={ministryRegistrations}
                  setMinistryRegistrations={setMinistryRegistrations}
                  theme={theme}
                />
              )}
              {activeTab === "content" && (
                <ContentManagement
                  blogPosts={blogPosts}
                  setBlogPosts={setBlogPosts}
                  media={media}
                  setMedia={setMedia}
                  theme={theme}
                />
              )}
              {activeTab === "financial" && (
                <FinancialManagement
                  donations={donations}
                  setDonations={setDonations}
                  theme={theme}
                />
              )}
              {activeTab === "communication" && (
                <CommunicationManagement
                  contactMessages={contactMessages}
                  setContactMessages={setContactMessages}
                  theme={theme}
                />
              )}
              {activeTab === "trash" && <TrashManagement theme={theme} />}
              {activeTab === "analytics" && (
                <AnalyticsSettings
                  analytics={analytics}
                  setAnalytics={setAnalytics}
                  theme={theme}
                />
              )}
              {activeTab === "branch-presidents" && (
                <BranchPresidentsManagement theme={theme} />
              )}
              {activeTab === "advertisements" && (
                <AdvertisementManagement theme={theme} />
              )}

              {activeTab === "Settings" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Settings
                  </h2>
                  <p className="text-gray-600">
                    Settings configuration will be added here.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}
