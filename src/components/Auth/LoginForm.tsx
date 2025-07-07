
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 filter brightness-110 contrast-105 saturate-110"
        style={{ backgroundImage: 'url(/lovable-uploads/df278197-6f7a-404b-ba89-ccbfc43e0d34.png)' }}
      />
      
      {/* Enhanced overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/30 to-black/50 z-10" />
      
      {/* Decorative overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 z-15" />
      
      <div className="w-full max-w-md relative z-20">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl">
              <Hotel className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-2xl filter brightness-110">
                Nardini S.R.L
              </h1>
              <p className="text-lg text-white/95 font-medium drop-shadow-lg filter brightness-105">
                Sistema de Gestión Hotelera
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white/25 backdrop-blur-lg border-white/20 shadow-2xl ring-1 ring-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white drop-shadow-lg">Iniciar Sesión</CardTitle>
            <CardDescription className="text-white/90 text-base font-medium drop-shadow-sm">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium drop-shadow-sm">Usuario</Label>
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
                  className="bg-white/90 border-white/30 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium drop-shadow-sm">Contraseña</Label>
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
                    className="bg-white/90 border-white/30 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
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
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg" 
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
