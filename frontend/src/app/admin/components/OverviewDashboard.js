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
  Users,
  Activity,
  ArrowUpRight,
  Mail,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OverviewDashboard({
  stats,
  analytics,
  theme,
  setActiveTab,
  teamMembers,
  events,
  donations,
  media,
  contactMessages,
}) {
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
      gradient: "from-gold-400 to-gold-600",
      accent: "text-gold-300",
    },
    {
      title: "Total Donations",
      value: `$${stats.totalDonations}`,
      icon: DollarSign,
      gradient: "from-blue-400 to-blue-600",
      accent: "text-blue-300",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      gradient: "from-gold-500 to-blue-500",
      accent: "text-gold-300",
    },
    {
      title: "Media Files",
      value: stats.totalMedia,
      icon: Image,
      gradient: "from-blue-500 to-gold-500",
      accent: "text-blue-300",
    },
    {
      title: "Contact Messages",
      value: contactMessages?.length || 0,
      icon: Mail,
      gradient: "from-gold-600 to-blue-600",
      accent: "text-gold-300",
    },
  ];

  const visitorHistory = analytics?.history || [];
  const dailyVisitors = analytics?.unique_visitors || 0;
  const weeklyVisitors = visitorHistory
    .slice(-7)
    .reduce((sum, day) => sum + (day.unique_visitors || 0), 0);
  const monthlyVisitors = visitorHistory.reduce(
    (sum, day) => sum + (day.unique_visitors || 0),
    0
  );
  const dailyPageViews = analytics?.page_views || 0;
  const weeklyPageViews = visitorHistory
    .slice(-7)
    .reduce((sum, day) => sum + (day.page_views || 0), 0);
  const monthlyPageViews = visitorHistory.reduce(
    (sum, day) => sum + (day.page_views || 0),
    0
  );

  const maxDailyVisitors = Math.max(
    ...visitorHistory.map((d) => d.unique_visitors || 0),
    dailyVisitors,
    1
  );
  const maxWeeklyVisitors = Math.max(
    ...Array.from({ length: Math.max(visitorHistory.length - 6, 1) }, (_, i) =>
      visitorHistory
        .slice(i, i + 7)
        .reduce((sum, d) => sum + (d.unique_visitors || 0), 0)
    ),
    weeklyVisitors,
    1
  );
  const maxMonthlyVisitors = Math.max(monthlyVisitors, 1);
  const maxDailyPageViews = Math.max(
    ...visitorHistory.map((d) => d.page_views || 0),
    dailyPageViews,
    1
  );

  const chartData = visitorHistory.map((day, index, arr) => {
    const runningSum = arr
      .slice(0, index + 1)
      .reduce((sum, d) => sum + (d.unique_visitors || 0), 0);
    return {
      label: new Date(day.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      visitors: day.unique_visitors || 0,
      runningAverage: Math.round(runningSum / (index + 1)),
    };
  });

  const visitorCards = [
    {
      title: "Daily Visitors",
      value: dailyVisitors,
      max: maxDailyVisitors,
      icon: Eye,
      gradient: ["#D4AF37", "#0F4C81"],
    },
    {
      title: "Weekly Visitors",
      value: weeklyVisitors,
      max: maxWeeklyVisitors,
      icon: Users,
      gradient: ["#3B82F6", "#D4AF37"],
    },
    {
      title: "Monthly Visitors",
      value: monthlyVisitors,
      max: maxMonthlyVisitors,
      icon: TrendingUp,
      gradient: ["#D4AF37", "#1E40AF"],
    },
    {
      title: "Page Views",
      value: dailyPageViews,
      max: maxDailyPageViews,
      icon: Activity,
      gradient: ["#60A5FA", "#D4AF37"],
    },
  ];

  const CircularProgress = ({ value, max, size = 72, stroke = 8, gradient, id }) => {
    const percentage = max > 0 ? Math.min(value / max, 1) : 0;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percentage * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const quickActions = [
    {
      title: "Add New Event",
      description: "Schedule upcoming events",
      icon: Plus,
      gradient: "from-gold-500 to-blue-500",
      action: () => setActiveTab("events"),
    },
    {
      title: "Upload Media",
      description: "Add photos and videos",
      icon: Upload,
      gradient: "from-blue-500 to-gold-500",
      action: () => setActiveTab("media"),
    },
    {
      title: "View Reports",
      description: "Analytics and insights",
      icon: FileText,
      gradient: "from-gold-500 to-blue-700",
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
        className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-8 text-white shadow-2xl shadow-gold-500/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100 text-lg">
              Here&apos;s what&apos;s happening with your YPG ministry today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-gold-500/20 border border-gold-500/30 backdrop-blur-sm rounded-2xl px-4 py-2">
            <Activity className="w-5 h-5 text-gold-300" />
            <span className="text-sm font-medium text-gold-100">Live Dashboard</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition-all duration-300 group cursor-pointer shadow-lg shadow-gold-500/5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-blue-100">
                  {card.title}
                </p>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient} shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-2xl font-bold text-white`}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Visitor Analytics */}
      <motion.div
        variants={cardVariants}
        className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-gold-500/10"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">
              Visitor Analytics
            </h3>
            <p className="text-blue-200 text-sm">
              Daily, weekly, and monthly visitor trends
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-sm font-medium border border-gold-500/30">
            <TrendingUp className="w-4 h-4" />
            Live Stats
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {visitorCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition-colors group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-500/10 to-blue-500/10 rounded-bl-full -mr-6 -mt-6" />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-blue-100">
                    {card.title}
                  </p>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gold-500/20 to-blue-500/20 border border-white/10">
                    <Icon className="w-5 h-5 text-gold-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      of {card.max.toLocaleString()} max
                    </p>
                  </div>
                  <CircularProgress
                    value={card.value}
                    max={card.max}
                    gradient={card.gradient}
                    id={card.title.replace(/\s+/g, "").toLowerCase()}
                    size={72}
                    stroke={7}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="rgba(191,219,254,0.5)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(191,219,254,0.5)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(5,11,46,0.95)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.75rem",
                  color: "#FFFFFF",
                }}
                itemStyle={{ color: "#D4AF37" }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#0F4C81"
                strokeWidth={2}
                fill="url(#blueGlow)"
                name="Visitors"
              />
              <Area
                type="monotone"
                dataKey="runningAverage"
                stroke="#D4AF37"
                strokeWidth={3}
                fill="url(#goldGlow)"
                name="Running Average"
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-gold-500/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              Quick Actions
            </h3>
            <p className="text-blue-100 text-sm">
              Common tasks to manage your ministry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-6 hover:bg-white/15 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-gold-300" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">
                  {action.title}
                </h4>
                <p className="text-sm text-blue-100">
                  {action.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={cardVariants}
        className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-gold-500/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              Recent Activity
            </h3>
            <p className="text-blue-100 text-sm">
              Latest updates from your ministry
            </p>
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
                color: "gold",
              });
            }

            // Add recent events
            if (events && events.length > 0) {
              const latestEvent = events[0];
              activities.push({
                icon: Calendar,
                text: `Event: ${latestEvent.title}`,
                time: "Recently",
                color: "blue",
              });
            }

            // Add recent donations
            if (donations && donations.length > 0) {
              const latestDonation = donations[0];
              activities.push({
                icon: DollarSign,
                text: `Donation: $${latestDonation.amount} from ${latestDonation.donor}`,
                time: "Recently",
                color: "gold",
              });
            }

            // Add recent media
            if (media && media.length > 0) {
              const latestMedia = media[0];
              activities.push({
                icon: Image,
                text: `Media uploaded: ${latestMedia.title}`,
                time: "Recently",
                color: "blue",
              });
            }

            // If no real data, show placeholder activities
            if (activities.length === 0) {
              activities.push(
                {
                  icon: Users,
                  text: "No team members yet",
                  time: "Add your first member",
                  color: "gold",
                },
                {
                  icon: Calendar,
                  text: "No events scheduled",
                  time: "Schedule your first event",
                  color: "blue",
                },
                {
                  icon: DollarSign,
                  text: "No donations received",
                  time: "Donations will appear here",
                  color: "gold",
                },
                {
                  icon: Image,
                  text: "No media uploaded",
                  time: "Upload your first media",
                  color: "blue",
                }
              );
            }

            const colorMap = {
              gold: "bg-gold-500/20 text-gold-300 border-gold-500/30",
              blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            };

            return activities.slice(0, 4); // Show max 4 activities
          })().map((activity, index) => {
            const Icon = activity.icon;
            const colorClass = activity.color === "gold"
              ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
              : "bg-blue-500/20 text-blue-300 border border-blue-500/30";
            return (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-xl transition-colors hover:bg-white/10"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {activity.text}
                  </p>
                  <p className="text-sm text-blue-200">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
