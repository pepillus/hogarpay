import { Empleado, Tarifa, Pago, BackupData } from "@/types";
import { supabase, isSupabaseEnabled } from "./supabase";

// Keys de localStorage (fallback)
const STORAGE_KEYS = {
  EMPLEADOS: "hogarpay-empleados",
  TARIFAS: "hogarpay-tarifas",
  PAGOS: "hogarpay-pagos",
} as const;

// ============ HELPERS DE CONVERSIÓN ============

// Convertir de snake_case (Supabase) a camelCase (App)
const empleadoFromDB = (row: any): Empleado => ({
  id: row.id,
  nombre: row.nombre,
  apellido: row.apellido,
  telefono: row.telefono,
  direccion: row.direccion,
  notas: row.notas || undefined,
  anioAlta: row.anio_alta,
});

const empleadoToDB = (e: Empleado) => ({
  id: e.id,
  nombre: e.nombre,
  apellido: e.apellido,
  telefono: e.telefono,
  direccion: e.direccion,
  notas: e.notas || null,
  anio_alta: e.anioAlta,
});

const tarifaFromDB = (row: any): Tarifa => ({
  id: row.id,
  empleadoId: row.empleado_id,
  valorHora: parseFloat(row.valor_hora),
  valorViatico: parseFloat(row.valor_viatico),
  antiguedad: row.antiguedad,
});

const tarifaToDB = (t: Tarifa) => ({
  id: t.id,
  empleado_id: t.empleadoId,
  valor_hora: t.valorHora,
  valor_viatico: t.valorViatico,
  antiguedad: t.antiguedad,
});

const pagoFromDB = (row: any): Pago => ({
  id: row.id,
  empleadoId: row.empleado_id,
  fecha: row.fecha,
  valorHora: parseFloat(row.valor_hora),
  valorHoraConAntiguedad: parseFloat(row.valor_hora_con_antiguedad),
  valorViatico: parseFloat(row.valor_viatico),
  antiguedad: row.antiguedad,
  total: parseFloat(row.total),
  asistio: row.asistio,
  comprobantePago: row.comprobante_pago || undefined,
  tipoPago: row.tipo_pago as "trabajo" | "aporte",
  esAporte: row.es_aporte,
  horasTrabajadas: row.horas_trabajadas
    ? parseFloat(row.horas_trabajadas)
    : undefined,
  montoAporte: row.monto_aporte ? parseFloat(row.monto_aporte) : undefined,
  mes: row.mes || undefined,
  anio: row.anio || undefined,
});

const pagoToDB = (p: Pago) => ({
  id: p.id,
  empleado_id: p.empleadoId,
  fecha: p.fecha.split("T")[0], // Solo la fecha, sin hora
  valor_hora: p.valorHora,
  valor_hora_con_antiguedad: p.valorHoraConAntiguedad,
  valor_viatico: p.valorViatico,
  antiguedad: p.antiguedad,
  total: p.total,
  asistio: p.asistio,
  comprobante_pago: p.comprobantePago || null,
  tipo_pago: p.tipoPago,
  es_aporte: p.esAporte,
  horas_trabajadas: p.horasTrabajadas || null,
  monto_aporte: p.montoAporte || null,
  mes: p.mes || null,
  anio: p.anio || null,
});

// ============ EMPLEADOS ============

export const getEmpleados = async (): Promise<Empleado[]> => {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .order("nombre");

    if (error) {
      console.error("Error fetching empleados:", error);
      return [];
    }
    return (data || []).map(empleadoFromDB);
  }

  // Fallback a localStorage
  const data = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
  return data ? JSON.parse(data) : [];
};

export const saveEmpleado = async (empleado: Empleado): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase
      .from("empleados")
      .upsert(empleadoToDB(empleado));

    if (error) {
      console.error("Error saving empleado:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const empleados = await getEmpleados();
  const index = empleados.findIndex((e) => e.id === empleado.id);

  if (index >= 0) {
    empleados[index] = empleado;
  } else {
    empleados.push(empleado);
  }

  localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
};

export const deleteEmpleado = async (id: string): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("empleados").delete().eq("id", id);

    if (error) {
      console.error("Error deleting empleado:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const empleados = (await getEmpleados()).filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
};

export const getEmpleadoById = async (
  id: string
): Promise<Empleado | undefined> => {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return undefined;
    }
    return empleadoFromDB(data);
  }

  // Fallback a localStorage
  const empleados = await getEmpleados();
  return empleados.find((e) => e.id === id);
};

// ============ TARIFAS ============

export const getTarifas = async (): Promise<Tarifa[]> => {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase.from("tarifas").select("*");

    if (error) {
      console.error("Error fetching tarifas:", error);
      return [];
    }
    return (data || []).map(tarifaFromDB);
  }

  // Fallback a localStorage
  const data = localStorage.getItem(STORAGE_KEYS.TARIFAS);
  return data ? JSON.parse(data) : [];
};

export const saveTarifa = async (tarifa: Tarifa): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    // Primero eliminar tarifa existente del empleado
    await supabase
      .from("tarifas")
      .delete()
      .eq("empleado_id", tarifa.empleadoId);

    const { error } = await supabase.from("tarifas").insert(tarifaToDB(tarifa));

    if (error) {
      console.error("Error saving tarifa:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const tarifas = await getTarifas();
  const tarifasFiltradas = tarifas.filter(
    (t) => t.empleadoId !== tarifa.empleadoId
  );
  tarifasFiltradas.push(tarifa);
  localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(tarifasFiltradas));
};

