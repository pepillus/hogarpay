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
  tipoPago: "trabajo" | "aporte";
  esAporte: boolean;
  horasTrabajadas?: number;
  montoAporte?: number;
  mes?: number;
  anio?: number;
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
