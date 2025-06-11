
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/Layout/AppLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import CalendarPage from "@/pages/CalendarPage";
import ReservationsPage from "@/pages/ReservationsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <AppLayout>
                <Index />
              </AppLayout>
            } />
            <Route path="/calendar" element={
              <AppLayout>
                <CalendarPage />
              </AppLayout>
            } />
            <Route path="/reservations" element={
              <AppLayout>
                <ReservationsPage />
              </AppLayout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
