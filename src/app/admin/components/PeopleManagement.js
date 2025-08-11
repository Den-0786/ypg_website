/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

export default function PeopleManagement({
  activePeopleTab,
  teamMembers,
  testimonials,
  ministryRegistrations,
  setTeamMembers,
  setTestimonials,
  setMinistryRegistrations,
  theme,
}) {
  // Team state
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    phone: "",
    quote: "",
    image: null,
  });
  const [editingTeamMember, setEditingTeamMember] = useState(null);

  // Testimonials state
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    quote: "",
    highlight: "",
    image: null,
  });
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Ministry registration state
  const [showAddMinistryRegistration, setShowAddMinistryRegistration] =
    useState(false);
  const [newMinistryRegistration, setNewMinistryRegistration] = useState({
    name: "",
    phone: "",
    congregation: "",
    ministry: "",
  });
  const [editingMinistryRegistration, setEditingMinistryRegistration] =
    useState(null);

  // Delete modal states
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState(null);
  const [showDeleteTestimonialModal, setShowDeleteTestimonialModal] =
    useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [showDeleteRegistrationModal, setShowDeleteRegistrationModal] =
    useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);

  // Handle adding a new team member
  const handleAddTeamMember = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", newTeamMember.name);
      formData.append("role", newTeamMember.role);
      formData.append("phone", newTeamMember.phone);
      formData.append("quote", newTeamMember.quote);
      if (newTeamMember.image) {
        formData.append("image", newTeamMember.image);
      }

      const response = await fetch("/api/team", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTeamMembers((prev) => [...prev, data.teamMember]);
        setShowAddTeamMember(false);
        setNewTeamMember({
          name: "",
          role: "",
          phone: "",
          quote: "",
          image: null,
        });
      } else {
        console.error("Error adding team member:", data.error);
      }
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  // Handle updating a team member
  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("id", editingTeamMember.id);
      formData.append("name", newTeamMember.name);
      formData.append("role", newTeamMember.role);
      formData.append("phone", newTeamMember.phone);
      formData.append("quote", newTeamMember.quote);
      if (newTeamMember.image) {
        formData.append("image", newTeamMember.image);
      }

      const response = await fetch("/api/team", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === editingTeamMember.id ? data.teamMember : member
          )
        );
        setShowAddTeamMember(false);
        setNewTeamMember({
          name: "",
          role: "",
          phone: "",
          quote: "",
          image: null,
        });
        setEditingTeamMember(null);
      } else {
        console.error("Error updating team member:", data.error);
      }
    } catch (error) {
      console.error("Error updating team member:", error);
    }
  };

  // Handle deleting a team member
  const handleDeleteTeamMemberClick = (member) => {
    setTeamMemberToDelete(member);
    setShowDeleteTeamModal(true);
  };

  const handleDeleteTeamMember = async (deleteType) => {
    if (!teamMemberToDelete) return;

    try {
      const response = await fetch(
        `/api/team?id=${teamMemberToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        if (deleteType === "both") {
          setTeamMembers((prev) =>
            prev.filter((member) => member.id !== teamMemberToDelete.id)
          );
        } else {
          setTeamMembers((prev) =>
            prev.map((member) =>
              member.id === teamMemberToDelete.id
                ? { ...member, dashboard_deleted: true }
                : member
            )
          );
        }
        setShowDeleteTeamModal(false);
        setTeamMemberToDelete(null);
      } else {
        console.error("Error deleting team member:", data.error);
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  // Handle adding a new testimonial
  const handleAddTestimonial = (e) => {
    e.preventDefault();
    const newTestimonialWithId = {
      ...newTestimonial,
      id: Date.now(), // In a real app, this would come from the server
    };
    setTestimonials((prev) => [...prev, newTestimonialWithId]);
    setShowAddTestimonial(false);
    setNewTestimonial({
      name: "",
      role: "",
      quote: "",
      highlight: "",
      image: null,
    });
  };

  // Handle updating a testimonial
  const handleUpdateTestimonial = (e) => {
    e.preventDefault();
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === editingTestimonial.id
          ? { ...newTestimonial, id: editingTestimonial.id }
          : t
      )
    );
    setShowAddTestimonial(false);
    setNewTestimonial({
      name: "",
      role: "",
      quote: "",
      highlight: "",
      image: null,
    });
    setEditingTestimonial(null);
  };

  // Handle deleting a testimonial
  const handleDeleteTestimonialClick = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setShowDeleteTestimonialModal(true);
  };

  const handleDeleteTestimonial = async (deleteType) => {
    if (!testimonialToDelete) return;

    try {
      const response = await fetch(
        `/api/testimonials?id=${testimonialToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          setTestimonials((prev) =>
            prev.filter((t) => t.id !== testimonialToDelete.id)
          );
        } else {
          setTestimonials((prev) =>
            prev.map((t) =>
              t.id === testimonialToDelete.id
                ? { ...t, dashboard_deleted: true }
                : t
            )
          );
        }
        setShowDeleteTestimonialModal(false);
        setTestimonialToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  // Handle adding a new ministry registration
  const handleAddMinistryRegistration = (e) => {
    e.preventDefault();
    const newRegistrationWithId = {
      ...newMinistryRegistration,
      id: Date.now(), // In a real app, this would come from the server
      submittedAt: new Date().toISOString(),
    };
    setMinistryRegistrations((prev) => [...prev, newRegistrationWithId]);
    setShowAddMinistryRegistration(false);
    setNewMinistryRegistration({
      name: "",
      phone: "",
      congregation: "",
      ministry: "",
    });
  };

  // Handle updating a ministry registration
  const handleUpdateMinistryRegistration = (e) => {
    e.preventDefault();
    setMinistryRegistrations((prev) =>
      prev.map((r) =>
        r.id === editingMinistryRegistration.id
          ? { ...newMinistryRegistration, id: editingMinistryRegistration.id }
          : r
      )
    );
    setShowAddMinistryRegistration(false);
    setNewMinistryRegistration({
      name: "",
      phone: "",
      congregation: "",
      ministry: "",
    });
    setEditingMinistryRegistration(null);
  };

  // Handle deleting a ministry registration
  const handleDeleteMinistryRegistrationClick = (registration) => {
    setRegistrationToDelete(registration);
    setShowDeleteRegistrationModal(true);
  };

  const handleDeleteMinistryRegistration = async (deleteType) => {
    if (!registrationToDelete) return;

    try {
      const response = await fetch(
        `/api/ministry?id=${registrationToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          setMinistryRegistrations((prev) =>
            prev.filter((r) => r.id !== registrationToDelete.id)
          );
        } else {
          setMinistryRegistrations((prev) =>
            prev.map((r) =>
              r.id === registrationToDelete.id
                ? { ...r, dashboard_deleted: true }
                : r
            )
          );
        }
        setShowDeleteRegistrationModal(false);
        setRegistrationToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting ministry registration:", error);
    }
  };

  if (activePeopleTab === "team") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Team Management
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setEditingTeamMember(null);
              setNewTeamMember({
                name: "",
                role: "",
                phone: "",
                quote: "",
                image: null,
              });
              setShowAddTeamMember(true);
            }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Team Member
          </button>
        </div>

        {/* Add Team Member Modal */}
        <Transition.Root show={showAddTeamMember} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={setShowAddTeamMember}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      {editingTeamMember
                        ? "Edit Team Member"
                        : "Add Team Member"}
                    </Dialog.Title>
                    <form
                      onSubmit={
                        editingTeamMember
                          ? handleUpdateTeamMember
                          : handleAddTeamMember
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTeamMember.name}
                          onChange={(e) =>
                            setNewTeamMember({
                              ...newTeamMember,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role/Position
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTeamMember.role}
                          onChange={(e) =>
                            setNewTeamMember({
                              ...newTeamMember,
                              role: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTeamMember.phone}
                          onChange={(e) =>
                            setNewTeamMember({
                              ...newTeamMember,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quote
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={3}
                          value={newTeamMember.quote}
                          onChange={(e) =>
                            setNewTeamMember({
                              ...newTeamMember,
                              quote: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Image
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                            <Users className="w-4 h-4 text-blue-400" />
                            {newTeamMember.image ? (
                              <span>
                                {typeof newTeamMember.image === "string"
                                  ? newTeamMember.image
                                  : newTeamMember.image.name}
                              </span>
                            ) : (
                              <span>No file chosen</span>
                            )}
                          </div>
                          <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setNewTeamMember({
                                  ...newTeamMember,
                                  image: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddTeamMember(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          {editingTeamMember ? "Update" : "Add"} Team Member
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Team Members Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your team by adding the first team member. They
                will appear here once added.
              </p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingTeamMember(null);
                  setNewTeamMember({
                    name: "",
                    role: "",
                    phone: "",
                    quote: "",
                    image: null,
                  });
                  setShowAddTeamMember(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Team Member
              </button>
            </div>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
              >
                <div
                  className={`aspect-square ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users
                      className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {member.name}
                  </h3>
                  <p
                    className={`${theme === "dark" ? "text-blue-400" : "text-blue-600"} font-medium mb-2`}
                  >
                    {member.role}
                  </p>
                  {member.phone && (
                    <p
                      className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Phone: {member.phone}
                    </p>
                  )}
                  {member.quote && (
                    <p
                      className={`text-sm italic line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      &quot;{member.quote}&quot;
                    </p>
                  )}
                  <div className="flex space-x-2 mt-3">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setEditingTeamMember(member);
                        setNewTeamMember({
                          name: member.name,
                          role: member.role,
                          phone: member.phone || "",
                          quote: member.quote || "",
                          image: member.image || null,
                        });
                        setShowAddTeamMember(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteTeamMemberClick(member)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  if (activePeopleTab === "testimonials") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Testimonial Management
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setEditingTestimonial(null);
              setNewTestimonial({
                name: "",
                role: "",
                quote: "",
                highlight: "",
                image: null,
              });
              setShowAddTestimonial(true);
            }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Testimonial
          </button>
        </div>

        {/* Add Testimonial Modal */}
        <Transition.Root show={showAddTestimonial} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={setShowAddTestimonial}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      {editingTestimonial
                        ? "Edit Testimonial"
                        : "Add Testimonial"}
                    </Dialog.Title>
                    <form
                      onSubmit={
                        editingTestimonial
                          ? handleUpdateTestimonial
                          : handleAddTestimonial
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTestimonial.name}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role/Congregation
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTestimonial.role}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              role: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Testimonial Quote
                        </label>
                        <textarea
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={4}
                          value={newTestimonial.quote}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              quote: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Highlighted Phrase
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newTestimonial.highlight}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              highlight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Image (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            {newTestimonial.image ? (
                              <span>
                                {typeof newTestimonial.image === "string"
                                  ? newTestimonial.image
                                  : newTestimonial.image.name}
                              </span>
                            ) : (
                              <span>No file chosen</span>
                            )}
                          </div>
                          <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setNewTestimonial({
                                  ...newTestimonial,
                                  image: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddTestimonial(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          {editingTestimonial ? "Update" : "Add"} Testimonial
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.length === 0 ? (
            <div className="text-center py-12 col-span-full">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Testimonials Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start collecting testimonials from your youth members. Their
                stories can inspire others to join your community.
              </p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingTestimonial(null);
                  setNewTestimonial({
                    name: "",
                    role: "",
                    quote: "",
                    highlight: "",
                    image: null,
                  });
                  setShowAddTestimonial(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Testimonial
              </button>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    {testimonial.image ? (
                      <img
                        src={
                          typeof testimonial.image === "string"
                            ? testimonial.image
                            : URL.createObjectURL(testimonial.image)
                        }
                        alt={testimonial.name}
                        className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm italic line-clamp-3">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <p className="text-blue-600 font-medium text-sm mt-2">
                      &quot;{testimonial.highlight}&quot;
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setEditingTestimonial(testimonial);
                        setNewTestimonial({
                          name: testimonial.name,
                          role: testimonial.role,
                          quote: testimonial.quote,
                          highlight: testimonial.highlight,
                          image: testimonial.image || null,
                        });
                        setShowAddTestimonial(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteTestimonialClick(testimonial)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  if (activePeopleTab === "ministry-registrations") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Ministry Registrations
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setEditingMinistryRegistration(null);
              setNewMinistryRegistration({
                name: "",
                phone: "",
                congregation: "",
                ministry: "",
              });
              setShowAddMinistryRegistration(true);
            }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Registration
          </button>
        </div>

        {/* Add Ministry Registration Modal */}
        <Transition.Root show={showAddMinistryRegistration} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={setShowAddMinistryRegistration}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      {editingMinistryRegistration
                        ? "Edit Ministry Registration"
                        : "Add Ministry Registration"}
                    </Dialog.Title>
                    <form
                      onSubmit={
                        editingMinistryRegistration
                          ? handleUpdateMinistryRegistration
                          : handleAddMinistryRegistration
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMinistryRegistration.name}
                          onChange={(e) =>
                            setNewMinistryRegistration({
                              ...newMinistryRegistration,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMinistryRegistration.phone}
                          onChange={(e) =>
                            setNewMinistryRegistration({
                              ...newMinistryRegistration,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Congregation
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMinistryRegistration.congregation}
                          onChange={(e) =>
                            setNewMinistryRegistration({
                              ...newMinistryRegistration,
                              congregation: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ministry of Interest
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMinistryRegistration.ministry}
                          onChange={(e) =>
                            setNewMinistryRegistration({
                              ...newMinistryRegistration,
                              ministry: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddMinistryRegistration(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          {editingMinistryRegistration ? "Update" : "Add"}{" "}
                          Registration
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Ministry Registrations Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Congregation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ministry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ministryRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.congregation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.ministry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setEditingMinistryRegistration(registration);
                          setNewMinistryRegistration({
                            name: registration.name,
                            phone: registration.phone,
                            congregation: registration.congregation,
                            ministry: registration.ministry,
                          });
                          setShowAddMinistryRegistration(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() =>
                          handleDeleteMinistryRegistrationClick(registration)
                        }
                      >
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
    );
  }

  return (
    <>
      {/* Delete Team Member Confirmation Modal */}
      <AnimatePresence>
        {showDeleteTeamModal && teamMemberToDelete && (
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
                    setShowDeleteTeamModal(false);
                    setTeamMemberToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{teamMemberToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteTeamMember("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Team member will be hidden from admin but remain on main
                    website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteTeamMember("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Team member will be permanently deleted from dashboard and
                    main website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteTeamModal(false);
                    setTeamMemberToDelete(null);
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

      {/* Delete Testimonial Confirmation Modal */}
      <AnimatePresence>
        {showDeleteTestimonialModal && testimonialToDelete && (
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
                    setShowDeleteTestimonialModal(false);
                    setTestimonialToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{testimonialToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteTestimonial("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Testimonial will be hidden from admin but remain on main
                    website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteTestimonial("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Testimonial will be permanently deleted from dashboard and
                    main website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteTestimonialModal(false);
                    setTestimonialToDelete(null);
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
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteRegistrationModal(false);
                    setRegistrationToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{registrationToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteMinistryRegistration("dashboard")}
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
                  onClick={() => handleDeleteMinistryRegistration("both")}
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
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
