import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBudgets } from "@/hooks/useBudgets";
import { useTables } from "@/hooks/useTables";
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
  const { language } = useLanguage();
  const { isLoading: isLoadingBudgets } = useBudgets(userId);
  const { tables, isLoading: isLoadingTables } = useTables(userId);

  // 1. Lógica para identificar "éste mes"
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysElapsed = now.getDate();

    // Meses en español e inglés para buscar en el nombre de la tabla
    const monthsEs = [
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
    ];
    const monthsEn = [
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

    const searchMonthEs = monthsEs[currentMonth];
    const searchMonthEn = monthsEn[currentMonth];
    const searchYear = currentYear.toString();

    // Buscar tabla que coincida con mes y año actual (en español O inglés)
    const currentTable = tables.find((t) => {
      const tableName = t.name.toLowerCase();
      const hasYear = tableName.includes(searchYear);
      const hasMonth =
        tableName.includes(searchMonthEs) || tableName.includes(searchMonthEn);
      return hasYear && hasMonth;
    });

    const monthExpenses = currentTable
      ? currentTable.expenses.filter((expense) => {
          const expenseDate = new Date(expense.createdAt);
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        })
      : [];

    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const dailyTotals = Array.from({ length: daysElapsed }, () => 0);
    if (currentTable) {
      monthExpenses.forEach((expense) => {
        const expenseDate = new Date(expense.createdAt);
        const dayIndex = expenseDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < dailyTotals.length) {
          dailyTotals[dayIndex] += expense.amount;
        }
      });
    }

    const daysWithExpenses = dailyTotals.filter((dayTotal) => dayTotal > 0).length;

    const totalBudget = currentTable?.budget || 0;
    const remaining = totalBudget - totalSpent;
    const percentageUsed =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const expectedSpentToDate = totalBudget * (daysElapsed / daysInMonth);
    const deviationVsPlan = totalSpent - expectedSpentToDate;

    const categoryTotals = monthExpenses.reduce<Record<string, number>>(
      (acc, expense) => {
        const category = expense.tags[0]?.trim() || "";
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      },
      {},
    );

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }));

    const isExceeded = totalSpent > totalBudget && totalBudget > 0;
    const isRisk = !isExceeded && deviationVsPlan > 0 && totalBudget > 0;
    const isOnTrack = !isExceeded && !isRisk && totalBudget > 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentageUsed,
      expectedSpentToDate,
      deviationVsPlan,
      topCategories,
      isExceeded,
      isRisk,
      isOnTrack,
      daysElapsed,
      daysInMonth,
      daysWithExpenses,
      hasBudget: totalBudget > 0,
    };
  }, [tables]);

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

  const getCategoryLabel = (category: string) => {
    if (category) return category;
    return language === "es" ? "Sin categoría" : "Uncategorized";
  };

  const absDeviation = Math.abs(currentMonthData.deviationVsPlan);
  const deviationTrend =
    currentMonthData.deviationVsPlan > 0
      ? "above"
      : currentMonthData.deviationVsPlan < 0
        ? "below"
        : "ontrack";
  const deviationScale = Math.max(
    (currentMonthData.totalBudget / currentMonthData.daysInMonth) * 7,
    1,
  );
  const deviationBarPercent = Math.min((absDeviation / deviationScale) * 50, 50);
  const topCategoryAmount = currentMonthData.topCategories[0]?.amount || 0;

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

        <div className="pt-4 border-t space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                  {language === "es" ? "Desvío vs plan" : "Deviation vs plan"}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${deviationTrend === "above" ? "bg-destructive/10 text-destructive" : deviationTrend === "below" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                >
                  {deviationTrend === "above"
                    ? language === "es"
                      ? "Arriba del plan"
                      : "Above plan"
                    : deviationTrend === "below"
                      ? language === "es"
                        ? "Debajo del plan"
                        : "Below plan"
                      : language === "es"
                        ? "En plan"
                        : "On plan"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <p
                  className={`text-2xl font-bold tabular-nums ${deviationTrend === "above" ? "text-destructive" : deviationTrend === "below" ? "text-emerald-600" : "text-foreground"}`}
                >
                  {deviationTrend === "above"
                    ? "+"
                    : deviationTrend === "below"
                      ? "-"
                      : ""}
                  {formatARS(absDeviation)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {language === "es"
                    ? `al día ${currentMonthData.daysElapsed}`
                    : `by day ${currentMonthData.daysElapsed}`}
                </span>
              </div>

              <div className="relative h-2 rounded-full overflow-hidden bg-muted/60">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-500/25" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-destructive/25" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                {deviationTrend === "above" && (
                  <div
                    className="absolute inset-y-0 left-1/2 bg-destructive"
                    style={{ width: `${deviationBarPercent}%` }}
                  />
                )}
                {deviationTrend === "below" && (
                  <div
                    className="absolute inset-y-0 right-1/2 bg-emerald-600"
                    style={{ width: `${deviationBarPercent}%` }}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {language === "es"
                  ? `Esperado al día ${currentMonthData.daysElapsed}: ${formatARS(currentMonthData.expectedSpentToDate)}`
                  : `Expected by day ${currentMonthData.daysElapsed}: ${formatARS(currentMonthData.expectedSpentToDate)}`}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                {language === "es" ? "Top 3 categorías" : "Top 3 categories"}
              </p>
              {currentMonthData.topCategories.length > 0 ? (
                <div className="space-y-2">
                  {currentMonthData.topCategories.map((item, index) => (
                    <div
                      key={item.category || "uncategorized"}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="text-foreground/90 truncate flex items-center gap-2 min-w-0">
                          <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                            {index + 1}
                          </span>
                          <span className="truncate">{getCategoryLabel(item.category)}</span>
                        </span>
                        <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatARS(item.amount)} ({Math.round(item.percentage)}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${topCategoryAmount > 0 ? (item.amount / topCategoryAmount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {language === "es"
                    ? "Todavía no hay gastos para mostrar categorías."
                    : "There are no expenses yet to show categories."}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/budgets">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-8">
                {language === "es" ? "Ver detalles" : "View details"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthStatus;
