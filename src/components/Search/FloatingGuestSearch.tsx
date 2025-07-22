import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHotelData } from '@/hooks/useHotelData';
import { Guest } from '@/types/hotel';
import { Users } from 'lucide-react';

interface FloatingGuestSearchProps {
  onGuestSelect: (guest: Guest) => void;
}

export const FloatingGuestSearch = ({ onGuestSelect }: FloatingGuestSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestLocal, setSelectedGuestLocal] = useState<Guest | null>(null);
  const { guests } = useHotelData();

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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
        >
          Buscar Huésped
          <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar huésped..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>No se encontraron huéspedes.</CommandEmpty>
            <CommandGroup heading="Huéspedes">
              {filteredGuests.map((guest) => (
                <CommandItem key={guest.id} onSelect={() => handleSelectGuest(guest)}>
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={`https://avatar.vercel.sh/${guest.email}.png`} />
                    <AvatarFallback>{guest.first_name[0]}{guest.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{guest.first_name} {guest.last_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
