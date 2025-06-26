
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useReportExport } from '@/hooks/useReportExport';
import { Reservation, Guest, Room } from '@/types/hotel';

interface ReportExportButtonsProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
}

export const ReportExportButtons = ({ reservations, guests, rooms }: ReportExportButtonsProps) => {
  const { exportToPDF, exportToExcel } = useReportExport();

  const handleExportPDF = () => {
    exportToPDF(reservations, guests, rooms);
  };

  const handleExportExcel = () => {
    exportToExcel(reservations, guests, rooms);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Exportar PDF
      </Button>
      <Button
        onClick={handleExportExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  );
};
