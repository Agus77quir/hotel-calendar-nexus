
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHotelData } from '@/hooks/useHotelData';
import { Guest } from '@/types/hotel';

interface GuestSearchInputProps {
  onGuestSelect: (guest: Guest | null) => void;
  selectedGuest: Guest | null;
}

export const GuestSearchInput = ({ onGuestSelect, selectedGuest }: GuestSearchInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestLocal, setSelectedGuestLocal] = useState<Guest | null>(null);
  const { guests } = useHotelData();

  useEffect(() => {
    if (selectedGuest) {
      setSelectedGuestLocal(selectedGuest);
      setSearchQuery(`${selectedGuest.first_name} ${selectedGuest.last_name}`);
    }
  }, [selectedGuest]);

  const filteredGuests = guests.filter(guest => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      guest.first_name.toLowerCase().includes(searchTerm) ||
      guest.last_name.toLowerCase().includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm) ||
      guest.phone.toLowerCase().includes(searchTerm) ||
      guest.document.toLowerCase().includes(searchTerm)
    );
  });

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuestLocal(guest);
    setSearchQuery(`${guest.first_name} ${guest.last_name}`);
    setIsOpen(false);
    onGuestSelect(guest);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          placeholder="Buscar huésped por nombre, email, teléfono o documento..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === '') {
              onGuestSelect(null);
              setSelectedGuestLocal(null);
            }
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0">
        <Command>
          <CommandInput placeholder="Buscar huésped..." />
          <CommandList>
            <CommandEmpty>No se encontraron huéspedes.</CommandEmpty>
            <CommandGroup heading="Huéspedes">
              <ScrollArea className="h-72">
                {filteredGuests.map((guest) => (
                  <CommandItem
                    key={guest.id}
                    onSelect={() => handleSelectGuest(guest)}
                    className="flex items-center px-2 py-3 hover:bg-accent hover:text-accent-foreground data-[active]:bg-accent data-[active]:text-accent-foreground"
                  >
                    <Avatar className="mr-2 h-7 w-7">
                      <AvatarImage src={`https://avatar.vercel.sh/${guest.email}.png`} />
                      <AvatarFallback>{guest.first_name[0]}{guest.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{guest.first_name} {guest.last_name}</span>
                      <span className="text-xs text-muted-foreground">{guest.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
