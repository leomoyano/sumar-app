# Sumar

Gestor de finanzas personales hecho con React + TypeScript + Supabase para administrar tablas mensuales de gastos, presupuestos por categoría, gastos fijos y asistencia con IA para carga rápida.

## Estado rápido

- **Stack oficial**: Vite, React 18, TypeScript, Tailwind CSS, Radix UI/shadcn-style, Supabase.
- **Package manager oficial**: `npm`.
- **Base de datos/Auth**: Supabase.
- **Documentación humana**: [`docs/README.md`](docs/README.md).
- **Contexto machine-oriented**: `.atl/`.

## Quickstart

1. Instalá dependencias:

   ```bash
   npm install
   ```

2. Creá tu entorno local desde `.env.example`.

3. Levantá el proyecto:

   ```bash
   npm run dev
   ```

## Variables de entorno

Copiá `.env.example` y completá:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GROQ_API_KEY`
- `VITE_AUTH_REDIRECT_URL`
- `VITE_PASSWORD_RESET_REDIRECT_URL`

> Nota: el cliente Supabase también acepta `VITE_SUPABASE_PUBLISHABLE_KEY` como fallback, pero el baseline actual del repo documenta `VITE_SUPABASE_ANON_KEY` porque es la variable declarada en `.env.example` y en CI.

## Comandos oficiales

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Dónde seguir

- [`docs/README.md`](docs/README.md) — índice documental para onboarding y continuidad.
- [`docs/onboarding.md`](docs/onboarding.md) — setup local paso a paso.
- [`docs/architecture.md`](docs/architecture.md) — arquitectura frontend, auth y flujo de datos.
- [`docs/data-model.md`](docs/data-model.md) — entidades reales y migraciones Supabase.
- [`docs/product-scope.md`](docs/product-scope.md) — alcance actual, partes parciales y deudas visibles.
- [`docs/deployment-runbook.md`](docs/deployment-runbook.md) — CI, secretos, deploy y rollback.

## Update when

Actualizá este README cuando cambie el entrypoint para humanos: propuesta de valor, stack oficial, comandos soportados, variables mínimas o links principales hacia `docs/`.
