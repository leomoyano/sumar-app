import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBudgets } from "@/hooks/useBudgets";
import { useTables } from "@/hooks/useTables";
import { formatARS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  ArrowLeft,
  Trash2,
  Target,
  Wallet,
  PiggyBank,
  Edit2,
  SeparatorHorizontal,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import BudgetProgress from "@/components/BudgetProgress";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import { DEFAULT_CATEGORIES } from "@/types";
import { Separator } from "@/components/ui/separator";

const Budgets = () => {
  const { user } = useAuthContext();
  const { t, language } = useLanguage();
  const {
    budgets,
    setBudget,
    deleteBudget,
    getTotalBudget,
    isLoading: isLoadingBudgets,
  } = useBudgets(user?.id);
  const {
    tables,
    updateTableBudget,
    isLoading: isLoadingTables,
  } = useTables(user?.id);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneralDialogOpen, setIsGeneralDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [generalBudgetAmount, setGeneralBudgetAmount] = useState<string>("");

  // Identify current month's table
  const currentTable = useMemo(() => {
    const now = new Date();
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

    const searchMonth = months[now.getMonth()];
    const searchYear = now.getFullYear().toString();

    return tables.find((t) => {
      const tableName = t.name.toLowerCase();
      return tableName.includes(searchMonth) && tableName.includes(searchYear);
    });
  }, [tables, language]);

  // Calculate current month's spending per category
  const currentMonthSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    if (currentTable) {
      currentTable.expenses.forEach((expense) => {
        const category = expense.tags[0] || "Otros";
        spending[category] = (spending[category] || 0) + expense.amount;
      });
    }
    return spending;
  }, [currentTable]);

  // Categories that don't have a budget yet
  const availableCategories = useMemo(() => {
    const existingCategories = new Set(budgets.map((b) => b.category));
    return DEFAULT_CATEGORIES.filter((c) => !existingCategories.has(c));
  }, [budgets]);

  const totalSpent = Object.values(currentMonthSpending).reduce(
    (sum, val) => sum + val,
    0,
  );

  const handleOpenDialog = (category?: string) => {
    if (category) {
      const budget = budgets.find((b) => b.category === category);
      setEditingCategory(category);
      setSelectedCategory(category);
      setBudgetAmount(budget ? String(budget.amount) : "");
    } else {
      setEditingCategory(null);
      setSelectedCategory(availableCategories[0] || "");
      setBudgetAmount("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveGeneralBudget = async () => {
    try {
      // Limpiamos el formato (puntos) para obtener el número puro
      const cleanAmount = generalBudgetAmount
        .replace(/\./g, "")
        .replace(/,/g, ".");
      const amount = parseFloat(cleanAmount);

      if (isNaN(amount) || amount < 0 || !currentTable) {
        toast.error(t("common.validation.validAmount"));
        return;
      }

      await updateTableBudget(currentTable.id, amount);
      toast.success(
        language === "es"
          ? "Presupuesto mensual actualizado"
          : "Monthly budget updated",
      );
      setIsGeneralDialogOpen(false);
    } catch (error) {
      toast.error(t("common.error.generic"));
    }
  };

  // Helper para formatear mientras se escribe
  const formatAsYouType = (value: string) => {
    // Solo permitimos números
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";

    // Formateamos con puntos de miles
    return new Intl.NumberFormat("es-AR").format(parseInt(numericValue, 10));
  };

  const handleGeneralBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formatted = formatAsYouType(e.target.value);
    setGeneralBudgetAmount(formatted);
  };

  const handleSaveBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (!selectedCategory || isNaN(amount) || amount <= 0) {
      toast.error(t("common.validation.validAmount"));
      return;
    }

    try {
      await setBudget(selectedCategory, amount);
      toast.success(
        language === "es" ? "Presupuesto guardado" : "Budget saved",
      );
      setIsDialogOpen(false);
      setEditingCategory(null);
      setBudgetAmount("");
    } catch (error) {
      toast.error(t("common.error.generic"));
    }
  };

  const handleDeleteBudget = async (category: string) => {
    try {
      await deleteBudget(category);
      toast.success(
        language === "es" ? "Presupuesto eliminado" : "Budget deleted",
      );
    } catch (error) {
      toast.error(t("common.error.generic"));
    }
  };

  if (isLoadingBudgets || isLoadingTables) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {t("budget.title")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {language === "es"
                  ? "Gestioná cuánto querés gastar este mes"
                  : "Manage how much you want to spend this month"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
          </div>
        </header>

        {/* General Monthly Budget - PRIMARY ELEMENT */}
        {!currentTable ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
              <p className="text-muted-foreground text-sm">
                {language === "es"
                  ? "Primero creá una tabla mensual en el Dashboard"
                  : "Create a monthly table in Dashboard first"}
              </p>
              <Link to="/dashboard">
                <Button variant="outline">
                  {language === "es" ? "Ir al Dashboard" : "Go to Dashboard"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card
            className={`overflow-hidden border-2 transition-all ${currentTable.budget > 0 ? "border-primary/20 shadow-md" : "border-dashed border-primary/40 bg-primary/5"}`}
          >
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest">
                      {language === "es"
                        ? "Presupuesto General"
                        : "General Budget"}{" "}
                      — {currentTable.name}
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tabular-nums">
                      {currentTable.budget > 0
                        ? formatARS(currentTable.budget)
                        : "$ 0,00"}
                    </h2>
                  </div>

                  {currentTable.budget === 0 ? (
                    <p className="text-muted-foreground text-sm max-w-md">
                      {language === "es"
                        ? "Definí cuánto querés gastar este mes para ver cuánto te queda disponible."
                        : "Set how much you want to spend this month to see how much is available."}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                      <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <PiggyBank className="h-4 w-4" />
                        <span>
                          {language === "es" ? "Disponible: " : "Available: "}{" "}
                          {formatARS(currentTable.budget - totalSpent)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        <Target className="h-4 w-4" />
                        <span>
                          {language === "es" ? "Gastado: " : "Spent: "}{" "}
                          {formatARS(totalSpent)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Dialog
                  open={isGeneralDialogOpen}
                  onOpenChange={setIsGeneralDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="px-8 shadow-lg hover:shadow-xl transition-all"
                      onClick={() =>
                        setGeneralBudgetAmount(
                          currentTable.budget > 0
                            ? new Intl.NumberFormat("es-AR").format(
                                currentTable.budget,
                              )
                            : "",
                        )
                      }
                    >
                      {currentTable.budget > 0
                        ? language === "es"
                          ? "Ajustar Presupuesto"
                          : "Adjust Budget"
                        : language === "es"
                          ? "Definir Presupuesto"
                          : "Set Budget"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {language === "es"
                          ? "Presupuesto Mensual"
                          : "Monthly Budget"}
                      </DialogTitle>
                      <DialogDescription>
                        {language === "es"
                          ? `¿Cuánto planeás gastar en ${currentTable.name}?`
                          : `How much do you plan to spend in ${currentTable.name}?`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                      <Label htmlFor="general-budget" className="mb-2 block">
                        {language === "es" ? "Monto Total" : "Total Amount"}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                          $
                        </span>
                        <Input
                          id="general-budget"
                          type="text"
                          inputMode="numeric"
                          className="pl-8 text-lg font-bold"
                          placeholder="0"
                          value={generalBudgetAmount}
                          onChange={handleGeneralBudgetChange}
                          autoFocus
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setIsGeneralDialogOpen(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button onClick={handleSaveGeneralBudget}>
                        {t("common.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Category Budgets Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                {language === "es"
                  ? "Límites por Categoría"
                  : "Category Limits"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === "es"
                  ? "Opcional: Controlá gastos específicos (ej: Comida, Salidas)"
                  : "Optional: Control specific spending (e.g. Food, Dining out)"}
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleOpenDialog()}
                  disabled={
                    availableCategories.length === 0 && !editingCategory
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t("budget.add")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? t("budget.edit") : t("budget.add")}
                  </DialogTitle>
                  <DialogDescription>
                    {language === "es"
                      ? "Define un límite de gasto mensual para esta categoría."
                      : "Set a monthly spending limit for this category."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("budget.category")}</Label>
                    {editingCategory ? (
                      <Input value={selectedCategory} disabled />
                    ) : (
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              language === "es"
                                ? "Seleccionar categoría"
                                : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("budget.limit")}</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1000"
                      placeholder="50000"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleSaveBudget}>{t("common.save")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Budgets List */}
          {budgets.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center">
              <Target className="h-8 w-8 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">
                {language === "es"
                  ? "No tenés límites por categoría. Usá esto si querés trackear algo específico."
                  : "No category limits set. Use this if you want to track something specific."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const spent = currentMonthSpending[budget.category] || 0;

                return (
                  <Card
                    key={budget.id}
                    className="group hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {budget.category}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {t("budget.limit")}: {formatARS(budget.amount)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenDialog(budget.category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "es"
                                    ? "¿Eliminar presupuesto?"
                                    : "Delete budget?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "es"
                                    ? "Esta acción eliminará el límite para esta categoría."
                                    : "This action will remove the limit for this category."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteBudget(budget.category)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <BudgetProgress
                        category={budget.category}
                        spent={spent}
                        limit={budget.amount}
                        showLabel={false}
                      />

                      <div className="flex justify-between mt-3 text-sm">
                        <span className="text-muted-foreground tabular-nums">
                          {formatARS(spent)} {t("budget.spent").toLowerCase()}
                        </span>
                        <span
                          className={`tabular-nums ${spent > budget.amount ? "text-destructive font-bold" : "text-muted-foreground"}`}
                        >
                          {spent > budget.amount
                            ? `${t("budget.exceeded")}: ${formatARS(spent - budget.amount)}`
                            : `${t("budget.remaining")}: ${formatARS(budget.amount - spent)}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Budgets;
