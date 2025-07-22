import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Reservation, Guest, Room } from '@/types/hotel';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationsTableProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onView: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
  onCheckOut: (reservation: Reservation) => void;
}

interface GuestInfo {
  name: string;
  details: string;
}

export const ReservationsTable = ({ 
  reservations, 
  onEdit, 
  onDelete, 
  onView,
  onCheckIn,
  onCheckOut 
}: ReservationsTableProps) => {
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);

  React.useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch('/api/guests');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGuests(data);
      } catch (error) {
        console.error("Could not fetch guests:", error);
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Could not fetch rooms:", error);
      }
    };

    fetchGuests();
    fetchRooms();
  }, []);

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.number : 'N/A';
  };

  const getGuestInfo = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return { name: 'Huésped no encontrado', details: '' };
    
    return {
      name: `${guest.first_name} ${guest.last_name}`,
      details: `${guest.email} • ${guest.phone}`
    };
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'confirmation_number',
      header: 'Reserva',
    },
    {
      accessorKey: 'guest_id',
      header: 'Huésped',
      cell: ({ row }) => {
        const guestInfo = getGuestInfo(row.getValue('guest_id'));
        return (
          <>
            <p className="font-medium">{guestInfo.name}</p>
            <p className="text-muted-foreground">{guestInfo.details}</p>
          </>
        );
      },
    },
    {
      accessorKey: 'room_id',
      header: 'Habitación',
      cell: ({ row }) => getRoomNumber(row.getValue('room_id')),
    },
    {
      accessorKey: 'check_in',
      header: 'Check-in',
      cell: ({ row }) => {
        const date = new Date(row.getValue('check_in'));
        return format(date, 'PPP', { locale: es });
      },
    },
    {
      accessorKey: 'check_out',
      header: 'Check-out',
      cell: ({ row }) => {
        const date = new Date(row.getValue('check_out'));
        return format(date, 'PPP', { locale: es });
      },
    },
    {
      accessorKey: 'guests_count',
      header: 'Huéspedes',
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => `$${row.getValue('total_amount')}`,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onView(row.original)}>
            Ver
          </Button>
          <Button size="sm" onClick={() => onEdit(row.original)}>
            Editar
          </Button>
          <Button size="sm" onClick={() => onDelete(row.original.id)}>
            Eliminar
          </Button>
          {row.original.status === 'confirmed' && (
            <Button size="sm" onClick={() => onCheckIn(row.original)}>
              Check-in
            </Button>
          )}
          {row.original.status === 'checked-in' && (
            <Button size="sm" onClick={() => onCheckOut(row.original)}>
              Check-out
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: reservations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
