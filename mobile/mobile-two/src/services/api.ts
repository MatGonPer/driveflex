import axios from 'axios';

import { Platform } from 'react-native';

// Ajuste a baseURL de acordo com o seu backend:
// - Para emulador Android: http://10.0.2.2 (porta 80 via Traefik)
// - Para iOS (simulador) ou web: http://localhost
// - Para dispositivo físico, use o IP do seu PC na rede local.
const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
