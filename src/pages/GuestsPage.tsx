
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { GuestModal } from '@/components/Guests/GuestModal';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { Guest } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const GuestsPage = () => {
  const { guests, addGuest, updateGuest, deleteGuest, isLoading } = useHotelData();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      guest.document.includes(searchLower)
    );
  });

  const handleSaveGuest = async (guestData: any) => {
    try {
      if (guestModal.mode === 'create') {
        console.log('Creating new guest:', guestData);
        await addGuest(guestData);
        toast({
          title: "Éxito",
          description: "Huésped creado correctamente",
        });
        // Siempre redirigir a reservas después de crear un huésped
        navigate('/reservations');
      } else if (guestModal.mode === 'edit' && guestModal.guest) {
        console.log('Updating guest:', guestModal.guest.id, guestData);
        await updateGuest(guestModal.guest.id, guestData);
        toast({
          title: "Éxito",
          description: "Huésped actualizado correctamente",
        });
      }
      setGuestModal({ isOpen: false, mode: 'create' });
    } catch (error: any) {
      console.error('Error saving guest:', error);
      const errorMessage = error?.message || 'No se pudo guardar el huésped. Por favor intente de nuevo.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este huésped? Esta acción no se puede deshacer.')) {
      try {
        console.log('Deleting guest:', id);
        await deleteGuest(id);
        toast({
          title: "Éxito",
          description: "Huésped eliminado correctamente",
        });
      } catch (error: any) {
        console.error('Error deleting guest:', error);
        const errorMessage = error?.message || 'No se pudo eliminar el huésped. Por favor intente de nuevo.';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleEditGuest = (guest: Guest) => {
    console.log('Editing guest:', guest);
    setGuestModal({
      isOpen: true,
      mode: 'edit',
      guest
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando huéspedes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Huéspedes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de todos los huéspedes
          </p>
        </div>
        <div className="flex gap-2">
          <BackToHomeButton />
          <Button
            onClick={() => {
              console.log('Opening create guest modal');
              setGuestModal({ isOpen: true, mode: 'create' });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Huésped
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar huéspedes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredGuests.length} huéspedes encontrados
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="py-3 px-4 text-left font-medium">Nombre</th>
                  <th className="py-3 px-4 text-left font-medium">Email</th>
                  <th className="py-3 px-4 text-left font-medium">Teléfono</th>
                  <th className="py-3 px-4 text-left font-medium">Documento</th>
                  <th className="py-3 px-4 text-left font-medium">Nacionalidad</th>
                  <th className="py-3 px-4 text-left font-medium">Fecha registro</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      {searchTerm ? 'No se encontraron huéspedes que coincidan con la búsqueda' : 'No hay huéspedes registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">
                        {guest.first_name} {guest.last_name}
                      </td>
                      <td className="py-3 px-4">{guest.email}</td>
                      <td className="py-3 px-4">{guest.phone}</td>
                      <td className="py-3 px-4">{guest.document}</td>
                      <td className="py-3 px-4">{guest.nationality}</td>
                      <td className="py-3 px-4">
                        {format(new Date(guest.created_at), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditGuest(guest)}
                            title="Editar huésped"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteGuest(guest.id)}
                            title="Eliminar huésped"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <GuestModal
        isOpen={guestModal.isOpen}
        onClose={() => {
          console.log('Closing guest modal');
          setGuestModal({ isOpen: false, mode: 'create' });
        }}
        onSave={handleSaveGuest}
        guest={guestModal.guest}
        mode={guestModal.mode}
      />
    </div>
  );
};

export default GuestsPage;
