-- Agregar columnas de aguinaldo a la tabla pagos
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS semestre_aguinaldo INTEGER;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS estado_aguinaldo VARCHAR(20);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_calculado DECIMAL(12,2);

-- Actualizar constraint de tipo_pago para incluir 'aguinaldo'
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_tipo_pago_check;
ALTER TABLE pagos ADD CONSTRAINT pagos_tipo_pago_check 
  CHECK (tipo_pago IN ('trabajo', 'aporte', 'aguinaldo'));

-- Agregar constraint para semestre (1 = Junio, 2 = Diciembre)
ALTER TABLE pagos ADD CONSTRAINT check_semestre_aguinaldo 
  CHECK (semestre_aguinaldo IS NULL OR semestre_aguinaldo IN (1, 2));

-- Agregar constraint para estado
ALTER TABLE pagos ADD CONSTRAINT check_estado_aguinaldo 
  CHECK (estado_aguinaldo IS NULL OR estado_aguinaldo IN ('pendiente', 'pagado'));
