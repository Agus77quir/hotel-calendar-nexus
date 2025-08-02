
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
                      ${isIPhone ? 'p-6 min-h-16 min-w-16' : 'p-4 sm:p-5 md:p-6 min-h-14 min-w-14 sm:min-h-16 sm:min-w-16 md:min-h-20 md:min-w-20'} 
                      flex-shrink-0 touch-manipulation
                      bg-gradient-to-br from-violet-500 via-purple-600 via-fuchsia-500 via-pink-500 via-rose-500 to-orange-500
                      hover:from-cyan-500 hover:via-blue-600 hover:via-violet-600 hover:via-purple-600 hover:to-fuchsia-600
                      active:from-emerald-500 active:via-teal-600 active:via-cyan-600 active:via-blue-600 active:to-violet-600
                      text-white font-black text-lg
                      shadow-2xl shadow-purple-500/60
                      hover:shadow-[0_0_40px_rgba(168,85,247,0.8),_0_0_80px_rgba(236,72,153,0.6)]
                      active:shadow-[0_0_60px_rgba(59,130,246,0.9),_0_0_120px_rgba(139,92,246,0.7)]
                      border-4 border-white/40
                      hover:border-white/60 active:border-white/80
                      transition-all duration-500 ease-out
                      transform hover:scale-125 active:scale-105
                      hover:rotate-12 active:rotate-[-12deg]
                      animate-pulse hover:animate-bounce active:animate-spin
                      before:absolute before:inset-0 
                      before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                      before:translate-x-[-300%] hover:before:translate-x-[300%]
                      before:transition-transform before:duration-1000
                      after:absolute after:inset-0 after:rounded-lg
                      after:shadow-[inset_0_2px_0_rgba(255,255,255,0.5),_inset_0_-2px_0_rgba(0,0,0,0.2)]
                      hover:after:shadow-[inset_0_4px_8px_rgba(255,255,255,0.6),_inset_0_-4px_8px_rgba(0,0,0,0.3)]
                      backdrop-blur-sm
                    `}
                  >
                    <Menu className={`
                      ${isIPhone ? 'h-8 w-8' : 'h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10'} 
                      drop-shadow-2xl
                      transition-all duration-500 ease-out
                      group-hover:rotate-180 group-active:rotate-360
                      group-hover:scale-150 group-active:scale-125
                      filter group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]
                      group-active:drop-shadow-[0_0_30px_rgba(255,255,255,1)]
                    `} />
                    
                    {/* Multi-layer glow effect */}
                    <div className="absolute -inset-2 bg-gradient-conic from-violet-500 via-purple-500 via-fuchsia-500 via-pink-500 to-violet-500 rounded-xl blur-lg opacity-40 group-hover:opacity-80 group-active:opacity-100 transition-opacity duration-500 -z-10 animate-spin"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur-md opacity-30 group-hover:opacity-60 group-active:opacity-80 transition-opacity duration-300 -z-10"></div>
                    
                    {/* Enhanced ripple effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity duration-200"></div>
                    
                    {/* Sparkle effect */}
                    <div className="absolute top-1 right-1 h-2 w-2 bg-white rounded-full opacity-60 group-hover:animate-ping"></div>
                    <div className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-yellow-300 rounded-full opacity-40 group-hover:animate-bounce group-hover:delay-100"></div>
                    <div className="absolute top-1/2 left-0 h-1 w-1 bg-cyan-300 rounded-full opacity-50 group-hover:animate-pulse group-hover:delay-200"></div>
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
