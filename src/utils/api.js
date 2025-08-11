// API Configuration and utility functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Generic API request function with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
};

// Quiz API functions - These connect to your external database management system
export const quizAPI = {
  // Get all quizzes from external system
  getQuizzes: () => apiRequest("/api/quizzes/"),

  // Get active quiz from external system
  getActiveQuiz: () => apiRequest("/api/quizzes/active/"),

  // Get quiz results from external system
  getQuizResults: () => apiRequest("/api/quizzes/results/"),

  // Submit quiz answer to external system
  submitQuiz: (quizData) =>
    apiRequest("/api/quizzes/submit/", {
      method: "POST",
      body: JSON.stringify(quizData),
    }),

  // Get specific quiz questions from external system
  getQuizQuestions: (quizId) => apiRequest(`/api/quizzes/${quizId}/questions/`),

  // Get congregation quiz statistics and leaderboard from external system
  getCongregationStats: () => apiRequest("/api/quizzes/congregation-stats/"),

  // Cleanup expired quizzes on external system
  cleanupExpiredQuizzes: () =>
    apiRequest("/api/quizzes/cleanup/", {
      method: "POST",
    }),
};

// Contact API functions
export const contactAPI = {
  submitContact: (contactData) =>
    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  getMessages: (status = null) =>
    fetch(`/api/contact${status ? `?status=${status}` : ""}`)
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  updateMessage: (id, updateData) =>
    fetch("/api/contact", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updateData }),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  deleteMessage: (id) =>
    fetch(`/api/contact?id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),
};

// Donation API functions
export const donationAPI = {
  submitDonation: (donationData) =>
    fetch("/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(donationData),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),
};

// Ministry API functions
export const ministryAPI = {
  submitMinistryRegistration: (ministryData) =>
    fetch("/api/ministry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ministryData),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),
};

// Y-Store API functions
export const ystoreAPI = {
  // Get all active items for main website
  getItems: () =>
    fetch("/api/ystore?forWebsite=true")
      .then((res) => res.json())
      .then((data) => ({ success: data.success, data }))
      .catch((error) => ({ success: false, error: error.message })),

  // Get all items for admin dashboard
  getAdminItems: () =>
    fetch("/api/ystore")
      .then((res) => res.json())
      .then((data) => ({ success: data.success, data }))
      .catch((error) => ({ success: false, error: error.message })),

  // Create new item
  createItem: (itemData) =>
    fetch("/api/ystore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  // Update item
  updateItem: (itemId, itemData) =>
    fetch("/api/ystore", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: itemId, ...itemData }),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  // Delete item
  deleteItem: async (itemId, deleteType = "soft") => {
    try {
      const response = await fetch(
        `/api/ystore?id=${itemId}&type=${deleteType}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error deleting Y-Store item:", error);
      return { success: false, error: error.message };
    }
  },
};

// Branch President API
export const branchPresidentAPI = {
  getPresidents: async () => {
    try {
      const response = await fetch(`/api/branch-presidents?active=true`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching branch presidents:", error);
      throw error;
    }
  },

  getAdminPresidents: async () => {
    try {
      const response = await fetch(`/api/branch-presidents`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching admin branch presidents:", error);
      throw error;
    }
  },

  createPresident: async (data) => {
    try {
      const response = await fetch(`/api/branch-presidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating branch president:", error);
      throw error;
    }
  },

  updatePresident: async (presidentId, data) => {
    try {
      const response = await fetch(`/api/branch-presidents?id=${presidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating branch president:", error);
      throw error;
    }
  },

  deletePresident: async (presidentId) => {
    try {
      const response = await fetch(`/api/branch-presidents?id=${presidentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting branch president:", error);
      throw error;
    }
  },
};

export default apiRequest;
