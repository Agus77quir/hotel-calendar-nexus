
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">404</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Página no encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            La página que buscas no existe o ha sido movida.
          </p>
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border font-mono">
            Ruta: {location.pathname}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              onClick={handleGoHome}
              className="flex items-center gap-2 flex-1"
            >
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Button>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
          <div className="pt-4 text-xs text-gray-400 border-t">
            <p>Si este error persiste, contacta al administrador del sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
