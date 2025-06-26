
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Calendar } from 'lucide-react';

interface HistoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterOperation: 'all' | 'INSERT' | 'UPDATE' | 'DELETE';
  setFilterOperation: (value: 'all' | 'INSERT' | 'UPDATE' | 'DELETE') => void;
  filterUser: 'all' | 'Admin' | 'Rec 1' | 'Rec 2';
  setFilterUser: (value: 'all' | 'Admin' | 'Rec 1' | 'Rec 2') => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  onClearFilters: () => void;
  onExportPDF: () => void;
}

export const HistoryFilters = ({
  searchTerm,
  setSearchTerm,
  filterOperation,
  setFilterOperation,
  filterUser,
  setFilterUser,
  dateFilter,
  setDateFilter,
  onClearFilters,
  onExportPDF
}: HistoryFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros y Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Usuario o entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Acción</label>
            <Select value={filterOperation} onValueChange={(value: any) => setFilterOperation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="INSERT">Creación</SelectItem>
                <SelectItem value="UPDATE">Actualización</SelectItem>
                <SelectItem value="DELETE">Eliminación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <Select value={filterUser} onValueChange={(value: any) => setFilterUser(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Rec 1">Rec 1</SelectItem>
                <SelectItem value="Rec 2">Rec 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Acciones</label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClearFilters} className="flex-1">
                Limpiar
              </Button>
              <Button onClick={onExportPDF} className="flex-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
