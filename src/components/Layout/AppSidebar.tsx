
import { Calendar, Users, Bed, Settings, BarChart3, LogOut, Hotel, UserCheck, Clock } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Reservas', url: '/reservations', icon: UserCheck },
  { title: 'Habitaciones', url: '/rooms', icon: Bed },
  { title: 'Huéspedes', url: '/guests', icon: Users },
  { title: 'Check-in/out', url: '/checkin', icon: Clock },
  { title: 'Configuración', url: '/settings', icon: Settings },
];

const receptionistItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Reservas', url: '/reservations', icon: UserCheck },
  { title: 'Habitaciones', url: '/rooms', icon: Bed },
  { title: 'Huéspedes', url: '/guests', icon: Users },
  { title: 'Check-in/out', url: '/checkin', icon: Clock },
];

const guestItems = [
  { title: 'Mi Reserva', url: '/my-reservation', icon: UserCheck },
  { title: 'Servicios', url: '/services', icon: Hotel },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getItemsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'receptionist':
        return receptionistItems;
      case 'guest':
        return guestItems;
      default:
        return [];
    }
  };

  const items = getItemsForRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-blue-600" />
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-blue-600">NARDINI</h2>
                <p className="text-xs text-muted-foreground">Hotel Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) => 
                        isActive 
                          ? 'bg-blue-100 text-blue-600 font-medium' 
                          : 'hover:bg-muted/50'
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          {!collapsed && user && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
