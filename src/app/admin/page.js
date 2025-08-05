'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Image, 
  Video, 
  DollarSign, 
  Eye, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Upload,
  BarChart3,
  FileText,
  Heart
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  // State for data from API
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalMedia: 0
  });

  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [media, setMedia] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsResponse = await fetch('/api/events');
      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        setEvents(eventsData.events);
      }

      // Fetch donations
      const donationsResponse = await fetch('/api/donations');
      const donationsData = await donationsResponse.json();
      if (donationsData.success) {
        setDonations(donationsData.donations);
      }

      // Fetch media
      const mediaResponse = await fetch('/api/media');
      const mediaData = await mediaResponse.json();
      if (mediaData.success) {
        setMedia(mediaData.media);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/analytics');
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Update stats
      setStats({
        totalVisitors: analyticsData.success ? analyticsData.analytics.visitors.total : 0,
        totalDonations: donationsData.success ? donationsData.summary.total_amount : 0,
        totalEvents: eventsData.success ? eventsData.events.length : 0,
        totalMedia: mediaData.success ? mediaData.media.length : 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'admin2024') {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert('Incorrect password');
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Presbyterian Youth Website</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Default password: admin2024
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Presbyterian Youth
              </span>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'media', label: 'Media', icon: Image },
              { id: 'donations', label: 'Donations', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: Eye },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalDonations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Image className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Media Files</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMedia}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Add New Event</span>
                </button>
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Upload Media</span>
                </button>
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium">View Reports</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Events Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Event
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.attendees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Media Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Media
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <Video className="w-12 h-12 text-gray-400" />
                    ) : (
                      <Image className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.type}</p>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Donations</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Donation
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {donation.donor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${donation.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Website Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Visitors</span>
                    <span className="font-semibold">{stats.totalVisitors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">89</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Most Viewed Page</span>
                    <span className="font-semibold">Events</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Time on Site</span>
                    <span className="font-semibold">4m 32s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-semibold">23%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Website Settings</h2>
            
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Presbyterian Youth Ministry"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        defaultValue="youth@presbyterian.org"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        defaultValue="https://facebook.com/presbyterianyouth"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        defaultValue="https://instagram.com/presbyterianyouth"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 