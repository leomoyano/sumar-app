import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFixedExpenses, FixedExpense } from '@/hooks/useFixedExpenses';
import { formatARS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import FixedExpenseForm from '@/components/FixedExpenseForm';
import FixedExpensesList from '@/components/FixedExpensesList';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitch from '@/components/LanguageSwitch';

const FixedExpensesPage = () => {
  const { user } = useAuthContext();
  const { t, language } = useLanguage();
  const { 
    fixedExpenses, 
    isLoading, 
    addFixedExpense, 
    updateFixedExpense, 
    deleteFixedExpense, 
    toggleActive 
  } = useFixedExpenses(user?.id);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);

  const handleAdd = async (expense: { name: string; amount: number; tags: string[]; isActive: boolean }) => {
    await addFixedExpense(expense);
    toast.success(language === 'es' ? 'Gasto fijo agregado' : 'Fixed expense added');
  };

  const handleEdit = async (expense: { name: string; amount: number; tags: string[]; isActive: boolean }) => {
    if (!editingExpense) return;
    await updateFixedExpense(editingExpense.id, expense);
    setEditingExpense(null);
    toast.success(language === 'es' ? 'Gasto fijo actualizado' : 'Fixed expense updated');
  };

  const handleDelete = async (id: string) => {
    await deleteFixedExpense(id);
    toast.success(language === 'es' ? 'Gasto fijo eliminado' : 'Fixed expense deleted');
  };

  const handleToggleActive = async (id: string) => {
    await toggleActive(id);
  };

  const totalActive = fixedExpenses
    .filter(exp => exp.isActive)
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('fixedExpenses.title')}
              </h1>
              <p className="text-muted-foreground">
                {language === 'es' 
                  ? 'Administra tus gastos recurrentes mensuales'
                  : 'Manage your monthly recurring expenses'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitch />
          </div>
        </div>

        {/* Summary Card */}
        {fixedExpenses.length > 0 && (
          <div className="bg-accent rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('fixedExpenses.selectedTotal')} ({language === 'es' ? 'activos' : 'active'})
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatARS(totalActive)}
                </p>
              </div>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('fixedExpenses.add')}
              </Button>
            </div>
          </div>
        )}

        {/* Add button when empty */}
        {fixedExpenses.length === 0 && (
          <div className="flex justify-end">
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('fixedExpenses.add')}
            </Button>
          </div>
        )}

        {/* List */}
        <FixedExpensesList
          expenses={fixedExpenses}
          onToggleActive={handleToggleActive}
          onEdit={(expense) => setEditingExpense(expense)}
          onDelete={handleDelete}
        />

        {/* Create Form */}
        <FixedExpenseForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleAdd}
          mode="create"
        />

        {/* Edit Form */}
        {editingExpense && (
          <FixedExpenseForm
            open={!!editingExpense}
            onOpenChange={(open) => !open && setEditingExpense(null)}
            onSubmit={handleEdit}
            initialData={editingExpense}
            mode="edit"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default FixedExpensesPage;
