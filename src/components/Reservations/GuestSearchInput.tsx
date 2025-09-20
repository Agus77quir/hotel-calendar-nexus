
import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Guest, Room, Reservation } from '@/types/hotel';
import { cn } from '@/lib/utils';

interface GuestSearchInputProps {
  guests: Guest[];
  rooms: Room[];
  reservations: Reservation[];
  selectedGuestId: string;
  onGuestSelect: (guestId: string) => void;
  placeholder?: string;
}

export const GuestSearchInput = ({
  guests,
  rooms,
  reservations,
  selectedGuestId,
  onGuestSelect,
  placeholder = "Buscar huésped por nombre o habitación..."
}: GuestSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected guest for display
  const selectedGuest = guests.find(g => g.id === selectedGuestId);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredGuests([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    // Safely handle guest data that might be null/undefined
    const guestMatches = (guests || []).filter(guest => {
      if (!guest) return false;
      
      const firstName = String(guest.first_name || '').toLowerCase();
      const lastName = String(guest.last_name || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        fullName.includes(searchLower)
      );
    });

    // Search by room number - safely handle room and reservation data
    const roomMatches = (rooms || [])
      .filter(room => {
        if (!room || !room.number) return false;
        return String(room.number).toLowerCase().includes(searchLower);
      })
      .map(room => {
        if (!reservations || reservations.length === 0) return null;
        
        // Find current reservation for this room
        const currentReservation = reservations.find(r => 
          r && r.room_id === room.id && 
          (r.status === 'confirmed' || r.status === 'checked-in')
        );
        
        if (!currentReservation) return null;
        
        return guests.find(g => g && g.id === currentReservation.guest_id) || null;
      })
      .filter(Boolean) as Guest[];

    // Combine results and remove duplicates
    const allMatches = [...guestMatches, ...roomMatches];
    const uniqueGuests = allMatches.filter((guest, index, self) => 
      guest && index === self.findIndex(g => g && g.id === guest.id)
    );

    setFilteredGuests(uniqueGuests.slice(0, 8)); // Limit to 8 results
  }, [searchTerm, guests, rooms, reservations]);

  const handleGuestSelect = (guest: Guest) => {
    onGuestSelect(guest.id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const clearSelection = () => {
    onGuestSelect('');
    setSearchTerm('');
  };

  const getCurrentRoomForGuest = (guestId: string) => {
    const currentReservation = reservations.find(r => 
      r.guest_id === guestId && 
      (r.status === 'confirmed' || r.status === 'checked-in')
    );
    if (currentReservation) {
      return rooms.find(r => r.id === currentReservation.room_id);
    }
    return null;
  };

  return (
    <div className="relative">
      {selectedGuest ? (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <User className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">
            {selectedGuest.first_name} {selectedGuest.last_name}
          </span>
          {selectedGuest.is_associated && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
              Asociado
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              ref={inputRef}
              type="search"
              placeholder={placeholder}
              value={searchTerm || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                if (value.trim()) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => {
                if (searchTerm && searchTerm.trim()) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearchTerm('');
                }
              }}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background pl-10 py-2 text-base ring-offset-background",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              )}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          {isOpen && searchTerm && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <Card className="absolute top-full left-0 right-0 z-20 mt-1 max-h-80 overflow-y-auto shadow-lg">
                <CardContent className="p-0">
                  {filteredGuests.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No se encontraron huéspedes</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredGuests.map((guest) => {
                        const currentRoom = getCurrentRoomForGuest(guest.id);
                        return (
                          <div
                            key={guest.id}
                            className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleGuestSelect(guest)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {guest.first_name} {guest.last_name}
                                  </span>
                                  {guest.is_associated && (
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                      Asociado
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {guest.email}
                                </div>
                                {currentRoom && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Habitación #{currentRoom.number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};
