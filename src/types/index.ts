// Tipos e interfaces para la aplicación de gestión de gastos

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number; // Monto en ARS
  amountUSD?: number; // Monto en USD (opcional, para multidivisa)
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTable {
  id: string;
  name: string; // Ej: "Enero 2026"
  userId: string;
  budget: number; // Presupuesto general para el mes
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Categorías predefinidas para gastos
export const DEFAULT_CATEGORIES = [
  'Comida',
  'Servicios',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Hogar',
  'Ropa',
  'Otros'
] as const;

export type CategoryType = typeof DEFAULT_CATEGORIES[number];

// Helper para obtener la categoría principal de un gasto (legacy support)
export const getPrimaryCategory = (tags: string[]): string => {
  return tags.length > 0 ? tags[0] : 'Sin categoría';
};

// Tipo para la respuesta de la API de dólar
export interface DollarRate {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  fechaActualizacion: string;
}
