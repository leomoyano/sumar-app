# Architecture

Resumen de la arquitectura observable hoy en `sumar-app`.

## Vista general

La app es un frontend SPA en React/Vite. El estado y los flujos principales se organizan alrededor de providers globales, hooks de acceso a Supabase y páginas protegidas por autenticación.

## Runtime shell

`src/App.tsx` monta este orden de providers:

1. `ErrorBoundary`
2. `QueryClientProvider`
3. `LanguageProvider`
4. `CurrencyProvider`
5. `AuthProvider`
6. `TooltipProvider`
7. `BrowserRouter`

Esto deja tres concerns globales bien visibles:

- **auth**
- **preferencias de UI** (idioma/moneda)
- **routing + feedback UI** (toasts/tooltips)

## Routing y control de acceso

`src/App.tsx` define dos wrappers:

- `ProtectedRoute`: bloquea acceso hasta resolver auth y redirige a `/login`.
- `PublicRoute`: evita mostrar login a usuarios ya autenticados y redirige a `/dashboard`.

Rutas protegidas actuales:

- `/dashboard`
- `/table/:tableId`
- `/fixed-expenses`
- `/budgets`
- `/subscriptions`
- `/settings`
- `/profile`

Rutas públicas/mixtas:

- `/login`
- `/reset-password`
- `*` → `NotFound`

## Auth

La autenticación se encapsula en `src/hooks/useAuth.ts` y se expone por `src/contexts/AuthContext.tsx`.

Características relevantes:

- Listener `supabase.auth.onAuthStateChange` + `getSession()` para bootstrap.
- Timeout defensivo de 5 segundos para evitar loading infinito.
- Enriquecimiento best-effort del usuario desde `profiles.name`.
- Soporte para login, registro, logout, recuperación y cambio de contraseña.
- Redirects configurables mediante `VITE_AUTH_REDIRECT_URL` y `VITE_PASSWORD_RESET_REDIRECT_URL`.

## Acceso a datos

El patrón dominante es:

**page/component → hook especializado → Supabase client**

Hooks principales:

- `useTables` → `monthly_tables` + `expenses`
- `useFixedExpenses` → `fixed_expenses`
- `useBudgets` → `budgets`
- `useTags` → `profiles.tags`
- `useDollarRate` → API externa `https://dolarapi.com/v1/dolares/blue`

Observación importante: aunque existe `QueryClientProvider`, la carga principal de datos hoy NO usa React Query; los hooks manejan estado con `useState/useEffect/useCallback` y pegan directo a Supabase.

## Capas funcionales principales

### Dashboard

`src/pages/Dashboard.tsx` funciona como hub principal:

- lista y crea tablas mensuales
- inserta gastos fijos al crear una tabla
- muestra dólar blue
- exporta PDF
- usa `MagicBar` para carga asistida con IA
- sugiere gastos olvidados

### Tabla mensual

`src/pages/ExpenseTable.tsx` concentra:

- alta/baja de gastos
- filtro por tags
- totales ARS/USD
- visualizaciones (`ExpenseBarChart`, `ExpensePieChart`)
- exportación a PDF

### Presupuestos

`src/pages/Budgets.tsx` mezcla dos niveles:

- presupuesto general mensual guardado en `monthly_tables.budget`
- presupuestos por categoría guardados en `budgets`

### Gastos fijos

`src/hooks/useFixedExpenses.ts` y la página asociada modelan recurrencia mensual, activación/desactivación, día de vencimiento y marca de pago.

### Suscripciones

`src/pages/Subscriptions.tsx` es actualmente una pantalla **mock/in-memory**. No persiste en Supabase y debe tratarse como área parcial del producto.

## Integraciones externas

- **Supabase**: auth, persistencia y tipado generado.
- **Groq**: parseo de gasto en lenguaje natural y detección de gastos olvidados (`src/services/ai.ts`).
- **DolarAPI**: cotización blue para referencia ARS/USD.

## Límites actuales del frontend

- La app concentra bastante lógica de negocio en hooks cliente.
- La integración de IA se ejecuta desde browser, útil para iterar pero débil desde seguridad.
- No hay suite de tests detectada; la red de seguridad actual es lint + build en CI.

## Update when

Actualizá este documento cuando cambie el árbol de providers, el routing, el modelo de auth, el patrón de acceso a datos, las integraciones externas o la frontera entre áreas productivas y mock.
