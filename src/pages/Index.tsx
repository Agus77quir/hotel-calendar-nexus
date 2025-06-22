
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { useHotelData } from '@/hooks/useHotelData';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { stats, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const handleQuickAction = (path: string) => {
    setOpenMobile(false); // Hide mobile menu
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Landscape Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=400"
          alt="Paisaje montañoso"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Bienvenido a Nardini SRL Gestión Hotelera</h1>
            <p className="text-xl">Administra tu hotel de manera eficiente y profesional</p>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions Card with Icons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="relative group cursor-pointer rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200"
                onClick={() => handleQuickAction('/guests')}
              >
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <p className="font-semibold text-blue-800">Huéspedes</p>
                  <p className="text-xs text-blue-600 mt-1">Gestionar registros</p>
                </div>
              </div>
              
              <div 
                className="relative group cursor-pointer rounded-lg p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200"
                onClick={() => handleQuickAction('/rooms')}
              >
                <div className="text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p className="font-semibold text-green-800">Habitaciones</p>
                  <p className="text-xs text-green-600 mt-1">Estado y disponibilidad</p>
                </div>
              </div>
              
              <div 
                className="relative group cursor-pointer rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 col-span-2"
                onClick={() => handleQuickAction('/reservations')}
              >
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <p className="font-semibold text-purple-800">Nueva Reserva</p>
                  <p className="text-xs text-purple-600 mt-1">Crear nueva reservación</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sistema Operativo</span>
                <span className="text-sm font-medium text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Actualización</span>
                <span className="text-sm font-medium">Hace 2 minutos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuarios Conectados</span>
                <span className="text-sm font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
