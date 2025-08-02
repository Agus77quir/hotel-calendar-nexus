
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
                      ${isIPhone ? 'p-8 min-h-20 min-w-20' : 'p-6 sm:p-7 md:p-8 min-h-16 min-w-16 sm:min-h-18 sm:min-w-18 md:min-h-24 md:min-w-24'} 
                      flex-shrink-0 touch-manipulation rounded-2xl
                      bg-gradient-to-br from-violet-600 via-purple-700 via-fuchsia-600 via-pink-600 via-rose-600 to-orange-600
                      hover:from-cyan-600 hover:via-blue-700 hover:via-violet-700 hover:via-purple-700 hover:to-fuchsia-700
                      active:from-emerald-600 active:via-teal-700 active:via-cyan-700 active:via-blue-700 active:to-violet-700
                      text-white font-black text-xl
                      shadow-[0_20px_40px_rgba(168,85,247,0.6),_0_10px_20px_rgba(236,72,153,0.4),_inset_0_1px_0_rgba(255,255,255,0.4)]
                      hover:shadow-[0_0_60px_rgba(168,85,247,0.9),_0_0_120px_rgba(236,72,153,0.7),_0_30px_60px_rgba(59,130,246,0.5)]
                      active:shadow-[0_0_80px_rgba(59,130,246,0.95),_0_0_160px_rgba(139,92,246,0.8),_0_40px_80px_rgba(16,185,129,0.6)]
                      border-4 border-white/60
                      hover:border-white/80 active:border-white/90
                      transition-all duration-700 ease-out
                      transform hover:scale-150 active:scale-125
                      hover:rotate-[18deg] active:rotate-[-18deg]
                      animate-[pulse_3s_ease-in-out_infinite] hover:animate-[bounce_0.6s_ease-in-out_infinite] active:animate-[spin_0.8s_ease-in-out_1]
                      before:absolute before:inset-0 
                      before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
                      before:translate-x-[-400%] hover:before:translate-x-[400%]
                      before:transition-transform before:duration-1200 before:ease-out
                      after:absolute after:inset-0 after:rounded-2xl
                      after:shadow-[inset_0_4px_8px_rgba(255,255,255,0.6),_inset_0_-4px_8px_rgba(0,0,0,0.2)]
                      hover:after:shadow-[inset_0_6px_12px_rgba(255,255,255,0.7),_inset_0_-6px_12px_rgba(0,0,0,0.3)]
                      backdrop-blur-sm
                      hover:backdrop-blur-md
                    `}
                  >
                    <Menu className={`
                      ${isIPhone ? 'h-10 w-10' : 'h-8 w-8 sm:h-9 sm:w-9 md:h-12 md:w-12'} 
                      drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]
                      transition-all duration-700 ease-out
                      group-hover:rotate-[360deg] group-active:rotate-[720deg]
                      group-hover:scale-175 group-active:scale-150
                      filter group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,1)]
                      group-active:drop-shadow-[0_0_40px_rgba(255,255,255,1)]
                      group-hover:brightness-150 group-active:brightness-200
                    `} />
                    
                    {/* Enhanced multi-layer glow effects */}
                    <div className="absolute -inset-4 bg-gradient-conic from-violet-600 via-purple-600 via-fuchsia-600 via-pink-600 to-violet-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-90 group-active:opacity-100 transition-opacity duration-700 -z-10 animate-[spin_8s_linear_infinite]"></div>
                    <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 group-active:opacity-90 transition-opacity duration-500 -z-10"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 group-active:opacity-80 transition-opacity duration-400 -z-10"></div>
                    
                    {/* Enhanced ripple effects */}
                    <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-active:opacity-100 group-active:animate-[ping_0.8s_ease-out_1] transition-opacity duration-200"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-cyan-300/50 to-pink-300/50 rounded-xl opacity-0 group-active:opacity-100 group-active:animate-[ping_1s_ease-out_1] transition-opacity duration-300"></div>
                    
                    {/* Enhanced sparkle effects */}
                    <div className="absolute top-2 right-2 h-3 w-3 bg-white rounded-full opacity-70 group-hover:animate-[ping_1s_ease-in-out_infinite] group-hover:bg-yellow-300"></div>
                    <div className="absolute bottom-2 left-2 h-2.5 w-2.5 bg-yellow-300 rounded-full opacity-50 group-hover:animate-[bounce_1s_ease-in-out_infinite] group-hover:delay-150 group-hover:bg-cyan-300"></div>
                    <div className="absolute top-1/2 left-1 h-2 w-2 bg-cyan-300 rounded-full opacity-60 group-hover:animate-[pulse_1.5s_ease-in-out_infinite] group-hover:delay-300 group-hover:bg-pink-300"></div>
                    <div className="absolute top-3 left-1/2 h-1.5 w-1.5 bg-pink-300 rounded-full opacity-40 group-hover:animate-[spin_2s_linear_infinite] group-hover:bg-violet-300"></div>
                    <div className="absolute bottom-3 right-1/3 h-2 w-2 bg-violet-300 rounded-full opacity-50 group-hover:animate-[bounce_1.2s_ease-in-out_infinite] group-hover:delay-500 group-hover:bg-emerald-300"></div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute -inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 left-1/4 h-1 w-1 bg-white rounded-full animate-[float_3s_ease-in-out_infinite]"></div>
                      <div className="absolute top-1/4 right-0 h-1.5 w-1.5 bg-cyan-300 rounded-full animate-[float_4s_ease-in-out_infinite] animation-delay-1000"></div>
                      <div className="absolute bottom-1/4 left-0 h-1 w-1 bg-pink-300 rounded-full animate-[float_3.5s_ease-in-out_infinite] animation-delay-2000"></div>
                      <div className="absolute bottom-0 right-1/4 h-1.5 w-1.5 bg-violet-300 rounded-full animate-[float_4.5s_ease-in-out_infinite] animation-delay-1500"></div>
                    </div>
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
