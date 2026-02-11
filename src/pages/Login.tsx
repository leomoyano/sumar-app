import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, TrendingUp, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useAuthContext();
  const { t } = useLanguage();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir cuando el usuario se autentique exitosamente
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(loginData.email, loginData.password);

    if (result.success) {
      toast.success(t("dashboard.welcome") + "!");
      // Redirigir explícitamente para mayor seguridad
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Error");
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (registerData.password.length < 6) {
      toast.error(t("login.error.passwordLength"));
      setIsSubmitting(false);
      return;
    }

    const result = await register(
      registerData.email,
      registerData.password,
      registerData.name,
    );

    if (result.success) {
      toast.success(t("dashboard.welcome") + "!");
      // Redirigir explícitamente para mayor seguridad
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Sumar"
              className="h-16 w-16 rounded-2xl object-cover shadow-sm border border-white/10"
            />
            <h1 className="text-4xl font-bold text-primary-foreground">
              {t("login.title")}
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            {t("login.subtitle")}
          </p>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">
                  {t("login.features.tracking")}
                </h3>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">
                  {t("login.features.conversion")}
                </h3>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">
                  {t("login.features.analysis")}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Language Switch & Theme Toggle - Top Right */}
        <div className="flex justify-end items-center gap-2 p-4">
          <ThemeToggle />
          <LanguageSwitch />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <img
                src={logo}
                alt="Sumar"
                className="h-14 w-14 mx-auto mb-4 rounded-2xl lg:hidden object-cover shadow-sm border"
              />
              <CardTitle className="text-2xl font-bold">
                {t("login.title")}
              </CardTitle>
              <CardDescription>{t("login.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">
                    {t("login.tab.login")}
                  </TabsTrigger>
                  <TabsTrigger value="register">
                    {t("login.tab.register")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 pt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("login.email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("login.email.placeholder")}
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">
                        {t("login.password")}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t("login.password.placeholder")}
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? t("login.loading")
                        : t("login.button.login")}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 pt-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">{t("login.name")}</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder={t("login.name.placeholder")}
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t("login.email")}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t("login.email.placeholder")}
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">
                        {t("login.password")}
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder={t("login.password.placeholder")}
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? t("login.loading")
                        : t("login.button.register")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
