import { useState, useEffect, useCallback } from 'react';
import { MonthlyTable, Expense } from '@/types';
import { getTablesByUserId, saveTable, deleteTable as removeTable, getTableById } from '@/lib/storage';

export const useTables = (userId: string | undefined) => {
  const [tables, setTables] = useState<MonthlyTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTables = useCallback(() => {
    if (!userId) {
      setTables([]);
      setIsLoading(false);
      return;
    }
    const userTables = getTablesByUserId(userId);
    setTables(userTables.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const createTable = useCallback((name: string): MonthlyTable => {
    if (!userId) throw new Error('Usuario no autenticado');
    
    const newTable: MonthlyTable = {
      id: crypto.randomUUID(),
      name,
      userId,
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveTable(newTable);
    setTables(prev => [newTable, ...prev]);
    return newTable;
  }, [userId]);

  const deleteTableById = useCallback((tableId: string) => {
    removeTable(tableId);
    setTables(prev => prev.filter(t => t.id !== tableId));
  }, []);

  const addExpense = useCallback((tableId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense => {
    const table = getTableById(tableId);
    if (!table) throw new Error('Tabla no encontrada');

    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTable: MonthlyTable = {
      ...table,
      expenses: [...table.expenses, newExpense],
      updatedAt: new Date().toISOString(),
    };

    saveTable(updatedTable);
    setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
    return newExpense;
  }, []);

  const updateExpense = useCallback((tableId: string, expenseId: string, updates: Partial<Expense>) => {
    const table = getTableById(tableId);
    if (!table) throw new Error('Tabla no encontrada');

    const updatedTable: MonthlyTable = {
      ...table,
      expenses: table.expenses.map(e => 
        e.id === expenseId 
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      ),
      updatedAt: new Date().toISOString(),
    };

    saveTable(updatedTable);
    setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
  }, []);

  const deleteExpense = useCallback((tableId: string, expenseId: string) => {
    const table = getTableById(tableId);
    if (!table) throw new Error('Tabla no encontrada');

    const updatedTable: MonthlyTable = {
      ...table,
      expenses: table.expenses.filter(e => e.id !== expenseId),
      updatedAt: new Date().toISOString(),
    };

    saveTable(updatedTable);
    setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
  }, []);

  return {
    tables,
    isLoading,
    createTable,
    deleteTableById,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshTables: loadTables,
  };
};
