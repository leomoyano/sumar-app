

## Sistema de Presupuestos Mensuales

### Objetivo
Permitir a los usuarios definir límites de gasto por categoría para cada mes, con visualización del progreso en tiempo real y alertas cuando se acercan o exceden el límite establecido.

---

### Flujo de Usuario

```text
Dashboard
    │
    ├── Ver indicador general de presupuesto (barra de progreso)
    │
    └── Acceder a "Presupuestos" ──► Página de configuración
                                         │
                                         ├── Crear presupuesto por categoría
                                         ├── Ver progreso de cada categoría
                                         └── Recibir alertas visuales
```

---

### Nueva Interfaz

**1. Dashboard - Indicador de Presupuesto Global**
- Barra de progreso debajo del total de gastos
- Muestra porcentaje gastado del presupuesto total del mes
- Colores: Verde (<70%), Amarillo (70-90%), Rojo (>90%)

**2. Nueva Página - Gestión de Presupuestos** (`/budgets`)
- Lista de categorías con su límite asignado
- Barra de progreso por categoría
- Monto gastado vs límite
- Botón para editar límite

**3. Vista de Tabla Mensual - Indicadores por Categoría**
- Al lado de cada categoría en los gráficos, mostrar el % del presupuesto
- Alerta visual cuando una categoría está cerca del límite

---

### Modelo de Datos

**Nueva tabla: `budgets`**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | Identificador único |
| user_id | uuid | Referencia al usuario |
| category | text | Nombre de la categoría |
| amount | numeric | Límite mensual en ARS |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Última actualización |

Cada usuario tendrá un presupuesto por categoría que aplica a todos los meses. Esto simplifica la gestión inicial.

---

### Componentes Visuales

**Barra de Progreso Mejorada**
```text
Comida                    $45,000 / $60,000
[████████████░░░░░░]  75% ⚠️

Transporte               $8,000 / $10,000  
[████████████████░░]  80% ⚠️

Entretenimiento          $5,000 / $15,000
[█████░░░░░░░░░░░░░]  33% ✓
```

**Estados visuales:**
- Verde: 0-70% del presupuesto
- Amarillo/Naranja: 70-90% (advertencia)
- Rojo: 90%+ (peligro/excedido)

---

### Implementacion Tecnica

#### 1. Base de Datos

**Crear migración para tabla `budgets`:**
- `id`: uuid, primary key
- `user_id`: uuid, foreign key a auth.users
- `category`: text, nombre de la categoría
- `amount`: numeric, límite en ARS
- `created_at`, `updated_at`: timestamps
- Constraint UNIQUE en (user_id, category)
- RLS policies para CRUD del usuario

#### 2. Nuevo Hook: `useBudgets`

```typescript
// Funcionalidades:
- loadBudgets(): Cargar presupuestos del usuario
- setBudget(category, amount): Crear/actualizar límite
- deleteBudget(category): Eliminar límite
- getBudgetProgress(category, spent): Calcular % usado
- getBudgetStatus(percentage): Retornar 'safe' | 'warning' | 'danger'
```

#### 3. Componente: `BudgetProgress`

Props:
- `category`: string
- `spent`: number (gastado)
- `limit`: number (presupuesto)
- `showLabel`: boolean

Renderiza:
- Barra de progreso con color dinámico
- Tooltip con detalles
- Icono de alerta si está cerca del límite

#### 4. Nueva Página: `Budgets.tsx`

Secciones:
- Header con total presupuestado
- Lista de categorías con formularios inline para editar
- Resumen visual del mes actual

#### 5. Integrar en Dashboard

- Mostrar barra de progreso global bajo el total de gastos
- Link a página de presupuestos en la barra de acciones

#### 6. Integrar en ExpenseTable

- En la sección de gráficos, agregar indicadores de presupuesto
- Mostrar alertas cuando una categoría está cerca del límite

---

### Traducciones a Agregar

**Español:**
- `budget.title`: Presupuestos
- `budget.add`: Agregar Presupuesto
- `budget.edit`: Editar Límite
- `budget.category`: Categoría
- `budget.limit`: Límite Mensual
- `budget.spent`: Gastado
- `budget.remaining`: Restante
- `budget.exceeded`: Excedido
- `budget.warning`: Cerca del límite
- `budget.safe`: Dentro del presupuesto
- `budget.empty`: No tienes presupuestos configurados
- `budget.progress`: Progreso del Presupuesto
- `budget.total`: Presupuesto Total

**English:**
- Equivalentes en inglés

---

### Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/xxx_budgets.sql` | Crear tabla y RLS |
| `src/hooks/useBudgets.ts` | Nuevo hook para presupuestos |
| `src/components/BudgetProgress.tsx` | Componente de barra de progreso |
| `src/components/BudgetCard.tsx` | Card para cada categoría |
| `src/pages/Budgets.tsx` | Nueva página de gestión |
| `src/pages/Dashboard.tsx` | Agregar indicador global |
| `src/pages/ExpenseTable.tsx` | Agregar indicadores por categoría |
| `src/contexts/LanguageContext.tsx` | Agregar traducciones |
| `src/App.tsx` | Agregar ruta /budgets |
| `src/integrations/supabase/types.ts` | Actualizar tipos |

---

### Resultado Esperado

1. El usuario puede definir un límite para cada categoría (ej: "Comida: $60,000/mes")
2. Al registrar gastos, ve inmediatamente cuánto le queda de cada presupuesto
3. Recibe alertas visuales claras cuando se acerca o excede un límite
4. En el dashboard, tiene una visión rápida del estado general de sus finanzas

