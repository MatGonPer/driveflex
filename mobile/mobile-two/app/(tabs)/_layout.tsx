import {Tabs} from 'expo-router';
import React from 'react';
import {Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {HapticTab} from '@/components/haptic-tab';

import {useAuth} from '@/context/AuthContext';

export default function TabLayout() {
  const {role} = useAuth();
  const isDriver = role === 'DRIVER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
      }}>
      {/* 1. INÍCIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. NOVO CONTRATO */}
      <Tabs.Screen
        name="newContract"
        options={{
          title: 'Novo',
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* 3. HISTÓRICO */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 4. PERFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. CONTRATOS PENDENTES (Apenas para Clientes) */}
      <Tabs.Screen
        name="contratosPendentes"
        options={{
          title: 'Contratos',
          href: isDriver ? null : '/(tabs)/contratosPendentes',
          tabBarIcon: ({color, focused}) => (
            <Ionicons
              name={focused ? 'document' : 'document-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      
      {/* 6. EDIT CONTRACT (HIDDEN) */}
      <Tabs.Screen
        name="editContract"
        options={{
          href: null,
        }}
      />
      
      {/* 7. CHAT (HIDDEN) */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />

      {/* 8. ALTER CONTRACT (HIDDEN) */}
      <Tabs.Screen
        name="alterContract"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
