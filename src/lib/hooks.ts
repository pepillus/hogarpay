import { useState, useEffect, useCallback } from 'react';
import { Empleado, Tarifa, Pago } from '@/types';
import * as storage from './storage-async';

// Hook para cargar empleados
export function useEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storage.getEmpleados();
      setEmpleados(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { empleados, loading, error, reload };
}

// Hook para cargar tarifas
export function useTarifas() {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storage.getTarifas();
      setTarifas(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tarifas, loading, error, reload };
}

// Hook para cargar pagos
export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storage.getPagos();
      setPagos(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pagos, loading, error, reload };
}

// Hook combinado para datos comunes
export function useAppData() {
  const { empleados, loading: loadingEmpleados, reload: reloadEmpleados } = useEmpleados();
  const { tarifas, loading: loadingTarifas, reload: reloadTarifas } = useTarifas();
  const { pagos, loading: loadingPagos, reload: reloadPagos } = usePagos();

  const loading = loadingEmpleados || loadingTarifas || loadingPagos;

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadEmpleados(), reloadTarifas(), reloadPagos()]);
  }, [reloadEmpleados, reloadTarifas, reloadPagos]);

  return {
    empleados,
    tarifas,
    pagos,
    loading,
    reloadEmpleados,
    reloadTarifas,
    reloadPagos,
    reloadAll,
  };
}

// Re-exportar funciones de storage
export {
  getEmpleados,
  saveEmpleado,
  deleteEmpleado,
  getEmpleadoById,
  getTarifas,
  saveTarifa,
  getTarifaByEmpleadoId,
  deleteTarifa,
  getPagos,
  savePago,
  updatePago,
  deletePago,
  exportBackup,
  importBackup,
  calcularValorHoraConAntiguedad,
  calcularTotalTrabajo,
  formatCurrency,
  formatDate,
} from './storage-async';
