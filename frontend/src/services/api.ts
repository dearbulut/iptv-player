import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: async (data: { email: string; password: string; username: string }) =>
    api.post('/users/register', data),
  login: async (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  updateXtreamCredentials: async (data: {
    xtream_username: string;
    xtream_password: string;
    xtream_url: string;
  }) => api.put('/users/xtream-credentials', data),
  toggleAdultContent: async () => api.post('/users/toggle-adult-content'),
  getProfile: async () => api.get('/users/profile'),
};

export const content = {
  getLiveStreams: async () => api.get('/content/live'),
  getMovies: async () => api.get('/content/vod'),
  getSeries: async () => api.get('/content/series'),
  getSeriesInfo: async (seriesId: string) =>
    api.get(`/content/series/${seriesId}`),
  getEPG: async (streamId: string) => api.get(`/content/epg/${streamId}`),
  getFavorites: async () => api.get('/content/favorites'),
  addToFavorites: async (data: {
    content_id: string;
    content_type: string;
    title: string;
    poster_url?: string;
  }) => api.post('/content/favorites', data),
  removeFromFavorites: async (id: string) =>
    api.delete(`/content/favorites/${id}`),
  getWatchHistory: async () => api.get('/content/history'),
  updateWatchHistory: async (data: {
    content_id: string;
    content_type: string;
    title: string;
    watched_duration: number;
    total_duration: number;
    season_number?: number;
    episode_number?: number;
    poster_url?: string;
  }) => api.post('/content/history', data),
};

export default api;