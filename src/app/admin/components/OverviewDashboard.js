
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  DollarSign,
  Calendar,
  Image,
  Plus,
  Upload,
  FileText,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function OverviewDashboard({ stats, theme, setActiveTab, teamMembers, events, donations, media }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statsCards = [
    {
      title: "Total Visitors",
      value: stats.totalVisitors,
      icon: Eye,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Total Donations",
      value: `$${stats.totalDonations}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "Media Files",
      value: stats.totalMedia,
      icon: Image,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      change: "+15%",
      changeType: "increase",
    },
  ];

  const quickActions = [
    {
      title: "Add New Event",
      description: "Schedule upcoming events",
      icon: Plus,
      gradient: "from-blue-500 to-purple-500",
      action: () => setActiveTab("events"),
    },
    {
      title: "Upload Media",
      description: "Add photos and videos",
      icon: Upload,
      gradient: "from-green-500 to-emerald-500",
      action: () => setActiveTab("media"),
    },
    {
      title: "View Reports",
      description: "Analytics and insights",
      icon: FileText,
      gradient: "from-orange-500 to-red-500",
      action: () => setActiveTab("settings"),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-gray-300 text-lg">
              Here&apos;s what&apos;s happening with your YPG ministry today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Live Dashboard</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className={`bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : card.bgGradient} p-6 rounded-2xl border ${theme === 'dark' ? 'border-gray-700' : 'border-white/50'} shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  {card.changeType === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      card.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
              </div>
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200/50'}`}>
                <div className={`flex items-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>From last month</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8 transition-colors duration-200`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Common tasks to manage your ministry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`group relative overflow-hidden bg-gradient-to-br ${theme === 'dark' ? 'from-gray-700 to-gray-800' : 'from-gray-50 to-gray-100'} p-6 rounded-xl border ${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} transition-all duration-300 text-left`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {action.title}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={cardVariants}
        className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8 transition-colors duration-200`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Latest updates from your ministry</p>
          </div>
        </div>

        <div className="space-y-4">
          {(() => {
            // Generate real activity data from actual data
            const activities = [];
            
            // Add recent team members
            if (teamMembers && teamMembers.length > 0) {
              const latestMember = teamMembers[0];
              activities.push({
                icon: Users,
                text: `New team member: ${latestMember.name}`,
                time: "Recently",
                color: "blue",
              });
            }
            
            // Add recent events
            if (events && events.length > 0) {
              const latestEvent = events[0];
              activities.push({
                icon: Calendar,
                text: `Event: ${latestEvent.title}`,
                time: "Recently",
                color: "purple",
              });
            }
            
            // Add recent donations
            if (donations && donations.length > 0) {
              const latestDonation = donations[0];
              activities.push({
                icon: DollarSign,
                text: `Donation: $${latestDonation.amount} from ${latestDonation.donor}`,
                time: "Recently",
                color: "green",
              });
            }
            
            // Add recent media
            if (media && media.length > 0) {
              const latestMedia = media[0];
              activities.push({
                icon: Image,
                text: `Media uploaded: ${latestMedia.title}`,
                time: "Recently",
                color: "orange",
              });
            }
            
            // If no real data, show placeholder activities
            if (activities.length === 0) {
              activities.push(
                {
                  icon: Users,
                  text: "No team members yet",
                  time: "Add your first member",
                  color: "blue",
                },
                {
                  icon: Calendar,
                  text: "No events scheduled",
                  time: "Schedule your first event",
                  color: "purple",
                },
                {
                  icon: DollarSign,
                  text: "No donations received",
                  time: "Donations will appear here",
                  color: "green",
                },
                {
                  icon: Image,
                  text: "No media uploaded",
                  time: "Upload your first media",
                  color: "orange",
                }
              );
            }
            
            return activities.slice(0, 4); // Show max 4 activities
          })().map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                  <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.text}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
