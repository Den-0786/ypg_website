import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Music,
  Video,
  Heart,
  BookOpen as BookIcon,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MinistryManagement = ({
  ministryRegistrations = [],
  setMinistryRegistrations,
  theme,
}) => {
  // Registration states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [newRegistration, setNewRegistration] = useState({
    name: "",
    email: "",
    phone: "",
    congregation: "",
    ministry: "",
    message: "",
  });

  // Ministry management states
  const [showAddMinistryModal, setShowAddMinistryModal] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [newMinistry, setNewMinistry] = useState({
    name: "",
    description: "",
    leaderName: "",
    leaderPhone: "",
    color: "from-blue-500 to-teal-500",
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Delete modal states
  const [showDeleteMinistryModal, setShowDeleteMinistryModal] = useState(false);
  const [ministryToDelete, setMinistryToDelete] = useState(null);
  const [showDeleteRegistrationModal, setShowDeleteRegistrationModal] =
    useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);

  // Ministries data - in production this would come from API
  const [ministries, setMinistries] = useState([]);

  // Load ministries on mount so they persist after refresh
  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministries/`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.ministries)) {
          setMinistries(data.ministries);
        } else {
          setMinistries([]);
        }
      } catch (e) {
        setMinistries([]);
      }
    };
    fetchMinistries();
  }, []);

  const handleAddRegistration = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministry/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newRegistration.name,
            email: newRegistration.email || "",
            phone: newRegistration.phone,
            congregation: newRegistration.congregation,
            ministry: newRegistration.ministry,
            message: newRegistration.message,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const added = {
          id: data.registration_id || data.id || Date.now(),
          name: newRegistration.name,
          email: newRegistration.email || "",
          phone: newRegistration.phone,
          congregation: newRegistration.congregation,
          ministry: newRegistration.ministry,
          message: newRegistration.message,
        };
        setMinistryRegistrations([...ministryRegistrations, added]);
        setShowAddModal(false);
        setNewRegistration({
          name: "",
          email: "",
          phone: "",
          congregation: "",
          ministry: "",
          message: "",
        });
        toast.success("Ministry registration added successfully!");
      }
    } catch (error) {
      console.error("Error adding ministry registration:", error);
      toast.error("Failed to add ministry registration. Please try again.");
    }
  };

  const handleUpdateRegistration = async () => {
    try {
      const registrationId =
        editingRegistration.id ?? editingRegistration.registration_id;
      if (!registrationId) {
        console.error(
          "Missing registration ID for update:",
          editingRegistration
        );
        toast.error("Cannot update: missing registration ID");
        return;
      }

      const payload = {
        name: editingRegistration.name,
        email: editingRegistration.email || "",
        phone: editingRegistration.phone || "",
        congregation: editingRegistration.congregation,
        ministry: editingRegistration.ministry,
      };

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministry/${registrationId}/`;
      console.log("Updating registration URL:", url);
      console.log("Updating registration with payload:", payload);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedRegistration = await response.json();
        console.log("Updated registration:", updatedRegistration);
        setMinistryRegistrations(
          ministryRegistrations.map((reg) =>
            (reg.id ?? reg.registration_id) === registrationId
              ? updatedRegistration
              : reg
          )
        );
        setEditingRegistration(null);
        toast.success("Ministry registration updated successfully!");
      } else {
        let errorMsg = "Failed to update ministry registration";
        try {
          const errorData = await response.json();
          console.log("Error response:", errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.log("Error parsing error response:", e);
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error updating ministry registration:", error);
      toast.error("Failed to update ministry registration. Please try again.");
    }
  };

  const handleDeleteRegistrationClick = (registration) => {
    setRegistrationToDelete(registration);
    setShowDeleteRegistrationModal(true);
  };

  const handleDeleteRegistration = async (deleteType) => {
    if (!registrationToDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministry/${registrationToDelete.id}/delete/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        if (deleteType === "both") {
          // Remove from both dashboard and main website
          setMinistryRegistrations(
            ministryRegistrations.filter(
              (reg) => reg.id !== registrationToDelete.id
            )
          );
          toast.success("Ministry registration permanently deleted!");
        } else {
          // Hide from dashboard only (soft delete)
          setMinistryRegistrations(
            ministryRegistrations.map((reg) =>
              reg.id === registrationToDelete.id
                ? { ...reg, dashboard_deleted: true }
                : reg
            )
          );
          toast.success("Ministry registration removed from dashboard!");
        }
        setShowDeleteRegistrationModal(false);
        setRegistrationToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting ministry registration:", error);
      toast.error("Failed to delete ministry registration. Please try again.");
    }
  };

  // Ministry management functions
  const handleAddMinistry = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    const errors = validateMinistryForm(newMinistry);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministries/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newMinistry.name,
            description: newMinistry.description,
            leader_name: newMinistry.leaderName,
            leader_phone: newMinistry.leaderPhone,
            color: newMinistry.color,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ministry) {
          setMinistries([...ministries, data.ministry]);
          setShowAddMinistryModal(false);
          setNewMinistry({
            name: "",
            description: "",
            leaderName: "",
            leaderPhone: "",
            color: "from-blue-500 to-teal-500",
          });
          setValidationErrors({});
          toast.success("Ministry added successfully!");
        } else {
          const message = data.error || "Failed to add ministry";
          setValidationErrors({ submit: message });
          toast.error(message);
          setTimeout(
            () => setValidationErrors((e) => ({ ...e, submit: "" })),
            5000
          );
        }
      } else {
        const errorData = await response.json();
        setValidationErrors({
          submit: errorData.message || "Failed to add ministry",
        });
        toast.error(errorData.message || "Failed to add ministry");
        setTimeout(
          () => setValidationErrors((e) => ({ ...e, submit: "" })),
          5000
        );
      }
    } catch (error) {
      console.error("Error adding ministry:", error);
      setValidationErrors({ submit: "Network error. Please try again." });
      toast.error("Network error. Please try again.");
      setTimeout(
        () => setValidationErrors((e) => ({ ...e, submit: "" })),
        5000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMinistry = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    const errors = validateMinistryForm(editingMinistry);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministries/${editingMinistry.id}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingMinistry.name,
            description: editingMinistry.description,
            leader_name: editingMinistry.leaderName,
            leader_phone: editingMinistry.leaderPhone,
            color: editingMinistry.color,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ministry) {
          setMinistries(
            ministries.map((ministry) =>
              ministry.id === editingMinistry.id ? data.ministry : ministry
            )
          );
          setEditingMinistry(null);
          setValidationErrors({});
          toast.success("Ministry updated successfully!");
        } else {
          const message = data.error || "Failed to update ministry";
          setValidationErrors({ submit: message });
          toast.error(message);
          setTimeout(
            () => setValidationErrors((e) => ({ ...e, submit: "" })),
            5000
          );
        }
      } else {
        const errorData = await response.json();
        setValidationErrors({
          submit: errorData.message || "Failed to update ministry",
        });
        toast.error(errorData.message || "Failed to update ministry");
        setTimeout(
          () => setValidationErrors((e) => ({ ...e, submit: "" })),
          5000
        );
      }
    } catch (error) {
      console.error("Error updating ministry:", error);
      setValidationErrors({ submit: "Network error. Please try again." });
      toast.error("Network error. Please try again.");
      setTimeout(
        () => setValidationErrors((e) => ({ ...e, submit: "" })),
        5000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMinistryClick = (ministry) => {
    setMinistryToDelete(ministry);
    setShowDeleteMinistryModal(true);
  };

  const handleDeleteMinistry = async (deleteType) => {
    if (!ministryToDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministries/${ministryToDelete.id}/delete/?type=${deleteType}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        if (deleteType === "both") {
          // Remove from both dashboard and main website
          setMinistries(
            ministries.filter((ministry) => ministry.id !== ministryToDelete.id)
          );
          toast.success("Ministry permanently deleted!");
        } else {
          // Hide from dashboard only (soft delete)
          setMinistries(
            ministries.map((ministry) =>
              ministry.id === ministryToDelete.id
                ? { ...ministry, dashboard_deleted: true }
                : ministry
            )
          );
          toast.success("Ministry removed from dashboard!");
        }
        setShowDeleteMinistryModal(false);
        setMinistryToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting ministry:", error);
      toast.error("Failed to delete ministry. Please try again.");
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    if (phone === "") {
      return true; // Empty is handled by required validation
    }

    // Check if it starts with +233 or 0
    if (!phone.startsWith("+233") && !phone.startsWith("0")) {
      return false;
    }

    // Check length (10 digits for 0 prefix, 13 for +233)
    if (phone.startsWith("0") && phone.length !== 10) {
      return false;
    }

    if (phone.startsWith("+233") && phone.length !== 13) {
      return false;
    }

    // Final validation with regex
    const phoneRegex = /^(\+233|0)\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time phone validation
  const validatePhoneRealTime = (phone) => {
    if (phone === "") {
      setPhoneError("");
      return;
    }

    // Check if it starts with +233 or 0
    if (!phone.startsWith("+233") && !phone.startsWith("0")) {
      setPhoneError("Please enter correct index (+233 or 0)");
      return;
    }

    // Check length (10 digits for 0 prefix, 13 for +233)
    if (phone.startsWith("0") && phone.length !== 10) {
      setPhoneError("Phone number should be 10 digits");
      return;
    }

    if (phone.startsWith("+233") && phone.length !== 13) {
      setPhoneError("Phone number with +233 should be 13 digits");
      return;
    }

    // If we get here, the phone number is valid
    setPhoneError("");
  };

  const validateMinistryForm = (ministry) => {
    const errors = {};

    if (!ministry.name.trim()) {
      errors.name = "Ministry name is required";
    }

    if (!ministry.description.trim()) {
      errors.description = "Description is required";
    }

    if (!ministry.leaderName.trim()) {
      errors.leaderName = "Leader name is required";
    }

    if (!ministry.leaderPhone.trim()) {
      errors.leaderPhone = "Phone number is required";
    } else if (!validatePhone(ministry.leaderPhone)) {
      errors.leaderPhone = "Please enter a valid Ghana phone number";
    }

    return errors;
  };

  const getMinistryIcon = (name) => {
    if (name.includes("Singers") || name.includes("Music"))
      return <Music className="w-6 h-6" />;
    if (name.includes("Media")) return <Video className="w-6 h-6" />;
    if (name.includes("Prayer") || name.includes("Evangelism"))
      return <Heart className="w-6 h-6" />;
    if (name.includes("Bible") || name.includes("Study"))
      return <BookIcon className="w-6 h-6" />;
    return <Users className="w-6 h-6" />;
  };

  return (
    <div className="space-y-8">
      {/* Ministry Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            Ministry Management
          </h2>
          <button
            onClick={() => setShowAddMinistryModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ministry</span>
          </button>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ministries.map((ministry) => (
            <motion.div
              key={ministry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
            >
              <div
                className={`h-32 bg-gradient-to-r ${ministry.color} flex items-center justify-center`}
              >
                <div className="text-white">
                  {getMinistryIcon(ministry.name)}
                </div>
              </div>
              <div className="p-4">
                <h3
                  className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 line-clamp-1`}
                >
                  {ministry.name}
                </h3>
                <p
                  className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-3 line-clamp-2`}
                >
                  {ministry.description}
                </p>
                <div
                  className={`space-y-1 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-4`}
                >
                  <p>
                    <span className="font-medium">Leader:</span>{" "}
                    {ministry.leaderName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {ministry.leaderPhone}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setEditingMinistry({
                        ...ministry,
                        leaderName:
                          ministry.leaderName ?? ministry.leader_name ?? "",
                        leaderPhone:
                          ministry.leaderPhone ?? ministry.leader_phone ?? "",
                        name: ministry.name ?? "",
                        description: ministry.description ?? "",
                        color: ministry.color ?? "from-blue-500 to-teal-500",
                      })
                    }
                    className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMinistryClick(ministry)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Registration Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            Ministry Registrations
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Registration</span>
          </button>
        </div>

        {/* Ministry Registrations Table */}
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border overflow-hidden`}
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
            <table className="w-full">
              <thead
                className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} text-center`}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Name
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Email
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Phone
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Congregation
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Ministry
                  </th>

                  <th
                    className={`px-6 py-3 text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider text-center`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"} text-center`}
              >
                {ministryRegistrations.map((registration) => (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div
                          className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {registration.name}
                        </div>
                        {registration.message && (
                          <div
                            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} truncate max-w-xs`}
                          >
                            {registration.message}
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {registration.email}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {registration.phone}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {registration.congregation}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {registration.ministry}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingRegistration(registration)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRegistrationClick(registration)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden overflow-x-auto">
            {!Array.isArray(ministryRegistrations) ? (
              <div className="text-center py-8">
                <BookOpen
                  className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mx-auto mb-4`}
                />
                <p
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  Loading ministry registrations...
                </p>
              </div>
            ) : ministryRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen
                  className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mx-auto mb-4`}
                />
                <p
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  No ministry registrations found. Add your first registration!
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4 overflow-x-auto">
                <div className="min-w-full">
                {ministryRegistrations.map((registration) => (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} rounded-lg p-4 border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {registration.name}
                      </h3>
                      <span className="text-sm font-semibold text-blue-600">
                        {registration.ministry}
                      </span>
                    </div>
                    <div
                      className={`space-y-1 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {registration.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {registration.phone}
                      </p>
                      <p>
                        <span className="font-medium">Congregation:</span>{" "}
                        {registration.congregation}
                      </p>

                      {registration.message && (
                        <p>
                          <span className="font-medium">Message:</span>{" "}
                          {registration.message}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setEditingRegistration(registration)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRegistrationClick(registration)
                        }
                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Registration Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Add Ministry Registration
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={newRegistration.name}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={newRegistration.email}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newRegistration.phone}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Congregation
                  </label>
                  <input
                    type="text"
                    value={newRegistration.congregation}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        congregation: e.target.value,
                      })
                    }
                    placeholder="e.g., Emmanuel Congregation Ahinsan"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Ministry of Interest
                  </label>
                  <select
                    value={newRegistration.ministry}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        ministry: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  >
                    <option value="">Select a ministry</option>
                    {ministries.map((m) => (
                      <option key={m.id ?? m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Additional Message (Optional)
                  </label>
                  <textarea
                    value={newRegistration.message}
                    onChange={(e) =>
                      setNewRegistration({
                        ...newRegistration,
                        message: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Any additional information or special requests..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRegistration}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Registration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Registration Modal */}
      <AnimatePresence>
        {editingRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Edit Ministry Registration
                </h3>
                <button
                  onClick={() => setEditingRegistration(null)}
                  className={`p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingRegistration.name}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingRegistration.email}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingRegistration.phone}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Congregation
                  </label>
                  <input
                    type="text"
                    value={editingRegistration.congregation || ""}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        congregation: e.target.value,
                      })
                    }
                    placeholder="e.g., Emmanuel Congregation Ahinsan"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Ministry of Interest
                  </label>
                  <select
                    value={editingRegistration.ministry}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        ministry: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  >
                    <option value="">Select a ministry</option>
                    {ministries.map((m) => (
                      <option key={m.id ?? m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingRegistration(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRegistration}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Registration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Ministry Modal */}
      <AnimatePresence>
        {showAddMinistryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Add Ministry
                </h3>
                <button
                  onClick={() => setShowAddMinistryModal(false)}
                  className={`p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ministry Name *
                  </label>
                  <input
                    type="text"
                    value={newMinistry.name}
                    onChange={(e) => {
                      setNewMinistry({ ...newMinistry, name: e.target.value });
                      if (validationErrors.name) {
                        setValidationErrors({ ...validationErrors, name: "" });
                      }
                    }}
                    placeholder="e.g., Y-Singers 🎤"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                      validationErrors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newMinistry.description}
                    onChange={(e) => {
                      setNewMinistry({
                        ...newMinistry,
                        description: e.target.value,
                      });
                      if (validationErrors.description) {
                        setValidationErrors({
                          ...validationErrors,
                          description: "",
                        });
                      }
                    }}
                    rows={3}
                    placeholder="Describe the ministry's purpose and activities..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                      validationErrors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.description}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Name *
                  </label>
                  <input
                    type="text"
                    value={newMinistry.leaderName}
                    onChange={(e) => {
                      setNewMinistry({
                        ...newMinistry,
                        leaderName: e.target.value,
                      });
                      if (validationErrors.leaderName) {
                        setValidationErrors({
                          ...validationErrors,
                          leaderName: "",
                        });
                      }
                    }}
                    placeholder="Enter leader's full name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                      validationErrors.leaderName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors.leaderName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.leaderName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newMinistry.leaderPhone}
                    onChange={(e) => {
                      setNewMinistry({
                        ...newMinistry,
                        leaderPhone: e.target.value,
                      });
                      validatePhoneRealTime(e.target.value);
                      if (validationErrors.leaderPhone) {
                        setValidationErrors({
                          ...validationErrors,
                          leaderPhone: "",
                        });
                      }
                    }}
                    placeholder=""
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                      phoneError || validationErrors.leaderPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {(phoneError || validationErrors.leaderPhone) && (
                    <p className="text-red-500 text-sm mt-1">
                      {phoneError || validationErrors.leaderPhone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={newMinistry.color}
                    onChange={(e) =>
                      setNewMinistry({ ...newMinistry, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="from-purple-500 to-pink-500">
                      Purple to Pink
                    </option>
                    <option value="from-amber-500 to-orange-500">
                      Amber to Orange
                    </option>
                    <option value="from-blue-500 to-teal-500">
                      Blue to Teal
                    </option>
                    <option value="from-green-500 to-emerald-500">
                      Green to Emerald
                    </option>
                    <option value="from-red-500 to-rose-500">
                      Red to Rose
                    </option>
                    <option value="from-indigo-500 to-purple-600">
                      Indigo to Purple
                    </option>
                    <option value="from-emerald-500 to-green-600">
                      Emerald to Green
                    </option>
                    <option value="from-orange-500 to-red-500">
                      Orange to Red
                    </option>
                  </select>
                </div>
              </div>

              {validationErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                  <p className="text-red-600 text-sm">
                    {validationErrors.submit}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddMinistryModal(false);
                    setValidationErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMinistry}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Ministry"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Ministry Modal */}
      <AnimatePresence>
        {editingMinistry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Edit Ministry
                </h3>
                <button
                  onClick={() => setEditingMinistry(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ministry Name
                  </label>
                  <input
                    type="text"
                    value={editingMinistry.name ?? ""}
                    onChange={(e) =>
                      setEditingMinistry({
                        ...editingMinistry,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Y-Singers 🎤"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingMinistry.description ?? ""}
                    onChange={(e) =>
                      setEditingMinistry({
                        ...editingMinistry,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe the ministry's purpose and activities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Name
                  </label>
                  <input
                    type="text"
                    value={editingMinistry.leaderName ?? ""}
                    onChange={(e) =>
                      setEditingMinistry({
                        ...editingMinistry,
                        leaderName: e.target.value,
                      })
                    }
                    placeholder="Enter leader's full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingMinistry.leaderPhone ?? ""}
                    onChange={(e) => {
                      setEditingMinistry({
                        ...editingMinistry,
                        leaderPhone: e.target.value,
                      });
                      validatePhoneRealTime(e.target.value);
                    }}
                    placeholder=""
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={editingMinistry.color ?? "from-blue-500 to-teal-500"}
                    onChange={(e) =>
                      setEditingMinistry({
                        ...editingMinistry,
                        color: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="from-purple-500 to-pink-500">
                      Purple to Pink
                    </option>
                    <option value="from-amber-500 to-orange-500">
                      Amber to Orange
                    </option>
                    <option value="from-blue-500 to-teal-500">
                      Blue to Teal
                    </option>
                    <option value="from-green-500 to-emerald-500">
                      Green to Emerald
                    </option>
                    <option value="from-red-500 to-rose-500">
                      Red to Rose
                    </option>
                    <option value="from-indigo-500 to-purple-600">
                      Indigo to Purple
                    </option>
                    <option value="from-emerald-500 to-green-600">
                      Emerald to Green
                    </option>
                    <option value="from-orange-500 to-red-500">
                      Orange to Red
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingMinistry(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMinistry}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Ministry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Ministry Confirmation Modal */}
      <AnimatePresence>
        {showDeleteMinistryModal && ministryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteMinistryModal(false);
                    setMinistryToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{ministryToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteMinistry("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Ministry will be hidden from admin but remain on main
                    website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteMinistry("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Ministry will be permanently deleted from dashboard and main
                    website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteMinistryModal(false);
                    setMinistryToDelete(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Registration Confirmation Modal */}
      <AnimatePresence>
        {showDeleteRegistrationModal && registrationToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 w-full max-w-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center gap-2`}
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteRegistrationModal(false);
                    setRegistrationToDelete(null);
                  }}
                  className={`p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                >
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{registrationToDelete.name}&rdquo;</strong>?
                </p>
                <p
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteRegistration("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Registration will be hidden from admin but remain on main
                    website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteRegistration("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Registration will be permanently deleted from dashboard and
                    main website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteRegistrationModal(false);
                    setRegistrationToDelete(null);
                  }}
                  className={`w-full px-4 py-2 border ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-lg transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinistryManagement;
