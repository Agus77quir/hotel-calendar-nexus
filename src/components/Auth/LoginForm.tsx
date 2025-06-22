
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Hotel className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-blue-600">NARDINI</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión Hotelera</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Credenciales de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">{cred.role}</p>
                <p className="text-xs text-muted-foreground">Email: {cred.email}</p>
                <p className="text-xs text-muted-foreground">Contraseña: {cred.password}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className="mt-2 h-6 text-xs"
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
