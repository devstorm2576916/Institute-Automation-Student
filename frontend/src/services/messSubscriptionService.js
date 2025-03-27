import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createSubscriptionRequest = async (studentId, newPlan) => {
  try {
    const response = await axios.post(`${API_URL}/subscription-request`, {
      studentId,
      newPlan
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const processSubscriptionRequest = async (requestId, status, rejectionReason = '') => {
  try {
    const response = await axios.put(`${API_URL}/process-request`, {
      requestId,
      status,
      rejectionReason
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getSubscriptionRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscription-requests`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};