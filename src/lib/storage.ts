// Utilidades para persistencia en localStorage
// Preparado para migrar a base de datos

import { User, MonthlyTable } from '@/types';

const STORAGE_KEYS = {
  USERS: 'gastos_app_users',
  CURRENT_USER: 'gastos_app_current_user',
  TABLES: 'gastos_app_tables',
} as const;

// Usuarios
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Tablas mensuales
export const getTables = (): MonthlyTable[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TABLES);
  return data ? JSON.parse(data) : [];
};

export const saveTables = (tables: MonthlyTable[]): void => {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
};

export const getTablesByUserId = (userId: string): MonthlyTable[] => {
  const tables = getTables();
  return tables.filter(table => table.userId === userId);
};

export const getTableById = (tableId: string): MonthlyTable | undefined => {
  const tables = getTables();
  return tables.find(table => table.id === tableId);
};

export const saveTable = (table: MonthlyTable): void => {
  const tables = getTables();
  const index = tables.findIndex(t => t.id === table.id);
  if (index >= 0) {
    tables[index] = table;
  } else {
    tables.push(table);
  }
  saveTables(tables);
};

export const deleteTable = (tableId: string): void => {
  const tables = getTables();
  const filtered = tables.filter(t => t.id !== tableId);
  saveTables(filtered);
};
