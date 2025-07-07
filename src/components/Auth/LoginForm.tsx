
import { useState, useEffect } from 'react';
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

  // Clear fields on component mount and unmount
  useEffect(() => {
    setEmail('');
    setPassword('');
    
    return () => {
      setEmail('');
      setPassword('');
    };
  }, []);

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
        // Clear form immediately after successful login
        setEmail('');
        setPassword('');
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: 'Credenciales incorrectas',
          variant: 'destructive',
        });
        // Clear password on failed login
        setPassword('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al iniciar sesión',
        variant: 'destructive',
      });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Prevent browser from storing the value
    e.target.setAttribute('autocomplete', 'off');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Prevent browser from storing the value
    e.target.setAttribute('autocomplete', 'new-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image - Full visibility */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/lovable-uploads/df278197-6f7a-404b-ba89-ccbfc43e0d34.png)' }}
      />
      
      {/* Minimal overlay for readability */}
      <div className="absolute inset-0 bg-black/20 z-10" />
      
      <div className="w-full max-w-md relative z-20">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Hotel className="h-10 w-10 text-white drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Nardini S.R.L</h1>
              <p className="text-sm text-white/90 drop-shadow">Sistema de Gestión Hotelera</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email">Usuario</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="Ingresa tu usuario"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
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
      </div>
    </div>
  );
};
