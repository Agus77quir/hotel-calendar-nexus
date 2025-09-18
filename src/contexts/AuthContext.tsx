import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/hotel';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with original credentials
const demoUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin',
    firstName: 'Administrador',
    lastName: 'Sistema',
    role: 'admin',
    password: 'admin@123',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'rec1',
    firstName: 'Recepcionista',
    lastName: 'Uno',
    role: 'receptionist',
    password: 'rec1@123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'rec2',
    firstName: 'Recepcionista',
    lastName: 'Dos',
    role: 'receptionist',
    password: 'rec2@123',
    createdAt: new Date(),
  },
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('[Auth] Inicializando autenticación...');
    let rafId: number | null = null;
    let timeoutId: number | null = null;

    const finalize = () => {
      setIsInitialized(true);
      console.log('[Auth] Inicialización completada');
    };

    try {
      rafId = requestAnimationFrame(() => {
        try {
          const savedUser = localStorage.getItem('hotelUser');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('[Auth] Usuario restaurado desde localStorage:', parsedUser?.email);
          } else {
            console.log('[Auth] No hay usuario guardado en localStorage');
          }
        } catch (error) {
          console.error('[Auth] Error leyendo/parsing localStorage:', error);
          try {
            localStorage.removeItem('hotelUser');
          } catch (storageError) {
            console.error('[Auth] Error limpiando localStorage:', storageError);
          }
        } finally {
          finalize();
        }
      });

      // Fallback por si requestAnimationFrame nunca dispara
      timeoutId = window.setTimeout(() => {
        console.warn('[Auth] Fallback de inicialización activado');
        finalize();
      }, 1500);
    } catch (error) {
      console.error('[Auth] Error programando inicialización:', error);
      finalize();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login with:', { email, password });
    
    // Safari-compatible Promise handling
    return new Promise((resolve) => {
      try {
        const foundUser = demoUsers.find(u => u.email === email && u.password === password);
        console.log('Found user:', foundUser);
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          
          // Safari-safe localStorage handling
          try {
            localStorage.setItem('hotelUser', JSON.stringify(userWithoutPassword));
          } catch (error) {
            console.error('Error saving user to localStorage:', error);
          }
          
          console.log('Login successful for user:', userWithoutPassword.email);
          resolve(true);
        } else {
          console.log('Login failed - user not found or wrong credentials');
          resolve(false);
        }
      } catch (error) {
        console.error('Login error:', error);
        resolve(false);
      }
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('hotelUser');
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-600 text-sm">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
