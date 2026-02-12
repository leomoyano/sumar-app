import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBudgets } from "@/hooks/useBudgets";
import { useTables, MonthlyTable } from "@/hooks/useTables";
import { formatARS } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Wallet,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

interface MonthStatusProps {
  userId: string | undefined;
}

const MonthStatus = ({ userId }: MonthStatusProps) => {
  const { t, language } = useLanguage();
  const { getTotalBudget, isLoading: isLoadingBudgets } = useBudgets(userId);
  const { tables, isLoading: isLoadingTables } = useTables(userId);

  // 1. Lógica para identificar "éste mes"
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysElapsed = now.getDate();

    // Meses en español/inglés para buscar en el nombre de la tabla
    const months =
      language === "es"
        ? [
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
          ]
        : [
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
          ];

    const searchMonth = months[currentMonth];
    const searchYear = currentYear.toString();

    // Buscar tabla que coincida con mes y año actual
    const currentTable = tables.find((t) => {
      const tableName = t.name.toLowerCase();
      return tableName.includes(searchMonth) && tableName.includes(searchYear);
    });

    const totalSpent = currentTable
      ? currentTable.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      : 0;

    const totalBudget = currentTable?.budget || 0;
    const remaining = totalBudget - totalSpent;
    const percentageUsed =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // 2. Proyección y Estado
    const dailyAvg = totalSpent / (daysElapsed || 1);
    const projectedTotal = dailyAvg * daysInMonth;

    const isExceeded = totalSpent > totalBudget && totalBudget > 0;
    const isRisk =
      projectedTotal > totalBudget && !isExceeded && totalBudget > 0;
    const isOnTrack = !isExceeded && !isRisk && totalBudget > 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentageUsed,
      projectedTotal,
      isExceeded,
      isRisk,
      isOnTrack,
      daysElapsed,
      daysInMonth,
      hasBudget: totalBudget > 0,
    };
  }, [tables, language]);

  if (isLoadingBudgets || isLoadingTables) {
    return <Card className="w-full h-48 animate-pulse bg-muted/50" />;
  }

  if (!currentMonthData.hasBudget) {
    return (
      <Card className="w-full border-dashed border-2 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">
              {language === "es"
                ? "Definí cuánto querés gastar este mes"
                : "Set how much you want to spend this month"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {language === "es"
                ? "Tener un presupuesto te ayuda a ahorrar y entender mejor tus finanzas."
                : "Having a budget helps you save and understand your finances better."}
            </p>
          </div>
          <Link to="/budgets">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {language === "es" ? "Configurar Presupuesto" : "Set Budget"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    if (currentMonthData.isExceeded) {
      return {
        label: language === "es" ? "Presupuesto Excedido" : "Budget Exceeded",
        icon: <XCircle className="h-5 w-5" />,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      };
    }
    if (currentMonthData.isRisk) {
      return {
        label: language === "es" ? "Riesgo de excederse" : "Risk of exceeding",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      };
    }
    return {
      label: language === "es" ? "En camino" : "On track",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    };
  };

  const status = getStatusInfo();

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-card">
      <CardHeader className="pb-2 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {language === "es" ? "Estado del mes" : "Month Status"}
          </CardTitle>
          <div
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold ${status.color} ${status.bgColor}`}
          >
            {status.icon}
            {status.label.toUpperCase()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-sm font-medium text-muted-foreground">
              {language === "es" ? "Progreso mensual" : "Monthly progress"}
            </p>
            <p className="text-sm font-bold tabular-nums">
              {Math.min(100, Math.round(currentMonthData.percentageUsed))}%
            </p>
          </div>
          <Progress
            value={currentMonthData.percentageUsed}
            className={`h-3 ${currentMonthData.isExceeded ? "[&>div]:bg-destructive" : currentMonthData.isRisk ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`}
          />
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs uppercase font-medium tracking-wider">
                {language === "es" ? "Presupuesto" : "Budget"}
              </span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {formatARS(currentMonthData.totalBudget)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase font-medium tracking-wider">
                {language === "es" ? "Gastado" : "Spent"}
              </span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {formatARS(currentMonthData.totalSpent)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs uppercase font-medium tracking-wider">
                {language === "es" ? "Restante" : "Remaining"}
              </span>
            </div>
            <p
              className={`text-xl font-bold tabular-nums ${currentMonthData.remaining < 0 ? "text-destructive" : "text-emerald-500"}`}
            >
              {formatARS(Math.abs(currentMonthData.remaining))}
              {currentMonthData.remaining < 0 && (
                <span className="text-xs ml-1 font-normal">
                  ({language === "es" ? "de más" : "over"})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Projection Footer */}
        <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
              {language === "es"
                ? "Proyección fin de mes"
                : "End of month forecast"}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold tabular-nums">
                {formatARS(currentMonthData.projectedTotal)}
              </p>
              <span className="text-xs text-muted-foreground">
                ({language === "es" ? "est. total" : "est. total"})
              </span>
            </div>
          </div>

          <Link to="/budgets">
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-8">
              {language === "es" ? "Ver detalles" : "View details"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthStatus;
