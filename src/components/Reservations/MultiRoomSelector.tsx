
import React, { useState, useEffect } from 'react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, DollarSign, X } from 'lucide-react';
import { hasDateOverlap } from '@/utils/reservationValidation';

interface MultiRoomSelectorProps {
  rooms: Room[];
  reservations: Reservation[];
  checkIn: string;
  checkOut: string;
  selectedRoomIds: string[];
  onRoomSelectionChange: (roomIds: string[]) => void;
  reservationId?: string;
  guestsCount: number;
}

export const MultiRoomSelector = ({
  rooms,
  reservations,
  checkIn,
  checkOut,
  selectedRoomIds,
  onRoomSelectionChange,
  reservationId,
  guestsCount
}: MultiRoomSelectorProps) => {
  const [localSelectedRooms, setLocalSelectedRooms] = useState<string[]>(selectedRoomIds);

  useEffect(() => {
    setLocalSelectedRooms(selectedRoomIds);
  }, [selectedRoomIds]);

  const getAvailableRooms = () => {
    if (!checkIn || !checkOut) return rooms.filter(room => room.status === 'available');

    return rooms.filter(room => {
      if (room.status !== 'available') return false;

      const hasOverlap = hasDateOverlap(
        room.id,
        checkIn,
        checkOut,
        reservations,
        reservationId
      );

      return !hasOverlap;
    });
  };

  const availableRooms = getAvailableRooms();

  const handleRoomToggle = (roomId: string, isChecked: boolean) => {
    const newSelection = isChecked
      ? [...localSelectedRooms, roomId]
      : localSelectedRooms.filter(id => id !== roomId);

    setLocalSelectedRooms(newSelection);
    onRoomSelectionChange(newSelection);
  };

  const removeRoom = (roomId: string) => {
    handleRoomToggle(roomId, false);
  };

  const getTotalCapacity = () => {
    return localSelectedRooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room?.capacity || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return localSelectedRooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room?.price || 0);
    }, 0);
  };

  const getRoomTypeLabel = (type: string) => {
    const typeLabels = {
      'matrimonial': 'Matrimonial',
      'triple-individual': 'Triple Individual',
      'triple-matrimonial': 'Triple Matrimonial',
      'doble-individual': 'Doble Individual',
      'suite-presidencial-doble': 'Suite Presidencial'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800">
            Selección Múltiple de Habitaciones (Solo Administrador)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localSelectedRooms.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Habitaciones seleccionadas:</p>
              <div className="flex flex-wrap gap-2">
                {localSelectedRooms.map(roomId => {
                  const room = rooms.find(r => r.id === roomId);
                  if (!room) return null;
                  return (
                    <Badge
                      key={roomId}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {room.number} - {getRoomTypeLabel(room.type)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeRoom(roomId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacidad total: {getTotalCapacity()}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Precio total: ${getTotalPrice().toLocaleString()}
                </span>
              </div>
              {getTotalCapacity() < guestsCount && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ La capacidad total ({getTotalCapacity()}) es menor al número de huéspedes ({guestsCount})
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Habitaciones disponibles:</p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableRooms.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No hay habitaciones disponibles para las fechas seleccionadas
                </p>
              ) : (
                availableRooms.map(room => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`room-${room.id}`}
                        checked={localSelectedRooms.includes(room.id)}
                        onCheckedChange={(checked) => 
                          handleRoomToggle(room.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hab. {room.number}</span>
                          <Badge variant="outline" className="text-xs">
                            {getRoomTypeLabel(room.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room.capacity} pers.
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${room.price.toLocaleString()}/noche
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
