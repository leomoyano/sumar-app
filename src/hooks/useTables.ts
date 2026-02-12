import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  amountUSD?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTable {
  id: string;
  name: string;
  userId: string;
  budget: number;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

interface RawExpense {
  id: string;
  table_id: string;
  name: string;
  amount: number;
  amount_usd?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Define raw database type for monthly_tables
interface RawMonthlyTable {
  id: string;
  name: string;
  user_id: string;
  budget: number;
  created_at: string;
  updated_at: string;
}



export const useTables = (userId: string | undefined) => {
  const [tables, setTables] = useState<MonthlyTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const loadTables = useCallback(async () => {
    if (!userId) {
      setTables([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('monthly_tables')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (tablesError) throw tablesError;

      // Fetch expenses for all tables
      const tableIds = tablesData?.map(t => t.id) || [];
      
      let expensesData: RawExpense[] = [];
      if (tableIds.length > 0) {
        const { data, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .in('table_id', tableIds)
          .order('created_at', { ascending: false });
        
        if (expensesError) throw expensesError;
        expensesData = data || [];
      }

      const tablesWithExpenses: MonthlyTable[] = (tablesData as unknown as RawMonthlyTable[] || []).map(table => ({
        id: table.id,
        name: table.name,
        userId: table.user_id,
        budget: Number(table.budget || 0), // Use RawMonthlyTable type to access budget directly
        createdAt: table.created_at,
        updatedAt: table.updated_at,
        expenses: expensesData
          .filter(exp => exp.table_id === table.id)
          .map(exp => ({
            id: exp.id,
            name: exp.name,
            amount: Number(exp.amount),
            amountUSD: exp.amount_usd ? Number(exp.amount_usd) : undefined,
            tags: exp.tags || [],
            createdAt: exp.created_at,
            updatedAt: exp.updated_at,
          })),
      }));

      setTables(tablesWithExpenses);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const createTable = useCallback(async (name: string): Promise<MonthlyTable | null> => {
    if (!userId) throw new Error('Usuario no autenticado');
    
    const { data, error } = await supabase
      .from('monthly_tables')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating table:', error);
      throw error;
    }

    const newTable: MonthlyTable = {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      budget: 0,
      expenses: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setTables(prev => [newTable, ...prev]);
    return newTable;
  }, [userId]);

  const deleteTableById = useCallback(async (tableId: string) => {
    const { error } = await supabase
      .from('monthly_tables')
      .delete()
      .eq('id', tableId);

    if (error) {
      console.error('Error deleting table:', error);
      throw error;
    }

    setTables(prev => prev.filter(t => t.id !== tableId));
  }, []);

  const addExpense = useCallback(async (
    tableId: string, 
    expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Expense | null> => {
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        table_id: tableId,
        user_id: userId,
        name: expense.name,
        amount: expense.amount,
        amount_usd: expense.amountUSD,
        tags: expense.tags,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    const newExpense: Expense = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      amountUSD: data.amount_usd ? Number(data.amount_usd) : undefined,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, expenses: [newExpense, ...t.expenses] }
        : t
    ));

    return newExpense;
  }, [userId]);

  const updateExpense = useCallback(async (
    tableId: string, 
    expenseId: string, 
    updates: Partial<Expense>
  ) => {
    const updateData: {
      name?: string;
      amount?: number;
      amount_usd?: number;
      tags?: string[];
    } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.amountUSD !== undefined) updateData.amount_usd = updates.amountUSD;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId);

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? {
            ...t,
            expenses: t.expenses.map(e => 
              e.id === expenseId 
                ? { ...e, ...updates, updatedAt: new Date().toISOString() }
                : e
            )
          }
        : t
    ));
  }, []);

  const deleteExpense = useCallback(async (tableId: string, expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, expenses: t.expenses.filter(e => e.id !== expenseId) }
        : t
    ));
  }, []);

  const updateTableBudget = useCallback(async (tableId: string, budget: number) => {
    const { error } = await supabase
      .from('monthly_tables')
      .update({ budget } as unknown as { budget: number })
      .eq('id', tableId);

    if (error) {
      console.error('Error updating table budget:', error);
      throw error;
    }

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, budget }
        : t
    ));
  }, []);

  return {
    tables,
    isLoading,
    createTable,
    deleteTableById,
    addExpense,
    updateExpense,
    deleteExpense,
    updateTableBudget, // Exportar nueva función
    refreshTables: loadTables,
  };
};
