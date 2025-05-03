import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Trains API
export const trainsApi = {
  getAllTrains: () => api.get('/trains'),
  getTrainById: (id: string) => api.get(`/trains/${id}`),
  searchTrains: (sourceId: string, destinationId: string) => 
    api.get(`/trains/search?sourceId=${sourceId}&destinationId=${destinationId}`),
  addTrain: (trainData: any) => api.post('/trains', trainData),
  updateTrain: (id: string, trainData: any) => api.put(`/trains/${id}`, trainData),
  deleteTrain: (id: string) => api.delete(`/trains/${id}`)
};

// Stations API
export const stationsApi = {
  getAllStations: () => api.get('/stations'),
  getStationById: (id: string) => api.get(`/stations/${id}`),
  addStation: (name: string) => api.post(`/stations?name=${name}`)
};

// Bookings API
export const bookingsApi = {
  createBooking: (bookingData: any) => api.post('/bookings', bookingData),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  processPayment: (paymentData: any) => api.post('/bookings/payment', paymentData),
  cancelBooking: (id: string) => api.post(`/bookings/${id}/cancel`),
  getBookingsByTrain: (trainId: string) => api.get(`/bookings/train/${trainId}`)
};

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      // In a real app, we would store and use an actual JWT token
      // For now, we'll just demonstrate the concept
      config.headers['Authorization'] = `Bearer user-is-authenticated`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;