export const getTarifaByEmpleadoId = async (
  empleadoId: string
): Promise<Tarifa | undefined> => {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("tarifas")
      .select("*")
      .eq("empleado_id", empleadoId)
      .single();

    if (error || !data) {
      return undefined;
    }
    return tarifaFromDB(data);
  }

  // Fallback a localStorage
  const tarifas = await getTarifas();
  return tarifas.find((t) => t.empleadoId === empleadoId);
};

export const deleteTarifa = async (id: string): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("tarifas").delete().eq("id", id);

    if (error) {
      console.error("Error deleting tarifa:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const tarifas = (await getTarifas()).filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(tarifas));
};

// ============ PAGOS ============

export const getPagos = async (): Promise<Pago[]> => {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching pagos:", error);
      return [];
    }
    return (data || []).map(pagoFromDB);
  }

  // Fallback a localStorage
  const data = localStorage.getItem(STORAGE_KEYS.PAGOS);
  return data ? JSON.parse(data) : [];
};

export const savePago = async (pago: Pago): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("pagos").insert(pagoToDB(pago));

    if (error) {
      console.error("Error saving pago:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const pagos = await getPagos();
  pagos.push(pago);
  localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
};

export const updatePago = async (pago: Pago): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase
      .from("pagos")
      .update(pagoToDB(pago))
      .eq("id", pago.id);

    if (error) {
      console.error("Error updating pago:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const pagos = await getPagos();
  const index = pagos.findIndex((p) => p.id === pago.id);

  if (index >= 0) {
    pagos[index] = pago;
    localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
  }
};

export const deletePago = async (id: string): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("pagos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting pago:", error);
      throw error;
    }
    return;
  }

  // Fallback a localStorage
  const pagos = (await getPagos()).filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(pagos));
};

// ============ BACKUP ============

export const exportBackup = async (): Promise<BackupData> => {
  return {
    empleados: await getEmpleados(),
    tarifas: await getTarifas(),
    pagos: await getPagos(),
    fechaBackup: new Date().toISOString(),
    version: "1.0.0",
  };
};

export const importBackup = async (data: BackupData): Promise<void> => {
  if (isSupabaseEnabled() && supabase) {
    try {
      // Limpiar datos existentes (usando gte en vez de neq para evitar 404)
      await supabase
        .from("pagos")
        .delete()
        .gte("id", "00000000-0000-0000-0000-000000000000");
      await supabase
        .from("tarifas")
        .delete()
        .gte("id", "00000000-0000-0000-0000-000000000000");
      await supabase
        .from("empleados")
        .delete()
        .gte("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      // Ignorar errores de delete si las tablas están vacías
      console.log("Tables might be empty, continuing with import...");
    }

    // Insertar empleados
    if (data.empleados?.length) {
      const { error: empError } = await supabase
        .from("empleados")
        .insert(data.empleados.map(empleadoToDB));
      if (empError) {
        console.error("Error inserting empleados:", empError);
        throw empError;
      }
    }

    // Insertar tarifas
    if (data.tarifas?.length) {
      const { error: tarError } = await supabase
        .from("tarifas")
        .insert(data.tarifas.map(tarifaToDB));
      if (tarError) {
        console.error("Error inserting tarifas:", tarError);
        throw tarError;
      }
    }

    // Insertar pagos
    if (data.pagos?.length) {
      const { error: pagError } = await supabase
        .from("pagos")
        .insert(data.pagos.map(pagoToDB));
      if (pagError) {
        console.error("Error inserting pagos:", pagError);
        throw pagError;
      }
    }
    return;
  }

  // Fallback a localStorage
  if (data.empleados) {
    localStorage.setItem(
      STORAGE_KEYS.EMPLEADOS,
      JSON.stringify(data.empleados)
    );
  }
  if (data.tarifas) {
    localStorage.setItem(STORAGE_KEYS.TARIFAS, JSON.stringify(data.tarifas));
  }
  if (data.pagos) {
    localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(data.pagos));
  }
};

// ============ CÁLCULOS (sin cambios, no async) ============

export const calcularValorHoraConAntiguedad = (
  valorHora: number,
  antiguedad: number
): number => {
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
  return valorHoraConAntiguedad * horasTrabajadas + valorViatico;
};

// ============ FORMATO (sin cambios, no async) ============

export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ============ ALIASES CON SUFIJO "Async" ============

export const getEmpleadosAsync = getEmpleados;
export const getEmpleadoByIdAsync = getEmpleadoById;
export const saveEmpleadoAsync = saveEmpleado;
export const deleteEmpleadoAsync = deleteEmpleado;

export const getTarifasAsync = getTarifas;
export const getTarifaByEmpleadoIdAsync = getTarifaByEmpleadoId;
export const saveTarifaAsync = saveTarifa;

export const getPagosAsync = getPagos;
export const savePagoAsync = savePago;
export const updatePagoAsync = updatePago;
export const deletePagoAsync = deletePago;
