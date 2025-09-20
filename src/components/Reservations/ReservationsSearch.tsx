
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCallback } from 'react';

interface ReservationsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export const ReservationsSearch = ({
  searchTerm,
  onSearchChange,
  resultCount
}: ReservationsSearchProps) => {
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value;
    onSearchChange(value);
  }, [onSearchChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Buscar por huésped, email, habitación o ID..."
          value={searchTerm || ''}
          onChange={handleInputChange}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {resultCount} reservas encontradas
      </div>
    </div>
  );
};
