
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
  const { setOpenMobile, isMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false) // Hide mobile menu when navigation item is clicked
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-gray-700 mb-2">
            Gestión Hotelera
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full h-10 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 active:bg-gray-200"
                  >
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3 text-sm font-medium"
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
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
