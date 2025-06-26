
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
    console.log('Attempting login with:', { email, password });
    const foundUser = demoUsers.find(u => u.email === email && u.password === password);
    console.log('Found user:', foundUser);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hotelUser', JSON.stringify(userWithoutPassword));
      console.log('Login successful for user:', userWithoutPassword.email);
      
      // Clear password from memory immediately after login
      setTimeout(() => {
        clearPasswordFields();
      }, 100);
      
      return true;
    }
    console.log('Login failed - user not found or wrong credentials');
    
    // Clear password field on failed login
    clearPasswordFields();
    
    return false;
  };

  const clearPasswordFields = () => {
    // Clear all password fields
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
      if (field instanceof HTMLInputElement) {
        field.value = '';
        field.setAttribute('autocomplete', 'new-password');
      }
    });
    
    // Clear any text inputs that might contain passwords
    const textFields = document.querySelectorAll('input[type="text"]');
    textFields.forEach(field => {
      if (field instanceof HTMLInputElement && (field.name === 'email' || field.name === 'username')) {
        field.value = '';
        field.setAttribute('autocomplete', 'off');
      }
    });
    
    // Clear forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'password' || input.name === 'email' || input.name === 'username') {
          input.value = '';
        }
      });
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
    
    // Clear all sensitive data from forms
    clearPasswordFields();
    
    // Additional cleanup for browser autofill
    setTimeout(() => {
      clearPasswordFields();
    }, 500);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
