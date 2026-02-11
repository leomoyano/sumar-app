import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTables } from "@/hooks/useTables";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { useDollarRate } from "@/hooks/useDollarRate";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  LogOut,
  TrendingUp,
  Repeat,
  FileDown,
  ArrowRight,
  Target,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import MonthStatus from "@/components/dashboard/MonthStatus";
import MagicBar from "@/components/dashboard/MagicBar";
import ForgottenExpensesAlert from "@/components/dashboard/ForgottenExpensesAlert";
import { exportTableToPdf } from "@/lib/exportPdf";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Dashboard = () => {
  const { user, logout } = useAuthContext();
  const { t, language } = useLanguage();
  const { tables, createTable, deleteTableById, addExpense, isLoading } =
    useTables(user?.id);
  const { fixedExpenses, getActiveExpenses } = useFixedExpenses(user?.id);
  const {
    rate,
    dollarInfo,
    isLoading: isLoadingRate,
    refetch: refetchRate,
  } = useDollarRate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFixedExpenses, setSelectedFixedExpenses] = useState<string[]>(
    [],
  );

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(currentDate.getMonth()),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(currentDate.getFullYear()),
  );

  const months = language === "es" ? MONTHS_ES : MONTHS_EN;
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate total monthly expenses across all tables
  const totalMonthlyExpenses = useMemo(() => {
    return tables.reduce((sum, table) => {
      return (
        sum + table.expenses.reduce((expSum, exp) => expSum + exp.amount, 0)
      );
    }, 0);
  }, [tables]);

  const generateTableName = () => {
    const monthName = months[parseInt(selectedMonth)];
    return `${monthName} ${selectedYear}`;
  };

  const handleOpenDialog = (open: boolean) => {
    if (open) {
      const activeIds = getActiveExpenses().map((exp) => exp.id);
      setSelectedFixedExpenses(activeIds);
    }
    setIsDialogOpen(open);
  };

  const toggleFixedExpense = (id: string) => {
    setSelectedFixedExpenses((prev) =>
      prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id],
    );
  };

  const selectedFixedTotal = fixedExpenses
    .filter((exp) => selectedFixedExpenses.includes(exp.id))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const handleCreateTable = async () => {
    const tableName = generateTableName();

    const exists = tables.some(
      (t) => t.name.toLowerCase() === tableName.toLowerCase(),
    );
    if (exists) {
      toast.error(
        language === "es"
          ? `Ya existe una tabla para ${tableName}`
          : `A table for ${tableName} already exists`,
      );
      return;
    }

    try {
      const newTable = await createTable(tableName);

      if (newTable && selectedFixedExpenses.length > 0) {
        const expensesToAdd = fixedExpenses.filter((exp) =>
          selectedFixedExpenses.includes(exp.id),
        );
        for (const fixedExp of expensesToAdd) {
          await addExpense(newTable.id, {
            name: fixedExp.name,
            amount: fixedExp.amount,
            tags: fixedExp.tags,
          });
        }
      }

      toast.success(`${t("dashboard.newTable.title")}: "${tableName}"`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    try {
      await deleteTableById(tableId);
      toast.success(`${t("dashboard.deleteTable.confirm")}: "${tableName}"`);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const calculateTableTotal = (expenses: { amount: number }[]) => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleExportPdf = (tableToExport: (typeof tables)[0]) => {
    if (tableToExport.expenses.length === 0) {
      toast.error(t("export.pdf.noExpenses"));
      return;
    }

    exportTableToPdf({
      tableName: tableToExport.name,
      expenses: tableToExport.expenses,
      rate,
      language,
    });

    toast.success(t("export.pdf.success"));
  };

  const handleMagicExpense = async (parsed: {
    name: string;
    amount: number;
    tags: string[];
  }) => {
    // Buscar la tabla más reciente (la primera en el array ya que están ordenadas)
    if (tables.length === 0) {
      toast.error(
        language === "es"
          ? "Primero debés crear una tabla (ej: Febrero 2026)"
          : "You must create a table first (ex: February 2026)",
      );
      return;
    }

    const targetTable = tables[0]; // La más reciente
    try {
      await addExpense(targetTable.id, {
        name: parsed.name,
        amount: parsed.amount,
        tags: parsed.tags,
      });
      toast.success(
        language === "es"
          ? `Agregado a "${targetTable.name}"`
          : `Added to "${targetTable.name}"`,
      );
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  if (isLoading) {
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
      <div className="space-y-8 pt-4">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-primary/10 flex items-center justify-center p-2.5">
              <img
                src="/favicon.svg"
                alt="Sumar Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {t("dashboard.welcome")}, {user?.name}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {t("login.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 mr-4 px-4 py-1.5 rounded-full bg-muted/50 border text-xs">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-primary" />
                <span className="font-bold tabular-nums">
                  {formatARS(rate)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refetchRate}
                disabled={isLoadingRate}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoadingRate ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <ThemeToggle />
            <LanguageSwitch />
            <Button
              variant="ghost"
              onClick={logout}
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("dashboard.logout")}</span>
            </Button>
          </div>
        </header>

        {/* Main Status Hero */}
        <MonthStatus userId={user?.id} />

        {/* Alerta de Gastos Olvidados (AI) */}
        <ForgottenExpensesAlert tables={tables} />

        {/* Barra Inteligente (AI) */}
        <MagicBar onExpenseParsed={handleMagicExpense} isLoading={isLoading} />

        {/* Mobile Dollar Rate as small card */}
        <div className="md:hidden">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {t("dashboard.dollarRate")}
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {formatARS(rate)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refetchRate}
                disabled={isLoadingRate}
                className="h-8 w-8 text-muted-foreground"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingRate ? "animate-spin" : ""}`}
                />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("dashboard.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Link to="/fixed-expenses">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Repeat className="h-4 w-4" />
              {t("fixedExpenses.title")}
            </Button>
          </Link>

          <Link to="/budgets">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Target className="h-4 w-4" />
              {t("budget.title")}
            </Button>
          </Link>

          <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("dashboard.newTable")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t("dashboard.newTable.title")}</DialogTitle>
                <DialogDescription>
                  {language === "es"
                    ? "Selecciona el mes y año para tu tabla de gastos."
                    : "Select the month and year for your expense table."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "es" ? "Mes" : "Month"}</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "es" ? "Año" : "Year"}</Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "es" ? "Se creará:" : "Will create:"}{" "}
                  <strong>{generateTableName()}</strong>
                </p>

                {fixedExpenses.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label>{t("fixedExpenses.includeInTable")}</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {fixedExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={expense.id}
                                checked={selectedFixedExpenses.includes(
                                  expense.id,
                                )}
                                onCheckedChange={() =>
                                  toggleFixedExpense(expense.id)
                                }
                              />
                              <label
                                htmlFor={expense.id}
                                className="text-sm cursor-pointer"
                              >
                                {expense.name}
                              </label>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground tabular-nums">
                              {formatARS(expense.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {selectedFixedExpenses.length > 0 && (
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span>{t("fixedExpenses.selectedTotal")}:</span>
                          <span className="text-primary tabular-nums">
                            {formatARS(selectedFixedTotal)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("dashboard.newTable.cancel")}
                </Button>
                <Button onClick={handleCreateTable}>
                  {t("dashboard.newTable.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tables Grid */}
        {filteredTables.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("dashboard.noTables")}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {t("dashboard.newTable.description")}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("dashboard.newTable")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTables.map((table) => {
              const total = calculateTableTotal(table.expenses);
              const totalUSD = total / rate;

              return (
                <Card
                  key={table.id}
                  className="group hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                          {table.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {table.expenses.length}{" "}
                          {table.expenses.length !== 1
                            ? t("dashboard.expenses")
                            : t("dashboard.expense")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleExportPdf(table)}
                          title={t("export.pdf")}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("dashboard.deleteTable.title")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("dashboard.deleteTable.description")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("dashboard.deleteTable.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteTable(table.id, table.name)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("dashboard.deleteTable.confirm")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-2xl font-bold text-foreground tabular-nums">
                          {formatARS(total)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground tabular-nums pl-6">
                        ≈ USD {totalUSD.toFixed(2)}
                      </p>
                    </div>

                    <Link to={`/table/${table.id}`}>
                      <Button
                        variant="secondary"
                        className="w-full justify-between group/btn"
                      >
                        {t("dashboard.viewDetails")}
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
