
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import GuestsPage from "./pages/GuestsPage";
import RoomsPage from "./pages/RoomsPage";
import ReservationsPage from "./pages/ReservationsPage";
import CheckInOutPage from "./pages/CheckInOutPage";
import CalendarPage from "./pages/CalendarPage";
import AuditPage from "./pages/AuditPage";
import HistoryPage from "./pages/HistoryPage";
import { AuthPage } from "./components/Auth/AuthPage";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/Layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AppLayout><Outlet /></AppLayout>}>
              <Route index element={<Index />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="checkin-checkout" element={<CheckInOutPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
