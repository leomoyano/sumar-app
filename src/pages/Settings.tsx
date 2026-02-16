import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Globe,
  Wallet,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [pendingCurrency, setPendingCurrency] = useState<"ARS" | "USD" | null>(
    null,
  );

  const handleCurrencyChange = (val: "ARS" | "USD") => {
    if (val !== currency) {
      setPendingCurrency(val);
    }
  };

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency);
      setPendingCurrency(null);
    }
  };

  const cancelCurrencyChange = () => {
    setPendingCurrency(null);
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
            <SettingsIcon className="h-6 w-6 text-primary" />
            {language === "es" ? "Configuración" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {language === "es"
              ? "Administrá tus preferencias globales de la aplicación."
              : "Manage your global application preferences."}
          </p>
        </div>

        {/* General Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {language === "es" ? "General" : "General"}
          </h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                {language === "es" ? "Idioma" : "Language"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Seleccioná el idioma de la interfaz."
                  : "Select the interface language."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="flex flex-col gap-1">
                  <span>
                    {language === "es" ? "Idioma de la App" : "App Language"}
                  </span>
                  <span className="font-normal text-xs text-muted-foreground">
                    {language === "es"
                      ? "Esto actualizará todos los textos."
                      : "This will update all texts."}
                  </span>
                </Label>
                <Select
                  value={language}
                  onValueChange={(val: "es" | "en") => setLanguage(val)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español 🇦🇷</SelectItem>
                    <SelectItem value="en">English 🇺🇸</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4" />
                {language === "es" ? "Moneda Principal" : "Primary Currency"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Elegí tu moneda base para los reportes."
                  : "Choose your base currency for reports."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="currency" className="flex flex-col gap-1">
                  <span>
                    {language === "es"
                      ? "Moneda por defecto"
                      : "Default Currency"}
                  </span>
                  <span className="font-normal text-xs text-muted-foreground">
                    {language === "es"
                      ? "Afecta cómo se muestran los totales."
                      : "Affects how totals are displayed."}
                  </span>
                </Label>
                <Select
                  value={currency}
                  onValueChange={(val: "ARS" | "USD") =>
                    handleCurrencyChange(val)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!pendingCurrency}
        onOpenChange={(open) => !open && cancelCurrencyChange()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              {language === "es" ? "Atención" : "Warning"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground">
              {language === "es" ? (
                <>
                  Estás a punto de cambiar tu moneda principal a{" "}
                  <b>{pendingCurrency}</b>.
                  <br />
                  <br />
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                    <li>
                      Se utilizará la cotización del <b>Dólar Blue</b> para las
                      conversiones.
                    </li>
                    <li>
                      Si tenés historial (más de 1 mes), tené en cuenta que la
                      conversión <b>solo cambiará visualmente el mes actual</b>{" "}
                      y futuros, o podría ser inexacta para meses anteriores al
                      no tener histórico de tasas de cambio.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  You are about to change your primary currency to{" "}
                  <b>{pendingCurrency}</b>.
                  <br />
                  <br />
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                    <li>
                      The <b>Blue Dollar</b> rate will be used for conversions.
                    </li>
                    <li>
                      If you have history (more than 1 month), please note that
                      the conversion{" "}
                      <b>will only visually affect the current month</b> and
                      future ones, or might be inaccurate for previous months
                      due to lack of historical exchange rates.
                    </li>
                  </ul>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelCurrencyChange}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={confirmCurrencyChange}>
              {language === "es" ? "Confirmar Cambio" : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Settings;
