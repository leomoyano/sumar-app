import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { formatARS } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data type
interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: "ARS" | "USD";
  billingCycle: "monthly" | "yearly";
  nextPaymentDate: string; // Changed to string for input[type="date"] compatibility
  category: string;
  status: "active" | "paused";
}

const Subscriptions = () => {
  const { t, language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Subscription, "id">>({
    name: "",
    amount: 0,
    currency: "ARS",
    billingCycle: "monthly",
    nextPaymentDate: new Date().toISOString().split("T")[0],
    category: "",
    status: "active",
  });

  // Mock initial state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      name: "Netflix Standard",
      amount: 6500,
      currency: "ARS",
      billingCycle: "monthly",
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 5))
        .toISOString()
        .split("T")[0],
      category: "Entertainment",
      status: "active",
    },
    {
      id: "2",
      name: "Spotify Premium",
      amount: 4200,
      currency: "ARS",
      billingCycle: "monthly",
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 12))
        .toISOString()
        .split("T")[0],
      category: "Music",
      status: "active",
    },
    {
      id: "3",
      name: "Github Copilot",
      amount: 10,
      currency: "USD",
      billingCycle: "monthly",
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 20))
        .toISOString()
        .split("T")[0],
      category: "Work",
      status: "active",
    },
  ]);

  // Calculate totals
  const totalMonthlyARS = subscriptions
    .filter(
      (s) =>
        s.currency === "ARS" &&
        s.billingCycle === "monthly" &&
        s.status === "active",
    )
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMonthlyUSD = subscriptions
    .filter(
      (s) =>
        s.currency === "USD" &&
        s.billingCycle === "monthly" &&
        s.status === "active",
    )
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getDaysUntilDue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({
        name: "",
        amount: 0,
        currency: "ARS",
        billingCycle: "monthly",
        nextPaymentDate: new Date().toISOString().split("T")[0],
        category: "",
        status: "active",
      });
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      nextPaymentDate: sub.nextPaymentDate,
      category: sub.category,
      status: sub.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        language === "es"
          ? "¿Estás seguro de eliminar esta suscripción?"
          : "Are you sure you want to delete this subscription?",
      )
    ) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      toast.success(
        language === "es" ? "Suscripción eliminada" : "Subscription deleted",
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    if (editingId) {
      // Edit existing
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingId ? { ...sub, ...formData } : sub,
        ),
      );
      toast.success(
        language === "es" ? "Suscripción actualizada" : "Subscription updated",
      );
    } else {
      // Create new
      const newSub: Subscription = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setSubscriptions((prev) => [...prev, newSub]);
      toast.success(
        language === "es" ? "Suscripción creada" : "Subscription created",
      );
    }
    handleOpenChange(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8 pt-4 pb-20">
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              {language === "es" ? "Suscripciones" : "Subscriptions"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              {language === "es"
                ? "Gestioná tus pagos recurrentes y servicios"
                : "Manage your recurring payments and services"}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === "es" ? "Nueva Suscripción" : "New Subscription"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId
                      ? language === "es"
                        ? "Editar Suscripción"
                        : "Edit Subscription"
                      : language === "es"
                        ? "Agregar Suscripción"
                        : "Add Subscription"}
                  </DialogTitle>
                  <DialogDescription>
                    {language === "es"
                      ? "Registrá o actualizá un servicio recurrente."
                      : "Register or update a recurring service."}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      {language === "es"
                        ? "Nombre del servicio"
                        : "Service name"}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Netflix, Spotify, Gym..."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">
                      {language === "es" ? "Categoría" : "Category"}
                    </Label>
                    <Input
                      id="category"
                      placeholder="Entertainment, Work, Health..."
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">
                        {language === "es" ? "Monto" : "Amount"}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount: Number(e.target.value),
                          })
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currency">
                        {language === "es" ? "Moneda" : "Currency"}
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(val: "ARS" | "USD") =>
                          setFormData({ ...formData, currency: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">ARS ($)</SelectItem>
                          <SelectItem value="USD">USD (US$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cycle">
                        {language === "es" ? "Ciclo" : "Cycle"}
                      </Label>
                      <Select
                        value={formData.billingCycle}
                        onValueChange={(val: "monthly" | "yearly") =>
                          setFormData({ ...formData, billingCycle: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">
                            {language === "es" ? "Mensual" : "Monthly"}
                          </SelectItem>
                          <SelectItem value="yearly">
                            {language === "es" ? "Anual" : "Yearly"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">
                        {language === "es" ? "Próximo pago" : "Next payment"}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.nextPaymentDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nextPaymentDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">
                      {language === "es" ? "Estado" : "Status"}
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: "active" | "paused") =>
                        setFormData({ ...formData, status: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {language === "es" ? "Activo" : "Active"}
                        </SelectItem>
                        <SelectItem value="paused">
                          {language === "es" ? "Pausado" : "Paused"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </Button>
                  <Button type="submit">
                    {language === "es" ? "Guardar" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {language === "es"
                    ? "Costo Mensual Total"
                    : "Total Monthly Cost"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tabular-nums">
                  {formatARS(totalMonthlyARS)}
                </span>
                {totalMonthlyUSD > 0 && (
                  <span className="text-sm font-medium text-muted-foreground mt-1">
                    + USD {totalMonthlyUSD.toFixed(2)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  {language === "es" ? "Servicios Activos" : "Active Services"}
                </span>
              </div>
              <span className="text-2xl font-bold">
                {subscriptions.filter((s) => s.status === "active").length}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => {
            const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
            const isDueSoon = daysLeft <= 7 && daysLeft >= 0;
            const isOverdue = daysLeft < 0;

            return (
              <Card
                key={sub.id}
                className="group hover:shadow-md transition-all duration-200 relative"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(sub)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {language === "es" ? "Editar" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(sub.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {language === "es" ? "Eliminar" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 pr-12">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {sub.name}
                    </CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {sub.category}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          sub.status === "active" ? "default" : "secondary"
                        }
                        className={
                          sub.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {sub.status === "active"
                          ? language === "es"
                            ? "Activo"
                            : "Active"
                          : language === "es"
                            ? "Pausado"
                            : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">
                        {sub.currency === "ARS"
                          ? formatARS(sub.amount)
                          : `USD ${sub.amount}`}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase">
                        {sub.billingCycle === "monthly"
                          ? language === "es"
                            ? "Mensual"
                            : "Monthly"
                          : language === "es"
                            ? "Anual"
                            : "Yearly"}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                        isDueSoon
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : isOverdue
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {isOverdue
                          ? (language === "es" ? "Venció hace" : "Overdue by") +
                            ` ${Math.abs(daysLeft)} ` +
                            (language === "es" ? "días" : "days")
                          : (language === "es" ? "Vence en" : "Due in") +
                            ` ${daysLeft} ` +
                            (language === "es" ? "días" : "days")}
                      </span>
                      {isDueSoon && <AlertCircle className="h-4 w-4 ml-auto" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Subscriptions;
