

## Exportar Tabla Mensual a PDF

### Objetivo
Agregar un botón en las tarjetas del dashboard y en la vista de tabla que permita generar y descargar un PDF con el resumen completo de gastos del mes. Este PDF será ideal para compartir con contadores o para imprimir.

---

### Contenido del PDF

El documento incluirá:
1. **Encabezado**: Nombre del mes (ej: "Febrero 2026") y fecha de generación
2. **Tabla de gastos**: Nombre, Categoría, Monto ARS, Monto USD
3. **Totales**: Total en ARS y equivalente en USD
4. **Cotización**: Tipo de cambio del dólar blue utilizado

---

### Ubicación de los botones

| Ubicación | Componente | Acción |
|-----------|------------|--------|
| Dashboard (card de cada mes) | `Dashboard.tsx` | Botón de descarga rápida en la tarjeta |
| Vista de tabla | `ExpenseTable.tsx` | Botón "Exportar PDF" en el header |

---

### Diseño del PDF

```text
+------------------------------------------+
|           SUMAR - Gastos Mensuales       |
|           Febrero 2026                   |
|           Generado: 04/02/2026           |
+------------------------------------------+
|                                          |
|  Nombre         Categoría    ARS    USD  |
|  --------------------------------------- |
|  Supermercado   Comida    $50,000  $41   |
|  Netflix        Servicios  $8,000   $7   |
|  Uber           Transporte $12,000  $10  |
|  ...                                     |
|  --------------------------------------- |
|  TOTAL                   $70,000   $58   |
|                                          |
|  Cotización USD: AR$ 1,200               |
+------------------------------------------+
```

---

### Implementacion Tecnica

#### 1. Instalar dependencias
- `jspdf`: Librería base para crear PDFs
- `jspdf-autotable`: Plugin para generar tablas automáticamente

#### 2. Crear utilidad de exportación
Crear `src/lib/exportPdf.ts` con:
- Función `exportTableToPdf(table, expenses, rate, language)`
- Configuración de estilos (colores, fuentes, márgenes)
- Formateo de moneda según idioma

#### 3. Agregar botón en ExpenseTable.tsx
- Botón "Exportar PDF" junto al botón de agregar gasto
- Icono de descarga (FileDown de lucide-react)
- Llamar a la función de exportación al hacer clic

#### 4. Agregar botón en Dashboard.tsx
- Botón de descarga rápida en cada tarjeta de mes
- Se muestra al hacer hover (similar al botón de eliminar)
- Permite exportar sin entrar a la tabla

#### 5. Agregar traducciones
- `'export.pdf'`: "Exportar PDF" / "Export PDF"
- `'export.pdf.success'`: "PDF descargado" / "PDF downloaded"
- `'export.pdf.generating'`: "Generando PDF..." / "Generating PDF..."

---

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `package.json` | Agregar jspdf y jspdf-autotable |
| `src/lib/exportPdf.ts` | Crear función de exportación |
| `src/pages/ExpenseTable.tsx` | Agregar botón de exportar |
| `src/pages/Dashboard.tsx` | Agregar botón de descarga rápida |
| `src/contexts/LanguageContext.tsx` | Agregar traducciones |

---

### Resultado esperado
- Con un solo clic, el usuario descarga un PDF profesional con todos los gastos del mes
- El PDF tiene formato limpio y es apto para presentar a un contador
- El nombre del archivo incluye el mes (ej: `Febrero_2026_gastos.pdf`)
- Funciona tanto desde el dashboard como desde la vista de tabla

