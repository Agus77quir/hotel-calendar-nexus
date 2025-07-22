import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { Reservation, Guest } from '@/types/hotel';
import { format } from 'date-fns';

interface ReservationViewModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationViewModal = ({ reservation, isOpen, onClose }: ReservationViewModalProps) => {
  const [guest, setGuest] = React.useState<Guest | null>(null);

  React.useEffect(() => {
    const fetchGuest = async () => {
      try {
        const response = await fetch(`/api/guests/${reservation.guest_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const guestData = await response.json();
        setGuest(guestData);
      } catch (error) {
        console.error("Could not fetch guest:", error);
        setGuest(null);
      }
    };

    if (reservation.guest_id) {
      fetchGuest();
    }
  }, [reservation.guest_id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Reserva #{reservation.confirmation_number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Huésped */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información del Huésped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guest ? (
                <>
                  <div>
                    <Label className="font-medium">Nombre Completo</Label>
                    <p className="text-gray-700">{guest.first_name} {guest.last_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="text-gray-700">{guest.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Teléfono</Label>
                    <p className="text-gray-700">{guest.phone}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Documento</Label>
                    <p className="text-gray-700">{guest.document}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Cargando información del huésped...</p>
              )}
            </CardContent>
          </Card>

          {/* Detalles de la Reserva */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Detalles de la Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="font-medium">Número de Confirmación</Label>
                <p className="text-gray-700">{reservation.confirmation_number}</p>
              </div>
              <div>
                <Label className="font-medium">Check-in</Label>
                <p className="text-gray-700">{format(new Date(reservation.check_in), 'PPP')}</p>
              </div>
              <div>
                <Label className="font-medium">Check-out</Label>
                <p className="text-gray-700">{format(new Date(reservation.check_out), 'PPP')}</p>
              </div>
              <div>
                <Label className="font-medium">Número de Huéspedes</Label>
                <p className="text-gray-700">{reservation.guests_count}</p>
              </div>
              <div>
                <Label className="font-medium">Estado</Label>
                <p className="text-gray-700">{reservation.status}</p>
              </div>
              <div>
                <Label className="font-medium">Monto Total</Label>
                <p className="text-gray-700">${reservation.total_amount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
