
## Objetivo
Eliminar la “pantalla en blanco con loader” asegurando que el estado `isLoading` de auth **siempre** se resuelva (pase a `false`) y que cualquier error de inicialización no deje la app bloqueada en el spinner.

---

## Diagnóstico (qué está pasando y por qué)
- El loader que ves en “todas las ventanas” coincide con el loader de `PublicRoute` / `ProtectedRoute` en `src/App.tsx`, que se muestra mientras `isLoading === true`.
- En `src/hooks/useAuth.ts`, `isLoading` se pone en `false` **solo** en `initializeAuth()` (después de `getSession()` y, si hay usuario, después de `transformUser()`).
- Si por algún motivo `getSession()` tarda demasiado, se queda colgado, o `transformUser()` (consulta a `profiles`) se demora/falla de forma que no retorna pronto, entonces **`isLoading` queda true** y la app se queda mostrando el spinner.
- Además, el callback de `onAuthStateChange` actualmente **no** hace `setIsLoading(false)`, por lo que si el flujo “depende” del evento para desbloquear, puede quedar trabado.

---

## Enfoque de solución (robusto)
### A) Hacer que `isLoading` se desbloquee rápido y de forma segura
1. Reordenar la inicialización para seguir el patrón recomendado:
   - Suscribirse a `supabase.auth.onAuthStateChange` primero.
   - Ejecutar `supabase.auth.getSession()` después.
2. Asegurar que **en ambos caminos** (evento y getSession) se ejecute `setIsLoading(false)` en un `finally`.
3. Agregar una “red de seguridad” con timeout (ej. 4–6s):
   - Si por algún motivo nunca resolvió, forzar `setIsLoading(false)` para que al menos redirija a `/login` y no quede infinito.

### B) No bloquear la UI por la consulta a `profiles`
4. Separar “sesión autenticada” de “perfil enriquecido”:
   - Cuando haya `session.user`, setear inmediatamente un `User` básico (id/email/name provisional) para desbloquear rutas.
   - Luego, en background, intentar cargar el `name` desde `profiles` y actualizar el estado si llega.
5. Envolver la lógica async del listener con `try/catch` para evitar rechazos no manejados.

### C) Mejorar resiliencia ante errores (para evitar pantallas “en blanco” futuras)
6. Agregar un Error Boundary a nivel de App para mostrar un fallback con:
   - Mensaje de error “Algo falló, recargar / volver a login”
   - Botón “Ir a Login” y “Recargar”
   Esto evita que un error runtime deje la app inutilizable sin feedback.

---

## Cambios concretos (archivos)
1. **Editar `src/hooks/useAuth.ts`**
   - Nuevo flujo:
     - `onAuthStateChange` (setea user + `setIsLoading(false)`)
     - `getSession()` (setea user + `setIsLoading(false)`)
     - Timeout de seguridad
   - Transformación de usuario:
     - `getBaseUser(supabaseUser)` síncrono (rápido)
     - `enrichUserWithProfileName(userId)` asíncrono (no bloquea)
2. **(Opcional pero recomendado) Crear `src/components/ErrorBoundary.tsx`**
   - Error boundary simple con UI de fallback.
3. **Editar `src/App.tsx`**
   - Envolver `AppRoutes` (o el árbol completo dentro de `AuthProvider`) con el Error Boundary.

---

## Validación / pruebas (lo que vamos a verificar)
1. Abrir `/login` en una ventana nueva:
   - Debe verse el login sin spinner infinito.
2. Ir manualmente a `/fixed-expenses` sin estar logueado:
   - Debe redirigir a `/login` (sin quedarse cargando).
3. Loguearse:
   - Debe ir a `/dashboard`.
4. Volver a `/fixed-expenses` logueado:
   - Debe cargar la pantalla normalmente.
5. Test de regresión del feature:
   - Crear un gasto fijo.
   - Crear una nueva tabla y confirmar que aparecen los gastos fijos seleccionados.

---

## Riesgos y cómo los mitigamos
- **RLS/tabla `profiles` no disponible**: la app igual funciona porque el “enrichment” es best-effort y no bloquea.
- **Supabase tarda en refrescar token**: el timeout evita bloqueos infinitos.
- **Errores runtime nuevos**: el Error Boundary evita pantalla completamente en blanco y ayuda a diagnosticar.

---

## Resultado esperado
- Nunca más quedar atrapado en loader infinito.
- Si hay problemas con `profiles`/red, el usuario igual puede ver login o dashboard, y el nombre del perfil se completa cuando esté disponible.
