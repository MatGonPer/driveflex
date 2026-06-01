import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'DRIVER' | 'USER' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  isLoading: boolean;
  logout: () => Promise<void>;
  setTestMode: (role: UserRole) => Promise<void>; // Para testes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚠️ MODO TESTE: Defina como true para pular login
const TEST_MODE = true;
const TEST_ROLE: UserRole = 'DRIVER'; // Altere para 'USER' ou 'DRIVER'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(TEST_MODE);
  const [role, setRole] = useState<UserRole>(TEST_MODE ? TEST_ROLE : null);
  const [isLoading, setIsLoading] = useState(TEST_MODE ? false : true);

  useEffect(() => {
    if (TEST_MODE) {
      return;
    }

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('userRole');
        
        setIsAuthenticated(!!token);
        setRole((userRole as UserRole) || null);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setRole(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const setTestMode = async (testRole: UserRole) => {
    if (testRole) {
      await AsyncStorage.setItem('token', 'test-token-' + Date.now());
      await AsyncStorage.setItem('userRole', testRole);
      setIsAuthenticated(true);
      setRole(testRole);
    } else {
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, isLoading, logout, setTestMode }}>
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
