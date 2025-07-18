
import { Badge } from '@/components/ui/badge';
import { Room } from '@/types/hotel';
import { Bed, AlertTriangle, Wrench, Sparkles } from 'lucide-react';

interface RoomStatusIndicatorProps {
  rooms: Room[];
}

export const RoomStatusIndicator = ({ rooms }: RoomStatusIndicatorProps) => {
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');
  const availableRooms = rooms.filter(r => r.status === 'available');
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning');

  return (
    <div className="space-y-3">
      {/* Habitaciones ocupadas - más prominente */}
      {occupiedRooms.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">Habitaciones Ocupadas ({occupiedRooms.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {occupiedRooms.map(room => (
              <Badge key={room.id} variant="destructive" className="text-xs">
                {room.number}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Habitaciones disponibles */}
      {availableRooms.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">Habitaciones Disponibles ({availableRooms.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {availableRooms.slice(0, 10).map(room => (
              <Badge key={room.id} className="bg-green-100 text-green-800 text-xs">
                {room.number}
              </Badge>
            ))}
            {availableRooms.length > 10 && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                +{availableRooms.length - 10} más
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Habitaciones en mantenimiento */}
      {maintenanceRooms.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">En Mantenimiento ({maintenanceRooms.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {maintenanceRooms.map(room => (
              <Badge key={room.id} className="bg-yellow-100 text-yellow-800 text-xs">
                {room.number}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Habitaciones en limpieza */}
      {cleaningRooms.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">En Limpieza ({cleaningRooms.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {cleaningRooms.map(room => (
              <Badge key={room.id} className="bg-purple-100 text-purple-800 text-xs">
                {room.number}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
