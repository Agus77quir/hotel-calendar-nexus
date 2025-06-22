
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, Search, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingGuestSearch } from '@/components/Search/FloatingGuestSearch';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <header className="h-16 md:h-20 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm px-3 md:px-6 shadow-lg">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger>
                  <Button variant="ghost" size="lg" className="p-2 md:p-3">
                    <Menu className="h-6 w-6 md:h-9 md:w-9 text-blue-700 drop-shadow-md" />
                  </Button>
                </SidebarTrigger>
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  <img 
                    src="/lovable-uploads/3658ca09-e189-41d7-823c-dffeb5310531.png" 
                    alt="NARDINI SRL" 
                    className="h-8 md:h-12 w-auto object-contain flex-shrink-0"
                  />
                  <div className="hidden sm:block min-w-0">
                    <span className="font-bold text-sm md:text-lg text-blue-600 truncate">Gestión de Hoteles</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-white/80 hover:bg-white h-8 w-8 md:h-10 md:w-10"
                  onClick={() => setIsSearchOpen(true)}
                  title="Buscar huéspedes (Ctrl+K)"
                >
                  <Search className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="bg-white/80 hover:bg-white flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
                  title="Cerrar Sesión"
                  size="sm"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 p-3 md:p-6 overflow-y-auto bg-white/80 backdrop-blur-sm">
              {children}
            </main>
          </div>
        </div>
        
        <Footer />
      </div>

      <FloatingGuestSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </SidebarProvider>
  );
};
