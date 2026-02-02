import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
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
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !amount) {
      toast.error(language === 'es' ? 'Completa todos los campos' : 'Fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        amount: parseFloat(amount),
        tags: selectedTags,
        isActive: initialData?.isActive ?? true,
      });
      
      setName('');
      setAmount('');
      setSelectedTags([]);
      onOpenChange(false);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddNewTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      await addTag(newTag.trim());
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    } catch (error) {
      toast.error(t('common.error'));
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
            <Label>{t('expenseForm.tags')}</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
              {availableTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.name)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.name) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t('expenseForm.newTag.placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
            />
            <Button type="button" variant="outline" onClick={handleAddNewTag}>
              <Plus className="h-4 w-4" />
            </Button>
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
