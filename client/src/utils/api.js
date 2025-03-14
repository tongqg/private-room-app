import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Set auth token for requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Room API functions
export const roomAPI = {
  // Create a new room
  createRoom: async (name, displayName) => {
    const response = await api.post('/rooms', { name, displayName });
    return response.data;
  },
  
  // Get room details
  getRoomDetails: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },
  
  // Join a room with access code
  joinRoom: async (accessCode, displayName) => {
    const response = await api.post('/rooms/join', { accessCode, displayName });
    return response.data;
  },
  
  // Close a room (admin only)
  closeRoom: async (roomId) => {
    const response = await api.put(`/rooms/${roomId}/close`);
    return response.data;
  },
  
  // Get room messages
  getRoomMessages: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/messages`);
    return response.data;
  }
};

export default api;