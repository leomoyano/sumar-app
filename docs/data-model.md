# Data Model

Modelo de datos observable en Supabase a partir de `src/integrations/supabase/types.ts` y `supabase/migrations/*`.

## Fuente de verdad

- Tipos frontend: `src/integrations/supabase/types.ts`
- Migraciones: `supabase/migrations/*.sql`

## Entidades principales

### `profiles`

Representa el perfil por usuario autenticado.

Campos relevantes:

- `user_id` (unique, referencia a `auth.users`)
- `email`
- `name`
- `tags` (`text[]`, categorías custom del usuario)
- `created_at`, `updated_at`

Notas:

- Se crea automáticamente vía trigger `handle_new_user()`.
- Absorbió el antiguo concepto de tabla `tags`; esa tabla fue eliminada en una migración posterior.

### `monthly_tables`

Tabla principal de períodos mensuales.

Campos relevantes:

- `id`
- `user_id`
- `name`
- `budget` (agregado después, default `0`)
- `created_at`, `updated_at`

Notas:

- `name` tiene constraint de longitud.
- Se usa como padre lógico de `expenses`.

### `expenses`

Gastos individuales asociados a una tabla mensual.

Campos relevantes:

- `id`
- `table_id` → `monthly_tables.id`
- `user_id`
- `name`
- `amount`
- `amount_usd`
- `tags` (`text[]`)
- `created_at`, `updated_at`

Constraints relevantes:

- monto positivo
- límite razonable superior
- longitud de nombre
- límite de cantidad de tags

### `fixed_expenses`

Gastos recurrentes del usuario.

Campos relevantes:

- `id`
- `user_id`
- `name`
- `amount`
- `tags`
- `is_active`
- `due_day` (1..31)
- `billing_cycle` (hoy restringido a `monthly`)
- `last_paid_at`
- `created_at`, `updated_at`

Notas:

- La UI actual modela la recurrencia solamente como mensual.
- Se usan al momento de crear una nueva tabla mensual para precargar gastos.

### `budgets`

Presupuestos por categoría.

Campos relevantes:

- `id`
- `user_id`
- `category`
- `amount`
- `created_at`, `updated_at`

Constraints relevantes:

- `amount > 0`
- `UNIQUE (user_id, category)`
- longitud de categoría entre 1 y 50

## Relaciones

| Origen | Relación | Destino |
| --- | --- | --- |
| `profiles.user_id` | 1:1 lógico | `auth.users.id` |
| `monthly_tables.user_id` | N:1 | `auth.users.id` |
| `expenses.user_id` | N:1 | `auth.users.id` |
| `expenses.table_id` | N:1 | `monthly_tables.id` |
| `fixed_expenses.user_id` | N:1 | `auth.users.id` |
| `budgets.user_id` | N:1 | `auth.users.id` |

## Seguridad

Todas las entidades principales habilitan **Row Level Security** y filtran por `auth.uid() = user_id` en operaciones de lectura/escritura según corresponda.

## Migraciones clave

| Archivo | Qué introduce |
| --- | --- |
| `20260110204136_*.sql` | `profiles`, triggers `handle_updated_at` y `handle_new_user`. |
| `20260110204743_*.sql` | `monthly_tables`, `expenses`, RLS inicial e índices. |
| `20260115185247_*.sql` | `profiles.tags` y eliminación de `tags` table. |
| `20260202151952_*.sql` | `fixed_expenses`. |
| `20260207034055_*.sql` | `budgets`. |
| `20260211024500_*.sql` | `monthly_tables.budget`. |
| `20260309193000_*.sql` | `fixed_expenses.due_day`, `billing_cycle`, `last_paid_at`. |

## Observaciones de diseño

- La categoría principal de un gasto vive implícitamente en `expenses.tags[0]`; eso es una convención de aplicación, no una FK explícita.
- `amount_usd` es dato derivado/auxiliar; la moneda base operativa sigue siendo ARS.
- Las suscripciones todavía no tienen tabla persistida.

## Update when

Actualizá este documento cuando cambie el esquema de Supabase, se agreguen migraciones relevantes, cambien constraints/RLS o aparezcan nuevas entidades persistidas.
