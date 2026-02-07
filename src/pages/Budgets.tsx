import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBudgets } from '@/hooks/useBudgets';
import { useTables } from '@/hooks/useTables';
import { formatARS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Trash2, Target, Wallet, PiggyBank, Edit2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetProgress from '@/components/BudgetProgress';
import LanguageSwitch from '@/components/LanguageSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import { DEFAULT_CATEGORIES } from '@/types';

const Budgets = () => {
  const { user } = useAuthContext();
  const { t, language } = useLanguage();
  const { budgets, setBudget, deleteBudget, getTotalBudget, isLoading } = useBudgets(user?.id);
  const { tables } = useTables(user?.id);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<string>('');

  // Calculate current month's spending per category
  const currentMonthSpending = useMemo(() => {
    const now = new Date();
    const currentMonthName = now.toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Find current month's table
    const currentTable = tables.find(t => {
      const tableName = t.name.toLowerCase();
      const months = language === 'es' 
        ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
        : ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      
      const currentMonth = months[now.getMonth()];
      const currentYear = now.getFullYear().toString();
      
      return tableName.includes(currentMonth) && tableName.includes(currentYear);
    });

    const spending: Record<string, number> = {};
    
    if (currentTable) {
      currentTable.expenses.forEach(expense => {
        const category = expense.tags[0] || 'Otros';
        spending[category] = (spending[category] || 0) + expense.amount;
      });
    }
    
    return spending;
  }, [tables, language]);

  // Categories that don't have a budget yet
  const availableCategories = useMemo(() => {
    const existingCategories = new Set(budgets.map(b => b.category));
    return DEFAULT_CATEGORIES.filter(c => !existingCategories.has(c));
  }, [budgets]);

  const totalBudget = getTotalBudget();
  const totalSpent = Object.values(currentMonthSpending).reduce((sum, val) => sum + val, 0);

  const handleOpenDialog = (category?: string) => {
    if (category) {
      const budget = budgets.find(b => b.category === category);
      setEditingCategory(category);
      setSelectedCategory(category);
      setBudgetAmount(budget ? String(budget.amount) : '');
    } else {
      setEditingCategory(null);
      setSelectedCategory(availableCategories[0] || '');
      setBudgetAmount('');
    }
    setIsDialogOpen(true);
  };

  const handleSaveBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (!selectedCategory || isNaN(amount) || amount <= 0) {
      toast.error(language === 'es' ? 'Ingresa un monto válido' : 'Enter a valid amount');
      return;
    }

    try {
      await setBudget(selectedCategory, amount);
      toast.success(language === 'es' ? 'Presupuesto guardado' : 'Budget saved');
      setIsDialogOpen(false);
      setEditingCategory(null);
      setBudgetAmount('');
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDeleteBudget = async (category: string) => {
    try {
      await deleteBudget(category);
      toast.success(language === 'es' ? 'Presupuesto eliminado' : 'Budget deleted');
    } catch (error) {
      toast.error(t('common.error'));
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
                {t('budget.title')}
              </h1>
              <p className="text-muted-foreground text-sm">
                {language === 'es' 
                  ? 'Define límites de gasto por categoría' 
                  : 'Set spending limits by category'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('budget.total')}</p>
                  <p className="text-2xl font-bold tabular-nums">{formatARS(totalBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('budget.spent')}</p>
                  <p className="text-2xl font-bold tabular-nums">{formatARS(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <PiggyBank className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('budget.remaining')}</p>
                  <p className={`text-2xl font-bold tabular-nums ${totalBudget - totalSpent < 0 ? 'text-destructive' : ''}`}>
                    {formatARS(Math.max(0, totalBudget - totalSpent))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Progress */}
        {totalBudget > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('budget.progress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetProgress 
                category={t('budget.total')}
                spent={totalSpent}
                limit={totalBudget}
                showLabel={false}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">{Math.round((totalSpent / totalBudget) * 100)}%</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatARS(totalSpent)} / {formatARS(totalBudget)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Budget Button */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2" 
                onClick={() => handleOpenDialog()}
                disabled={availableCategories.length === 0 && !editingCategory}
              >
                <Plus className="h-4 w-4" />
                {t('budget.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? t('budget.edit') : t('budget.add')}
                </DialogTitle>
                <DialogDescription>
                  {language === 'es' 
                    ? 'Define un límite de gasto mensual para esta categoría.'
                    : 'Set a monthly spending limit for this category.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('budget.category')}</Label>
                  {editingCategory ? (
                    <Input value={selectedCategory} disabled />
                  ) : (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'es' ? 'Seleccionar categoría' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('budget.limit')}</Label>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveBudget}>
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('budget.empty')}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {language === 'es' 
                  ? 'Comienza definiendo un límite de gasto para tus categorías.'
                  : 'Start by setting a spending limit for your categories.'}
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('budget.add')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(budget => {
              const spent = currentMonthSpending[budget.category] || 0;
              
              return (
                <Card key={budget.id} className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <CardTitle className="text-base">{budget.category}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {t('budget.limit')}: {formatARS(budget.amount)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(budget.category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {language === 'es' ? '¿Eliminar presupuesto?' : 'Delete budget?'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === 'es' 
                                  ? 'Esta acción no se puede deshacer.'
                                  : 'This action cannot be undone.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBudget(budget.category)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('common.delete')}
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
                        {formatARS(spent)} {t('budget.spent').toLowerCase()}
                      </span>
                      <span className={`tabular-nums ${spent > budget.amount ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {spent > budget.amount 
                          ? `${t('budget.exceeded')}: ${formatARS(spent - budget.amount)}`
                          : `${t('budget.remaining')}: ${formatARS(budget.amount - spent)}`
                        }
                      </span>
                    </div>
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

export default Budgets;
