"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Shield,
  UserCheck,
  Palette,
  Info,
  Globe,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Sun,
  Moon,
  Monitor,
  Key,
  Smartphone,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function SettingsComponent({ onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [theme, setTheme] = useState("light");
  const [securityMethod, setSecurityMethod] = useState("password");

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Clear save status after 3 seconds
  useEffect(() => {
    if (saveStatus.type) {
      const timer = setTimeout(() => {
        setSaveStatus({ type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Form states
  const [profile, setProfile] = useState({
    fullName: "Admin User",
    email: "admin@ypg.com",
    phone: "+233 20 123 4567",
    role: "System Administrator",
    avatar: null,
  });

  const [generalSettings, setGeneralSettings] = useState({
    websiteTitle: "PCG Ahinsan District YPG",
    contactEmail: "youth@presbyterian.org",
    phoneNumber: "+233 20 123 4567",
    address: "Ahinsan District, Kumasi, Ghana",
    description:
      "Presbyterian Church of Ghana Youth Ministry - Ahinsan District",
  });

  const [socialMedia, setSocialMedia] = useState({
    facebook: "https://facebook.com/presbyterianyouth",
    instagram: "https://instagram.com/presbyterianyouth",
    twitter: "https://twitter.com/presbyterianyouth",
    youtube: "https://youtube.com/presbyterianyouth",
    linkedin: "https://linkedin.com/company/presbyterianyouth",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    currentPin: "",
    newPin: "",
    confirmPin: "",
    twoFactorAuth: false,
    requirePinForActions: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "English",
    primaryColor: "#3B82F6",
    borderRadius: "medium",
  });

  // Additional states for new features
  const [settingsHistory, setSettingsHistory] = useState([
    {
      id: 1,
      action: "Profile Updated",
      timestamp: "2024-01-15 14:30",
      user: "Admin User",
      details: "Updated email and phone number",
    },
    {
      id: 2,
      action: "Security Settings Changed",
      timestamp: "2024-01-14 09:15",
      user: "Admin User",
      details: "Enabled two-factor authentication",
    },
    {
      id: 3,
      action: "Website Content Updated",
      timestamp: "2024-01-13 16:45",
      user: "Admin User",
      details: "Updated social media links",
    },
  ]);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupData, setBackupData] = useState(null);

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User, color: "blue" },
    { id: "security", label: "Security", icon: Shield, color: "red" },
    { id: "privacy", label: "Privacy", icon: UserCheck, color: "green" },
    { id: "appearance", label: "Appearance", icon: Palette, color: "purple" },
    { id: "website", label: "Website Content", icon: Globe, color: "emerald" },
    { id: "backup", label: "Backup & Restore", icon: Save, color: "orange" },
    { id: "history", label: "Settings History", icon: Info, color: "gray" },
    { id: "about", label: "About", icon: Info, color: "gray" },
  ];

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+233|0)[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validatePin = (pin) => {
    return /^\d{4,6}$/.test(pin);
  };

  const validateProfile = () => {
    const errors = {};

    if (!profile.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!validateEmail(profile.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!validatePhone(profile.phone)) {
      errors.phone =
        "Please enter a valid phone number (0 or +233 followed by 9 digits)";
    }

    return errors;
  };

  const validateSecurity = () => {
    const errors = {};

    if (securityMethod === "password") {
      if (security.newPassword && !validatePassword(security.newPassword)) {
        errors.newPassword = "Password must be at least 8 characters long";
      }

      if (security.newPassword !== security.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    } else {
      // PIN validation - only validate if PIN is provided (since it's optional)
      if (security.newPin) {
        if (!validatePin(security.newPin)) {
          errors.newPin = "PIN must be 4-6 digits";
        }

        if (security.newPin !== security.confirmPin) {
          errors.confirmPin = "PINs do not match";
        }
      }
    }

    return errors;
  };

  const validateWebsite = () => {
    const errors = {};

    if (!generalSettings.websiteTitle.trim()) {
      errors.websiteTitle = "Website title is required";
    }

    if (!validateEmail(generalSettings.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    if (!validatePhone(generalSettings.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    return errors;
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    setValidationErrors({});

    try {
      // Validate based on section
      let errors = {};
      switch (section) {
        case "profile":
          errors = validateProfile();
          break;
        case "security":
          errors = validateSecurity();
          break;
        case "website":
          errors = validateWebsite();
          break;
        default:
          break;
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSaveStatus({
          type: "error",
          message: "Please fix the validation errors",
        });
        return;
      }

      // Make actual API calls
      let response;
      switch (section) {
        case "profile":
          response = await fetch("http://localhost:8000/api/settings/profile/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
          });
          break;

        case "security":
          response = await fetch("http://localhost:8000/api/settings/security/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...security,
              securityMethod,
            }),
          });
          break;

        case "website":
          response = await fetch("http://localhost:8000/api/settings/website/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              websiteTitle: generalSettings.websiteTitle,
              contactEmail: generalSettings.contactEmail,
              phoneNumber: generalSettings.phoneNumber,
              address: generalSettings.address,
              description: generalSettings.description,
              socialMedia,
              appearance,
            }),
          });
          break;

        default:
          throw new Error("Invalid section");
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setValidationErrors(errorData.errors);
          setSaveStatus({
            type: "error",
            message: "Please fix the validation errors",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to save settings");
      }

      const result = await response.json();
      setSaveStatus({
        type: "success",
        message:
          result.message ||
          `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`,
      });

      // Clear form fields for security
      if (section === "security") {
        setSecurity({
          ...security,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          currentPin: "",
          newPin: "",
          confirmPin: "",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({
        type: "error",
        message: error.message || "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setAppearance({ ...appearance, theme: newTheme });
  };

  // Backup and Restore functions
  const handleBackup = () => {
    const backup = {
      profile,
      generalSettings,
      socialMedia,
      security: {
        twoFactorAuth: security.twoFactorAuth,
        requirePinForActions: security.requirePinForActions,
      },
      appearance,
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ypg-settings-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveStatus({
      type: "success",
      message: "Settings backup created successfully!",
    });
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validate backup structure
        if (backup.profile && backup.generalSettings && backup.appearance) {
          setProfile(backup.profile);
          setGeneralSettings(backup.generalSettings);
          setSocialMedia(backup.socialMedia || socialMedia);
          setAppearance(backup.appearance);
          setSecurity((prev) => ({
            ...prev,
            twoFactorAuth: backup.security?.twoFactorAuth || false,
            requirePinForActions: backup.security?.requirePinForActions || true,
          }));

          setSaveStatus({
            type: "success",
            message: "Settings restored successfully!",
          });
        } else {
          setSaveStatus({
            type: "error",
            message: "Invalid backup file format",
          });
        }
      } catch (error) {
        setSaveStatus({
          type: "error",
          message: "Failed to restore settings. Invalid file.",
        });
      }
    };
    reader.readAsText(file);
  };

  // Profile picture upload function
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSaveStatus({
        type: "error",
        message: "Please select a valid image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveStatus({
        type: "error",
        message: "Image size must be less than 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfile({ ...profile, avatar: e.target.result });
      setSaveStatus({
        type: "success",
        message: "Profile picture updated successfully!",
      });
    };
    reader.readAsDataURL(file);
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName];
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-base";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = "border-gray-300 dark:border-gray-600";

    return `${baseClass} ${getFieldError(fieldName) ? errorClass : normalClass}`;
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
              {saveStatus.type && (
                <div
                  className={`flex items-center mt-2 text-sm ${
                    saveStatus.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {saveStatus.type === "success" ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  {saveStatus.message}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex h-96">
            {/* Settings Sidebar */}
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <nav className="p-4 space-y-2">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Settings
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {profile.avatar ? (
                            <img
                              src={profile.avatar}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm flex items-center cursor-pointer">
                            <Save className="w-4 h-4 mr-2" />
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG or GIF. Max 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) =>
                          setProfile({ ...profile, fullName: e.target.value })
                        }
                        className={getInputClassName("fullName")}
                        placeholder="Enter your full name"
                      />
                      {getFieldError("fullName") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getFieldError("fullName")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className={getInputClassName("email")}
                        placeholder="Enter your email address"
                      />
                      {getFieldError("email") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getFieldError("email")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className={getInputClassName("phone")}
                        placeholder="+233 20 123 4567"
                      />
                      {getFieldError("phone") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getFieldError("phone")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Role
                      </label>
                      <select
                        value={profile.role}
                        onChange={(e) =>
                          setProfile({ ...profile, role: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-base"
                      >
                        <option>System Administrator</option>
                        <option>Data Manager</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleSave("profile")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </button>
                    {saveStatus.type === "success" && (
                      <p className="text-green-600 text-xs mt-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                    {saveStatus.type === "error" && (
                      <p className="text-red-600 text-xs mt-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Security Settings
                  </h3>

                  {/* Authentication Method Toggle */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Authentication Method
                    </h4>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSecurityMethod("password")}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          securityMethod === "password"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        <Key className="w-4 h-4 inline mr-2" />
                        Username & Password
                      </button>
                      <button
                        onClick={() => setSecurityMethod("pin")}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          securityMethod === "pin"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 inline mr-2" />
                        PIN Authentication
                        <span className="ml-1 text-xs opacity-75">
                          (Optional)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Password Authentication */}
                  {securityMethod === "password" && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Password Settings
                      </h4>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={security.currentPassword}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                currentPassword: e.target.value,
                              })
                            }
                            className={getInputClassName("currentPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {getFieldError("currentPassword") && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError("currentPassword")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={security.newPassword}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              newPassword: e.target.value,
                            })
                          }
                          className={getInputClassName("newPassword")}
                          placeholder="Enter new password (min 8 characters)"
                        />
                        {getFieldError("newPassword") && (
                          <p className="mt-1 text-xs text-red-600">
                            {getFieldError("newPassword")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              confirmPassword: e.target.value,
                            })
                          }
                          className={getInputClassName("confirmPassword")}
                          placeholder="Confirm new password"
                        />
                        {getFieldError("confirmPassword") && (
                          <p className="mt-1 text-xs text-red-600">
                            {getFieldError("confirmPassword")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={security.twoFactorAuth}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              twoFactorAuth: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                      <button
                        onClick={() => handleSave("security")}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Password Settings
                          </>
                        )}
                      </button>
                      {saveStatus.type === "success" && (
                        <p className="text-green-600 text-xs mt-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {saveStatus.message}
                        </p>
                      )}
                      {saveStatus.type === "error" && (
                        <p className="text-red-600 text-xs mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {saveStatus.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* PIN Authentication */}
                  {securityMethod === "pin" && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        PIN Settings
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                        PIN authentication is optional and can be used for quick
                        actions and sensitive operations. Leave blank if you
                        don't want to use PIN.
                      </p>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Current PIN
                        </label>
                        <div className="relative">
                          <input
                            type={showPin ? "text" : "password"}
                            maxLength="6"
                            placeholder="Enter 4-6 digit PIN"
                            value={security.currentPin}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                currentPin: e.target.value,
                              })
                            }
                            className={getInputClassName("currentPin")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPin ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {getFieldError("currentPin") && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError("currentPin")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          New PIN
                        </label>
                        <input
                          type="password"
                          maxLength="6"
                          placeholder="Enter 4-6 digit PIN"
                          value={security.newPin}
                          onChange={(e) =>
                            setSecurity({ ...security, newPin: e.target.value })
                          }
                          className={getInputClassName("newPin")}
                        />
                        {getFieldError("newPin") && (
                          <p className="mt-1 text-xs text-red-600">
                            {getFieldError("newPin")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Confirm New PIN
                        </label>
                        <input
                          type="password"
                          maxLength="6"
                          placeholder="Confirm 4-6 digit PIN"
                          value={security.confirmPin}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              confirmPin: e.target.value,
                            })
                          }
                          className={getInputClassName("confirmPin")}
                        />
                        {getFieldError("confirmPin") && (
                          <p className="mt-1 text-xs text-red-600">
                            {getFieldError("confirmPin")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={security.requirePinForActions}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              requirePinForActions: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          Require PIN for sensitive actions
                        </label>
                      </div>
                      <button
                        onClick={() => handleSave("security")}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 inline mr-2" />
                            Update PIN Settings
                          </>
                        )}
                      </button>
                      {saveStatus.type === "success" && (
                        <p className="text-green-600 text-xs mt-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {saveStatus.message}
                        </p>
                      )}
                      {saveStatus.type === "error" && (
                        <p className="text-red-600 text-xs mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {saveStatus.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Privacy Policy
                  </h3>
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Your data is protected and used only for church
                      administration purposes. We do not share your information
                      with third parties. For more details, contact your
                      administrator.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Data Protection
                      </h4>
                      <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>
                          • All personal data is encrypted and stored securely
                        </li>
                        <li>
                          • Access is restricted to authorized personnel only
                        </li>
                        <li>• Regular security audits are conducted</li>
                        <li>• Data retention policies are strictly followed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Appearance Settings
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Theme
                      </label>
                      <select
                        value={appearance.theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-base"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Language
                      </label>
                      <select
                        value={appearance.language}
                        onChange={(e) =>
                          setAppearance({
                            ...appearance,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-base"
                      >
                        <option>English</option>
                        <option>Twi</option>
                        <option>Ga</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) =>
                          setAppearance({
                            ...appearance,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => handleSave("appearance")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Appearance Settings
                        </>
                      )}
                    </button>
                    {saveStatus.type === "success" && (
                      <p className="text-green-600 text-xs mt-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                    {saveStatus.type === "error" && (
                      <p className="text-red-600 text-xs mt-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* About */}
              {activeTab === "about" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    About
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        YPG Management System
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Version: 2.0.0
                      </p>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Built for PCG Ahinsan District
                      </p>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        © 2024 Presbyterian Church of Ghana
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        Features
                      </h4>
                      <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <li>• Member Management</li>
                        <li>• Event Planning</li>
                        <li>• Attendance Tracking</li>
                        <li>• Communication Tools</li>
                        <li>• Analytics Dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Website Content */}
              {activeTab === "website" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Website Content
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {/* General Settings */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3">
                        General Settings
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Website Title
                          </label>
                          <input
                            type="text"
                            value={generalSettings.websiteTitle}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                websiteTitle: e.target.value,
                              })
                            }
                            className={getInputClassName("websiteTitle")}
                          />
                          {getFieldError("websiteTitle") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("websiteTitle")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={generalSettings.contactEmail}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                contactEmail: e.target.value,
                              })
                            }
                            className={getInputClassName("contactEmail")}
                          />
                          {getFieldError("contactEmail") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("contactEmail")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={generalSettings.phoneNumber}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                phoneNumber: e.target.value,
                              })
                            }
                            className={getInputClassName("phoneNumber")}
                          />
                          {getFieldError("phoneNumber") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("phoneNumber")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={generalSettings.address}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                address: e.target.value,
                              })
                            }
                            className={getInputClassName("address")}
                          />
                          {getFieldError("address") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("address")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={generalSettings.description}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Social Media */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Social Media
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2 flex items-center">
                            <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                            Facebook URL
                          </label>
                          <input
                            type="url"
                            value={socialMedia.facebook}
                            onChange={(e) =>
                              setSocialMedia({
                                ...socialMedia,
                                facebook: e.target.value,
                              })
                            }
                            className={getInputClassName("facebook")}
                          />
                          {getFieldError("facebook") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("facebook")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2 flex items-center">
                            <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                            Instagram URL
                          </label>
                          <input
                            type="url"
                            value={socialMedia.instagram}
                            onChange={(e) =>
                              setSocialMedia({
                                ...socialMedia,
                                instagram: e.target.value,
                              })
                            }
                            className={getInputClassName("instagram")}
                          />
                          {getFieldError("instagram") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("instagram")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2 flex items-center">
                            <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                            Twitter URL
                          </label>
                          <input
                            type="url"
                            value={socialMedia.twitter}
                            onChange={(e) =>
                              setSocialMedia({
                                ...socialMedia,
                                twitter: e.target.value,
                              })
                            }
                            className={getInputClassName("twitter")}
                          />
                          {getFieldError("twitter") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("twitter")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2 flex items-center">
                            <Youtube className="w-4 h-4 mr-2 text-red-600" />
                            YouTube URL
                          </label>
                          <input
                            type="url"
                            value={socialMedia.youtube}
                            onChange={(e) =>
                              setSocialMedia({
                                ...socialMedia,
                                youtube: e.target.value,
                              })
                            }
                            className={getInputClassName("youtube")}
                          />
                          {getFieldError("youtube") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getFieldError("youtube")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave("website")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Website Settings
                        </>
                      )}
                    </button>
                    {saveStatus.type === "success" && (
                      <p className="text-green-600 text-xs mt-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                    {saveStatus.type === "error" && (
                      <p className="text-red-600 text-xs mt-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {saveStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Backup & Restore */}
              {activeTab === "backup" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Backup & Restore
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Backup Settings
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-4">
                        Create a backup of all your current settings. This will
                        download a JSON file that you can use to restore your
                        settings later.
                      </p>
                      <button
                        onClick={handleBackup}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Backup
                      </button>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                        Restore Settings
                      </h4>
                      <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 mb-4">
                        Restore your settings from a previously created backup
                        file.
                      </p>
                      <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm flex items-center cursor-pointer">
                        <Save className="w-4 h-4 mr-2" />
                        Choose Backup File
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestore}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                        Important Notes
                      </h4>
                      <ul className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                        <li>
                          • Backup files contain sensitive information - keep
                          them secure
                        </li>
                        <li>• Only restore files created by this system</li>
                        <li>• Restoring will overwrite current settings</li>
                        <li>• Backup files are version-specific</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings History */}
              {activeTab === "history" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Settings History
                  </h3>
                  <div className="space-y-3">
                    {settingsHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              {item.action}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {item.details}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              By: {item.user} • {item.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
