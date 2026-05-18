import axios from 'axios';

// Ajuste a baseURL de acordo com o seu backend:
// - Para emulador Android: http://10.0.2.2:8080
// - Para iOS (simulador) ou web: http://localhost:8080
// - Para dispositivo físico, use o IP do seu PC na rede local.
const baseURL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
