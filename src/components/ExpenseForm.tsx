import { useState } from 'react';
import { convertARStoUSD } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { X, Loader2 } from 'lucide-react';
import { useTags, Tag } from '@/hooks/useTags';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    onSubmit({
      name: name.trim(),
      amount: amountNum,
      tags: selectedTags,
      amountUSD: convertARStoUSD(amountNum, rate),
    });

    setName('');
    setAmount('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = async () => {
    const tagName = customTag.trim();
    if (!tagName) return;
    
    // Check if already selected
    if (selectedTags.includes(tagName)) {
      setCustomTag('');
      return;
    }

    // Check if tag already exists in the list
    const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      setSelectedTags(prev => [...prev, existingTag.name]);
      setCustomTag('');
      return;
    }

    // Add new tag to database
    setIsAddingTag(true);
    try {
      const newTag = await addTag(tagName);
      if (newTag) {
        setSelectedTags(prev => [...prev, newTag.name]);
        toast.success(`Etiqueta "${newTag.name}" creada`);
      }
    } catch (error) {
      toast.error('Error al crear la etiqueta');
    } finally {
      setIsAddingTag(false);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
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
        <Label>Etiquetas</Label>
        {tagsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando etiquetas...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
                {tag.isCustom && <span className="ml-1 opacity-60">•</span>}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label>Etiquetas seleccionadas</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="custom-tag">Agregar etiqueta personalizada</Label>
        <div className="flex gap-2">
          <Input
            id="custom-tag"
            placeholder="Nueva etiqueta..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
          />
          <Button type="button" variant="outline" onClick={addCustomTag}>
            Agregar
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
