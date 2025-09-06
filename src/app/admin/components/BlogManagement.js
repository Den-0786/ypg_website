import { useState } from "react";
import { FileText, Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const BlogManagement = ({ blogPosts = [], setBlogPosts, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    image: null,
  });

  const handleAddPost = async () => {
    try {
      let response;

      if (newPost.image) {
        // If there's an image, use FormData
        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("content", newPost.content);
        formData.append("excerpt", newPost.excerpt);
        formData.append("author", newPost.author);
        formData.append("category", newPost.category);
        formData.append("date", newPost.date);
        formData.append("image", newPost.image);

        response = await fetch("http://localhost:8002/api/blog", {
          method: "POST",
          body: formData,
        });
      } else {
        // If no image, use JSON
        response = await fetch("http://localhost:8002/api/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newPost.title,
            content: newPost.content,
            excerpt: newPost.excerpt,
            author: newPost.author,
            category: newPost.category,
            date: newPost.date,
          }),
        });
      }

      if (response.ok) {
        const addedPost = await response.json();
        setBlogPosts([...blogPosts, addedPost.blogPost]);
        setShowAddModal(false);
        setNewPost({
          title: "",
          content: "",
          excerpt: "",
          author: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          image: null,
        });
        toast.success("Blog post added successfully!");
      }
    } catch (error) {
      console.error("Error adding blog post:", error);
      toast.error("Failed to add blog post. Please try again.");
    }
  };

  const handleUpdatePost = async () => {
    try {
      let response;

      if (editingPost.image) {
        // If there's an image, use FormData
        const formData = new FormData();
        formData.append("title", editingPost.title);
        formData.append("content", editingPost.content);
        formData.append("excerpt", editingPost.excerpt);
        formData.append("author", editingPost.author);
        formData.append("category", editingPost.category);
        formData.append("date", editingPost.date);
        formData.append("image", editingPost.image);

        response = await fetch(`http://localhost:8002/api/blog?id=${editingPost.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // If no image, use JSON
        response = await fetch(`http://localhost:8002/api/blog?id=${editingPost.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingPost.title,
            content: editingPost.content,
            excerpt: editingPost.excerpt,
            author: editingPost.author,
            category: editingPost.category,
            date: editingPost.date,
          }),
        });
      }

      if (response.ok) {
        const updatedPost = await response.json();
        setBlogPosts(
          blogPosts.map((post) =>
            post.id === editingPost.id ? updatedPost.blogPost : post
          )
        );
        setEditingPost(null);
        toast.success("Blog post updated successfully!");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update blog post. Please try again.");
    }
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async (deleteType) => {
    if (!postToDelete) return;

    try {
      const response = await fetch(
        `/api/blog?id=${postToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          // Remove from both dashboard and main website
          setBlogPosts(blogPosts.filter((post) => post.id !== postToDelete.id));
          toast.success("Blog post permanently deleted!");
        } else {
          // Hide from dashboard only (soft delete)
          setBlogPosts(
            blogPosts.map((post) =>
              post.id === postToDelete.id
                ? { ...post, dashboard_deleted: true }
                : post
            )
          );
          toast.success("Blog post removed from dashboard!");
        }
        setShowDeleteModal(false);
        setPostToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete blog post. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Blog Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Post</span>
        </button>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
          >
            <div
              className={`h-64 ${theme === "dark" ? "bg-gradient-to-r from-blue-600 to-purple-700" : "bg-gradient-to-r from-blue-500 to-purple-600"} flex items-center justify-center`}
            >
              <FileText className="w-12 h-12 text-white" />
            </div>
            <div className="p-6">
              <h3
                className={`font-semibold mb-2 line-clamp-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {post.title}
              </h3>
              <p
                className={`text-sm mb-3 line-clamp-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {post.content}
              </p>
              <div
                className={`space-y-1 text-xs mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                <p>✍️ {post.author}</p>
                <p>📂 {post.category}</p>
                <p>📅 {post.date}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPost(post)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(post)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-red-900/30 text-red-300 hover:bg-red-800/40" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Post Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 border max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Add Blog Post
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Content
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Excerpt *
                  </label>
                  <textarea
                    value={newPost.excerpt}
                    onChange={(e) =>
                      setNewPost({ ...newPost, excerpt: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter a short excerpt for the blog post"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      value={newPost.author}
                      onChange={(e) =>
                        setNewPost({ ...newPost, author: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      value={newPost.category}
                      onChange={(e) =>
                        setNewPost({ ...newPost, category: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(e) =>
                      setNewPost({ ...newPost, date: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {newPost.image ? (
                        <div className="text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}
                          >
                            <svg
                              className={`w-3 h-3 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p
                            className={`text-xs truncate px-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {newPost.image.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p
                            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            No media
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right side - Upload button */}
                    <div className="flex-1">
                      <label
                        className={`h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20" : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"}`}
                      >
                        <svg
                          className={`w-4 h-4 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span
                          className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Upload
                        </span>
                        <input
                          type="file"
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              image: e.target.files[0],
                            })
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPost}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 border max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Edit Blog Post
                </h3>
                <button
                  onClick={() => setEditingPost(null)}
                  className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Content
                  </label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        content: e.target.value,
                      })
                    }
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      value={editingPost.author}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingPost.category}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          category: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {editingPost.image ? (
                        <div className="text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}
                          >
                            <svg
                              className={`w-3 h-3 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p
                            className={`text-xs truncate px-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {editingPost.image.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p
                            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            No media
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right side - Upload button */}
                    <div className="flex-1">
                      <label
                        className={`h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20" : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"}`}
                      >
                        <svg
                          className={`w-4 h-4 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span
                          className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Upload
                        </span>
                        <input
                          type="file"
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              image: e.target.files[0],
                            })
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setEditingPost(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Update Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && postToDelete && (
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
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{postToDelete.title}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeletePost("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Post will be hidden from admin but remain on main website
                  </div>
                </button>

                <button
                  onClick={() => handleDeletePost("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Post will be permanently deleted from dashboard and main
                    website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
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
    </div>
  );
};

export default BlogManagement;
