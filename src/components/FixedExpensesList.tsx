import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FixedExpense } from '@/hooks/useFixedExpenses';
import { formatARS } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Repeat } from 'lucide-react';

interface FixedExpensesListProps {
  expenses: FixedExpense[];
  onToggleActive: (id: string) => Promise<void>;
  onEdit: (expense: FixedExpense) => void;
  onDelete: (id: string) => Promise<void>;
}

const FixedExpensesList = ({ expenses, onToggleActive, onEdit, onDelete }: FixedExpensesListProps) => {
  const { t, language } = useLanguage();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setLoadingId(id);
    try {
      await onToggleActive(id);
    } finally {
      setLoadingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('fixedExpenses.empty')}
          </h3>
          <p className="text-muted-foreground text-center">
            {language === 'es' 
              ? 'Agrega gastos recurrentes como alquiler, servicios o suscripciones.'
              : 'Add recurring expenses like rent, utilities, or subscriptions.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map(expense => (
        <Card key={expense.id} className={`transition-opacity ${!expense.isActive ? 'opacity-60' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {expense.name}
                  </h3>
                  <span className="text-lg font-semibold text-primary whitespace-nowrap">
                    {formatARS(expense.amount)}
                  </span>
                </div>
                {expense.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {expense.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {expense.isActive ? t('fixedExpenses.active') : t('fixedExpenses.inactive')}
                  </span>
                  <Switch
                    checked={expense.isActive}
                    onCheckedChange={() => handleToggle(expense.id)}
                    disabled={loadingId === expense.id}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
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
                        {language === 'es' ? '¿Eliminar gasto fijo?' : 'Delete fixed expense?'}
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
                        onClick={() => onDelete(expense.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FixedExpensesList;
