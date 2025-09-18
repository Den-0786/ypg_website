import { useState } from "react";
import { Users, Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const TeamManagement = ({ teamMembers = [], setTeamMembers, theme }) => {
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    congregation: "",
    quote: "",
    image: null,
  });

  const [editingMember, setEditingMember] = useState({
    id: null,
    name: "",
    position: "",
    congregation: "",
    quote: "",
    image: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", newMember.name);
      formData.append("position", newMember.position);
      formData.append("congregation", newMember.congregation);
      formData.append("quote", newMember.quote);
      if (newMember.image) {
        formData.append("image", newMember.image);
      }

      const response = await fetch("http://localhost:8002/api/team/create/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTeamMembers([...teamMembers, data.member]);
        setNewMember({
          name: "",
          position: "",
          congregation: "",
          quote: "",
          image: null,
        });
        setIsModalOpen(false);
        toast.success("District executive added successfully!");

        // Dispatch custom event to refresh main website
        window.dispatchEvent(new CustomEvent("refreshTeamMembers"));
      } else {
        setError(data.error || "Failed to add district executive");
        toast.error(data.error || "Failed to add district executive");
      }
    } catch (error) {
      setError("An error occurred while adding district executive");
      toast.error("An error occurred while adding district executive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", editingMember.name);
      formData.append("position", editingMember.position);
      formData.append("congregation", editingMember.congregation);
      formData.append("quote", editingMember.quote);
      if (editingMember.image) {
        formData.append("image", editingMember.image);
      }

      const response = await fetch(
        `http://localhost:8002/api/team/${editingMember.id}/update/`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setTeamMembers(
          teamMembers.map((member) =>
            member.id === editingMember.id ? data.member : member
          )
        );
        setEditingMember({
          id: null,
          name: "",
          position: "",
          congregation: "",
          quote: "",
          image: null,
        });
        setIsEditModalOpen(false);
        toast.success("District executive updated successfully!");

        // Dispatch custom event to refresh main website
        window.dispatchEvent(new CustomEvent("refreshTeamMembers"));
      } else {
        setError(data.error || "Failed to update district executive");
        toast.error(data.error || "Failed to update district executive");
      }
    } catch (error) {
      setError("An error occurred while updating district executive");
      toast.error("An error occurred while updating district executive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this district executive?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:8002/api/team/${id}/delete/`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (data.success) {
          setTeamMembers(teamMembers.filter((member) => member.id !== id));
          toast.success("District executive deleted successfully!");
        } else {
          toast.error(data.error || "Failed to delete district executive");
        }
      } catch (error) {
        toast.error("An error occurred while deleting district executive");
      }
    }
  };

  const openEditModal = (member) => {
    setEditingMember({
      id: member.id,
      name: member.name,
      position: member.position,
      congregation: member.congregation || "",
      quote: member.quote || "",
      image: null,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className={`p-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Executive Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Add District Executive
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className={`p-6 rounded-lg shadow-lg transition-all hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={
                  member.image
                    ? `http://localhost:8002${member.image}`
                    : "/placeholder-team.jpg"
                }
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p
                  className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                >
                  {member.position}
                </p>
                {member.congregation && (
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {member.congregation}
                  </p>
                )}
              </div>
            </div>

            {member.quote && (
              <p
                className={`text-sm mb-4 italic ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                "{member.quote}"
              </p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(member)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div
          className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
        >
          <p className="text-lg">No district executives found.</p>
          <p className="text-sm mt-2">
            Add your first district executive to get started.
          </p>
        </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Add District Executive</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newMember.position}
                    onChange={(e) =>
                      setNewMember({ ...newMember, position: e.target.value })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Congregation
                  </label>
                  <input
                    type="text"
                    value={newMember.congregation}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        congregation: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Favorite Quote
                  </label>
                  <textarea
                    value={newMember.quote}
                    onChange={(e) =>
                      setNewMember({ ...newMember, quote: e.target.value })
                    }
                    rows="3"
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    placeholder="Enter their favorite quote or motto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewMember({ ...newMember, image: e.target.files[0] })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isLoading ? "Adding..." : "Add Executive"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Edit District Executive</h3>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        name: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={editingMember.position}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        position: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Congregation
                  </label>
                  <input
                    type="text"
                    value={editingMember.congregation}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        congregation: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Favorite Quote
                  </label>
                  <textarea
                    value={editingMember.quote}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        quote: e.target.value,
                      })
                    }
                    rows="3"
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                    placeholder="Enter their favorite quote or motto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        image: e.target.files[0],
                      })
                    }
                    className={`w-full p-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isLoading ? "Updating..." : "Update Executive"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
