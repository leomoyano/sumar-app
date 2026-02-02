

# Plan: Sistema de Gastos Fijos Recurrentes

## Resumen

Implementar un sistema de "gastos fijos" que permita a los usuarios predefinir gastos recurrentes (como alquiler, servicios, suscripciones) que se pueden incluir automáticamente al crear una nueva tabla mensual.

---

## Funcionalidades Principales

### 1. Gestión de Gastos Fijos
- Lista de gastos fijos predefinidos por usuario
- Cada gasto fijo tiene: nombre, monto, etiquetas, estado (activo/inactivo)
- Opción para activar/desactivar cada gasto fijo
- Agregar, editar y eliminar gastos fijos

### 2. Creación de Nueva Tabla Mejorada
- Al crear una nueva tabla mensual, mostrar lista de gastos fijos activos
- Checkbox para seleccionar cuáles incluir en la nueva tabla
- Los gastos seleccionados se agregan automáticamente a la tabla

### 3. Navegación
- Nueva sección accesible desde el dashboard: "Gastos Fijos" o "Recurring"
- Página dedicada para administrar gastos fijos

---

## Cambios Técnicos

### Base de Datos

Nueva tabla `fixed_expenses`:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Identificador único |
| user_id | uuid | Usuario propietario |
| name | text | Nombre del gasto |
| amount | numeric | Monto en ARS |
| tags | text[] | Etiquetas asociadas |
| is_active | boolean | Si está activo por defecto |
| created_at | timestamptz | Fecha de creación |
| updated_at | timestamptz | Fecha de actualización |

Políticas RLS: Solo el usuario puede ver/crear/editar/eliminar sus propios gastos fijos.

### Nuevos Archivos

1. **`src/pages/FixedExpenses.tsx`** - Página para gestionar gastos fijos
2. **`src/hooks/useFixedExpenses.ts`** - Hook para operaciones CRUD de gastos fijos
3. **`src/components/FixedExpenseForm.tsx`** - Formulario para agregar/editar gastos fijos
4. **`src/components/FixedExpensesList.tsx`** - Lista de gastos fijos con switches

### Archivos a Modificar

1. **`src/pages/Dashboard.tsx`**
   - Agregar botón/link a página de gastos fijos
   - Modificar diálogo de creación de tabla para incluir selector de gastos fijos

2. **`src/hooks/useTables.ts`**
   - Modificar `createTable` para aceptar gastos fijos iniciales

3. **`src/App.tsx`**
   - Agregar ruta `/fixed-expenses`

4. **`src/contexts/LanguageContext.tsx`**
   - Agregar traducciones para la nueva funcionalidad

---

## Flujo de Usuario

```text
Dashboard
    │
    ├── [Botón "Gastos Fijos"] ──► Página de Gastos Fijos
    │                                   │
    │                                   ├── Ver lista de gastos fijos
    │                                   ├── Toggle activar/desactivar
    │                                   ├── Agregar nuevo gasto fijo
    │                                   └── Editar/Eliminar existentes
    │
    └── [Botón "Nueva Tabla"] ──► Diálogo mejorado
                                      │
                                      ├── Selector de Mes/Año
                                      ├── Lista de gastos fijos activos
                                      │     └── Checkboxes para incluir
                                      └── [Crear] ──► Tabla con gastos incluidos
```

---

## Detalles de Implementación

### Página de Gastos Fijos (`/fixed-expenses`)

- Header con título y botón "Agregar Gasto Fijo"
- Lista de cards/filas mostrando cada gasto fijo:
  - Nombre y monto
  - Etiquetas (badges)
  - Switch para activar/desactivar
  - Botones de editar y eliminar
- Estado vacío cuando no hay gastos fijos

### Diálogo de Nueva Tabla (mejorado)

El diálogo actual de creación de tabla se expande para incluir:

1. **Sección actual**: Selector de mes y año
2. **Nueva sección**: "Incluir gastos fijos"
   - Lista con checkboxes de todos los gastos fijos activos
   - Pre-seleccionados por defecto
   - Muestra nombre y monto de cada uno
   - Total estimado de gastos fijos seleccionados

### Hook `useFixedExpenses`

```typescript
interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Funciones:
- loadFixedExpenses()
- addFixedExpense(expense)
- updateFixedExpense(id, updates)
- deleteFixedExpense(id)
- toggleActive(id)
```

---

## Traducciones a Agregar

**Español:**
- `fixedExpenses.title`: "Gastos Fijos"
- `fixedExpenses.add`: "Agregar Gasto Fijo"
- `fixedExpenses.empty`: "No tienes gastos fijos configurados"
- `fixedExpenses.active`: "Activo"
- `fixedExpenses.inactive`: "Inactivo"
- `fixedExpenses.includeInTable`: "Incluir gastos fijos"
- `fixedExpenses.selectedTotal`: "Total seleccionado"

**English:**
- `fixedExpenses.title`: "Fixed Expenses"
- `fixedExpenses.add`: "Add Fixed Expense"
- `fixedExpenses.empty`: "You don't have any fixed expenses configured"
- `fixedExpenses.active`: "Active"
- `fixedExpenses.inactive`: "Inactive"
- `fixedExpenses.includeInTable`: "Include fixed expenses"
- `fixedExpenses.selectedTotal`: "Selected total"

---

## Orden de Implementación

1. Crear migración de base de datos para tabla `fixed_expenses` con RLS
2. Crear hook `useFixedExpenses`
3. Crear página `FixedExpenses.tsx` con componentes
4. Agregar ruta y navegación
5. Modificar diálogo de creación de tabla en Dashboard
6. Modificar `useTables.createTable` para insertar gastos iniciales
7. Agregar todas las traducciones

