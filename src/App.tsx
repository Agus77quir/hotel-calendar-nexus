
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import GuestsPage from "./pages/GuestsPage";
import RoomsPage from "./pages/RoomsPage";
import ReservationsPage from "./pages/ReservationsPage";
import CalendarPage from "./pages/CalendarPage";
import CheckInOutPage from "./pages/CheckInOutPage";
import AuditPage from "./pages/AuditPage";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/Layout/AppLayout";

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Reduce retries for faster error handling
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
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
              <Route path="/guests" element={<AppLayout><GuestsPage /></AppLayout>} />
              <Route path="/rooms" element={<AppLayout><RoomsPage /></AppLayout>} />
              <Route path="/reservations" element={<AppLayout><ReservationsPage /></AppLayout>} />
              <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
              <Route path="/checkin-checkout" element={<AppLayout><CheckInOutPage /></AppLayout>} />
              <Route path="/audit" element={<AppLayout><AuditPage /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
