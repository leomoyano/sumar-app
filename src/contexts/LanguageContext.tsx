import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Login
    'login.title': 'Sumar',
    'login.subtitle': 'Tu gestor de finanzas personales',
    'login.features.tracking': 'Seguimiento de gastos mensuales',
    'login.features.categories': 'Categorías personalizables',
    'login.features.conversion': 'Conversión automática USD/ARS',
    'login.features.analysis': 'Análisis visual de tus finanzas',
    'login.tab.login': 'Iniciar Sesión',
    'login.tab.register': 'Registrarse',
    'login.email': 'Correo electrónico',
    'login.email.placeholder': 'tu@email.com',
    'login.password': 'Contraseña',
    'login.password.placeholder': '••••••••',
    'login.name': 'Nombre',
    'login.name.placeholder': 'Tu nombre',
    'login.confirmPassword': 'Confirmar contraseña',
    'login.button.login': 'Iniciar Sesión',
    'login.button.register': 'Crear Cuenta',
    'login.loading': 'Cargando...',
    'login.error.passwordLength': 'La contraseña debe tener al menos 6 caracteres',
    'login.error.passwordMatch': 'Las contraseñas no coinciden',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido',
    'dashboard.logout': 'Cerrar sesión',
    'dashboard.dollarRate': 'Dólar Blue',
    'dashboard.dollarRate.buy': 'Compra',
    'dashboard.dollarRate.sell': 'Venta',
    'dashboard.dollarRate.error': 'Error al cargar',
    'dashboard.search': 'Buscar tablas...',
    'dashboard.newTable': 'Nueva Tabla',
    'dashboard.newTable.title': 'Crear Nueva Tabla',
    'dashboard.newTable.description': 'Ingresa un nombre para tu nueva tabla de gastos mensuales.',
    'dashboard.newTable.name': 'Nombre de la tabla',
    'dashboard.newTable.placeholder': 'Ej: Gastos Enero 2024',
    'dashboard.newTable.cancel': 'Cancelar',
    'dashboard.newTable.create': 'Crear',
    'dashboard.noTables': 'No hay tablas que coincidan con tu búsqueda',
    'dashboard.expenses': 'gastos',
    'dashboard.expense': 'gasto',
    'dashboard.deleteTable': 'Eliminar',
    'dashboard.deleteTable.title': '¿Eliminar tabla?',
    'dashboard.deleteTable.description': 'Esta acción no se puede deshacer. Se eliminarán todos los gastos asociados a esta tabla.',
    'dashboard.deleteTable.cancel': 'Cancelar',
    'dashboard.deleteTable.confirm': 'Eliminar',
    
    // Expense Table
    'expenseTable.back': 'Volver',
    'expenseTable.dollarRate': 'Dólar Blue',
    'expenseTable.noExpenses': 'No hay gastos registrados',
    'expenseTable.noExpenses.description': 'Agrega tu primer gasto usando el formulario.',
    'expenseTable.addExpense': 'Agregar Gasto',
    'expenseTable.expense.name': 'Nombre',
    'expenseTable.expense.amount': 'Monto (ARS)',
    'expenseTable.expense.amountUSD': 'Monto (USD)',
    'expenseTable.expense.tags': 'Etiquetas',
    'expenseTable.expense.actions': 'Acciones',
    'expenseTable.expense.delete': 'Eliminar',
    'expenseTable.total': 'Total',
    'expenseTable.analysis': 'Análisis de Gastos',
    'expenseTable.chart.bar': 'Gastos por Etiqueta',
    'expenseTable.chart.pie': 'Distribución de Gastos',
    
    // Expense Form
    'expenseForm.title': 'Nuevo Gasto',
    'expenseForm.name': 'Nombre del gasto',
    'expenseForm.name.placeholder': 'Ej: Supermercado',
    'expenseForm.amount': 'Monto (ARS)',
    'expenseForm.amount.placeholder': '0.00',
    'expenseForm.tags': 'Etiquetas',
    'expenseForm.tags.placeholder': 'Seleccionar etiquetas...',
    'expenseForm.tags.empty': 'No hay etiquetas disponibles',
    'expenseForm.newTag': 'Nueva etiqueta',
    'expenseForm.newTag.placeholder': 'Nueva etiqueta',
    'expenseForm.newTag.add': 'Agregar',
    'expenseForm.submit': 'Agregar Gasto',
    
    // Tag Filter
    'tagFilter.all': 'Todos',
    'tagFilter.filter': 'Filtrar por etiqueta',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    
    // Fixed Expenses
    'fixedExpenses.title': 'Gastos Fijos',
    'fixedExpenses.add': 'Agregar Gasto Fijo',
    'fixedExpenses.empty': 'No tienes gastos fijos configurados',
    'fixedExpenses.active': 'Activo',
    'fixedExpenses.inactive': 'Inactivo',
    'fixedExpenses.includeInTable': 'Incluir gastos fijos',
    'fixedExpenses.selectedTotal': 'Total seleccionado',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
  },
  en: {
    // Login
    'login.title': 'Sumar',
    'login.subtitle': 'Your personal finance manager',
    'login.features.tracking': 'Monthly expense tracking',
    'login.features.categories': 'Customizable categories',
    'login.features.conversion': 'Automatic USD/ARS conversion',
    'login.features.analysis': 'Visual analysis of your finances',
    'login.tab.login': 'Login',
    'login.tab.register': 'Register',
    'login.email': 'Email',
    'login.email.placeholder': 'your@email.com',
    'login.password': 'Password',
    'login.password.placeholder': '••••••••',
    'login.name': 'Name',
    'login.name.placeholder': 'Your name',
    'login.confirmPassword': 'Confirm password',
    'login.button.login': 'Login',
    'login.button.register': 'Create Account',
    'login.loading': 'Loading...',
    'login.error.passwordLength': 'Password must be at least 6 characters',
    'login.error.passwordMatch': 'Passwords do not match',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.logout': 'Logout',
    'dashboard.dollarRate': 'Blue Dollar',
    'dashboard.dollarRate.buy': 'Buy',
    'dashboard.dollarRate.sell': 'Sell',
    'dashboard.dollarRate.error': 'Error loading',
    'dashboard.search': 'Search tables...',
    'dashboard.newTable': 'New Table',
    'dashboard.newTable.title': 'Create New Table',
    'dashboard.newTable.description': 'Enter a name for your new monthly expense table.',
    'dashboard.newTable.name': 'Table name',
    'dashboard.newTable.placeholder': 'Ex: January 2024 Expenses',
    'dashboard.newTable.cancel': 'Cancel',
    'dashboard.newTable.create': 'Create',
    'dashboard.noTables': 'No tables match your search',
    'dashboard.expenses': 'expenses',
    'dashboard.expense': 'expense',
    'dashboard.deleteTable': 'Delete',
    'dashboard.deleteTable.title': 'Delete table?',
    'dashboard.deleteTable.description': 'This action cannot be undone. All expenses associated with this table will be deleted.',
    'dashboard.deleteTable.cancel': 'Cancel',
    'dashboard.deleteTable.confirm': 'Delete',
    
    // Expense Table
    'expenseTable.back': 'Back',
    'expenseTable.dollarRate': 'Blue Dollar',
    'expenseTable.noExpenses': 'No expenses recorded',
    'expenseTable.noExpenses.description': 'Add your first expense using the form.',
    'expenseTable.addExpense': 'Add Expense',
    'expenseTable.expense.name': 'Name',
    'expenseTable.expense.amount': 'Amount (ARS)',
    'expenseTable.expense.amountUSD': 'Amount (USD)',
    'expenseTable.expense.tags': 'Tags',
    'expenseTable.expense.actions': 'Actions',
    'expenseTable.expense.delete': 'Delete',
    'expenseTable.total': 'Total',
    'expenseTable.analysis': 'Expense Analysis',
    'expenseTable.chart.bar': 'Expenses by Tag',
    'expenseTable.chart.pie': 'Expense Distribution',
    
    // Expense Form
    'expenseForm.title': 'New Expense',
    'expenseForm.name': 'Expense name',
    'expenseForm.name.placeholder': 'Ex: Groceries',
    'expenseForm.amount': 'Amount (ARS)',
    'expenseForm.amount.placeholder': '0.00',
    'expenseForm.tags': 'Tags',
    'expenseForm.tags.placeholder': 'Select tags...',
    'expenseForm.tags.empty': 'No tags available',
    'expenseForm.newTag': 'New tag',
    'expenseForm.newTag.placeholder': 'New tag',
    'expenseForm.newTag.add': 'Add',
    'expenseForm.submit': 'Add Expense',
    
    // Tag Filter
    'tagFilter.all': 'All',
    'tagFilter.filter': 'Filter by tag',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    
    // Fixed Expenses
    'fixedExpenses.title': 'Fixed Expenses',
    'fixedExpenses.add': 'Add Fixed Expense',
    'fixedExpenses.empty': "You don't have any fixed expenses configured",
    'fixedExpenses.active': 'Active',
    'fixedExpenses.inactive': 'Inactive',
    'fixedExpenses.includeInTable': 'Include fixed expenses',
    'fixedExpenses.selectedTotal': 'Selected total',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
