import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PiggyBank, Target, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTables } from "@/hooks/useTables";
import { formatARS } from "@/lib/format";

const MONTHS = {
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  en: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ],
} as const;

const parseCurrencyInput = (value: string) =>
  parseFloat(value.replace(/\./g, "").replace(/,/g, "."));

const formatAsYouType = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("es-AR").format(parseInt(numericValue, 10));
};

const Budgets = () => {
  const { user } = useAuthContext();
  const { t, language } = useLanguage();
  const { tables, updateTableBudget, isLoading } = useTables(user?.id);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");

  const currentTable = useMemo(() => {
    const now = new Date();
    const searchMonthEs = MONTHS.es[now.getMonth()];
    const searchMonthEn = MONTHS.en[now.getMonth()];
    const searchYear = now.getFullYear().toString();

    return tables.find((table) => {
      const tableName = table.name.toLowerCase();
      return (
        tableName.includes(searchYear) &&
        (tableName.includes(searchMonthEs) || tableName.includes(searchMonthEn))
      );
    });
  }, [tables]);

  const totalSpent = useMemo(() => {
    if (!currentTable) return 0;
    return currentTable.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [currentTable]);

  const monthlyBudget = currentTable?.budget || 0;
  const remaining = monthlyBudget - totalSpent;
  const progress = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
  const isExceeded = monthlyBudget > 0 && totalSpent > monthlyBudget;
  const isNearLimit = !isExceeded && monthlyBudget > 0 && totalSpent / monthlyBudget >= 0.8;

  const statusLabel = isExceeded
    ? t("budget.exceeded")
    : isNearLimit
      ? t("budget.warning")
      : t("budget.safe");

  const statusClass = isExceeded
    ? "text-destructive bg-destructive/10 border-destructive/20"
    : isNearLimit
      ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";

  const handleOpenBudgetDialog = () => {
    setBudgetAmount(monthlyBudget > 0 ? new Intl.NumberFormat("es-AR").format(monthlyBudget) : "");
    setIsDialogOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!currentTable) return;

    const amount = parseCurrencyInput(budgetAmount);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error(t("common.validation.validAmount"));
      return;
    }

    try {
      await updateTableBudget(currentTable.id, amount);
      toast.success(
        language === "es" ? "Presupuesto mensual actualizado" : "Monthly budget updated",
      );
      setIsDialogOpen(false);
    } catch {
      toast.error(t("common.error.generic"));
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("budget.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "es"
                  ? "Definí un único objetivo de gasto para este mes."
                  : "Set one spending target for this month."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
          </div>
        </header>

        {!currentTable ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {language === "es" ? "Todavía no hay tabla para este mes" : "No table for this month yet"}
                </h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  {language === "es"
                    ? "Creá la tabla mensual desde el Dashboard para poder definir tu presupuesto."
                    : "Create the monthly table from the Dashboard before setting your budget."}
                </p>
              </div>
              <Link to="/dashboard">
                <Button variant="outline">
                  {language === "es" ? "Ir al Dashboard" : "Go to Dashboard"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border-2 border-primary/20 shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      {language === "es" ? "Presupuesto mensual" : "Monthly budget"}
                    </CardTitle>
                    <CardDescription>{currentTable.name}</CardDescription>
                  </div>
                  {monthlyBudget > 0 && (
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusClass}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
                  <div className="space-y-4">
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">
                      {language === "es" ? "Objetivo del mes" : "Monthly target"}
                    </p>
                    <div className="space-y-2">
                      <p className="text-4xl font-black tabular-nums md:text-5xl">
                        {monthlyBudget > 0 ? formatARS(monthlyBudget) : "$ 0,00"}
                      </p>
                      <p className="max-w-md text-sm text-muted-foreground">
                        {monthlyBudget > 0
                          ? language === "es"
                            ? "Este es el único presupuesto activo. Las categorías quedan sólo para clasificar gastos."
                            : "This is the only active budget. Categories are only used to classify expenses."
                          : language === "es"
                            ? "Definí cuánto querés gastar este mes para ver tu disponible."
                            : "Set how much you want to spend this month to see what's available."}
                      </p>
                    </div>
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="justify-self-start px-8 md:justify-self-end" onClick={handleOpenBudgetDialog}>
                        {monthlyBudget > 0 ? t("budget.edit") : t("budget.add")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{language === "es" ? "Presupuesto mensual" : "Monthly budget"}</DialogTitle>
                        <DialogDescription>
                          {language === "es"
                            ? `¿Cuánto planeás gastar en ${currentTable.name}?`
                            : `How much do you plan to spend in ${currentTable.name}?`}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-6">
                        <Label htmlFor="monthly-budget" className="mb-2 block">
                          {language === "es" ? "Monto total" : "Total amount"}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="monthly-budget"
                            type="text"
                            inputMode="numeric"
                            className="pl-8 text-lg font-bold"
                            placeholder="0"
                            value={budgetAmount}
                            onChange={(event) => setBudgetAmount(formatAsYouType(event.target.value))}
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSaveBudget}>{t("common.save")}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {monthlyBudget > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{t("budget.progress")}</span>
                      <span className="font-bold tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className={`h-3 ${isExceeded ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{t("budget.spent")}</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{formatARS(totalSpent)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PiggyBank className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{t("budget.remaining")}</span>
                  </div>
                  <p className={`text-2xl font-bold tabular-nums ${remaining < 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {formatARS(Math.abs(remaining))}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {language === "es" ? "Estado" : "Status"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{monthlyBudget > 0 ? statusLabel : t("budget.empty")}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Budgets;
