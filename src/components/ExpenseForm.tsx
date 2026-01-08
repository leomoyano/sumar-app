import { useState } from 'react';
import { DEFAULT_TAGS } from '@/types';
import { convertARStoUSD } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: { name: string; amount: number; tags: string[]; amountUSD?: number }) => void;
  rate: number;
}

const ExpenseForm = ({ onSubmit, rate }: ExpenseFormProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

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

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
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
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
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
