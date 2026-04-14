import axios from 'axios';

const api = axios.create({
  // Substitua o 192.168.X.X pelo IP que apareceu no seu ipconfig
  baseURL: 'http://192.168.X.X', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;