
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
      className="bg-white/80 hover:bg-white flex items-center gap-2"
    >
      <Home className="h-4 w-4" />
      <span className="hidden sm:inline">Volver al Inicio</span>
    </Button>
  );
};
