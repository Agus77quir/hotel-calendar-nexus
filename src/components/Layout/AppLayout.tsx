
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
          style={{ backgroundImage: 'url(/lovable-uploads/a71a95fb-44b6-4706-83ad-80878a466482.png)' }}
        />
        
        <AppSidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <header className="h-20 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm px-6 shadow-lg">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <div className="flex items-center gap-4">
                <img 
                  src="/lovable-uploads/3658ca09-e189-41d7-823c-dffeb5310531.png" 
                  alt="NARDINI SRL" 
                  className="h-12 w-auto object-contain"
                />
                <div className="hidden sm:block">
                  <span className="font-bold text-lg text-blue-600">Hotel Management System</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto bg-white/80 backdrop-blur-sm">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
