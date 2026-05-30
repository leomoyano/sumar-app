# Product Scope

Qué cubre hoy `sumar-app` y qué partes todavía están verdes o mockeadas.

## Funcionalidades productivas hoy

### 1. Autenticación y cuenta

- registro/login con Supabase
- recuperación y cambio de contraseña
- perfil base enriquecido desde `profiles`

### 2. Gestión de tablas mensuales

- crear tablas por mes/año
- listar tablas existentes
- eliminar tablas con cascade sobre gastos

### 3. Gestión de gastos

- alta y baja de gastos
- etiquetas/categorías por gasto
- visualización por tabla mensual
- totales y conversión estimada ARS/USD

### 4. Asistencia inteligente

- parseo de gastos en lenguaje natural con Groq
- detección de gastos olvidados comparando meses

### 5. Gastos fijos

- CRUD de gastos recurrentes
- activación/desactivación
- día de vencimiento y marca de pago
- precarga opcional al crear nueva tabla mensual

### 6. Presupuestos

- presupuesto general mensual por tabla
- cálculo de progreso y estado

### 7. Visualización y exportación

- gráficos por tabla
- exportación PDF de tablas
- cotización de dólar blue para referencia

## Áreas parciales o mock

### Suscripciones

`src/pages/Subscriptions.tsx` maneja datos en memoria con estado local y ejemplos hardcodeados. Hoy sirve más como exploración de UI/flujo que como funcionalidad cerrada de producto.

### Seguridad de IA en frontend

`src/services/ai.ts` usa `dangerouslyAllowBrowser: true`. Funcionalmente resuelve la experiencia, pero desde arquitectura de producto todavía no es una integración endurecida para producción estricta.

## Deudas visibles

- Falta una estrategia de testing automatizado.
- React Query está montado globalmente, pero los hooks de datos siguen un patrón manual con `useState/useEffect`.
- No existe aún una persistencia real para suscripciones.
- La semántica de categorías depende del primer tag del gasto.

## Qué no promete esta baseline documental

- No reemplaza specs funcionales futuras.
- No documenta cada componente UI fino.
- No convierte `.atl/` en documentación humana.

## Update when

Actualizá este documento cuando una funcionalidad pase de mock a productiva, cuando aparezcan nuevas capacidades relevantes o cuando una deuda visible cambie de prioridad/estado.
