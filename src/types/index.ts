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
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Tags predefinidos para gastos
export const DEFAULT_TAGS = [
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

export type TagType = typeof DEFAULT_TAGS[number];

// Tipo para la respuesta de la API de dólar
export interface DollarRate {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  fechaActualizacion: string;
}
