// API Configuration and utility functions
import { getApiBaseUrl } from "./config.js";

const API_BASE_URL = getApiBaseUrl();

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

// Quiz API functions - These connect to the YPG Database backend (hosted)
const QUIZ_API_BASE_URL = "https://ypg-database-system.onrender.com";

export const quizAPI = {
  // Get all quizzes from YPG Database system
  getQuizzes: () => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/`;
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Get active quiz from YPG Database system
  getActiveQuiz: () => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/active/`;
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Get quiz results from YPG Database system
  getQuizResults: () => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/results/`;
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Submit quiz answer to YPG Database system
  submitQuiz: (quizData) => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/submit/`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Get specific quiz questions from YPG Database system
  getQuizQuestions: (quizId) => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/${quizId}/questions/`;
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Get congregation quiz statistics and leaderboard from YPG Database system
  getCongregationStats: () => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/congregation-stats/`;
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },

  // Cleanup expired quizzes on YPG Database system
  cleanupExpiredQuizzes: () => {
    const url = `${QUIZ_API_BASE_URL}/api/quizzes/cleanup/`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error: error.message }));
  },
};

// Contact API functions
export const contactAPI = {
  submitContact: (contactData) =>
    fetch(`${API_BASE_URL}/api/contact/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  getMessages: (status = null) =>
    fetch(`${API_BASE_URL}/api/contact${status ? `?status=${status}` : ""}`)
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  updateMessage: (id, updateData) =>
    fetch(`${API_BASE_URL}/api/contact`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updateData }),
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),

  deleteMessage: (id) =>
    fetch(`${API_BASE_URL}/api/contact?id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .catch((error) => ({ success: false, error: error.message })),
};

// Donation API functions
export const donationAPI = {
  submitDonation: (donationData) =>
    fetch("http://localhost:8002/api/donations", {
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
    fetch("http://localhost:8002/api/ministry", {
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
    fetch(`${API_BASE_URL}/api/ystore/?forWebsite=true`)
      .then((res) => res.json())
      .then((data) => ({ success: data.success, data }))
      .catch((error) => ({ success: false, error: error.message })),

  // Get all items for admin dashboard
  getAdminItems: () =>
    fetch(`${API_BASE_URL}/api/ystore/`)
      .then((res) => res.json())
      .then((data) => ({ success: data.success, data }))
      .catch((error) => ({ success: false, error: error.message })),

  // Create new item
  createItem: (itemData) =>
    fetch(`${API_BASE_URL}/api/ystore/`, {
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
    fetch(`${API_BASE_URL}/api/ystore/`, {
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
        `${API_BASE_URL}/api/ystore?id=${itemId}&type=${deleteType}`,
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
      const response = await fetch(
        `http://localhost:8002/branch-presidents/?active=true`
      );
      const data = await response.json();
      return data.success ? data.presidents : [];
    } catch (error) {
      console.error("Error fetching branch presidents:", error);
      throw error;
    }
  },

  getAdminPresidents: async () => {
    try {
      const response = await fetch(
        `http://localhost:8002/branch-presidents/admin/`
      );
      const data = await response.json();
      return data.success ? data.presidents : [];
    } catch (error) {
      console.error("Error fetching admin branch presidents:", error);
      throw error;
    }
  },

  createPresident: async (data) => {
    try {
      const response = await fetch(
        `http://localhost:8002/branch-presidents/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error creating branch president:", error);
      throw error;
    }
  },

  updatePresident: async (presidentId, data) => {
    try {
      const response = await fetch(
        `http://localhost:8002/branch-presidents/${presidentId}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating branch president:", error);
      throw error;
    }
  },

  deletePresident: async (presidentId) => {
    try {
      const response = await fetch(
        `http://localhost:8002/branch-presidents/${presidentId}/delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error deleting branch president:", error);
      throw error;
    }
  },
};

export default apiRequest;
