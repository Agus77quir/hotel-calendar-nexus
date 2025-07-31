import { useState } from 'react';
import { useHotelData } from '@/hooks/useHotelData';
import { RoomModal } from '@/components/Rooms/RoomModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Room } from '@/types/hotel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const RoomsPage = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, isLoading } = useHotelData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Room['type'] | 'all'>('all');

  const handleAddRoom = async (roomData: Omit<Room, 'id' | 'created_at'>) => {
    await addRoom(roomData);
    setIsModalOpen(false);
  };

  const handleUpdateRoom = async (roomData: Room, updateGroupPrice?: boolean) => {
    if (selectedRoom) {
      await updateRoom({ id: selectedRoom.id, updateGroupPrice, ...roomData });
      setIsModalOpen(false);
      setSelectedRoom(undefined);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    await deleteRoom(id);
  };

  const filteredRooms = rooms.filter(room => {
    const searchMatch = room.number.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedType === 'all' || room.type === selectedType;
    return searchMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Habitaciones</h1>
          <Button onClick={() => {
            setIsModalOpen(true);
            setModalMode('create');
          }} className="bg-primary text-white hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Habitación
          </Button>
        </div>

        <div className="mb-4 flex items-center space-x-4">
          <div>
            <Label htmlFor="search" className="text-sm text-gray-600">Buscar por número:</Label>
            <Input
              type="search"
              id="search"
              placeholder="Buscar..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="typeFilter" className="text-sm text-gray-600">Filtrar por tipo:</Label>
            <select
              id="typeFilter"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as Room['type'] | 'all')}
            >
              <option value="all">Todos los tipos</option>
              <option value="matrimonial">Matrimonial</option>
              <option value="triple-individual">Triple Individual</option>
              <option value="triple-matrimonial">Triple Matrimonial</option>
              <option value="doble-individual">Doble Individual</option>
              <option value="suite-presidencial-doble">Suite Presidencial Doble</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando habitaciones...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <div key={room.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{room.number}</h2>
                <p className="text-gray-600">Tipo: {room.type}</p>
                <p className="text-gray-600">Precio: ${room.price}</p>
                <p className="text-gray-600">Capacidad: {room.capacity} personas</p>
                <p className="text-gray-600">Estado: {room.status}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.amenities?.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{amenity}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalOpen(true);
                      setModalMode('edit');
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom(undefined);
          setModalMode('create');
        }}
        onSave={modalMode === 'create' ? handleAddRoom : handleUpdateRoom}
        room={selectedRoom}
        mode={modalMode}
        rooms={rooms}
      />
    </div>
  );
};

export default RoomsPage;
