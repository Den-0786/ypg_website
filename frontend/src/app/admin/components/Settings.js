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
  Menu,
} from "lucide-react";

export default function SettingsComponent({ onClose, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [securityMethod, setSecurityMethod] = useState("password");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
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

  // Set sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear save status after 3 seconds
  useEffect(() => {
    if (saveStatus.type) {
      const timer = setTimeout(() => {
        setSaveStatus({ type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Load current credentials on component mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        // Try to get credentials with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/auth/credentials/`,
          {
            signal: controller.signal,
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.credentials) {
            setCurrentCredentials(data.credentials);
            setSecurity((prev) => ({
              ...prev,
              newUsername: data.credentials.username,
            }));
            return;
          }
        } else if (response.status === 401) {
          // User is not authenticated, use default credentials
          console.log("User not authenticated, using default credentials");
          setCurrentCredentials({
            username: "admin",
            hasPassword: true,
            fullName: "YPG Administrator",
            email: "admin@ahinsanypg.com",
            role: "System Administrator",
          });
          setSecurity((prev) => ({
            ...prev,
            newUsername: "admin",
          }));
          return;
        } else {
          // Handle other error responses
          console.log(
            `API returned status ${response.status}, using default credentials`
          );
          setCurrentCredentials({
            username: "admin",
            hasPassword: true,
            fullName: "YPG Administrator",
            email: "admin@ahinsanypg.com",
            role: "System Administrator",
          });
          setSecurity((prev) => ({
            ...prev,
            newUsername: "admin",
          }));
          return;
        }

        // Fallback to default credentials
        setCurrentCredentials({
          username: "admin",
          hasPassword: true,
          fullName: "YPG Administrator",
          email: "admin@ahinsanypg.com",
          role: "System Administrator",
        });
        setSecurity((prev) => ({
          ...prev,
          newUsername: "admin",
        }));
      } catch (error) {
        console.log("Using default credentials:", error.message);
        // Set default credentials on error
        setCurrentCredentials({
          username: "admin",
          hasPassword: true,
          fullName: "YPG Administrator",
          email: "admin@ahinsanypg.com",
          role: "System Administrator",
        });
        setSecurity((prev) => ({
          ...prev,
          newUsername: "admin",
        }));
      }
    };
    loadCredentials();
  }, []);

  // Form states
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "System Administrator",
    avatar: null,
  });

  // Load profile data from database
  useEffect(() => {
    const loadProfile = async () => {
      setIsProfileLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/profile`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          console.error(
            "Failed to load profile:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Load website settings from database
  useEffect(() => {
    const loadWebsiteSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/website`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.settings) {
          // Update general settings
          if (data.settings.websiteTitle) {
            setGeneralSettings((prev) => ({
              ...prev,
              websiteTitle: data.settings.websiteTitle,
              contactEmail: data.settings.contactEmail || prev.contactEmail,
              phoneNumber: data.settings.phoneNumber || prev.phoneNumber,
              address: data.settings.address || prev.address,
              description: data.settings.description || prev.description,
            }));
          }

          // Update social media settings
          if (data.settings.socialMedia) {
            setSocialMedia((prev) => ({
              ...prev,
              ...data.settings.socialMedia,
            }));
          }

          // Update appearance settings
          if (data.settings.appearance) {
            setAppearance((prev) => ({
              ...prev,
              ...data.settings.appearance,
            }));
          }
        } else {
          console.error(
            "Failed to load website settings:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Failed to load website settings:", error);
      }
    };
    loadWebsiteSettings();
  }, []);

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
    newUsername: "",
    currentPin: "",
    newPin: "",
    confirmPin: "",
    twoFactorAuth: false,
    requirePinForActions: true,
  });

  const [currentCredentials, setCurrentCredentials] = useState({
    username: "",
    hasPassword: false,
  });

  const [appearance, setAppearance] = useState({
    language: "English",
    borderRadius: "medium",
  });

  // Additional states for new features
  const [settingsHistory, setSettingsHistory] = useState([]);

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

  const validateAppearance = () => {
    const errors = {};

    if (!appearance.language) {
      errors.language = "Language is required";
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
        case "appearance":
          errors = validateAppearance();
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
          response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/profile`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
          });
          break;

        case "security":
          const sessionToken = localStorage.getItem("ypg_admin_session_token");
          response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/auth/credentials`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
              ...(sessionToken && { "Authorization": `Bearer ${sessionToken}` }),
            },
            body: JSON.stringify({
              currentPassword: security.currentPassword,
              newUsername: security.newUsername,
              newPassword: security.newPassword,
            }),
          });
          break;

        case "website":
          response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/website`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
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

        case "appearance":
          response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/website`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
        // Show specific error message from server
        const errorMessage =
          errorData.error || errorData.message || "Failed to save settings";
        setSaveStatus({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      const result = await response.json();
      setSaveStatus({
        type: "success",
        message:
          result.message ||
          `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`,
      });

      // Add history entry based on section
      switch (section) {
        case "profile":
          addHistoryEntry("Profile Updated", "Updated profile information");
          break;
        case "security":
          addHistoryEntry(
            "Security Settings Changed",
            "Updated login credentials"
          );
          break;
        case "website":
          addHistoryEntry(
            "Website Content Updated",
            "Updated website settings and content"
          );
          break;
        case "appearance":
          addHistoryEntry(
            "Appearance Settings Changed",
            "Updated theme and appearance settings"
          );
          break;
        default:
          break;
      }

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
  };

  // Function to add history entry
  const addHistoryEntry = (action, details) => {
    const newEntry = {
      id: Date.now(),
      action,
      timestamp: new Date().toLocaleString(),
      user: profile.fullName || "Admin User",
      details,
    };
    setSettingsHistory((prev) => [newEntry, ...prev.slice(0, 19)]); // Keep only last 20 entries
  };

  // Function to delete history entry
  const deleteHistoryEntry = (id) => {
    setSettingsHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Backup and Restore functions
  const handleBackup = async () => {
    try {
      setIsLoading(true);

      // Create comprehensive backup with all current settings
      const backup = {
        profile,
        generalSettings,
        socialMedia,
        security: {
          twoFactorAuth: security.twoFactorAuth,
          requirePinForActions: security.requirePinForActions,
        },
        appearance,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "2.0.0",
          system: "YPG Website Settings",
          exportedBy: profile.fullName || "Admin User",
        },
      };

      // Validate backup data
      if (!backup.profile || !backup.generalSettings || !backup.appearance) {
        throw new Error("Invalid backup data structure");
      }

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
        message: "Settings backup created and downloaded successfully!",
      });
      addHistoryEntry("Backup Created", "Settings backup file downloaded");
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: `Failed to create backup: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      setSaveStatus({
        type: "error",
        message: "Please select a valid JSON backup file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveStatus({
        type: "error",
        message: "Backup file is too large. Maximum size is 5MB.",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validate backup structure and version
        if (!backup.profile || !backup.generalSettings || !backup.appearance) {
          throw new Error("Invalid backup file structure");
        }

        // Check if it's a YPG settings backup
        if (backup.metadata?.system !== "YPG Website Settings") {
          throw new Error("This is not a valid YPG settings backup file");
        }

        // Restore settings with validation
        const restoredProfile = {
          fullName: backup.profile.fullName || "",
          email: backup.profile.email || "",
          phone: backup.profile.phone || "",
          role: backup.profile.role || "System Administrator",
          avatar: backup.profile.avatar || null,
        };

        const restoredGeneralSettings = {
          websiteTitle:
            backup.generalSettings.websiteTitle || "PCG Ahinsan District YPG",
          contactEmail:
            backup.generalSettings.contactEmail || "youth@presbyterian.org",
          phoneNumber: backup.generalSettings.phoneNumber || "+233 20 123 4567",
          address:
            backup.generalSettings.address || "Ahinsan District, Kumasi, Ghana",
          description:
            backup.generalSettings.description ||
            "Presbyterian Church of Ghana Youth Ministry - Ahinsan District",
        };

        const restoredSocialMedia = {
          facebook:
            backup.socialMedia?.facebook ||
            "https://facebook.com/presbyterianyouth",
          instagram:
            backup.socialMedia?.instagram ||
            "https://instagram.com/presbyterianyouth",
          twitter:
            backup.socialMedia?.twitter ||
            "https://twitter.com/presbyterianyouth",
          youtube:
            backup.socialMedia?.youtube ||
            "https://youtube.com/presbyterianyouth",
          linkedin:
            backup.socialMedia?.linkedin ||
            "https://linkedin.com/company/presbyterianyouth",
        };

        const restoredAppearance = {
          language: backup.appearance?.language || "English",
          borderRadius: backup.appearance?.borderRadius || "medium",
        };

        // Update state with restored settings
        setProfile(restoredProfile);
        setGeneralSettings(restoredGeneralSettings);
        setSocialMedia(restoredSocialMedia);
        setAppearance(restoredAppearance);
        setSecurity((prev) => ({
          ...prev,
          twoFactorAuth: backup.security?.twoFactorAuth || false,
          requirePinForActions: backup.security?.requirePinForActions || true,
        }));

        // Save restored settings to database
        try {
          // Save profile settings
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/profile`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(restoredProfile),
          });

          // Save website settings
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/website`, {
            method: "PUT",
            credentials: 'include', // Include cookies for session authentication
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              websiteTitle: restoredGeneralSettings.websiteTitle,
              contactEmail: restoredGeneralSettings.contactEmail,
              phoneNumber: restoredGeneralSettings.phoneNumber,
              address: restoredGeneralSettings.address,
              description: restoredGeneralSettings.description,
              socialMedia: restoredSocialMedia,
              appearance: restoredAppearance,
            }),
          });

          setSaveStatus({
            type: "success",
            message: `Settings restored and saved to database successfully from backup created on ${new Date(backup.metadata?.timestamp).toLocaleDateString()}`,
          });
          addHistoryEntry(
            "Settings Restored",
            `Settings restored from backup file (${backup.metadata?.exportedBy || "Unknown"})`
          );
        } catch (dbError) {
          setSaveStatus({
            type: "warning",
            message: `Settings restored but failed to save to database: ${dbError.message}. Please save manually.`,
          });
          addHistoryEntry(
            "Settings Restore Failed",
            `Failed to save restored settings to database`
          );
        }

        // Clear the file input
        event.target.value = "";
      } catch (error) {
        setSaveStatus({
          type: "error",
          message: `Failed to restore settings: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Profile picture upload function
  const handleAvatarUpload = async (event) => {
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

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const avatarData = e.target.result;

        // Save the avatar to the database
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/settings/profile`,
          {
            method: "PUT",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              avatar: avatarData,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              errorData.message ||
              "Failed to save profile picture"
          );
        }

        const result = await response.json();
        setProfile({ ...profile, avatar: avatarData });
        setSaveStatus({
          type: "success",
          message: "Profile picture updated successfully!",
        });
        addHistoryEntry(
          "Profile Picture Updated",
          "Uploaded new profile picture"
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: error.message || "Failed to save profile picture",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName];
  };

  const getInputClassName = (fieldName) => {
    const baseClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base ${
      theme === "dark"
        ? "bg-gray-700 text-white border-gray-600"
        : "bg-white text-gray-900 border-gray-300"
    }`;
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass =
      theme === "dark" ? "border-gray-600" : "border-gray-300";

    return `${baseClass} ${getFieldError(fieldName) ? errorClass : normalClass}`;
  };

  const getLabelClassName = () => {
    return `block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
      theme === "dark" ? "text-gray-300" : "text-gray-700"
    }`;
  };

  const getLabelWithIconClassName = () => {
    return `text-xs sm:text-sm font-medium mb-1 sm:mb-2 flex items-center ${
      theme === "dark" ? "text-gray-300" : "text-gray-700"
    }`;
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
        <div
          className={`rounded-lg shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] overflow-hidden ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          {/* Modal Header */}
          <div
            className={`flex items-center justify-between p-4 sm:p-6 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <h2
                className={`text-lg sm:text-xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Settings
              </h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-1 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
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
              className={`p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex h-96">

            {/* Settings Sidebar */}
            <div
              className={`${
                sidebarOpen ? "w-48" : "w-0"
              } transition-all duration-300 border-r overflow-hidden ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <nav className="p-4 space-y-2">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        // Close sidebar on mobile after selecting tab
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? theme === "dark"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                          : theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
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
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Profile Settings
                  </h3>
                  {isProfileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Loading profile data...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Profile Picture
                        </label>
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
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
                            <p
                              className={`text-xs mt-1 ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              JPG, PNG or GIF. Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={getLabelClassName()}>
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
                        <label className={getLabelClassName()}>Email *</label>
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
                        <label className={getLabelClassName()}>Phone *</label>
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
                        <label className={getLabelClassName()}>Role</label>
                        <select
                          value={profile.role}
                          onChange={(e) =>
                            setProfile({ ...profile, role: e.target.value })
                          }
                          className={getInputClassName("role")}
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
                  )}
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Security Settings
                  </h3>

                  {/* Authentication Info */}
                  <div
                    className={`rounded-lg p-4 border ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <h4
                      className={`text-xs sm:text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-white" : "text-blue-900"
                      }`}
                    >
                      Authentication Method
                    </h4>
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-2 text-blue-600" />
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-blue-800"
                        }`}
                      >
                        Username & Password Authentication
                      </span>
                    </div>
                  </div>

                  {/* Password Authentication */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Supervisor Credentials
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Current Username:{" "}
                        <strong>
                          {currentCredentials.username || "Loading..."}
                        </strong>
                      </p>
                    </div>
                    <div>
                      <label className={getLabelClassName()}>
                        New Username
                      </label>
                      <input
                        type="text"
                        value={security.newUsername}
                        onChange={(e) =>
                          setSecurity({
                            ...security,
                            newUsername: e.target.value,
                          })
                        }
                        className={getInputClassName("newUsername")}
                        placeholder="Leave blank to keep current username"
                      />
                      {getFieldError("newUsername") && (
                        <p className="text-red-500 text-xs mt-1">
                          {getFieldError("newUsername")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={getLabelClassName()}>
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
                      <label className={getLabelClassName()}>
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={security.newPassword}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              newPassword: e.target.value,
                            })
                          }
                          className={getInputClassName("newPassword")}
                          placeholder="Leave blank to keep current password"
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
                      {getFieldError("newPassword") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getFieldError("newPassword")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={getLabelClassName()}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
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
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {getFieldError("confirmPassword") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getFieldError("confirmPassword")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSave("security")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Supervisor Credentials
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

              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Privacy Policy
                  </h3>
                  <div className="space-y-4">
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Appearance Settings
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={getLabelClassName()}>Theme</label>
                      <select
                        value={theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className={getInputClassName("theme")}
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">Auto (System)</option>
                      </select>
                    </div>
                    <div>
                      <label className={getLabelClassName()}>Language</label>
                      <select
                        value={appearance.language}
                        onChange={(e) =>
                          setAppearance({
                            ...appearance,
                            language: e.target.value,
                          })
                        }
                        className={getInputClassName("language")}
                      >
                        <option>English</option>
                        <option>Twi</option>
                        <option>Ga</option>
                      </select>
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
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    About
                  </h3>
                  <div className="space-y-4">
                    <div
                      className={`border rounded-lg p-4 ${
                        theme === "dark"
                          ? "bg-blue-900/20 border-blue-800"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-2 ${
                          theme === "dark" ? "text-blue-300" : "text-blue-900"
                        }`}
                      >
                        YPG Official Website
                      </h4>
                      <p
                        className={`text-xs sm:text-sm mb-2 ${
                          theme === "dark" ? "text-blue-200" : "text-blue-800"
                        }`}
                      >
                        Version: 1.1.0
                      </p>
                      <p
                        className={`text-xs sm:text-sm mb-2 ${
                          theme === "dark" ? "text-blue-200" : "text-blue-800"
                        }`}
                      >
                        Built for PCG Ahinsan District YPG
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${
                          theme === "dark" ? "text-blue-200" : "text-blue-800"
                        }`}
                      >
                        © 2025 PCG Ahinsan District YPG
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4
                        className={`text-xs sm:text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Features
                      </h4>
                      <ul
                        className={`text-xs sm:text-sm space-y-1 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <li>• Members Management</li>
                        <li>• Event Planning</li>
                        <li>• Attendance Tracking</li>
                        <li>• Communication Tools</li>
                        <li>• Analytics Dashboard</li>
                        <li>• Guilders Support System</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Website Content */}
              {activeTab === "website" && (
                <div className="space-y-4 sm:space-y-6">
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Website Content
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {/* General Settings */}
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-3 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        General Settings
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div>
                          <label className={getLabelClassName()}>
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
                          <label className={getLabelClassName()}>
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
                          <label className={getLabelClassName()}>
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
                          <label className={getLabelClassName()}>Address</label>
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
                        <label className={getLabelClassName()}>
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
                          className={getInputClassName("description")}
                        />
                      </div>
                    </div>

                    {/* Social Media */}
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-3 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Social Media
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div>
                          <label className={getLabelWithIconClassName()}>
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
                          <label className={getLabelWithIconClassName()}>
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
                          <label className={getLabelWithIconClassName()}>
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
                          <label className={getLabelWithIconClassName()}>
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
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Backup & Restore
                  </h3>
                  <div className="space-y-4">
                    <div
                      className={`border rounded-lg p-4 ${
                        theme === "dark"
                          ? "bg-blue-900/20 border-blue-800"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-2 ${
                          theme === "dark" ? "text-blue-300" : "text-blue-900"
                        }`}
                      >
                        Backup Settings
                      </h4>
                      <p
                        className={`text-xs sm:text-sm mb-4 ${
                          theme === "dark" ? "text-blue-200" : "text-blue-800"
                        }`}
                      >
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

                    <div
                      className={`border rounded-lg p-4 ${
                        theme === "dark"
                          ? "bg-green-900/20 border-green-800"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-2 ${
                          theme === "dark" ? "text-green-300" : "text-green-900"
                        }`}
                      >
                        Restore Settings
                      </h4>
                      <p
                        className={`text-xs sm:text-sm mb-4 ${
                          theme === "dark" ? "text-green-200" : "text-green-800"
                        }`}
                      >
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

                    <div
                      className={`border rounded-lg p-4 ${
                        theme === "dark"
                          ? "bg-yellow-900/20 border-yellow-800"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <h4
                        className={`text-xs sm:text-sm font-medium mb-2 ${
                          theme === "dark"
                            ? "text-yellow-300"
                            : "text-yellow-900"
                        }`}
                      >
                        Important Notes
                      </h4>
                      <ul
                        className={`text-xs sm:text-sm space-y-1 ${
                          theme === "dark"
                            ? "text-yellow-200"
                            : "text-yellow-800"
                        }`}
                      >
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
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Settings History
                  </h3>
                  <div className="space-y-3">
                    {settingsHistory.length === 0 ? (
                      <div
                        className={`rounded-lg p-8 border text-center ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No settings changes recorded yet.
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Changes will appear here after you save settings.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {settingsHistory.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-lg p-4 border ${
                              theme === "dark"
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4
                                  className={`text-xs sm:text-sm font-medium ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.action}
                                </h4>
                                <p
                                  className={`text-xs mt-1 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {item.details}
                                </p>
                                <p
                                  className={`text-xs mt-2 ${
                                    theme === "dark"
                                      ? "text-gray-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  By: {item.user} • {item.timestamp}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteHistoryEntry(item.id)}
                                className={`ml-2 p-1 text-gray-400 hover:text-red-600 rounded transition-colors ${
                                  theme === "dark"
                                    ? "hover:bg-red-900/20"
                                    : "hover:bg-red-50"
                                }`}
                                title="Delete this entry"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="text-center pt-2">
                          <button
                            onClick={() => setSettingsHistory([])}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                          >
                            Clear All History
                          </button>
                        </div>
                      </div>
                    )}
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
