
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
import { Home, Bed, Calendar, ClipboardList, CheckSquare, Shield, Settings } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const allMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ['admin'],
  },
  {
    title: "Reservas",
    url: "/reservations",
    icon: ClipboardList,
    roles: ['admin', 'receptionist'],
  },
  {
    title: "Habitaciones",
    url: "/rooms",
    icon: Bed,
    roles: ['admin'],
  },
  {
    title: "Calendario",
    url: "/calendar",
    icon: Calendar,
    roles: ['admin', 'receptionist'],
  },
  {
    title: "Check-in/out",
    url: "/checkin-checkout",
    icon: CheckSquare,
    roles: ['admin'],
  },
  {
    title: "Auditoría",
    url: "/audit",
    icon: Shield,
    roles: ['admin'],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()
  const { user } = useAuth()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-white/20 rounded-md px-3 py-2">
            <Settings className="h-4 w-4" />
            Gestión Hotelera
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full h-10 px-3 py-2 rounded-md transition-colors hover:bg-gray-100/30 active:bg-gray-200/30 bg-white/20"
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
