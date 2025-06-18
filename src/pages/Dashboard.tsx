
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { stats, reservations, rooms, guests } = useHotelData();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate pending actions count
  const pendingActionsCount = (() => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayCheckIns = reservations.filter(r => 
      r.check_in === today && r.status === 'confirmed'
    ).length;
    
    const todayCheckOuts = reservations.filter(r => 
      r.check_out === today && r.status === 'checked-in'
    ).length;
    
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    
    return todayCheckIns + todayCheckOuts + maintenanceRooms;
  })();

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-2">
                Bienvenido, {user?.firstName}
              </h1>
              <p className="text-gray-600 text-lg">
                Panel de control del sistema hotelero - Resumen general y actividades del día
              </p>
            </div>
          </div>
        </div>
      )}

      <StatsCards stats={stats} />

      {/* Calendar with real-time data */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Calendario de Reservas
        </h2>
        <HotelCalendar 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
        />
      </div>

      {/* Quick Actions based on pending tasks */}
      {pendingActionsCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Acciones Pendientes ({pendingActionsCount})
          </h3>
          <div className="space-y-2 text-sm text-yellow-700">
            {reservations.filter(r => {
              const today = new Date().toISOString().split('T')[0];
              return r.check_in === today && r.status === 'confirmed';
            }).length > 0 && (
              <p>• {reservations.filter(r => {
                const today = new Date().toISOString().split('T')[0];
                return r.check_in === today && r.status === 'confirmed';
              }).length} check-ins programados para hoy</p>
            )}
            {reservations.filter(r => {
              const today = new Date().toISOString().split('T')[0];
              return r.check_out === today && r.status === 'checked-in';
            }).length > 0 && (
              <p>• {reservations.filter(r => {
                const today = new Date().toISOString().split('T')[0];
                return r.check_out === today && r.status === 'checked-in';
              }).length} check-outs programados para hoy</p>
            )}
            {rooms.filter(r => r.status === 'maintenance').length > 0 && (
              <p>• {rooms.filter(r => r.status === 'maintenance').length} habitaciones en mantenimiento</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
