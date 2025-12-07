export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  notas?: string;
  anioAlta: number;
}

export interface Tarifa {
  id: string;
  empleadoId: string;
  valorHora: number;
  valorViatico: number;
  antiguedad: number;
}

export interface Pago {
  id: string;
  empleadoId: string;
  fecha: string;
  valorHora: number;
  valorHoraConAntiguedad: number;
  valorViatico: number;
  antiguedad: number;
  total: number;
  asistio: boolean;
  comprobantePago?: string;
  tipoPago: "trabajo" | "aporte" | "aguinaldo";
  esAporte: boolean;
  horasTrabajadas?: number;
  montoAporte?: number;
  mes?: number;
  anio?: number;
  // Campos específicos para aguinaldo
  semestreAguinaldo?: 1 | 2; // 1 = Junio (Dic-May), 2 = Diciembre (Jun-Nov)
  estadoAguinaldo?: "pendiente" | "pagado";
  montoCalculado?: number; // El monto original calculado (50% del mejor sueldo)
}

export interface BackupData {
  empleados: Empleado[];
  tarifas: Tarifa[];
  pagos: Pago[];
  comprobantesEducacion?: ComprobanteEducacion[];
  fechaBackup: string;
  version: string;
}

export interface ComprobanteEducacion {
  id: string;
  fecha: string;
  tipoFactura: "A" | "B" | "C";
  numeroComprobante: string; // Formato: 0005-00171315
  monto: number;
  descripcion?: string;
}
