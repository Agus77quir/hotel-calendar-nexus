import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, UserCheck, UserX, AlertCircle, Calendar, X, CheckCircle, Trash2 } from 'lucide-react';
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

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido removida"
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notificaciones eliminadas",
      description: "Todas las notificaciones han sido removidas"
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-x-2 top-16 md:top-20 md:right-6 md:left-auto w-auto md:w-96 z-[99999] pointer-events-auto">
      <Card className="shadow-2xl border bg-white max-h-[80vh] md:max-h-[90vh] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base md:text-lg">Notificaciones</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700 px-2 py-1 h-7"
                  title="Eliminar todas"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Limpiar</span>
                </Button>
              )}
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 h-7"
                >
                  <span className="hidden sm:inline">Marcar todo</span>
                  <span className="sm:hidden">✓</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-7 w-7 -webkit-tap-highlight-color-transparent"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="max-h-full overflow-y-auto -webkit-overflow-scrolling-touch" style={{ WebkitOverflowScrolling: 'touch' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 md:p-4 border-b hover:bg-muted/50 transition-colors touch-manipulation ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {notification.time}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 -webkit-tap-highlight-color-transparent flex-shrink-0"
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                              title="Eliminar notificación"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-6 px-2 -webkit-tap-highlight-color-transparent"
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              Marcar leída
                            </Button>
                          </div>
                          {notification.actionable && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickAction(notification)}
                              className="text-xs h-7 px-3 -webkit-tap-highlight-color-transparent flex-shrink-0"
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">
                                {notification.type === 'check-in' ? 'Check-in' : 
                                 notification.type === 'check-out' ? 'Check-out' : 'Completar'}
                              </span>
                              <span className="sm:hidden">
                                {notification.type === 'check-in' ? 'In' : 
                                 notification.type === 'check-out' ? 'Out' : 'OK'}
                              </span>
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
