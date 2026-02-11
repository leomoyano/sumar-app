# Sumar 🚀

**Sumar** es tu gestor inteligente de finanzas personales, diseñado para ayudarte a tomar el control total de tus gastos mensuales con una estética moderna, limpia y premium.

## ✨ Características Principal

- **Presupuesto Mensual Inteligente**: Establece metas de gasto por mes y visualiza tu progreso en tiempo real.
- **Doble Moneda (ARS/USD)**: Conversión automática basada en el Dólar Blue para entender el valor real de tus gastos.
- **Categorización Flexible**: Organiza tus gastos por categorías configurables.
- **Gastos Fijos**: Automatiza la carga de tus gastos fijos (alquiler, servicios, suscripciones) en cada nueva tabla mensual.
- **Análisis Visual**: Gráficos dinámicos para entender la distribución y evolución de tus finanzas.
- **Exportación a PDF**: Genera reportes detallados de tus tablas de gastos con un clic.
- **Privacidad Total**: Tus datos se gestionan de forma segura a través de Supabase.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno y profesional:

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [Shadcn/UI](https://ui.shadcn.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/)
- **Estado**: [Zustand](https://docs.pmnd.rs/zustand/) & [TanStack Query](https://tanstack.com/query/latest)

## 🚀 Inicio Rápido

1. **Instalación**:

   ```bash
   npm install
   ```

2. **Entorno**:
   Crea un archivo `.env` basado en `.env.example` y agrega tus credenciales de Supabase.

3. **Desarrollo**:

   ```bash
   npm run dev
   ```

4. **Producción**:
   ```bash
   npm run build
   ```

## 🔐 Configuración de Supabase

Este proyecto requiere una instancia de Supabase con las siguientes tablas:

- `expenses`
- `monthly_tables`
- `fixed_expenses`
- `budgets`

Las migraciones se encuentran en la carpeta `/supabase/migrations`.

---

_Desarrollado con ❤️ para ayudarte a sumar mejores decisiones financieras._
