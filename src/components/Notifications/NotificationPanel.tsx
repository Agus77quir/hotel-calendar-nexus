
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, UserCheck, UserX, AlertCircle, Calendar, X, CheckCircle } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface NotificationPanelProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'check-in' | 'check-out' | 'maintenance' | 'booking';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  reservationId?: string;
  roomId?: string;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { reservations, guests, rooms, updateReservation, updateRoom } = useHotelData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const generatedNotifications: Notification[] = [];

    // Check-ins pendientes para hoy
    const todayCheckIns = reservations.filter(r => 
      r.check_in === today && r.status === 'confirmed'
    );

    todayCheckIns.forEach(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const room = rooms.find(r => r.id === reservation.room_id);
      
      generatedNotifications.push({
        id: `checkin-${reservation.id}`,
        type: 'check-in',
        title: 'Check-in pendiente',
        message: `${guest?.first_name} ${guest?.last_name} - Habitación ${room?.number}`,
        time: 'Hoy',
        isRead: false,
        priority: 'high',
        actionable: true,
        reservationId: reservation.id,
        roomId: reservation.room_id
      });
    });

    // Check-outs para hoy
    const todayCheckOuts = reservations.filter(r => 
      r.check_out === today && r.status === 'checked-in'
    );

    todayCheckOuts.forEach(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const room = rooms.find(r => r.id === reservation.room_id);
      
      generatedNotifications.push({
        id: `checkout-${reservation.id}`,
        type: 'check-out',
        title: 'Check-out pendiente',
        message: `${guest?.first_name} ${guest?.last_name} - Habitación ${room?.number}`,
        time: 'Hoy',
        isRead: false,
        priority: 'medium',
        actionable: true,
        reservationId: reservation.id,
        roomId: reservation.room_id
      });
    });

    // Habitaciones en mantenimiento
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
    
    maintenanceRooms.forEach(room => {
      generatedNotifications.push({
        id: `maintenance-${room.id}`,
        type: 'maintenance',
        title: 'Habitación en mantenimiento',
        message: `Habitación ${room.number} requiere atención`,
        time: 'Pendiente',
        isRead: false,
        priority: 'medium',
        actionable: true,
        roomId: room.id
      });
    });

    // Nuevas reservas recientes
    const recentReservations = reservations
      .filter(r => r.status === 'confirmed')
      .slice(0, 2);

    recentReservations.forEach(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      
      generatedNotifications.push({
        id: `booking-${reservation.id}`,
        type: 'booking',
        title: 'Nueva reserva confirmada',
        message: `${guest?.first_name} ${guest?.last_name} - ${format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}`,
        time: 'Reciente',
        isRead: false,
        priority: 'low',
        actionable: false
      });
    });

    setNotifications(generatedNotifications);
  }, [reservations, guests, rooms]);

  const handleQuickAction = async (notification: Notification) => {
    try {
      if (notification.type === 'check-in' && notification.reservationId && notification.roomId) {
        await updateReservation(notification.reservationId, { status: 'checked-in' });
        await updateRoom(notification.roomId, { status: 'occupied' });
        toast({
          title: "Check-in realizado",
          description: "El huésped ha sido registrado exitosamente"
        });
      } else if (notification.type === 'check-out' && notification.reservationId && notification.roomId) {
        await updateReservation(notification.reservationId, { status: 'checked-out' });
        await updateRoom(notification.roomId, { status: 'cleaning' });
        toast({
          title: "Check-out realizado",
          description: "El huésped ha salido y la habitación está en limpieza"
        });
      } else if (notification.type === 'maintenance' && notification.roomId) {
        await updateRoom(notification.roomId, { status: 'available' });
        toast({
          title: "Mantenimiento completado",
          description: "La habitación está disponible nuevamente"
        });
      }
      
      // Mark notification as read
      markAsRead(notification.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'check-in':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'check-out':
        return <UserX className="h-4 w-4 text-orange-600" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute top-12 right-0 w-96 z-50">
      <Card className="shadow-2xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar todo
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs"
                            >
                              Marcar leída
                            </Button>
                          </div>
                          {notification.actionable && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickAction(notification)}
                              className="text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {notification.type === 'check-in' ? 'Check-in' : 
                               notification.type === 'check-out' ? 'Check-out' : 'Completar'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
