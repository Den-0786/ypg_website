'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, DollarSign, Calendar, Image } from 'lucide-react';

export default function AnalyticsSettings({ activeSettingsTab, stats, analytics }) {
  const [settings, setSettings] = useState({
    websiteTitle: "Presbyterian Youth Ministry",
    contactEmail: "youth@presbyterian.org",
    phoneNumber: "+1 (555) 123-4567",
    facebookUrl: "https://facebook.com/presbyterianyouth",
    instagramUrl: "https://instagram.com/presbyterianyouth"
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to a database or API
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

  if (activeSettingsTab === 'analytics') {
    return (
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
    );
  }

  if (activeSettingsTab === 'settings') {
    return (
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
                    value={settings.websiteTitle}
                    onChange={(e) => setSettings({...settings, websiteTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phoneNumber}
                    onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
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
                    value={settings.facebookUrl}
                    onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <button 
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}