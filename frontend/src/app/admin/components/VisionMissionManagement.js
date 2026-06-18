"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Upload, X, Save, Image as ImageIcon } from "lucide-react";
import { getBaseUrl } from "../../../utils/baseUrl";

export default function VisionMissionManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mission_text: "",
    vision_text: "",
    motto: "",
    theme_title: "",
    theme_text: "",
  });
  const [missionImage, setMissionImage] = useState(null);
  const [visionImage, setVisionImage] = useState(null);
  const [missionPreview, setMissionPreview] = useState(null);
  const [visionPreview, setVisionPreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const baseUrl = getBaseUrl();

  useEffect(() => {
    fetchVisionMission();
  }, []);

  const fetchVisionMission = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/vision-mission/`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setFormData({
          mission_text: result.data.mission_text || "",
          vision_text: result.data.vision_text || "",
          motto: result.data.motto || "",
          theme_title: result.data.theme_title || "",
          theme_text: result.data.theme_text || "",
        });
        setMissionPreview(result.data.mission_image_url);
        setVisionPreview(result.data.vision_image_url);
      }
    } catch (error) {
      console.error("Error fetching vision/mission:", error);
      showMessage("error", "Failed to load Vision & Mission data");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "mission") {
        setMissionImage(file);
        setMissionPreview(URL.createObjectURL(file));
      } else {
        setVisionImage(file);
        setVisionPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("mission_text", formData.mission_text);
      formDataToSend.append("vision_text", formData.vision_text);
      formDataToSend.append("motto", formData.motto);
      formDataToSend.append("theme_title", formData.theme_title);
      formDataToSend.append("theme_text", formData.theme_text);

      if (missionImage) {
        formDataToSend.append("mission_image", missionImage);
      }
      if (visionImage) {
        formDataToSend.append("vision_image", visionImage);
      }

      const sessionToken = localStorage.getItem("session_token");
      const response = await fetch(`${baseUrl}/api/vision-mission/update/`, {
        method: "PUT",
        headers: {
          Authorization: sessionToken ? `Bearer ${sessionToken}` : "",
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setIsEditing(false);
        showMessage("success", "Vision & Mission updated successfully!");
      } else {
        showMessage("error", result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating vision/mission:", error);
      showMessage("error", "Network error - please try again");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Message Toast */}
      {message.text && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Vision & Mission Management
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" /> Edit Content
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mission Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Mission Section
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Text
                </label>
                <textarea
                  name="mission_text"
                  value={formData.mission_text}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Image
                </label>
                <div className="flex items-center gap-4">
                  {missionPreview && (
                    <img
                      src={missionPreview}
                      alt="Mission preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "mission")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Vision Section
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision Text
                </label>
                <textarea
                  name="vision_text"
                  value={formData.vision_text}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision Image
                </label>
                <div className="flex items-center gap-4">
                  {visionPreview && (
                    <img
                      src={visionPreview}
                      alt="Vision preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "vision")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Motto & Theme Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Motto & Theme
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motto
                </label>
                <input
                  type="text"
                  name="motto"
                  value={formData.motto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Title
                </label>
                <input
                  type="text"
                  name="theme_title"
                  value={formData.theme_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Text
                </label>
                <textarea
                  name="theme_text"
                  value={formData.theme_text}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission Preview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Mission
              </h3>
              <div className="flex flex-col items-center gap-4">
                {missionPreview && (
                  <img
                    src={missionPreview}
                    alt="Mission"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                  />
                )}
                <p className="text-gray-700 text-center">{data?.mission_text}</p>
              </div>
            </div>

            {/* Vision Preview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Vision
              </h3>
              <div className="flex flex-col items-center gap-4">
                {visionPreview && (
                  <img
                    src={visionPreview}
                    alt="Vision"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                  />
                )}
                <p className="text-gray-700 text-center">{data?.vision_text}</p>
              </div>
            </div>
          </div>

          {/* Motto & Theme Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Motto</h4>
              <p className="text-blue-900 italic">{data?.motto}</p>
            </div>

            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-2 text-center">
                {data?.theme_title}
              </h4>
              <p className="text-green-900 text-center text-sm">
                {data?.theme_text}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Last updated: {data?.updated_at ? new Date(data.updated_at).toLocaleString() : "N/A"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
