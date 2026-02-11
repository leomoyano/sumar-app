import { useState, useEffect } from "react";
import { AlertCircle, X, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { detectForgottenExpenses } from "@/services/ai";
import { MonthlyTable } from "@/hooks/useTables";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForgottenExpensesAlertProps {
  tables: MonthlyTable[];
}

const ForgottenExpensesAlert = ({ tables }: ForgottenExpensesAlertProps) => {
  const [forgotten, setForgotten] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const checkForgotten = async () => {
      // Necesitamos al menos dos tablas para comparar
      if (tables.length < 2) return;

      const currentTable = tables[0];
      const previousTable = tables[1];

      // Evitar re-chequear si ya lo hicimos en esta sesión (opcional)
      const hasChecked = sessionStorage.getItem(
        `check-forgotten-${currentTable.id}`,
      );
      if (hasChecked) return;

      setIsLoading(true);
      try {
        const prevData = previousTable.expenses.map((e) => ({
          name: e.name,
          amount: e.amount,
        }));
        const currData = currentTable.expenses.map((e) => ({
          name: e.name,
          amount: e.amount,
        }));

        const detected = await detectForgottenExpenses(prevData, currData);
        if (detected.length > 0) {
          setForgotten(detected);
          setIsVisible(true);
        }
        sessionStorage.setItem(`check-forgotten-${currentTable.id}`, "true");
      } catch (error) {
        console.error("Error checking forgotten expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForgotten();
  }, [tables]);

  if (!isVisible || forgotten.length === 0) return null;

  return (
    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <div className="flex-1">
        <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
          {language === "es"
            ? "¿Te olvidaste de algo?"
            : "Did you forget something?"}
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-500/80 mt-1">
          {language === "es"
            ? "Basado en tu mes pasado, parece que aún no cargaste:"
            : "Based on last month, it seems you haven't loaded yet:"}
          <div className="flex flex-wrap gap-2 mt-2">
            {forgotten.map((name, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-medium border border-amber-200 dark:border-amber-800"
              >
                {name}
              </span>
            ))}
          </div>
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-amber-700 hover:bg-amber-100"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default ForgottenExpensesAlert;
