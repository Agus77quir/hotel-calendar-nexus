import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  resultCount?: number;
  showResultCount?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    value, 
    onValueChange, 
    placeholder = "Buscar...", 
    className,
    resultCount,
    showResultCount = false
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Sync internal value with external value
    useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    // Debounced update to parent
    const debouncedUpdate = useCallback((newValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onValueChange(newValue);
      }, 150);
    }, [onValueChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      debouncedUpdate(newValue);
    }, [debouncedUpdate]);

    const handleClear = useCallback(() => {
      setInternalValue('');
      onValueChange('');
      inputRef.current?.focus();
    }, [onValueChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    }, [handleClear]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <input
            ref={ref || inputRef}
            type="search"
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
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
            spellCheck="false"
          />
          {internalValue && (
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
        {showResultCount && typeof resultCount === 'number' && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {resultCount} resultado{resultCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';