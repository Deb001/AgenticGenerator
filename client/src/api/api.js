import axios from 'axios';

/**
 * Creates and returns a pre‑configured Axios instance.
 * The instance includes the base URL for the API and automatically
 * injects the JWT token from localStorage into the Authorization header.
 *
 * @returns {import('axios').AxiosInstance}
 */
function apiClient() {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add Authorization header if a token exists.
  instance.interceptors.request.use(
    (config) => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // localStorage may be unavailable (e.g., during SSR); ignore silently.
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}

/**
 * Retrieves schedules from the back‑end.
 *
 * @param {object} [params] - Optional query parameters (e.g., pagination, filters).
 * @returns {Promise<any>} Axios response promise.
 */
function getSchedules(params = {}) {
  return apiClient().get('/schedules', { params });
}

/**
 * Creates a new schedule.
 *
 * @param {object} data - The schedule payload to send to the server.
 * @returns {Promise<any>} Axios response promise.
 */
function createSchedule(data) {
  return apiClient().post('/schedules', data);
}

/**
 * Deletes a schedule by its identifier.
 *
 * @param {string|number} id - The unique identifier of the schedule to delete.
 * @returns {Promise<any>} Axios response promise.
 */
function deleteSchedule(id) {
  return apiClient().delete(`/schedules/${id}`);
}

export { apiClient, getSchedules, createSchedule, deleteSchedule };