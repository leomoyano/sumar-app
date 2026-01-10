import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Wallet, TrendingUp, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuthContext();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Error al iniciar sesión');
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (registerData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }
    
    const result = await register(registerData.email, registerData.password, registerData.name);
    
    if (result.success) {
      toast.success('¡Cuenta creada exitosamente! Revisa tu email para confirmar.');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Error al registrarse');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-primary-foreground">
            GastosApp
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Tu compañero inteligente para gestionar gastos mensuales
          </p>
          
          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Control Total</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Organiza tus gastos por mes y etiquetas
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Multidivisa</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Seguimiento en pesos argentinos y dólares
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Seguro</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Tus datos siempre protegidos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
            <CardDescription>
              Inicia sesión o crea una cuenta para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 pt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
