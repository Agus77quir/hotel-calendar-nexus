
import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHotelData } from '@/hooks/useHotelData';
import { Guest } from '@/types/hotel';

interface FloatingGuestSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingGuestSearch = ({ isOpen, onClose }: FloatingGuestSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const { guests } = useHotelData();

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGuests([]);
      return;
    }

    const filtered = guests.filter(guest => {
      const searchLower = searchTerm.toLowerCase();
      return (
        guest.first_name.toLowerCase().includes(searchLower) ||
        guest.last_name.toLowerCase().includes(searchLower) ||
        guest.email.toLowerCase().includes(searchLower) ||
        guest.phone.includes(searchTerm) ||
        guest.document.includes(searchTerm)
      );
    }).slice(0, 8); // Limitar a 8 resultados

    setFilteredGuests(filtered);
  }, [searchTerm, guests]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4">
        <Card className="shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar huéspedes por nombre, email, teléfono o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {searchTerm && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron huéspedes</p>
                  </div>
                ) : (
                  filteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        // Aquí podrías agregar navegación o mostrar detalles
                        console.log('Guest selected:', guest);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {guest.first_name} {guest.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {guest.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {guest.phone}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Doc: {guest.document}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Comienza a escribir para buscar huéspedes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
