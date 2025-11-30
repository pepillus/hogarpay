import { Empleado, Tarifa, Pago, BackupData } from "@/types";

// Keys de localStorage
const STORAGE_KEYS = {
  EMPLEADOS: 'empleados',
  TARIFAS: 'tarifas',
  PAGOS: 'pagos',
} as const;

// ============ EMPLEADOS ============

export const getEmpleados = (): Empleado[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
  return data ? JSON.parse(data) : [];
};

export const saveEmpleado = (empleado: Empleado): void => {
  const empleados = getEmpleados();
  const index = empleados.findIndex(e => e.id === empleado.id);
  
  if (index >= 0) {
    empleados[index] = empleado;
  } else {
    empleados.push(empleado);
  }
  
  localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
};

export const deleteEmpleado = (id: string): void => {
  const empleados = getEmpleados().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
};

export const getEmpleadoById = (id: string): Empleado | undefined => {
  return getEmpleados().find(e => e.id === id);
};

// ============ TARIFAS ============

export const getTarifas = (): Tarifa[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TARIFAS);
  return data ? JSON.parse(data) : [];
};

export const saveTarifa = (tarifa: Tarifa): void => {
  const tarifas = getTarifas();
  // Eliminar tarifa anterior del mismo empleado si existe
  const tarifasFiltradas = tarifas.filter(t => t.empleadoId !== tarifa.empleadoId);
  tarifasFiltradas.push(tarifa);
  localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(tarifasFiltradas));
};

export const getTarifaByEmpleadoId = (empleadoId: string): Tarifa | undefined => {
  return getTarifas().find(t => t.empleadoId === empleadoId);
};

export const deleteTarifa = (id: string): void => {
  const tarifas = getTarifas().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(tarifas));
};

// ============ PAGOS ============

export const getPagos = (): Pago[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAGOS);
  return data ? JSON.parse(data) : [];
};

export const savePago = (pago: Pago): void => {
  const pagos = getPagos();
  pagos.push(pago);
  localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
};

export const updatePago = (pago: Pago): void => {
  const pagos = getPagos();
  const index = pagos.findIndex(p => p.id === pago.id);
  
  if (index >= 0) {
    pagos[index] = pago;
    localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
  }
};

export const deletePago = (id: string): void => {
  const pagos = getPagos().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
};

// ============ BACKUP ============

export const exportBackup = (): BackupData => {
  return {
    empleados: getEmpleados(),
    tarifas: getTarifas(),
    pagos: getPagos(),
    fechaBackup: new Date().toISOString(),
    version: '1.0.0',
  };
};

export const importBackup = (data: BackupData): void => {
  if (data.empleados) {
    localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(data.empleados));
  }
  if (data.tarifas) {
    localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(data.tarifas));
  }
  if (data.pagos) {
    localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(data.pagos));
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.EMPLEADOS);
  localStorage.removeItem(STORAGE_KEYS.TARIFAS);
  localStorage.removeItem(STORAGE_KEYS.PAGOS);
};

// ============ CÁLCULOS ============

export const calcularValorHoraConAntiguedad = (valorHora: number, antiguedad: number): number => {
  const porcentajeAdicional = antiguedad * 0.01; // 1% por año
  return valorHora * (1 + porcentajeAdicional);
};

export const calcularTotalTrabajo = (
  valorHoraConAntiguedad: number,
  horasTrabajadas: number,
  valorViatico: number,
  asistio: boolean
): number => {
  if (!asistio) return 0;
  return (valorHoraConAntiguedad * horasTrabajadas) + valorViatico;
};

// ============ FORMATO ============

export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
