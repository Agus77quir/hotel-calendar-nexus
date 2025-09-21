
import { SearchInput } from '@/components/Search/SearchInput';

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
  return (
    <SearchInput
      value={searchTerm}
      onValueChange={onSearchChange}
      placeholder="Buscar por huésped, email, habitación o ID..."
      resultCount={resultCount}
      showResultCount={true}
    />
  );
};
