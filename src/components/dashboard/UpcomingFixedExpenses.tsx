import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FixedExpense } from "@/hooks/useFixedExpenses";
import { formatARS } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UpcomingFixedExpensesProps {
  expenses: FixedExpense[];
  onMarkPaid: (id: string) => Promise<void>;
}

const WINDOW_OPTIONS = [7, 15, 30] as const;
type WindowDays = (typeof WINDOW_OPTIONS)[number];

const toLocalMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const cycleDueDate = (year: number, monthIndex: number, dueDay: number) => {
  const safeDay = Math.min(Math.max(dueDay, 1), daysInMonth(year, monthIndex));
  return new Date(year, monthIndex, safeDay);
};

const UpcomingFixedExpenses = ({
  expenses,
  onMarkPaid,
}: UpcomingFixedExpensesProps) => {
  const { language } = useLanguage();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState<WindowDays>(15);

  const data = useMemo(() => {
    const today = toLocalMidnight(new Date());

    const upcoming = expenses
      .filter((expense) => expense.isActive)
      .map((expense) => {
        const thisMonthDue = cycleDueDate(
          today.getFullYear(),
          today.getMonth(),
          Number.isFinite(expense.dueDay)
            ? Math.min(31, Math.max(1, Math.round(expense.dueDay)))
            : 1,
        );

        const paidAt = expense.lastPaidAt ? toLocalMidnight(new Date(expense.lastPaidAt)) : null;
        const paidThisMonth =
          paidAt !== null &&
          paidAt.getFullYear() === today.getFullYear() &&
          paidAt.getMonth() === today.getMonth();

        let nextDue = thisMonthDue;
        if (paidThisMonth || thisMonthDue < today) {
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          nextDue = cycleDueDate(
            nextMonth.getFullYear(),
            nextMonth.getMonth(),
            Number.isFinite(expense.dueDay)
              ? Math.min(31, Math.max(1, Math.round(expense.dueDay)))
              : 1,
          );
        }

        const diffDays = Math.ceil(
          (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          ...expense,
          nextDue,
          diffDays,
        };
      })
      .filter((expense) => expense.diffDays >= 0 && expense.diffDays <= windowDays)
      .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

    const totalUpcoming = upcoming.reduce((sum, item) => sum + item.amount, 0);

    return { upcoming, totalUpcoming };
  }, [expenses, windowDays]);

  const formatDueDate = (date: Date) =>
    date.toLocaleDateString(language === "es" ? "es-AR" : "en-US", {
      day: "2-digit",
      month: "short",
    });

  const relativeDue = (days: number) => {
    if (days === 0) return language === "es" ? "hoy" : "today";
    if (days === 1) return language === "es" ? "mañana" : "tomorrow";
    return language === "es" ? `en ${days} días` : `in ${days} days`;
  };

  const urgency = (days: number) => {
    if (days === 0) {
      return {
        label: language === "es" ? "Hoy" : "Today",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      };
    }

    if (days === 1) {
      return {
        label: language === "es" ? "Mañana" : "Tomorrow",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    }

    if (days <= 7) {
      return {
        label: language === "es" ? "Esta semana" : "This week",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    }

    return {
      label: language === "es" ? "Próximo" : "Upcoming",
      className: "bg-muted text-muted-foreground border-transparent",
    };
  };

  const markPaid = async (id: string) => {
    setLoadingId(id);
    try {
      await onMarkPaid(id);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            {language === "es" ? "Próximos vencimientos" : "Upcoming due dates"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-0.5 flex items-center gap-1">
              {WINDOW_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={windowDays === option ? "secondary" : "ghost"}
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setWindowDays(option)}
                >
                  {option}d
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="tabular-nums">
              {formatARS(data.totalUpcoming)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {data.upcoming.length > 0 ? (
          <div className="space-y-2">
            {data.upcoming.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{expense.name}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span>
                      {formatDueDate(expense.nextDue)} · {relativeDue(expense.diffDays)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${urgency(expense.diffDays).className}`}>
                      {urgency(expense.diffDays).label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatARS(expense.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1"
                    onClick={() => markPaid(expense.id)}
                    disabled={loadingId === expense.id}
                  >
                    <Check className="h-3 w-3" />
                    {language === "es" ? "Pagado" : "Paid"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? `No hay vencimientos en los próximos ${windowDays} días.`
              : `No due dates in the next ${windowDays} days.`}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Link to="/fixed-expenses">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              {language === "es" ? "Administrar gastos fijos" : "Manage fixed expenses"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingFixedExpenses;
