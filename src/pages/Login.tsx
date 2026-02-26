import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, TrendingUp, Shield, Eye, EyeOff } from "lucide-react";
import { SumarLogo } from "@/components/ui/BrandLogo";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, requestPasswordReset, isAuthenticated, isLoading } =
    useAuthContext();
  const { t, language } = useLanguage();
  const { setCurrency } = useCurrency();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    currency: "ARS" as "ARS" | "USD",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const getFriendlyAuthError = (error: string | undefined, type: "login" | "register") => {
    if (!error) {
      return type === "login"
        ? t("common.error.authLogin")
        : t("common.error.authRegister");
    }

    const normalized = error.toLowerCase();
    if (
      normalized.includes("invalid login credentials") ||
      normalized.includes("invalid credentials")
    ) {
      return t("common.error.invalidCredentials");
    }

    if (
      normalized.includes("email address") &&
      normalized.includes("invalid")
    ) {
      return t("common.error.invalidEmail");
    }

    if (normalized.includes("already registered") || normalized.includes("already been registered")) {
      return t("common.error.emailAlreadyRegistered");
    }

    if (
      normalized.includes("redirect") &&
      (normalized.includes("not allowed") || normalized.includes("invalid"))
    ) {
      return t("common.error.authRedirectInvalid");
    }

    return type === "login"
      ? t("common.error.authLogin")
      : t("common.error.authRegister");
  };

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
      toast.error(getFriendlyAuthError(result.error, "login"));
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
      registerData.currency,
    );

    if (result.success) {
      setCurrency(registerData.currency);
      if (result.requiresEmailVerification) {
        toast.success(t("common.auth.verifyEmail"));
      } else {
        toast.success(t("dashboard.welcome") + "!");
        // Redirigir explícitamente para mayor seguridad
        navigate("/dashboard", { replace: true });
      }
    } else {
      toast.error(getFriendlyAuthError(result.error, "register"));
      setIsSubmitting(false);
    }

    if (result.success) {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return;

    setIsSendingReset(true);
    const result = await requestPasswordReset(resetEmail);

    if (result.success) {
      toast.success(
        language === "es"
          ? "Te enviamos un email para restablecer tu contraseña"
          : "We sent you an email to reset your password",
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } else {
      toast.error(result.error || t("common.error.generic"));
    }

    setIsSendingReset(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex justify-center">
            <SumarLogo className="h-32 w-auto" />
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
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="sumar-pattern"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                {/* Larger, distinct Plus signs */}
                <path
                  d="M 25 30 L 35 30 M 30 25 L 30 35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-primary/60"
                />
                {/* Secondary smaller plus signs for texture */}
                <path
                  d="M 58 60 L 62 60 M 60 58 L 60 62"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-primary/40"
                />
              </pattern>
            </defs>
            {/* Base grid pattern */}
            <rect width="100%" height="100%" fill="url(#sumar-pattern)" />

            {/* Large abstract shapes for depth */}
            <circle
              cx="90%"
              cy="10%"
              r="30%"
              fill="currentColor"
              className="text-primary/5 blur-3xl"
            />
            <circle
              cx="10%"
              cy="90%"
              r="30%"
              fill="currentColor"
              className="text-primary/5 blur-3xl"
            />
          </svg>
        </div>

        {/* Language Switch & Theme Toggle - Top Right */}
        <div className="flex justify-end items-center gap-2 p-4 relative z-10">
          <ThemeToggle />
          <LanguageSwitch />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <Card className="w-full max-w-md shadow-lg backdrop-blur-sm">
            <CardHeader className="text-center">
              <SumarLogo className="h-16 w-auto mx-auto mb-4 lg:hidden" />
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
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder={t("login.password.placeholder")}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={
                            showLoginPassword
                              ? language === "es"
                                ? "Ocultar contraseña"
                                : "Hide password"
                              : language === "es"
                                ? "Mostrar contraseña"
                                : "Show password"
                          }
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword((prev) => !prev)}
                        className="text-sm text-primary hover:underline"
                      >
                        {language === "es"
                          ? "¿Olvidaste tu contraseña?"
                          : "Forgot your password?"}
                      </button>

                      {showForgotPassword && (
                        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {language === "es"
                              ? "Ingresá tu email y te enviamos un enlace para restablecerla."
                              : "Enter your email and we will send you a reset link."}
                          </p>
                          <div className="space-y-2">
                            <Input
                              type="email"
                              placeholder={t("login.email.placeholder")}
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void handlePasswordReset();
                                }
                              }}
                              required
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full"
                              disabled={isSendingReset}
                              onClick={() => {
                                void handlePasswordReset();
                              }}
                            >
                              {isSendingReset
                                ? language === "es"
                                  ? "Enviando..."
                                  : "Sending..."
                                : language === "es"
                                  ? "Enviar enlace"
                                  : "Send link"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                      <Label htmlFor="register-currency">
                        {t("login.currency")}
                      </Label>
                      <Select
                        value={registerData.currency}
                        onValueChange={(value: "ARS" | "USD") =>
                          setRegisterData({
                            ...registerData,
                            currency: value,
                          })
                        }
                      >
                        <SelectTrigger id="register-currency">
                          <SelectValue placeholder={t("login.currency.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder={t("login.password.placeholder")}
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          aria-label={
                            showRegisterPassword
                              ? language === "es"
                                ? "Ocultar contraseña"
                                : "Hide password"
                              : language === "es"
                                ? "Mostrar contraseña"
                                : "Show password"
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
