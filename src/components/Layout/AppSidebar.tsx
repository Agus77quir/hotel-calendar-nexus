
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
  const { setOpenMobile } = useSidebar()

  const handleNavClick = () => {
    setOpenMobile(false) // Hide mobile menu when navigation item is clicked
  }

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
                      onClick={handleNavClick}
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
