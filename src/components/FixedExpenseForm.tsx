import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FixedExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: { name: string; amount: number; tags: string[]; isActive: boolean }) => Promise<void>;
  initialData?: {
    name: string;
    amount: number;
    tags: string[];
    isActive: boolean;
  };
  mode: 'create' | 'edit';
}

const FixedExpenseForm = ({ open, onOpenChange, onSubmit, initialData, mode }: FixedExpenseFormProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuthContext();
  const { tags: availableTags, addTag } = useTags(user?.id);
  
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.tags?.[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    setName(initialData?.name || '');
    setAmount(initialData?.amount?.toString() || '');
    setSelectedCategory(initialData?.tags?.[0] || '');
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim() || !amount) {
      toast.error(t('common.validation.requiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        amount: parseFloat(amount),
        tags: selectedCategory ? [selectedCategory] : [],
        isActive: initialData?.isActive ?? true,
      });
      
      setName('');
      setAmount('');
      setSelectedCategory('');
      onOpenChange(false);
    } catch (error) {
      toast.error(t('common.error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;
    
    const categoryName = newCategory.trim();
    const existingTag = availableTags.find(t => t.name.toLowerCase() === categoryName.toLowerCase());
    
    if (existingTag) {
      setSelectedCategory(existingTag.name);
      setNewCategory('');
      toast.info(t('common.category.selected').replace('{{name}}', existingTag.name));
      return;
    }

    setIsAddingCategory(true);
    try {
      await addTag(categoryName);
      setSelectedCategory(categoryName);
      setNewCategory('');
      toast.success(t('common.category.created').replace('{{name}}', categoryName));
    } catch (error) {
      toast.error(t('common.error.categoryCreate'));
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' 
              ? t('fixedExpenses.add') 
              : (language === 'es' ? 'Editar Gasto Fijo' : 'Edit Fixed Expense')}
          </DialogTitle>
          <DialogDescription>
            {language === 'es' 
              ? 'Los gastos fijos se pueden incluir automáticamente al crear nuevas tablas mensuales.'
              : 'Fixed expenses can be automatically included when creating new monthly tables.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('expenseForm.name')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'es' ? 'Ej: Alquiler, Netflix, Gym' : 'Ex: Rent, Netflix, Gym'}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('expenseForm.amount')}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{language === 'es' ? 'Categoría' : 'Category'}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={language === 'es' ? 'Seleccionar categoría' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{language === 'es' ? 'Agregar nueva categoría' : 'Add new category'}</Label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={language === 'es' ? 'Nueva categoría...' : 'New category...'}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                disabled={isAddingCategory}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddNewCategory}
                disabled={isAddingCategory || !newCategory.trim()}
              >
                {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? t('common.loading') 
              : (mode === 'create' ? t('fixedExpenses.add') : t('common.save'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FixedExpenseForm;
