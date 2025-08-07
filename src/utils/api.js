// API Configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Generic API request function with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
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
      error: error.message || 'Network error occurred' 
    };
  }
};

// Quiz API functions
export const quizAPI = {
  // Get all quizzes
  getQuizzes: () => apiRequest('/api/quizzes/'),
  
  // Get active quiz
  getActiveQuiz: () => apiRequest('/api/quizzes/active/'),
  
  // Get quiz results
  getQuizResults: () => apiRequest('/api/quizzes/results/'),
  
  // Submit quiz answer
  submitQuiz: (quizData) => apiRequest('/api/quizzes/submit/', {
    method: 'POST',
    body: JSON.stringify(quizData),
  }),
  
  // Get specific quiz questions
  getQuizQuestions: (quizId) => apiRequest(`/api/quizzes/${quizId}/questions/`),
  
  // Get quiz result by ID
  getQuizResult: (resultId) => apiRequest(`/api/quiz-result/${resultId}/`),
};

// Contact API functions
export const contactAPI = {
  submitContact: (contactData) => apiRequest('/api/contact/', {
    method: 'POST',
    body: JSON.stringify(contactData),
  }),
};

// Donation API functions
export const donationAPI = {
  submitDonation: (donationData) => apiRequest('/api/donations/', {
    method: 'POST',
    body: JSON.stringify(donationData),
  }),
};

// Ministry API functions
export const ministryAPI = {
  submitMinistryRegistration: (ministryData) => apiRequest('/api/ministry/register/', {
    method: 'POST',
    body: JSON.stringify(ministryData),
  }),
};

export default apiRequest;
