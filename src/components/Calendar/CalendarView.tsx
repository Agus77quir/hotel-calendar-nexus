
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import { Reservation } from '@/types/hotel';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  reservations: Reservation[];
  onAddReservation?: () => void;
  onDateSelect?: (date: Date) => void;
  selectedDate: Date;
}

export const CalendarView = ({ reservations, onAddReservation, onDateSelect, selectedDate }: CalendarViewProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect?.(date);
    }
  };

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      return date >= checkIn && date <= checkOut;
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <CalendarDays className="h-5 w-5" />
          Calendario de Reservas
        </CardTitle>
        {onAddReservation && (
          <Button 
            onClick={onAddReservation} 
            size="sm" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 whitespace-nowrap flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={es}
          className="rounded-md border bg-white/50"
          modifiers={{
            hasReservations: (date) => getReservationsForDate(date).length > 0,
          }}
          modifiersStyles={{
            hasReservations: {
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 'bold',
              borderRadius: '6px',
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
