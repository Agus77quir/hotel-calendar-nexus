
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Bed, Users } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { RoomModal } from '@/components/Rooms/RoomModal';
import { Room } from '@/types/hotel';
import { Badge } from '@/components/ui/badge';

const RoomsPage = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, isLoading } = useHotelData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roomModal, setRoomModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    room?: Room;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.number.toLowerCase().includes(searchLower) ||
      room.type.toLowerCase().includes(searchLower)
    );
  });

  const handleSaveRoom = (roomData: any) => {
    if (roomModal.mode === 'create') {
      addRoom(roomData);
    } else if (roomModal.mode === 'edit' && roomModal.room) {
      updateRoom(roomModal.room.id, roomData);
    }
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      deleteRoom(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'maintenance':
        return 'Mantenimiento';
      case 'cleaning':
        return 'Limpieza';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'matrimonial':
        return 'Matrimonial';
      case 'triple-individual':
        return 'Triple Individual';
      case 'triple-matrimonial':
        return 'Triple Matrimonial';
      case 'doble-individual':
        return 'Doble Individual';
      case 'suite-presidencial-doble':
        return 'Suite Presidencial Doble';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habitaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas las habitaciones del hotel
          </p>
        </div>
        <Button
          onClick={() => setRoomModal({ isOpen: true, mode: 'create' })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Habitación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar habitaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredRooms.length} habitaciones encontradas
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No se encontraron habitaciones
              </div>
            ) : (
              filteredRooms.map((room) => (
                <Card key={room.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Habitación {room.number}
                      </CardTitle>
                      <Badge className={getStatusColor(room.status)}>
                        {getStatusText(room.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      <span>{getTypeText(room.type)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacidad: {room.capacity} personas</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${room.price}/noche
                    </div>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.amenities.length - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setRoomModal({
                          isOpen: true,
                          mode: 'edit',
                          room
                        })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <RoomModal
        isOpen={roomModal.isOpen}
        onClose={() => setRoomModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveRoom}
        room={roomModal.room}
        mode={roomModal.mode}
      />
    </div>
  );
};

export default RoomsPage;
