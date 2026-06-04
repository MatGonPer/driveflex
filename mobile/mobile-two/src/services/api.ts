import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let host = 'localhost';

if (Platform.OS === 'web') {
  host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
} else {
  // Tenta obter o IP do PC hospedeiro dinamicamente (útil para celulares físicos e emuladores)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    host = hostUri.split(':')[0];
  }
}

// O backend está ouvindo na porta 8085 exposta diretamente no host
const baseURL = `http://${host}:8085`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
