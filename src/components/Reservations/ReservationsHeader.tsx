
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { Room, Guest, Reservation } from '@/types/hotel';

interface ReservationsHeaderProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onNewReservation: () => void;
}

export const ReservationsHeader = ({ 
  reservations, 
  guests, 
  rooms, 
  onNewReservation
}: ReservationsHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona todas las reservas del hotel
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <BackToHomeButton />
          <ReportExportButtons 
            reservations={reservations}
            guests={guests}
            rooms={rooms}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onNewReservation}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>
    </div>
  );
};
