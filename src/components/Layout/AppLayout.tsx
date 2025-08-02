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
import { useIsIPhone } from '@/hooks/use-mobile';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isIPhone = useIsIPhone();

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // iPhone-specific optimizations
  useEffect(() => {
    if (isIPhone) {
      // Optimize viewport for iPhone
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
      // Add iPhone-specific styles
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      
      // Handle orientation changes
      const handleOrientationChange = () => {
        setTimeout(() => {
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        }, 100);
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  }, [isIPhone]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full relative flex-col ${isIPhone ? 'iphone-safe-area iphone-full-height' : ''}`}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
          style={{ backgroundImage: 'url(/lovable-uploads/a71a95fb-44b6-4706-83ad-80878a466482.png)' }}
        />
        
        <div className="flex flex-1 relative z-10">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className={`${isIPhone ? 'h-16 sticky-header' : 'h-14 sm:h-16 md:h-20'} flex items-center justify-between border-b bg-white/95 backdrop-blur-sm px-2 sm:px-3 md:px-6 shadow-lg touch-manipulation`}>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`
                      group relative overflow-hidden
                      ${isIPhone ? 'p-4 min-h-16 min-w-16' : 'p-4 sm:p-5 md:p-6 min-h-14 min-w-14 sm:min-h-16 sm:min-w-16 md:min-h-20 md:min-w-20'} 
                      flex-shrink-0 touch-manipulation
                      bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800
                      hover:from-purple-700 hover:via-pink-600 hover:to-red-600
                      active:from-green-600 active:via-cyan-600 active:to-blue-700
                      text-white font-bold
                      shadow-2xl shadow-blue-600/50
                      hover:shadow-3xl hover:shadow-purple-600/70
                      active:shadow-2xl active:shadow-green-600/60
                      border-3 border-white/40
                      hover:border-white/60 active:border-white/80
                      transition-all duration-300 ease-out
                      transform hover:scale-110 active:scale-95
                      hover:rotate-6 active:rotate-[-6deg]
                      animate-pulse hover:animate-none
                      rounded-2xl
                      before:absolute before:inset-0 
                      before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                      before:translate-x-[-100%] hover:before:translate-x-[100%]
                      before:transition-transform before:duration-700
                      after:absolute after:inset-0 after:rounded-2xl
                      after:shadow-[inset_0_2px_0_rgba(255,255,255,0.5)]
                      backdrop-blur-sm
                    `}
                  >
                    <Menu className={`
                      ${isIPhone ? 'h-12 w-12' : 'h-8 w-8 sm:h-10 sm:w-10 md:h-16 md:w-16'} 
                      drop-shadow-2xl
                      transition-all duration-300 ease-out
                      group-hover:rotate-90 group-active:rotate-180
                      group-hover:scale-125 group-active:scale-110
                      filter group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1.2)]
                      group-active:drop-shadow-[0_0_25px_rgba(255,255,255,1.5)]
                      stroke-[4] group-hover:stroke-[5] group-active:stroke-[4.5]
                      text-white group-hover:text-yellow-100 group-active:text-green-100
                    `} />
                    
                    {/* Enhanced glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 group-active:opacity-90 transition-opacity duration-300 -z-10 animate-pulse"></div>
                    
                    {/* Secondary glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-50 group-active:opacity-60 transition-opacity duration-300 -z-20"></div>
                    
                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 bg-white/15 rounded-2xl opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity duration-200"></div>
                    
                    {/* Enhanced sparkle effects */}
                    <div className="absolute top-1 right-1 h-3 w-3 bg-yellow-300 rounded-full opacity-60 group-hover:opacity-100 group-hover:animate-ping"></div>
                    <div className="absolute bottom-2 left-2 h-2 w-2 bg-white rounded-full opacity-40 group-hover:opacity-80 group-hover:animate-pulse"></div>
                    <div className="absolute top-3 left-3 h-1 w-1 bg-cyan-300 rounded-full opacity-50 group-hover:opacity-90 group-hover:animate-bounce"></div>
                  </Button>
                </SidebarTrigger>
                
                <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 overflow-hidden flex-1">
                  <img 
                    src="/lovable-uploads/3658ca09-e189-41d7-823c-dffeb5310531.png" 
                    alt="NARDINI SRL" 
                    className={`${isIPhone ? 'h-8' : 'h-6 sm:h-8 md:h-12'} w-auto object-contain flex-shrink-0`}
                  />
                  <span className={`font-bold text-blue-600 truncate ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm md:text-lg'}`}>
                    <span className={isIPhone ? 'inline' : 'hidden sm:inline'}>Gestión de Hoteles</span>
                    <span className={isIPhone ? 'hidden' : 'sm:hidden'}>Hotel</span>
                  </span>
                </div>
              </div>

              {/* Simplified info section - only role and date */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mr-2 sm:mr-3">
                <div className="flex items-center gap-1 text-blue-600">
                  <User className={`${isIPhone ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
                  <span className={`font-medium ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'} truncate`}>
                    {getRoleDisplayName(user?.role || '')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className={`${isIPhone ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
                  <span className={`font-mono ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>
                    {format(currentDateTime, isIPhone ? 'dd/MM HH:mm' : 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
              </div>

              <div className="flex items-center flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className={`bg-white/80 hover:bg-white flex items-center gap-1 flex-shrink-0 touch-manipulation ${
                    isIPhone ? 'text-sm px-3 py-2 h-10 min-h-11' : 'text-xs px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-10'
                  }`}
                  title="Cerrar Sesión"
                  size="sm"
                >
                  <LogOut className={`${isIPhone ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
                  <span className={isIPhone ? 'inline' : 'hidden sm:inline'}>Cerrar</span>
                </Button>
              </div>
            </header>
            <main className={`flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm smooth-scroll ${
              isIPhone ? 'p-3 keyboard-adjust' : 'p-2 sm:p-3 md:p-6'
            }`}>
              {children}
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};
