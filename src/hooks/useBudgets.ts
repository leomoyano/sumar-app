import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export type BudgetStatus = 'safe' | 'warning' | 'danger';

export const useBudgets = (userId: string | undefined) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = useCallback(async () => {
    if (!userId) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category');

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const setBudget = async (category: string, amount: number): Promise<Budget | null> => {
    if (!userId) return null;

    try {
      // Check if budget exists for this category
      const existing = budgets.find(b => b.category === category);

      if (existing) {
        // Update existing budget
        const { data, error } = await supabase
          .from('budgets')
          .update({ amount })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        
        setBudgets(prev => prev.map(b => b.id === existing.id ? data : b));
        return data;
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({ user_id: userId, category, amount })
          .select()
          .single();

        if (error) throw error;
        
        setBudgets(prev => [...prev, data].sort((a, b) => a.category.localeCompare(b.category)));
        return data;
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (category: string): Promise<void> => {
    if (!userId) return;

    const budget = budgets.find(b => b.category === category);
    if (!budget) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budget.id);

      if (error) throw error;
      
      setBudgets(prev => prev.filter(b => b.id !== budget.id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const getBudgetForCategory = (category: string): Budget | undefined => {
    return budgets.find(b => b.category === category);
  };

  const getBudgetProgress = (spent: number, limit: number): number => {
    if (limit <= 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getBudgetStatus = (percentage: number): BudgetStatus => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  };

  const getTotalBudget = (): number => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  };

  return {
    budgets,
    isLoading,
    setBudget,
    deleteBudget,
    getBudgetForCategory,
    getBudgetProgress,
    getBudgetStatus,
    getTotalBudget,
    refetch: loadBudgets,
  };
};
