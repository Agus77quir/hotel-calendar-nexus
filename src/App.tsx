
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RoomsPage from "./pages/RoomsPage";
import ReservationsPage from "./pages/ReservationsPage";
import CalendarPage from "./pages/CalendarPage";
import AuditPage from "./pages/AuditPage";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/Layout/AppLayout";

// Configuración optimizada del QueryClient para mejor rendimiento
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos 
      retry: 1, // Un solo reintento
      refetchOnWindowFocus: false, // Evitar refetches innecesarios
      refetchOnReconnect: false, // Evitar refetches en reconexión
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/reservations" element={<AppLayout><ReservationsPage /></AppLayout>} />
              <Route path="/rooms" element={<AppLayout><RoomsPage /></AppLayout>} />
              <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
              <Route path="/audit" element={<AppLayout><AuditPage /></AppLayout>} />
              {/* Redireccionar la ruta eliminada al dashboard */}
              <Route path="/checkin-checkout" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
