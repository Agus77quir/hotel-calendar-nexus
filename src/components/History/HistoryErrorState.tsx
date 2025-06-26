
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle } from 'lucide-react';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';

export const HistoryErrorState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Historial de Movimientos
          </h1>
          <p className="text-muted-foreground">
            Error al cargar los registros del sistema
          </p>
        </div>
        <BackToHomeButton />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error de conexión</h3>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar los registros de auditoría. Verifica la conexión con la base de datos.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
