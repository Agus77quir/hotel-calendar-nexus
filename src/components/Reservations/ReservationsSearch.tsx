
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Prevent form submission or page reload
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por huésped, email, habitación o ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          autoComplete="off"
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {resultCount} reservas encontradas
      </div>
    </div>
  );
};
