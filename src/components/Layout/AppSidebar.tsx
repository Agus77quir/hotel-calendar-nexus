
import {
  CalendarDays,
  FileText,
  Home,
  Users,
  Building2,
  Calendar,
  UserCheck,
  Wrench,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle('dark', !isDarkTheme);
  };

  const handleNavigate = (url: string) => {
    navigate(url);
    // Hide sidebar on mobile after navigation
    setOpenMobile(false);
  };

  const navigationItems = [
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
      icon: Building2,
    },
    {
      title: "Reservas",
      url: "/reservations",
      icon: Calendar,
    },
    {
      title: "Calendario",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Check-in/out",
      url: "/checkin-checkout",
      icon: UserCheck,
    },
    {
      title: "Mantenimiento",
      url: "/maintenance",
      icon: Wrench,
    },
    {
      title: "Auditoría",
      url: "/audit",
      icon: FileText,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="md:w-60">
        <SidebarHeader>
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Hotel Admin</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton onClick={() => handleNavigate(item.url)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="p-4">
            <Label htmlFor="dark-theme" className="text-sm">
              Modo oscuro
            </Label>
            <Switch
              id="dark-theme"
              checked={isDarkTheme}
              onCheckedChange={toggleTheme}
            />
          </div>
        </SidebarFooter>
        <SidebarRail>
          <SidebarTrigger />
        </SidebarRail>
      </Sidebar>
    </SidebarProvider>
  )
}
