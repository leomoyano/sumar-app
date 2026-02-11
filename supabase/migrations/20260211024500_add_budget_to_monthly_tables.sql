-- Migración: Agregar columna budget a monthly_tables
-- Fecha: 2026-02-11

ALTER TABLE monthly_tables 
ADD COLUMN budget NUMERIC DEFAULT 0;

COMMENT ON COLUMN monthly_tables.budget IS 'Presupuesto general mensual para la tabla.';
