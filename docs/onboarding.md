# Onboarding

Guía mínima para levantar `sumar-app` y empezar a trabajar sin depender de conocimiento tribal.

## Requisitos

- Node.js 20.x recomendado (alineado con CI).
- `npm` como package manager oficial.
- Proyecto Supabase configurado con las migraciones del repo.
- Credenciales para Groq si querés usar la carga asistida por IA.

## Primer arranque

1. Instalá dependencias:

   ```bash
   npm install
   ```

2. Creá `.env` a partir de `.env.example`.

3. Completá las variables:

   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_GROQ_API_KEY=
   VITE_AUTH_REDIRECT_URL=
   VITE_PASSWORD_RESET_REDIRECT_URL=
   ```

4. Asegurate de que Supabase tenga aplicadas las migraciones de `supabase/migrations/`.

5. Iniciá la app:

   ```bash
   npm run dev
   ```

## Qué validar en local

- Registro/login con Supabase.
- Redirección de auth y reset password.
- Creación de tabla mensual desde dashboard.
- Alta de gastos manuales y, si hay API key, carga por IA.
- Gestión de gastos fijos y presupuestos.

## Rutina diaria recomendada

```bash
npm run lint
```

Usá `npm run dev` para iterar y dejá `npm run build` como validación de CI/release, no como paso obligatorio después de cada cambio documental.

## Checklist de primer día

- [ ] Instalar dependencias con `npm install`.
- [ ] Configurar `.env` desde `.env.example`.
- [ ] Verificar acceso a Supabase.
- [ ] Confirmar que la autenticación funciona.
- [ ] Crear una tabla mensual de prueba.
- [ ] Recorrer dashboard, tabla de gastos, gastos fijos y presupuestos.
- [ ] Leer [`architecture.md`](./architecture.md) y [`product-scope.md`](./product-scope.md).

## Notas operativas

- La app usa `VITE_SUPABASE_ANON_KEY` en el baseline actual; `client.ts` acepta además `VITE_SUPABASE_PUBLISHABLE_KEY` como fallback.
- La integración de Groq corre desde frontend (`dangerouslyAllowBrowser: true`), así que la API key merece tratamiento cuidadoso y debería considerarse deuda técnica de seguridad para producción dura.
- `.atl/` queda reservado para contexto de agentes; el onboarding humano vive acá.

## Update when

Actualizá este documento cuando cambien los prerequisitos, variables de entorno, pasos de setup, flujos de auth local, comandos oficiales o dependencias externas necesarias para levantar la app.
