import { useState } from 'react';
import { convertARStoUSD } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExpenseFormProps {
  onSubmit: (expense: { name: string; amount: number; tags: string[]; amountUSD?: number }) => void;
  rate: number;
}

const ExpenseForm = ({ onSubmit, rate }: ExpenseFormProps) => {
  const { user } = useAuth();
  const { tags, addTag, isLoading: tagsLoading } = useTags(user?.id);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    onSubmit({
      name: name.trim(),
      amount: amountNum,
      tags: selectedCategory ? [selectedCategory] : [],
      amountUSD: convertARStoUSD(amountNum, rate),
    });

    setName('');
    setAmount('');
    setSelectedCategory('');
  };

  const addCustomCategory = async () => {
    const categoryName = customCategory.trim();
    if (!categoryName) return;
    
    // Check if category already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === categoryName.toLowerCase());
    if (existingTag) {
      setSelectedCategory(existingTag.name);
      setCustomCategory('');
      toast.info(`Categoría "${existingTag.name}" seleccionada`);
      return;
    }

    // Add new category to database
    setIsAddingCategory(true);
    try {
      const newTag = await addTag(categoryName);
      if (newTag) {
        setSelectedCategory(newTag.name);
        toast.success(`Categoría "${newTag.name}" creada`);
      }
    } catch (error) {
      toast.error('Error al crear la categoría');
    } finally {
      setIsAddingCategory(false);
      setCustomCategory('');
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const amountUSD = convertARStoUSD(amountNum, rate);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expense-name">Nombre del Gasto</Label>
        <Input
          id="expense-name"
          placeholder="Ej: Supermercado"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-amount">Monto (ARS)</Label>
        <Input
          id="expense-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        {amountNum > 0 && (
          <p className="text-sm text-muted-foreground">
            ≈ USD {amountUSD.toFixed(2)} (cotización: ${rate.toFixed(0)})
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        {tagsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando categorías...</span>
          </div>
        ) : (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                  {tag.isCustom && <span className="ml-1 opacity-60">•</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-category">Agregar nueva categoría</Label>
        <div className="flex gap-2">
          <Input
            id="custom-category"
            placeholder="Nueva categoría..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
            disabled={isAddingCategory}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={addCustomCategory}
            disabled={isAddingCategory || !customCategory.trim()}
          >
            {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!name.trim() || !amount || parseFloat(amount) <= 0}>
          Guardar Gasto
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExpenseForm;
