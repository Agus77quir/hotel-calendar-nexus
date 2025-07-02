
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { GuestModal } from '@/components/Guests/GuestModal';
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Percent } from 'lucide-react';
import { Guest } from '@/types/hotel';

const GuestsPage = () => {
  const { guests, addGuest, updateGuest, deleteGuest, isLoading } = useHotelData();
  const [searchTerm, setSearchTerm] = useState('');
  const [guestModal, setGuestModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    guest?: Guest;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const filteredGuests = guests.filter(guest => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.first_name.toLowerCase().includes(searchLower) ||
      guest.last_name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.phone.includes(searchLower) ||
      guest.document.includes(searchLower) ||
      guest.nationality.toLowerCase().includes(searchLower)
    );
  });

  const associatedGuests = guests.filter(guest => guest.is_associated).length;
  const regularGuests = guests.length - associatedGuests;

  const handleSaveGuest = async (guestData: any) => {
    try {
      if (guestModal.mode === 'create') {
        await addGuest(guestData);
      } else if (guestModal.guest) {
        await updateGuest({ id: guestModal.guest.id, ...guestData });
      }
      setGuestModal({ isOpen: false, mode: 'create' });
    } catch (error) {
      console.error('Error saving guest:', error);
    }
  };

  const handleDeleteGuest = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este huésped?')) {
      deleteGuest(id);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Huéspedes</h1>
          <p className="text-muted-foreground">Gestión de huéspedes del hotel</p>
        </div>
        <Button 
          onClick={() => setGuestModal({ isOpen: true, mode: 'create' })}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Huésped
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Huéspedes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes Asociados</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{associatedGuests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes Regulares</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularGuests}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar huéspedes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredGuests.length} resultado{filteredGuests.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nacionalidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron huéspedes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="font-medium">
                          {guest.first_name} {guest.last_name}
                        </div>
                      </TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone}</TableCell>
                      <TableCell>{guest.document}</TableCell>
                      <TableCell className="capitalize">{guest.nationality}</TableCell>
                      <TableCell>
                        {guest.is_associated ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500">
                              Asociado
                            </Badge>
                            <div className="flex items-center gap-1 text-green-600">
                              <Percent className="h-3 w-3" />
                              <span className="text-xs">{guest.discount_percentage}%</span>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGuestModal({
                              isOpen: true,
                              mode: 'edit',
                              guest
                            })}
                            title="Editar huésped"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGuest(guest.id)}
                            title="Eliminar huésped"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GuestModal
        isOpen={guestModal.isOpen}
        onClose={() => setGuestModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveGuest}
        guest={guestModal.guest}
        mode={guestModal.mode}
      />
    </div>
  );
};

export default GuestsPage;
