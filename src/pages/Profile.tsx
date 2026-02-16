import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/layout/AppLayout";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, ArrowLeft, Save, Lock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuthContext();
  const { language } = useLanguage();

  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(
        language === "es"
          ? "Perfil actualizado correctamente"
          : "Profile updated successfully",
      );
      setIsSaving(false);
    }, 1000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setTimeout(() => {
      toast.success(
        language === "es" ? "Contraseña actualizada" : "Password updated",
      );
      setIsChangingPassword(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="space-y-8 pt-4 pb-20 max-w-2xl mx-auto">
        <div>
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className="pl-0 gap-2 mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "es" ? "Volver al Dashboard" : "Back to Dashboard"}
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {language === "es" ? "Mi Perfil" : "My Profile"}
          </h1>
          <p className="text-muted-foreground">
            {language === "es"
              ? "Administrá tu información personal."
              : "Manage your personal information."}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed">
            <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-sm">
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "es" ? "Datos de la Cuenta" : "Account Details"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Actualizá tu nombre y verificá tu información."
                  : "Update your name and verify your information."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === "es" ? "Email" : "Email"}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-9 bg-muted/50"
                    />
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {language === "es"
                      ? "El email no se puede cambiar."
                      : "Email cannot be changed."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    {language === "es" ? "Nombre completo" : "Full Name"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                        {language === "es" ? "Guardando..." : "Saving..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {language === "es" ? "Guardar Cambios" : "Save Changes"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "es" ? "Seguridad" : "Security"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Actualizá tu contraseña para mantener tu cuenta segura."
                  : "Update your password to keep your account secure."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    {language === "es"
                      ? "Contraseña actual"
                      : "Current Password"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      className="pl-9"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">
                      {language === "es" ? "Nueva contraseña" : "New Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        className="pl-9"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      {language === "es" ? "Confirmar" : "Confirm"}
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        className="pl-9"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                        {language === "es" ? "Actualizando..." : "Updating..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {language === "es"
                          ? "Actualizar Contraseña"
                          : "Update Password"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
