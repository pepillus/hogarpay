-- Tabla para comprobantes de gastos de educación
CREATE TABLE IF NOT EXISTS comprobantes_educacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  tipo_factura VARCHAR(1) NOT NULL DEFAULT 'C' CHECK (tipo_factura IN ('A', 'B', 'C')),
  numero_comprobante VARCHAR(20) NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_comprobantes_educacion_fecha ON comprobantes_educacion(fecha);

-- Habilitar RLS (Row Level Security)
ALTER TABLE comprobantes_educacion ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidad de seguridad)
CREATE POLICY "Permitir todas las operaciones en comprobantes_educacion" ON comprobantes_educacion
  FOR ALL USING (true) WITH CHECK (true);
