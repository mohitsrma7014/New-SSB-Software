import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.199:8001/api/',
  withCredentials: true, // Include cookies in requests
});

export default api;
