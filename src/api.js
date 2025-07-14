import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hours-control-back-end.vercel.app/api',
  
});

export default api;
