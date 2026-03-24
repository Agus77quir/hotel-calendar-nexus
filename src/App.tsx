
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/Layout/AppLayout";

const Index = lazy(() => import("./pages/Index"));
const GuestsPage = lazy(() => import("./pages/GuestsPage"));
const RoomsPage = lazy(() => import("./pages/RoomsPage"));
const ReservationsPage = lazy(() => import("./pages/ReservationsPage"));
const CheckInOutPage = lazy(() => import("./pages/CheckInOutPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const AuditPage = lazy(() => import("./pages/AuditPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted-foreground">Cargando...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
