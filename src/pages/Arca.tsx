import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgePercent,
  FileText,
  Landmark,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useArcaCategories } from "@/hooks/useArcaCategories";
import { useOfficialDollarRate } from "@/hooks/useOfficialDollarRate";
import {
  findCategory,
  findSuggestedCategory,
  MonotributoCategoryId,
} from "@/lib/arcaMonotributo";
import { formatARS, formatUSD } from "@/lib/format";

const ARCA_PROFILE_STORAGE_KEY = "arca-estimator-profile";
const DEFAULT_IIBB_RATE = 5;

type IncomeCurrency = "ARS" | "USD";

type ArcaProfile = {
  monthlyIncome: string;
  currency: IncomeCurrency;
  currentCategory: MonotributoCategoryId;
  paysIibb: boolean;
  iibbRate: string;
};

const DEFAULT_PROFILE: ArcaProfile = {
  monthlyIncome: "1000000",
  currency: "ARS",
  currentCategory: "C",
  paysIibb: true,
  iibbRate: String(DEFAULT_IIBB_RATE),
};

const parseNumberInput = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatUpdatedAt = (timestamp: number | null) => {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
};

const loadStoredProfile = (): ArcaProfile => {
  const saved = localStorage.getItem(ARCA_PROFILE_STORAGE_KEY);
  if (!saved) return DEFAULT_PROFILE;

  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

const MetricCard = ({
  title,
  value,
  description,
  tone = "default",
}: {
  title: string;
  value: string;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}) => {
  const toneClass = {
    default: "bg-card",
    success: "border-emerald-500/20 bg-emerald-500/10",
    warning: "border-amber-500/20 bg-amber-500/10",
    danger: "border-destructive/20 bg-destructive/10",
  }[tone];

  return (
    <Card className={toneClass}>
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <p className="text-2xl font-black tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const Arca = () => {
  const { language } = useLanguage();
  const { categories, isLoading: isLoadingCategories } = useArcaCategories();
  const {
    rate: officialDollarRate,
    updatedAt: officialDollarUpdatedAt,
    isLoading: isLoadingDollar,
    refetch: refetchDollar,
  } = useOfficialDollarRate();
  const [profile, setProfile] = useState<ArcaProfile>(loadStoredProfile);

  const updateProfile = <Key extends keyof ArcaProfile>(
    key: Key,
    value: ArcaProfile[Key],
  ) => {
    setProfile((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(ARCA_PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const currentCategory = findCategory(profile.currentCategory, categories);

  const calculation = useMemo(() => {
    const rawMonthlyIncome = parseNumberInput(profile.monthlyIncome);
    const monthlyIncomeARS =
      profile.currency === "USD" ? rawMonthlyIncome * officialDollarRate : rawMonthlyIncome;
    const annualIncomeARS = monthlyIncomeARS * 12;
    const suggestedCategory = findSuggestedCategory(annualIncomeARS, categories);
    const targetCategory = suggestedCategory || categories[categories.length - 1];
    const iibbRate = parseNumberInput(profile.iibbRate) / 100;
    const monthlyIibb = profile.paysIibb ? monthlyIncomeARS * iibbRate : 0;
    const monthlyTaxTotal = currentCategory.serviceTotal + monthlyIibb;
    const margin = currentCategory.annualIncomeLimit - annualIncomeARS;
    const usedPercentage = Math.min(
      (annualIncomeARS / currentCategory.annualIncomeLimit) * 100,
      100,
    );
    const isOverCurrentCategory = annualIncomeARS > currentCategory.annualIncomeLimit;
    const isNearLimit = !isOverCurrentCategory && usedPercentage >= 80;

    return {
      rawMonthlyIncome,
      monthlyIncomeARS,
      annualIncomeARS,
      suggestedCategory,
      targetCategory,
      monthlyIibb,
      monthlyTaxTotal,
      margin,
      usedPercentage,
      isOverCurrentCategory,
      isNearLimit,
      taxBurdenPercentage:
        monthlyIncomeARS > 0 ? (monthlyTaxTotal / monthlyIncomeARS) * 100 : 0,
    };
  }, [categories, currentCategory, officialDollarRate, profile]);

  const statusTone = calculation.isOverCurrentCategory
    ? "danger"
    : calculation.isNearLimit
      ? "warning"
      : "success";

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {language === "es" ? "Estimación fiscal" : "Tax estimate"}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-foreground">ARCA</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {language === "es"
                  ? "Simulá tu categoría de monotributo para prestación de servicios, usando dólar oficial si cargás ingresos en USD."
                  : "Estimate your service monotributo category using official dollar rate for USD income."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
            <Button variant="outline" size="icon" onClick={refetchDollar} disabled={isLoadingDollar}>
              <RefreshCw className={`h-4 w-4 ${isLoadingDollar ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {language === "es" ? "Datos de simulación" : "Simulation data"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Tus datos quedan guardados sólo en este navegador."
                  : "Your data is saved only in this browser."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
                <div className="space-y-2">
                  <Label htmlFor="arca-income">
                    {language === "es" ? "Ingreso mensual" : "Monthly income"}
                  </Label>
                  <Input
                    id="arca-income"
                    inputMode="decimal"
                    value={profile.monthlyIncome}
                    onChange={(event) => updateProfile("monthlyIncome", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "es" ? "Moneda" : "Currency"}</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value: IncomeCurrency) => updateProfile("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "es" ? "Categoría actual" : "Current category"}</Label>
                  <Select
                    value={profile.currentCategory}
                    onValueChange={(value: MonotributoCategoryId) =>
                      updateProfile("currentCategory", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          Categoría {category.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arca-iibb-rate">
                    {language === "es" ? "IIBB Tucumán" : "Tucumán gross income tax"}
                  </Label>
                  <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border px-3 py-2">
                    <Switch
                      checked={profile.paysIibb}
                      onCheckedChange={(checked) => updateProfile("paysIibb", checked)}
                    />
                    <div className="relative">
                      <Input
                        id="arca-iibb-rate"
                        inputMode="decimal"
                        disabled={!profile.paysIibb}
                        value={profile.iibbRate}
                        onChange={(event) => updateProfile("iibbRate", event.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>Dólar oficial ARCA</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatARS(officialDollarRate)}
                  </span>
                </div>
                <p className="mt-1 text-xs">
                  {language === "es"
                    ? `Usado sólo si cargás ingresos en USD. Actualizado: ${formatUpdatedAt(officialDollarUpdatedAt)}`
                    : `Used only for USD income. Updated: ${formatUpdatedAt(officialDollarUpdatedAt)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground/70">
                      {language === "es" ? "Categoría sugerida" : "Suggested category"}
                    </p>
                    <p className="text-5xl font-black">
                      {calculation.suggestedCategory
                        ? calculation.suggestedCategory.category
                        : language === "es"
                          ? "Fuera"
                          : "Out"}
                    </p>
                    <p className="max-w-md text-sm text-primary-foreground/75">
                      {calculation.suggestedCategory
                        ? language === "es"
                          ? `Por tu ingreso proyectado, entrarías en categoría ${calculation.suggestedCategory.category}.`
                          : `Based on projected income, you fit category ${calculation.suggestedCategory.category}.`
                        : language === "es"
                          ? "Tu ingreso proyectado supera la categoría K."
                          : "Your projected income exceeds category K."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary-foreground/15 p-4 text-right">
                    <p className="text-xs uppercase tracking-wider text-primary-foreground/70">
                      {language === "es" ? "Total mensual estimado" : "Estimated monthly total"}
                    </p>
                    <p className="mt-1 text-2xl font-black tabular-nums">
                      {formatARS(calculation.monthlyTaxTotal)}
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/70">
                      Monotributo + {profile.paysIibb ? "IIBB" : "sin IIBB"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Ingreso mensual ARS"
                value={formatARS(calculation.monthlyIncomeARS)}
                description={
                  profile.currency === "USD"
                    ? `${formatUSD(calculation.rawMonthlyIncome)} al dólar oficial`
                    : "Valor ingresado en pesos"
                }
              />
              <MetricCard
                title="Ingreso anual proyectado"
                value={formatARS(calculation.annualIncomeARS)}
                description="Ingreso mensual multiplicado por 12"
              />
              <MetricCard
                title="Cuota monotributo"
                value={formatARS(currentCategory.serviceTotal)}
                description={`Categoría ${currentCategory.category} · prestación de servicios`}
              />
              <MetricCard
                title="Ingresos Brutos"
                value={formatARS(calculation.monthlyIibb)}
                description={profile.paysIibb ? `Tucumán ${profile.iibbRate}%` : "Desactivado"}
              />
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {language === "es" ? "Uso de tu categoría actual" : "Current category usage"}
                </CardTitle>
                <CardDescription>
                  {language === "es"
                    ? `Categoría ${currentCategory.category} tiene límite anual de ${formatARS(currentCategory.annualIncomeLimit)}.`
                    : `Category ${currentCategory.category} annual limit is ${formatARS(currentCategory.annualIncomeLimit)}.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{Math.round(calculation.usedPercentage)}%</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusTone === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : statusTone === "warning"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {calculation.isOverCurrentCategory
                      ? language === "es"
                        ? "Supera categoría"
                        : "Over category"
                      : calculation.isNearLimit
                        ? language === "es"
                          ? "Cerca del límite"
                          : "Near limit"
                        : language === "es"
                          ? "Dentro del límite"
                          : "Within limit"}
                  </span>
                </div>
                <Progress
                  value={calculation.usedPercentage}
                  className={`h-3 ${
                    statusTone === "danger"
                      ? "[&>div]:bg-destructive"
                      : statusTone === "warning"
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-emerald-500"
                  }`}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {language === "es" ? "Margen anual" : "Annual margin"}
                    </p>
                    <p
                      className={`mt-1 text-xl font-black tabular-nums ${
                        calculation.margin < 0 ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {formatARS(Math.abs(calculation.margin))}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {language === "es" ? "Carga sobre ingreso" : "Burden on income"}
                    </p>
                    <p className="mt-1 text-xl font-black tabular-nums">
                      {calculation.taxBurdenPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              {language === "es"
                ? "Esta pantalla es una estimación para ayudarte a planificar. No reemplaza asesoramiento contable ni validación oficial de ARCA. Valores de monotributo vigentes desde 01/02/2026 según tabla pública de ARCA."
                : "This screen is an estimate for planning. It does not replace accounting advice or official ARCA validation. Monotributo values effective from 2026-02-01 according to ARCA public table."}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Arca;
