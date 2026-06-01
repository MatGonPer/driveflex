import {Redirect} from 'expo-router';
import {useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useAuth} from '@/context/AuthContext';

export default function Index() {
  const {isAuthenticated, role, isLoading} = useAuth();

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

  // Se é motorista, redireciona para dashboard do motorista
  if (role === 'DRIVER') {
    return <Redirect href="/driver-dashboard" />;
  }

  // Se é cliente (USER), redireciona para a home padrão
  if (role === 'USER') {
    return <Redirect href="/" />;
  }

  // Fallback (não deveria chegar aqui)
  return <Redirect href="/(auth)/login" />;
}
