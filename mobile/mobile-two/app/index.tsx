import {Redirect} from 'expo-router';
import {View, ActivityIndicator} from 'react-native';
import {useAuth} from '@/context/AuthContext';

export default function Index() {
  const {isAuthenticated, isLoading} = useAuth();

  // Enquanto verifica o token, mostra um loading
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a2535',
        }}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Se está autenticado (qualquer role), vai para as tabs
  // O botão verde no perfil cuida de levar o motorista ao painel
  return <Redirect href="/(tabs)" />;
}
