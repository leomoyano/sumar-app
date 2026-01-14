import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/hooks/useTables';
import { useDollarRate } from '@/hooks/useDollarRate';
import { formatARS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Trash2, Calendar, DollarSign, RefreshCw, LogOut, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LanguageSwitch from '@/components/LanguageSwitch';
import ThemeToggle from '@/components/ThemeToggle';

const Dashboard = () => {
  const { user, logout } = useAuthContext();
  const { t } = useLanguage();
  const { tables, createTable, deleteTableById, isLoading } = useTables(user?.id);
  const { rate, dollarInfo, isLoading: isLoadingRate, refetch: refetchRate } = useDollarRate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      toast.error(t('dashboard.newTable.name'));
      return;
    }
    
    try {
      await createTable(newTableName.trim());
      toast.success(`${t('dashboard.newTable.title')}: "${newTableName}"`);
      setNewTableName('');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    try {
      await deleteTableById(tableId);
      toast.success(`${t('dashboard.deleteTable.confirm')}: "${tableName}"`);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const calculateTableTotal = (expenses: { amount: number }[]) => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('dashboard.welcome')}, {user?.name}
            </h1>
            <p className="text-muted-foreground">
              {t('login.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitch />
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('dashboard.logout')}
            </Button>
          </div>
        </div>

        {/* Dollar Rate Card */}
        <Card className="bg-accent border-accent-foreground/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.dollarRate')}</p>
                  <p className="font-semibold text-foreground">
                    {formatARS(rate)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refetchRate}
                disabled={isLoadingRate}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {dollarInfo && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('dashboard.dollarRate.buy')}: {formatARS(dollarInfo.compra)} | {t('dashboard.dollarRate.sell')}: {formatARS(dollarInfo.venta)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dashboard.newTable')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.newTable.title')}</DialogTitle>
                <DialogDescription>
                  {t('dashboard.newTable.description')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="table-name">{t('dashboard.newTable.name')}</Label>
                  <Input
                    id="table-name"
                    placeholder={t('dashboard.newTable.placeholder')}
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTable()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('dashboard.newTable.cancel')}
                </Button>
                <Button onClick={handleCreateTable}>
                  {t('dashboard.newTable.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tables Grid */}
        {filteredTables.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('dashboard.noTables')}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('dashboard.newTable.description')}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('dashboard.newTable')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => {
              const total = calculateTableTotal(table.expenses);
              const totalUSD = total / rate;
              
              return (
                <Card key={table.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <CardDescription>
                          {table.expenses.length} {table.expenses.length !== 1 ? t('dashboard.expenses') : t('dashboard.expense')}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('dashboard.deleteTable.title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('dashboard.deleteTable.description')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('dashboard.deleteTable.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTable(table.id, table.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('dashboard.deleteTable.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-xl font-bold text-foreground">
                          {formatARS(total)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ≈ USD {totalUSD.toFixed(2)}
                      </p>
                      <Link to={`/table/${table.id}`}>
                        <Button variant="outline" className="w-full mt-2">
                          {t('expenseTable.back').replace('Volver', 'Ver').replace('Back', 'View')}
                        </Button>
                      </Link>
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

export default Dashboard;
