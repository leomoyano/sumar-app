# Deployment Runbook

Runbook operativo para deploy y rollback del frontend `sumar-app`.

## Runtime esperado

- Frontend SPA en Vite/React.
- Hosting del frontend: **por confirmar**. Este runbook usa Vercel como referencia operativa probable para una app Vite frontend-only, pero el proveedor real debe validarse antes de formalizar releases.
- Backend/Auth/Data: **Supabase**.
- CI en GitHub Actions: `.github/workflows/ci.yml`.

## Pipeline actual de CI

El workflow `CI` corre en push y pull request sobre `main` y `develop`.

Pasos actuales:

1. checkout
2. setup Node.js 20
3. `npm ci`
4. `npm run lint`
5. `npm run build`

Variables usadas en CI:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Secretos/variables mínimas

### Aplicación

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GROQ_API_KEY`
- `VITE_AUTH_REDIRECT_URL`
- `VITE_PASSWORD_RESET_REDIRECT_URL`

### Consideraciones

- `VITE_*` se expone al bundle cliente, así que no hay que tratarlas como secretos backend clásicos.
- La API key de Groq en frontend es un riesgo aceptado temporalmente; si el uso crece, conviene mover esa integración a backend/edge.

## Checklist de deploy

- [ ] Secrets/variables sincronizadas entre la plataforma de hosting elegida, GitHub Actions y `.env.example`.
- [ ] Supabase target correcto.
- [ ] Redirect URLs consistentes con dominio real.
- [ ] CI verde en la rama a publicar.
- [ ] Confirmar que no hubo cambios de esquema pendientes fuera de `supabase/migrations/`.

## Checklist de rollback

- [ ] Identificar último deploy sano en la plataforma de hosting utilizada.
- [ ] Revalidar variables de entorno del deploy anterior.
- [ ] Si hubo cambio de esquema, evaluar compatibilidad hacia atrás antes de restaurar frontend.
- [ ] Verificar login, dashboard y tabla mensual luego del rollback.

## Incidentes comunes para mirar primero

1. Variables `VITE_SUPABASE_*` faltantes o mal configuradas.
2. Redirect URLs de auth/reset apuntando a dominios incorrectos.
3. Build roto por cambios en imports, tipos o lint.
4. Fallas de IA o cotización externa por APIs de terceros.

## Update when

Actualizá este documento cuando cambie el proveedor de hosting, la pipeline de CI, las variables requeridas, el proceso de publicación o el procedimiento de rollback.
