import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, Clock } from 'lucide-react';
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

  // Mobile optimizations for all devices
  useEffect(() => {
    // Optimize viewport for all mobile devices
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
    }
    
    // Add mobile-specific styles for all devices
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    setVH();
    
    // Handle orientation changes and resize for all devices
    const handleViewportChange = () => {
      setTimeout(() => {
        setVH();
      }, 100);
    };
    
    window.addEventListener('orientationchange', handleViewportChange);
    window.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
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

  // Evitar pantalla en blanco: mostrar loader breve mientras redirige
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative flex-col justify-center mobile-safe-area mobile-full-height">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
          style={{ backgroundImage: 'url(/lovable-uploads/a71a95fb-44b6-4706-83ad-80878a466482.png)' }}
        />
        
        <div className="flex flex-1 relative z-10">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 sm:h-16 lg:h-18 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm px-2 sm:px-4 md:px-6 shadow-lg sticky top-0 z-50 min-h-14 touch-manipulation">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="group relative overflow-hidden p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 touch-manipulation bg-gradient-to-br from-primary via-primary/80 to-primary/60 hover:from-primary/80 hover:via-primary/60 hover:to-primary/40 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-90" />
                  </Button>
                </SidebarTrigger>
                
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden flex-1">
                  <img 
                    src="/lovable-uploads/3658ca09-e189-41d7-823c-dffeb5310531.png" 
                    alt="NARDINI SRL" 
                    className="h-6 sm:h-8 lg:h-10 w-auto object-contain flex-shrink-0"
                  />
                  <span className="font-bold text-primary truncate text-sm sm:text-base lg:text-lg">
                    <span className="hidden sm:inline">Gestión de Hoteles</span>
                    <span className="sm:hidden">Hotel</span>
                  </span>
                </div>
              </div>

              {/* User info section - role and date */}
              <div className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-primary">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="font-medium truncate hidden xs:inline">
                    {getRoleDisplayName(user?.role || '')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="font-mono">
                    <span className="hidden sm:inline">
                      {format(currentDateTime, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                    <span className="sm:hidden">
                      {format(currentDateTime, 'dd/MM HH:mm', { locale: es })}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="bg-white/80 hover:bg-white flex items-center gap-1 sm:gap-2 flex-shrink-0 touch-manipulation text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10 min-h-8"
                  title="Cerrar Sesión"
                  size="sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Cerrar</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 keyboard-adjust smooth-scroll">
              {children}
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};
