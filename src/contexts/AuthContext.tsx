
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/hotel';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with updated credentials
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

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('hotelUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login with:', { email, password });
    const foundUser = demoUsers.find(u => u.email === email && u.password === password);
    console.log('Found user:', foundUser);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hotelUser', JSON.stringify(userWithoutPassword));
      console.log('Login successful for user:', userWithoutPassword.email);
      return true;
    }
    console.log('Login failed - user not found or wrong credentials');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
    // Clear any form data that might contain passwords
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Clear all password fields specifically
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
      if (field instanceof HTMLInputElement) {
        field.value = '';
      }
    });
    
    // Clear any text inputs that might contain passwords
    const textFields = document.querySelectorAll('input[type="text"]');
    textFields.forEach(field => {
      if (field instanceof HTMLInputElement) {
        field.value = '';
      }
    });
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
