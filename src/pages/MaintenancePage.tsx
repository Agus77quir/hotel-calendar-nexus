
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wrench, Search, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { MaintenanceModal } from '@/components/Maintenance/MaintenanceModal';
import { Room } from '@/types/hotel';

const MaintenancePage = () => {
  const { rooms, updateRoom, isLoading } = useHotelData();
  const [searchTerm, setSearchTerm] = useState('');
  const [maintenanceModal, setMaintenanceModal] = useState<{
    isOpen: boolean;
    room?: Room;
  }>({
    isOpen: false,
  });

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.number.toLowerCase().includes(searchLower) ||
      room.type.toLowerCase().includes(searchLower) ||
      room.status.toLowerCase().includes(searchLower)
    );
  });

  const handleSetMaintenance = (room: Room) => {
    setMaintenanceModal({ isOpen: true, room });
  };

  const handleCompleteMaintenance = (roomId: string) => {
    updateRoom(roomId, { status: 'available' });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'cleaning':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const maintenanceRooms = filteredRooms.filter(room => room.status === 'maintenance');
  const availableRooms = filteredRooms.filter(room => room.status === 'available');
  const otherRooms = filteredRooms.filter(room => !['maintenance', 'available'].includes(room.status));

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
          <h1 className="text-3xl font-bold tracking-tight">Mantenimiento</h1>
          <p className="text-muted-foreground">
            Gestiona el mantenimiento de las habitaciones del hotel
          </p>
        </div>
        <BackToHomeButton />
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
      </Card>

      {/* Habitaciones en Mantenimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-600" />
            Habitaciones en Mantenimiento ({maintenanceRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maintenanceRooms.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No hay habitaciones en mantenimiento
              </div>
            ) : (
              maintenanceRooms.map((room) => (
                <Card key={room.id} className="border-2 border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Habitación {room.number}
                      </CardTitle>
                      <Badge className={getStatusColor(room.status)}>
                        {getStatusIcon(room.status)}
                        <span className="ml-1">{getStatusText(room.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Tipo: {room.type}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleCompleteMaintenance(room.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Habitaciones Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Habitaciones Disponibles ({availableRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No hay habitaciones disponibles
              </div>
            ) : (
              availableRooms.map((room) => (
                <Card key={room.id} className="border-2 border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Habitación {room.number}
                      </CardTitle>
                      <Badge className={getStatusColor(room.status)}>
                        {getStatusIcon(room.status)}
                        <span className="ml-1">{getStatusText(room.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Tipo: {room.type}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleSetMaintenance(room)}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Mantenimiento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Otras Habitaciones */}
      {otherRooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Otras Habitaciones ({otherRooms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherRooms.map((room) => (
                <Card key={room.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Habitación {room.number}
                      </CardTitle>
                      <Badge className={getStatusColor(room.status)}>
                        {getStatusIcon(room.status)}
                        <span className="ml-1">{getStatusText(room.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Tipo: {room.type}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleSetMaintenance(room)}
                        disabled={room.status === 'occupied'}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Mantenimiento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <MaintenanceModal
        isOpen={maintenanceModal.isOpen}
        onClose={() => setMaintenanceModal({ isOpen: false })}
        room={maintenanceModal.room}
        onConfirm={(roomId) => {
          updateRoom(roomId, { status: 'maintenance' });
          setMaintenanceModal({ isOpen: false });
        }}
      />
    </div>
  );
};

export default MaintenancePage;
