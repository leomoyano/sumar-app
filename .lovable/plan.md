
## Problema Identificado

Actualmente, cuando un gasto tiene múltiples etiquetas (ej: "Comida" + "Entretenimiento"), el monto completo se suma a **cada** etiqueta en los gráficos. Esto causa:

1. **Duplicación visual**: Un gasto de $10,000 con 3 tags aparece como $30,000 en el total del gráfico
2. **Distorsión de porcentajes**: El pie chart muestra porcentajes inflados
3. **Confusión del usuario**: Parece que hay más gastos de los que realmente existen

---

## Opciones de Solución

### Opción A: Cambiar a Categoría Única (Recomendado)
Permitir solo **una categoría principal** por gasto. Es el modelo más simple y claro para el usuario.

**Ventajas:**
- Gráficos precisos y sin duplicación
- UX más simple y clara
- Modelo mental fácil de entender

**Cambios necesarios:**
- Modificar el formulario para seleccionar solo 1 categoría (dropdown o radio buttons)
- Mantener las tags secundarias como opcionales/adicionales solo para filtrado
- Los gráficos mostrarán datos 100% precisos

---

### Opción B: Dividir el Monto entre Tags
Si un gasto tiene N tags, dividir el monto entre ellos (ej: $1000 con 2 tags = $500 por tag).

**Ventajas:**
- El total del gráfico coincide con el total real de gastos
- Mantiene flexibilidad de múltiples tags

**Desventajas:**
- Puede ser confuso ("¿Por qué Comida muestra $500 si gasté $1000?")
- Requiere explicar al usuario cómo funciona

---

### Opción C: Categoría Principal + Tags Secundarios
Separar en dos conceptos: una **Categoría** (obligatoria, única) y **Tags** opcionales para filtrar.

**Ventajas:**
- Lo mejor de ambos mundos
- Gráficos basados en categoría (sin duplicación)
- Tags para organización y filtrado flexible

**Desventajas:**
- Requiere más cambios en la base de datos y UI

---

## Plan de Implementación (Opción A - Categoría Única)

### 1. Modificar ExpenseForm
- Cambiar de selección múltiple de tags a selección única (dropdown/select)
- Renombrar "Etiquetas" a "Categoría"
- Mantener campo de tags personalizados para permitir crear nuevas categorías

### 2. Actualizar los Gráficos
- Simplificar la lógica: cada gasto tiene una sola categoría
- Si `tags` está vacío o tiene múltiples (datos legacy), usar el primero o "Sin categoría"

### 3. Actualizar tipos y base de datos
- No requiere cambios en la estructura de DB (seguimos usando el array `tags`, solo usamos el primer elemento)
- Actualizar tipos en TypeScript para reflejar el nuevo comportamiento

### 4. Migración de datos existentes
- Los gastos con múltiples tags usarán el primer tag como categoría principal
- No se pierden datos

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ExpenseForm.tsx` | Cambiar a Select único para categoría |
| `src/components/FixedExpenseForm.tsx` | Mismo cambio para gastos fijos |
| `src/components/charts/ExpenseBarChart.tsx` | Simplificar lógica (usar primer tag) |
| `src/components/charts/ExpensePieChart.tsx` | Simplificar lógica (usar primer tag) |
| `src/pages/ExpenseTable.tsx` | Actualizar texto "Etiquetas" → "Categoría" |
| `src/types/index.ts` | Renombrar DEFAULT_TAGS a DEFAULT_CATEGORIES |

---

## Resultado Esperado
- Cada gasto tiene exactamente una categoría
- Los gráficos muestran datos precisos sin duplicación
- El total en los gráficos coincide con el total real de gastos
- UX más clara y fácil de entender
