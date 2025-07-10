import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hours-control-back-end.vercel.app/api',
  withCredentials: true,
});

export default api;
