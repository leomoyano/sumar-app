import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTables } from '@/hooks/useTables';
import { useDollarRate } from '@/hooks/useDollarRate';
import { formatARS, formatUSD, convertARStoUSD } from '@/lib/format';
import { DEFAULT_TAGS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Trash2, Tag, Calculator, BarChart3 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ExpenseForm from '@/components/ExpenseForm';
import TagFilter from '@/components/TagFilter';
import ExpenseBarChart from '@/components/charts/ExpenseBarChart';
import ExpensePieChart from '@/components/charts/ExpensePieChart';

const ExpenseTable = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { tables, addExpense, deleteExpense, isLoading } = useTables(user?.id);
  const { rate } = useDollarRate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const table = tables.find(t => t.id === tableId);

  const allTags = useMemo(() => {
    if (!table) return [];
    const tags = new Set<string>();
    table.expenses.forEach(exp => exp.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [table]);

  const filteredExpenses = useMemo(() => {
    if (!table) return [];
    if (selectedTags.length === 0) return table.expenses;
    return table.expenses.filter(exp => 
      selectedTags.some(tag => exp.tags.includes(tag))
    );
  }, [table, selectedTags]);

  const totals = useMemo(() => {
    const totalARS = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalUSD = convertARStoUSD(totalARS, rate);
    return { ars: totalARS, usd: totalUSD };
  }, [filteredExpenses, rate]);

  const handleAddExpense = async (expense: { name: string; amount: number; tags: string[]; amountUSD?: number }) => {
    if (!tableId) return;
    
    try {
      await addExpense(tableId, {
        name: expense.name,
        amount: expense.amount,
        tags: expense.tags,
        amountUSD: expense.amountUSD,
      });
      
      toast.success('Gasto agregado');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al agregar el gasto');
    }
  };

  const handleDeleteExpense = async (expenseId: string, expenseName: string) => {
    if (!tableId) return;
    try {
      await deleteExpense(tableId, expenseId);
      toast.success(`Gasto "${expenseName}" eliminado`);
    } catch (error) {
      toast.error('Error al eliminar el gasto');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!table) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Tabla no encontrada</h2>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Volver al Dashboard
          </Button>
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
              <h1 className="text-2xl font-bold text-foreground">{table.name}</h1>
              <p className="text-muted-foreground">
                {table.expenses.length} gasto{table.expenses.length !== 1 ? 's' : ''} registrado{table.expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Gasto</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo gasto a la tabla {table.name}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm onSubmit={handleAddExpense} rate={rate} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Totals Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-6 w-6" />
              <span className="text-lg font-medium">Total de Gastos</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div>
                <p className="text-3xl font-bold">{formatARS(totals.ars)}</p>
                {selectedTags.length > 0 && (
                  <p className="text-sm text-primary-foreground/70">
                    (filtrado por {selectedTags.length} etiqueta{selectedTags.length > 1 ? 's' : ''})
                  </p>
                )}
              </div>
              <div className="text-primary-foreground/80">
                <p className="text-lg">≈ {formatUSD(totals.usd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        {table.expenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ExpenseBarChart expenses={filteredExpenses} />
            <ExpensePieChart expenses={filteredExpenses} />
          </div>
        )}

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <TagFilter
            availableTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        )}

        {/* Expenses Table */}
        {filteredExpenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {selectedTags.length > 0 ? 'Sin gastos con esas etiquetas' : 'Sin gastos registrados'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {selectedTags.length > 0 
                  ? 'Prueba quitando algunos filtros'
                  : 'Agrega tu primer gasto para comenzar'}
              </p>
              {selectedTags.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Primer Gasto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Gastos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Etiquetas</TableHead>
                      <TableHead className="text-right">Monto (ARS)</TableHead>
                      <TableHead className="text-right">Monto (USD)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {expense.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatARS(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {expense.amountUSD 
                            ? formatUSD(expense.amountUSD)
                            : formatUSD(convertARStoUSD(expense.amount, rate))
                          }
                        </TableCell>
                        <TableCell>
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
                                <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el gasto "{expense.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteExpense(expense.id, expense.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ExpenseTable;
