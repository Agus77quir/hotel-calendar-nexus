
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserContext = () => {
  const { user } = useAuth();

  const setUserContext = useCallback(async () => {
    if (!user) return;

    let userName: string;
    
    // Mapear el nombre del usuario según su rol y nombre
    if (user.role === 'admin') {
      userName = 'Administrador Sistema';
    } else if (user.role === 'receptionist') {
      if (user.firstName === 'Recepcionista' && user.lastName === 'Uno') {
        userName = 'Recepcionista Uno';
      } else if (user.firstName === 'Recepcionista' && user.lastName === 'Dos') {
        userName = 'Recepcionista Dos';
      } else {
        userName = `${user.firstName} ${user.lastName}`;
      }
    } else {
      userName = `${user.firstName} ${user.lastName}`;
    }

    try {
      // Establecer el contexto de usuario en la base de datos
      const { error } = await supabase.rpc('set_current_user', {
        user_name: userName
      });

      if (error) {
        console.error('Error setting user context:', error);
      }
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }, [user]);

  const executeWithUserContext = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    await setUserContext();
    return operation();
  }, [setUserContext]);

  return {
    setUserContext,
    executeWithUserContext
  };
};
