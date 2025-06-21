
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Users, Bed, Calendar, ClipboardList, CheckSquare, Shield } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useEffect } from "react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Huéspedes",
    url: "/guests",
    icon: Users,
  },
  {
    title: "Habitaciones",
    url: "/rooms",
    icon: Bed,
  },
  {
    title: "Reservas",
    url: "/reservations",
    icon: ClipboardList,
  },
  {
    title: "Calendario",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Check-in/out",
    url: "/checkin-checkout",
    icon: CheckSquare,
  },
  {
    title: "Auditoría",
    url: "/audit",
    icon: Shield,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  // Guardar automáticamente la selección del menú
  useEffect(() => {
    const currentPath = location.pathname;
    const selectedMenuItem = menuItems.find(item => item.url === currentPath);
    
    if (selectedMenuItem) {
      // Guardar en localStorage la última sección visitada
      localStorage.setItem('lastSelectedMenuItem', JSON.stringify({
        title: selectedMenuItem.title,
        url: selectedMenuItem.url,
        timestamp: new Date().toISOString()
      }));
      
      console.log(`Menú guardado automáticamente: ${selectedMenuItem.title}`);
      
      // Cerrar el sidebar en móviles cuando se seleccione una sección
      if (isMobile) {
        setOpenMobile(false);
        console.log('Sidebar cerrado automáticamente en móvil');
      }
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const handleMenuItemClick = () => {
    // Cerrar sidebar en móviles al hacer clic en cualquier elemento del menú
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Hotelera</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full"
                  >
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3"
                      onClick={handleMenuItemClick}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
