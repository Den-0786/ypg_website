"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react";

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Youtube,
  telegram: MessageCircle,
  other: MessageCircle,
};

export default function SocialMediaManagement() {
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    platform_name: "facebook",
    custom_platform_name: "",
    url: "",
    icon_name: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSocialMediaLinks();
  }, []);

  const fetchSocialMediaLinks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-media/admin/`
      );
      const data = await response.json();
      if (data.success) {
        setSocialMediaLinks(data.social_media_links);
      }
    } catch (error) {
      console.error("Error fetching social media links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingLink
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-media/${editingLink.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-media/create/`;
      
      const method = editingLink ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSocialMediaLinks();
        setShowModal(false);
        setEditingLink(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving social media link:", error);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      platform_name: link.platform_name,
      custom_platform_name: link.custom_platform_name,
      url: link.url,
      icon_name: link.icon_name,
      display_order: link.display_order,
      is_active: link.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this social media link?")) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-media/${id}/delete/`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        fetchSocialMediaLinks();
      }
    } catch (error) {
      console.error("Error deleting social media link:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      platform_name: "facebook",
      custom_platform_name: "",
      url: "",
      icon_name: "",
      display_order: 0,
      is_active: true,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLink(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Links</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Link
        </button>
      </div>

      <div className="grid gap-4">
        {socialMediaLinks.map((link) => {
          const Icon = PLATFORM_ICONS[link.platform_name] || PLATFORM_ICONS.other;
          return (
            <div
              key={link.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {link.display_name}
                  </h3>
                  <p className="text-sm text-gray-600">{link.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        link.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {link.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Order: {link.display_order}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(link)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}

        {socialMediaLinks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No social media links configured. Click "Add Link" to create one.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLink ? "Edit Social Media Link" : "Add Social Media Link"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform_name}
                  onChange={(e) =>
                    setFormData({ ...formData, platform_name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.platform_name === "other" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Custom Platform Name
                  </label>
                  <input
                    type="text"
                    value={formData.custom_platform_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custom_platform_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Snapchat"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/yourpage"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Icon Name (Lucide icon name or custom identifier)
                </label>
                <input
                  type="text"
                  value={formData.icon_name}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., facebook, instagram"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-xs font-medium text-gray-700">
                  Active (show on website)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save size={16} />
                  {editingLink ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
