import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const normalizeDueDay = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  const rounded = Math.round(parsed);
  return Math.min(31, Math.max(1, rounded));
};

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  tags: string[];
  dueDay: number;
  billingCycle: 'monthly';
  isActive: boolean;
  lastPaidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useFixedExpenses = (userId: string | undefined) => {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFixedExpenses = useCallback(async () => {
    if (!userId) {
      setFixedExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: FixedExpense[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        amount: Number(item.amount),
        tags: item.tags || [],
        dueDay: normalizeDueDay(item.due_day),
        billingCycle: 'monthly',
        isActive: item.is_active,
        lastPaidAt: item.last_paid_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setFixedExpenses(mapped);
    } catch (error) {
      console.error('Error loading fixed expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFixedExpenses();
  }, [loadFixedExpenses]);

  const addFixedExpense = useCallback(async (
    expense: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FixedExpense | null> => {
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert({
        user_id: userId,
        name: expense.name,
        amount: expense.amount,
        tags: expense.tags,
        due_day: expense.dueDay,
        billing_cycle: expense.billingCycle,
        is_active: expense.isActive,
        last_paid_at: expense.lastPaidAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding fixed expense:', error);
      throw error;
    }

    const newExpense: FixedExpense = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      tags: data.tags || [],
      dueDay: normalizeDueDay(data.due_day),
      billingCycle: 'monthly',
      isActive: data.is_active,
      lastPaidAt: data.last_paid_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setFixedExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, [userId]);

  const updateFixedExpense = useCallback(async (
    id: string,
    updates: Partial<Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;
    if (updates.billingCycle !== undefined) updateData.billing_cycle = updates.billingCycle;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.lastPaidAt !== undefined) updateData.last_paid_at = updates.lastPaidAt;

    const { error } = await supabase
      .from('fixed_expenses')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating fixed expense:', error);
      throw error;
    }

    setFixedExpenses(prev => prev.map(exp =>
      exp.id === id
        ? { ...exp, ...updates, updatedAt: new Date().toISOString() }
        : exp
    ));
  }, []);

  const deleteFixedExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting fixed expense:', error);
      throw error;
    }

    setFixedExpenses(prev => prev.filter(exp => exp.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const expense = fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    await updateFixedExpense(id, { isActive: !expense.isActive });
  }, [fixedExpenses, updateFixedExpense]);

  const getActiveExpenses = useCallback(() => {
    return fixedExpenses.filter(exp => exp.isActive);
  }, [fixedExpenses]);

  const markAsPaid = useCallback(async (id: string) => {
    await updateFixedExpense(id, { lastPaidAt: new Date().toISOString() });
  }, [updateFixedExpense]);

  return {
    fixedExpenses,
    isLoading,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    toggleActive,
    getActiveExpenses,
    markAsPaid,
    refreshFixedExpenses: loadFixedExpenses,
  };
};
