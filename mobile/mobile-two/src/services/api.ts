import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.9:8080', 
  timeout: 5000, 
});

export default api;