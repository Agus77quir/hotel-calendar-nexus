
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/hotel';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with simplified credentials
const demoUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin',
    firstName: 'Administrador',
    lastName: 'Sistema',
    role: 'admin',
    password: 'admin1234',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'rec1',
    firstName: 'Recepcionista',
    lastName: 'Uno',
    role: 'receptionist',
    password: 'rec1123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'rec2',
    firstName: 'Recepcionista',
    lastName: 'Dos',
    role: 'receptionist',
    password: 'rec2123',
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

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('hotelUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = demoUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hotelUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
    // Clear any form data that might contain passwords
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
