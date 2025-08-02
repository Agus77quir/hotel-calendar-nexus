
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackToHomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate('/')}
      className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 hover:border-blue-400 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <Home className="h-5 w-5 text-blue-600 drop-shadow-md animate-pulse hover:animate-none transition-all duration-300" />
      <span className="hidden sm:inline font-semibold text-blue-700 drop-shadow-sm">Volver al Inicio</span>
    </Button>
  );
};
