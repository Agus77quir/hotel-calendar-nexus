
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { Room, Guest, Reservation } from '@/types/hotel';

interface ReservationsHeaderProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onNewReservation: () => void;
  onNewGuest: () => void;
}

export const ReservationsHeader = ({ 
  reservations, 
  guests, 
  rooms, 
  onNewReservation, 
  onNewGuest 
}: ReservationsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona todas las reservas del hotel
        </p>
      </div>
      <div className="flex gap-2">
        <BackToHomeButton />
        <ReportExportButtons 
          reservations={reservations}
          guests={guests}
          rooms={rooms}
        />
        <Button
          variant="outline"
          onClick={onNewGuest}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Huésped
        </Button>
        <Button onClick={onNewReservation}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>
    </div>
  );
};
