import React, { useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    onSearchChange(e.currentTarget.value);
  }, [onSearchChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.key === 'Escape') {
      onSearchChange('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    onSearchChange('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onSearchChange]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={searchTerm ?? ''}
          onChange={handleChange}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por huésped, email, habitación o ID..."
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-base ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "transition-colors duration-200"
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Buscar reservas"
        />
        {!!searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-muted"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {resultCount} resultado{resultCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
