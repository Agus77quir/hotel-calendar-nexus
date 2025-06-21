
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente',
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: 'Credenciales incorrectas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@nardini.com', password: 'admin123' },
    { role: 'Recepcionista', email: 'recepcion@nardini.com', password: 'recep123' },
    { role: 'Huésped', email: 'huesped@example.com', password: 'guest123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-4">
      <div className="w-full max-w-[340px] xs:max-w-sm sm:max-w-md space-y-3 sm:space-y-4">
        <div className="text-center px-2">
          <div className="flex justify-center items-center gap-2 mb-3 sm:mb-4">
            <Hotel className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-blue-600" />
            <div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-blue-600">NARDINI</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Sistema de Gestión Hotelera</p>
            </div>
          </div>
        </div>

        <Card className="mx-2 xs:mx-0">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base xs:text-lg sm:text-xl text-center xs:text-left">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs xs:text-sm text-center xs:text-left">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs xs:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="h-9 xs:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-xs xs:text-sm">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-9 xs:h-10 pr-9 xs:pr-10 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full w-8 xs:w-10 px-2 xs:px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 xs:h-4 xs:w-4" />
                    ) : (
                      <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-9 xs:h-10 text-sm" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mx-2 xs:mx-0">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs xs:text-sm text-center xs:text-left">Credenciales de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="p-2.5 xs:p-3 bg-muted rounded-lg">
                <p className="font-medium text-xs xs:text-sm">{cred.role}</p>
                <p className="text-[10px] xs:text-xs text-muted-foreground break-all">Email: {cred.email}</p>
                <p className="text-[10px] xs:text-xs text-muted-foreground">Contraseña: {cred.password}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="mt-1.5 xs:mt-2 h-5 xs:h-6 text-[10px] xs:text-xs w-full px-2"
                >
                  Usar credenciales
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
