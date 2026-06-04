import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'DRIVER' | 'USER' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string | null;
  isLoading: boolean;
  login: (token: string, userRole: UserRole, email?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToDriver: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚠️ MODO TESTE: Defina como true para pular login
const TEST_MODE = false;
const TEST_ROLE: UserRole = 'USER'; // Altere para 'USER' ou 'DRIVER'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(TEST_MODE);
  const [role, setRole] = useState<UserRole>(TEST_MODE ? TEST_ROLE : null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(TEST_MODE ? false : true);

  useEffect(() => {
    if (TEST_MODE) {
      return;
    }

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('userRole');
        const savedName = await AsyncStorage.getItem('userName');
        
        setIsAuthenticated(!!token);
        setRole((userRole as UserRole) || null);
        setUserName(savedName);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setRole(null);
        setUserName(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string, userRole: UserRole, email?: string, name?: string) => {
    try {
      await AsyncStorage.setItem('token', token);
      if (userRole) {
        await AsyncStorage.setItem('userRole', userRole);
      }
      if (email) {
        await AsyncStorage.setItem('email', email);
      }
      if (name) {
        await AsyncStorage.setItem('userName', name);
        setUserName(name);
      }
      setIsAuthenticated(true);
      setRole(userRole);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('userName');
      setIsAuthenticated(false);
      setRole(null);
      setUserName(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const upgradeToDriver = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.post('/api/driver/upgrade', {
          cpf: '12345678901', // Dados mockados para simplificar
          cnh: '12345678901',
          cnhCategory: 'B'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.token) {
          await AsyncStorage.setItem('token', response.data.token);
        }
      }
      
      await AsyncStorage.setItem('userRole', 'DRIVER');
      setRole('DRIVER');
    } catch (error) {
      console.error('Erro ao atualizar role para DRIVER:', error);
    }
  };

  const updateUserName = async (name: string) => {
    try {
      await AsyncStorage.setItem('userName', name);
      setUserName(name);
    } catch (error) {
      console.error('Erro ao atualizar nome de usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userName, isLoading, login, logout, upgradeToDriver, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
