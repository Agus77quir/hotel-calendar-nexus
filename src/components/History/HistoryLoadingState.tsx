
import { Clock } from 'lucide-react';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';

export const HistoryLoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Historial de Movimientos
          </h1>
          <p className="text-muted-foreground">
            Cargando registros del sistema...
          </p>
        </div>
        <BackToHomeButton />
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando historial...</div>
      </div>
    </div>
  );
};
