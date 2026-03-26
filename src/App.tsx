
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/Layout/AppLayout";

const loadIndex = () => import("./pages/Index");
const loadGuestsPage = () => import("./pages/GuestsPage");
const loadRoomsPage = () => import("./pages/RoomsPage");
const loadReservationsPage = () => import("./pages/ReservationsPage");
const loadCheckInOutPage = () => import("./pages/CheckInOutPage");
const loadCalendarPage = () => import("./pages/CalendarPage");
const loadAuditPage = () => import("./pages/AuditPage");
const loadHistoryPage = () => import("./pages/HistoryPage");
const loadLogin = () => import("./pages/Login");
const loadNotFound = () => import("./pages/NotFound");

const Index = lazy(loadIndex);
const GuestsPage = lazy(loadGuestsPage);
const RoomsPage = lazy(loadRoomsPage);
const ReservationsPage = lazy(loadReservationsPage);
const CheckInOutPage = lazy(loadCheckInOutPage);
const CalendarPage = lazy(loadCalendarPage);
const AuditPage = lazy(loadAuditPage);
const HistoryPage = lazy(loadHistoryPage);
const Login = lazy(loadLogin);
const NotFound = lazy(loadNotFound);

const queryClient = new QueryClient();

const warmRouteChunks = () => {
  void loadIndex();
  void loadGuestsPage();
  void loadRoomsPage();
  void loadReservationsPage();
  void loadCheckInOutPage();
  void loadCalendarPage();
  void loadAuditPage();
  void loadHistoryPage();
  void loadLogin();
  void loadNotFound();
};

const RouteChunkPreloader = () => {
  useEffect(() => {
    const preload = () => warmRouteChunks();

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preload, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RouteChunkPreloader />
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
