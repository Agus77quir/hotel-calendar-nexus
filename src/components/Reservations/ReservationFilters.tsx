
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, X } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationFiltersProps {
  onFiltersChange: (filters: {
    dateFrom?: string;
    dateTo?: string;
    filterType?: 'custom' | 'week' | 'month';
  }) => void;
  onClearFilters: () => void;
}

export const ReservationFilters = ({ onFiltersChange, onClearFilters }: ReservationFiltersProps) => {
  const [filterType, setFilterType] = useState<'custom' | 'week' | 'month'>('custom');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFilterTypeChange = (type: 'custom' | 'week' | 'month') => {
    setFilterType(type);
    const today = new Date();
    
    if (type === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const from = format(weekStart, 'yyyy-MM-dd');
      const to = format(weekEnd, 'yyyy-MM-dd');
      setDateFrom(from);
      setDateTo(to);
      onFiltersChange({ dateFrom: from, dateTo: to, filterType: type });
    } else if (type === 'month') {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      const from = format(monthStart, 'yyyy-MM-dd');
      const to = format(monthEnd, 'yyyy-MM-dd');
      setDateFrom(from);
      setDateTo(to);
      onFiltersChange({ dateFrom: from, dateTo: to, filterType: type });
    } else {
      // custom - don't auto-set dates
      if (dateFrom && dateTo) {
        onFiltersChange({ dateFrom, dateTo, filterType: type });
      }
    }
  };

  const handleCustomDateChange = () => {
    if (dateFrom && dateTo && filterType === 'custom') {
      onFiltersChange({ dateFrom, dateTo, filterType });
    }
  };

  const handleClearFilters = () => {
    setFilterType('custom');
    setDateFrom('');
    setDateTo('');
    onClearFilters();
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Filtrar por:</Label>
          </div>
          
          <Select value={filterType} onValueChange={handleFilterTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Rango personalizado</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
            </SelectContent>
          </Select>

          {filterType === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="dateFrom" className="text-sm">Desde:</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="w-auto"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="dateTo" className="text-sm">Hasta:</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="w-auto"
                />
              </div>
            </>
          )}

          {filterType !== 'custom' && dateFrom && dateTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(dateFrom), 'dd/MM/yyyy', { locale: es })} - {format(new Date(dateTo), 'dd/MM/yyyy', { locale: es })}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
