
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, Clock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'receptionist':
        return 'Recepcionista';
      default:
        return role;
    }
  };

  const getSystemStatus = () => {
    return 'Sistema Operativo'; // Sistema siempre operativo
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
          style={{ backgroundImage: 'url(/lovable-uploads/a71a95fb-44b6-4706-83ad-80878a466482.png)' }}
        />
        
        <div className="flex flex-1 relative z-10">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 sm:h-16 md:h-20 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm px-2 sm:px-3 md:px-6 shadow-lg">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm" className="p-1 sm:p-2 md:p-3 flex-shrink-0">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-700 drop-shadow-md" />
                  </Button>
                </SidebarTrigger>
                <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 overflow-hidden flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                    <img 
                      src="/lovable-uploads/3658ca09-e189-41d7-823c-dffeb5310531.png" 
                      alt="NARDINI SRL" 
                      className="h-6 sm:h-8 md:h-12 w-auto object-contain flex-shrink-0"
                    />
                    <span className="font-bold text-xs sm:text-sm md:text-lg text-blue-600 truncate">
                      <span className="hidden sm:inline">Gestión de Hoteles</span>
                      <span className="sm:hidden">Hotel</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">{getSystemStatus()}</span>
                      <span className="sm:hidden">Online</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="font-medium text-xs truncate">{getRoleDisplayName(user?.role || '')}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-gray-600">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="font-mono text-xs">
                        <span className="hidden md:inline">
                          {format(currentDateTime, 'dd/MM/yyyy - HH:mm:ss', { locale: es })}
                        </span>
                        <span className="md:hidden">
                          {format(currentDateTime, 'dd/MM - HH:mm', { locale: es })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
                {/* User info - hidden on small screens, shown on large screens */}
                <div className="hidden lg:flex items-center gap-2 bg-white/80 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium text-gray-900 truncate max-w-20">{user?.firstName}</div>
                    <div className="text-xs text-gray-600 truncate">{getRoleDisplayName(user?.role || '')}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="bg-white/80 hover:bg-white flex items-center gap-1 text-xs px-2 sm:px-3 md:px-4 flex-shrink-0 h-7 sm:h-8 md:h-10"
                  title="Cerrar Sesión"
                  size="sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Cerrar</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 p-2 sm:p-3 md:p-6 overflow-y-auto bg-white/80 backdrop-blur-sm">
              {children}
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};
