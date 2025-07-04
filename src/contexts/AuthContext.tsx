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
    // Optimized initialization - only check localStorage once
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('hotelUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('hotelUser');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login with:', { email, password });
    
    // Simulate network delay for realistic UX but keep it minimal
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const foundUser = demoUsers.find(u => u.email === email && u.password === password);
    console.log('Found user:', foundUser);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      
      try {
        localStorage.setItem('hotelUser', JSON.stringify(userWithoutPassword));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
      
      console.log('Login successful for user:', userWithoutPassword.email);
      return true;
    }
    console.log('Login failed - user not found or wrong credentials');
    return false;
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

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
