
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/hotel';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@nardini.com',
    firstName: 'María',
    lastName: 'Nardini',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'recepcion@nardini.com',
    firstName: 'Carlos',
    lastName: 'González',
    role: 'receptionist',
    password: 'recep123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'huesped@example.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    role: 'guest',
    password: 'guest123',
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
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
