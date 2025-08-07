/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import toast from "react-hot-toast";
import OverviewDashboard from "./components/OverviewDashboard";
import TeamManagement from "./components/TeamManagement";
import EventsManagement from "./components/EventsManagement";
import DonationsManagement from "./components/DonationsManagement";
import MinistryManagement from "./components/MinistryManagement";
import BlogManagement from "./components/BlogManagement";
import TestimonialsManagement from "./components/TestimonialsManagement";
import MediaManagement from "./components/MediaManagement";
import CommunicationManagement from "./components/CommunicationManagement";
import SettingsComponent from "./components/Settings";
import TrashManagement from "./components/TrashManagement";

export default function AdminDashboard() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState("light");

  // Data states
  const [teamMembers, setTeamMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [ministryRegistrations, setMinistryRegistrations] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [media, setMedia] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalMedia: 0,
  });

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    }
  }, []);

  // Generic fetch function
  const fetchData = async (endpoint, setter) => {
    try {
      console.log(`Fetching ${endpoint}...`);
      const response = await fetch(endpoint);
      console.log(`${endpoint} response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`${endpoint} response data:`, data);

        // Handle different API response formats
        if (Array.isArray(data)) {
          console.log(`${endpoint} - setting array data, length:`, data.length);
          setter(data);
        } else if (data.success && Array.isArray(data.donations)) {
          console.log(
            `${endpoint} - setting donations data, length:`,
            data.donations.length
          );
          setter(data.donations);
        } else if (data.success && Array.isArray(data.events)) {
          console.log(
            `${endpoint} - setting events data, length:`,
            data.events.length
          );
          setter(data.events);
        } else if (data.success && Array.isArray(data.team)) {
          console.log(
            `${endpoint} - setting team data, length:`,
            data.team.length
          );
          setter(data.team);
        } else if (data.success && Array.isArray(data.ministry)) {
          console.log(
            `${endpoint} - setting ministry data, length:`,
            data.ministry.length
          );
          setter(data.ministry);
        } else if (data.success && Array.isArray(data.blog)) {
          console.log(
            `${endpoint} - setting blog data, length:`,
            data.blog.length
          );
          setter(data.blog);
        } else if (data.success && Array.isArray(data.testimonials)) {
          console.log(
            `${endpoint} - setting testimonials data, length:`,
            data.testimonials.length
          );
          setter(data.testimonials);
        } else if (data.success && Array.isArray(data.media)) {
          console.log(
            `${endpoint} - setting media data, length:`,
            data.media.length
          );
          setter(data.media);
        } else {
          console.log(`${endpoint} - no valid data found, setting empty array`);
          setter([]);
        }
      } else {
        console.log(`${endpoint} - response not ok, setting empty array`);
        setter([]);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setter([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData("/api/team", setTeamMembers);
      fetchData("/api/events", setEvents);
      fetchData("/api/donations", setDonations);
      fetchData("/api/ministry", setMinistryRegistrations);
      fetchData("/api/blog", setBlogPosts);
      fetchData("/api/testimonials", setTestimonials);
      fetchData("/api/media", setMedia);
      fetchData("/api/analytics", setAnalytics);
      updateStats();
    }
  }, [isAuthenticated]);

  // Update stats when data changes
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
    const totalDonations = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.amount || 0),
      0
    );
    setStats({
      totalVisitors: analytics?.analytics?.visitors?.total || 0,
      totalDonations: totalDonations,
      totalEvents: events.length,
      totalMedia: media.length,
    });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    toast.success(
      "Logged out successfully! Thank you for using YPG Admin Dashboard."
    );
    setIsAuthenticated(false);
  };

  // Render login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render main dashboard
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          theme={theme}
        />
      </div>

      {/* Main layout with top padding for header */}
      <div className="flex pt-16">
        {/* Sidebar - Fixed on left */}
        <div className="fixed left-0 top-16 bottom-0 z-[60]">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            toggleTheme={toggleTheme}
            setSettingsOpen={setSettingsOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main content - With left margin for sidebar */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out lg:${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          {/* Main content area */}
          <main
            className={`p-6 min-w-0 transition-colors duration-200 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" && (
                  <OverviewDashboard
                    stats={stats}
                    teamMembers={teamMembers}
                    events={events}
                    donations={donations}
                    media={media}
                    theme={theme}
                    setActiveTab={setActiveTab}
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
                {activeTab === "communication" && (
                  <CommunicationManagement
                    contactMessages={contactMessages}
                    setContactMessages={setContactMessages}
                    theme={theme}
                  />
                )}
                {activeTab === "trash" && <TrashManagement theme={theme} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsComponent onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
