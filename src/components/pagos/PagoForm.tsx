import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Gift, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Empleado, Tarifa, Pago } from "@/types";
import { 
  calcularValorHoraConAntiguedad,
  calcularTotalTrabajo,
  formatCurrency 
} from "@/lib/storage";
import { 
  getEmpleadosAsync, 
  getTarifaByEmpleadoIdAsync, 
  getPagosAsync,
  savePagoAsync 
} from "@/lib/storage-async";
import { cn } from "@/lib/utils";

const pagoSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  horasTrabajadas: z.coerce.number().optional(),
  asistio: z.boolean().default(true),
  comprobantePago: z.string().optional(),
  tipoPago: z.enum(['trabajo', 'aporte', 'aguinaldo']).default('trabajo'),
  montoAporte: z.coerce.number().optional(),
  mesAporte: z.string().optional(),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

interface MesDisponible {
  value: string;
  label: string;
}

// Helper para parsear fecha sin problemas de timezone
const parseFechaLocal = (fechaStr: string): { year: number; month: number; day: number } => {
  const [year, month, day] = fechaStr.split('T')[0].split('-').map(Number);
  return { year, month, day };
};

interface AguinaldoInfo {
  semestre: 1 | 2;
  label: string;
  mesesRango: string;
  mejorSueldo: number;
  montoCalculado: number;
  aguinaldoExistente: Pago | null;
}

export function PagoForm() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [tarifaActual, setTarifaActual] = useState<Tarifa | null>(null);
  const [mesesDisponibles, setMesesDisponibles] = useState<MesDisponible[]>([]);
  const [tipoPagoActivo, setTipoPagoActivo] = useState<'trabajo' | 'aporte' | 'aguinaldo'>('trabajo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para aguinaldo
  const [anioAguinaldo, setAnioAguinaldo] = useState<string>(new Date().getFullYear().toString());
  const [aguinaldoJunio, setAguinaldoJunio] = useState<AguinaldoInfo | null>(null);
  const [aguinaldoDiciembre, setAguinaldoDiciembre] = useState<AguinaldoInfo | null>(null);
  const [editandoAguinaldo, setEditandoAguinaldo] = useState<1 | 2 | null>(null);
  const [fechaAguinaldo, setFechaAguinaldo] = useState<Date>(new Date());
  const [montoAguinaldo, setMontoAguinaldo] = useState<string>("");
  const [comprobanteAguinaldo, setComprobanteAguinaldo] = useState<string>("");
  const [savingAguinaldo, setSavingAguinaldo] = useState(false);

  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      empleadoId: "",
      fecha: new Date(),
      horasTrabajadas: 8,
      asistio: true,
      comprobantePago: "",
      tipoPago: 'trabajo',
      montoAporte: 0,
      mesAporte: "",
    },
  });

  const empleadoId = form.watch("empleadoId");
  const asistio = form.watch("asistio");
  const horasTrabajadas = form.watch("horasTrabajadas") || 0;
  const montoAporteRaw = form.watch("montoAporte");
  const montoAporte = typeof montoAporteRaw === 'number' ? montoAporteRaw : (montoAporteRaw ? parseFloat(String(montoAporteRaw)) : 0) || 0;

  useEffect(() => {
    const loadData = async () => {
      const [emps, pags] = await Promise.all([
        getEmpleadosAsync(),
        getPagosAsync()
      ]);
      setEmpleados(emps);
      setPagos(pags);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (empleadoId) {
      const loadTarifa = async () => {
        const tarifa = await getTarifaByEmpleadoIdAsync(empleadoId);
        setTarifaActual(tarifa || null);
        
        // Obtener meses disponibles para aportes
        const meses = await obtenerMesesDisponiblesParaAporte(empleadoId);
        setMesesDisponibles(meses);
      };
      loadTarifa();
    } else {
      setTarifaActual(null);
      setMesesDisponibles([]);
    }
  }, [empleadoId]);

  const obtenerMesesDisponiblesParaAporte = async (empId: string): Promise<MesDisponible[]> => {
    const pagos = await getPagosAsync();
    const aportesEmpleado = pagos.filter(
      p => p.empleadoId === empId && p.tipoPago === 'aporte'
    );
    
    const mesesOcupados = new Set(
      aportesEmpleado.map(a => `${String(a.mes).padStart(2, '0')}-${a.anio}`)
    );
    
    const mesesDisp: MesDisponible[] = [];
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    
    for (let anio = anioActual - 1; anio <= anioActual + 1; anio++) {
      for (let mes = 1; mes <= 12; mes++) {
        const mesStr = String(mes).padStart(2, '0');
        const valor = `${mesStr}-${anio}`;
        
        if (!mesesOcupados.has(valor)) {
          const nombreMes = format(new Date(anio, mes - 1, 1), "MMMM yyyy", { locale: es });
          mesesDisp.push({
            value: valor,
            label: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
          });
        }
      }
    }
    
    return mesesDisp;
  };

  // Calcular aguinaldo cuando cambia empleado o año
  useEffect(() => {
    if (empleadoId && tipoPagoActivo === 'aguinaldo') {
      calcularAguinaldos(empleadoId, parseInt(anioAguinaldo));
    }
  }, [empleadoId, anioAguinaldo, tipoPagoActivo, pagos]);

  const calcularAguinaldos = (empId: string, anio: number) => {
    // Aguinaldo Junio (semestre 1): meses Dic año anterior a Mayo año actual
    const aguinaldoJun = calcularAguinaldoSemestre(empId, anio, 1);
    setAguinaldoJunio(aguinaldoJun);

    // Aguinaldo Diciembre (semestre 2): meses Jun a Nov año actual
    const aguinaldoDic = calcularAguinaldoSemestre(empId, anio, 2);
    setAguinaldoDiciembre(aguinaldoDic);
  };

  const calcularAguinaldoSemestre = (empId: string, anio: number, semestre: 1 | 2): AguinaldoInfo => {
    let mesesRango: { mes: number; anio: number }[] = [];
    let label: string;
    let mesesRangoStr: string;

    if (semestre === 1) {
      // Junio: Dic año anterior a Mayo año actual
      mesesRango = [
        { mes: 12, anio: anio - 1 },
        { mes: 1, anio },
        { mes: 2, anio },
        { mes: 3, anio },
        { mes: 4, anio },
        { mes: 5, anio },
      ];
      label = `Aguinaldo Junio ${anio}`;
      mesesRangoStr = `Dic ${anio - 1} - May ${anio}`;
    } else {
      // Diciembre: Jun a Nov año actual
      mesesRango = [
        { mes: 6, anio },
        { mes: 7, anio },
        { mes: 8, anio },
        { mes: 9, anio },
        { mes: 10, anio },
        { mes: 11, anio },
      ];
      label = `Aguinaldo Diciembre ${anio}`;
      mesesRangoStr = `Jun - Nov ${anio}`;
    }

    // Filtrar pagos de trabajo del empleado en el rango de meses
    // Buscar el mejor sueldo (sin viáticos)
    let mejorSueldo = 0;

    const pagosTrabajo = pagos.filter(p => 
      p.empleadoId === empId && 
      p.tipoPago === 'trabajo' && 
      p.asistio
    );

    for (const rango of mesesRango) {
      // Buscar pagos de ese mes/año
      const pagosMes = pagosTrabajo.filter(p => {
        const { year, month } = parseFechaLocal(p.fecha);
        return year === rango.anio && month === rango.mes;
      });

      // Sumar todos los pagos del mes (solo horas, sin viáticos)
      const sueldoMes = pagosMes.reduce((sum, p) => {
        const sueldoSinViatico = (p.horasTrabajadas || 0) * p.valorHoraConAntiguedad;
        return sum + sueldoSinViatico;
      }, 0);

      if (sueldoMes > mejorSueldo) {
        mejorSueldo = sueldoMes;
      }
    }

    const montoCalculado = mejorSueldo / 2; // 50% del mejor sueldo

    // Buscar si ya existe un aguinaldo registrado para este semestre/año
    const aguinaldoExistente = pagos.find(p =>
      p.empleadoId === empId &&
      p.tipoPago === 'aguinaldo' &&
      p.semestreAguinaldo === semestre &&
      p.anio === anio
    ) || null;

    return {
      semestre,
      label,
      mesesRango: mesesRangoStr,
      mejorSueldo,
      montoCalculado,
      aguinaldoExistente,
    };
  };

  const iniciarPagoAguinaldo = (semestre: 1 | 2) => {
    const info = semestre === 1 ? aguinaldoJunio : aguinaldoDiciembre;
    if (!info) return;

    setEditandoAguinaldo(semestre);
    setFechaAguinaldo(new Date());
    setMontoAguinaldo(info.montoCalculado.toFixed(2));
    setComprobanteAguinaldo("");
  };

  const guardarAguinaldo = async () => {
    if (!empleadoId || !editandoAguinaldo) return;

    const info = editandoAguinaldo === 1 ? aguinaldoJunio : aguinaldoDiciembre;
    if (!info) return;

    const monto = parseFloat(montoAguinaldo);
    if (isNaN(monto) || monto <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }

    setSavingAguinaldo(true);

    try {
      const nuevoAguinaldo: Pago = {
        id: info.aguinaldoExistente?.id || crypto.randomUUID(),
        empleadoId,
        fecha: fechaAguinaldo.toISOString(),
        valorHora: 0,
        valorHoraConAntiguedad: 0,
        valorViatico: 0,
        antiguedad: 0,
        total: monto,
        asistio: true,
        comprobantePago: comprobanteAguinaldo || undefined,
        tipoPago: 'aguinaldo',
        esAporte: false,
        semestreAguinaldo: editandoAguinaldo,
        estadoAguinaldo: 'pagado',
        montoCalculado: info.montoCalculado,
        anio: parseInt(anioAguinaldo),
      };

      await savePagoAsync(nuevoAguinaldo);
      
      // Refrescar pagos
      const nuevos = await getPagosAsync();
      setPagos(nuevos);
      
      setEditandoAguinaldo(null);
      toast.success("Aguinaldo registrado correctamente");
    } catch (error) {
      console.error("Error guardando aguinaldo:", error);
      toast.error("Error al guardar el aguinaldo");
    } finally {
      setSavingAguinaldo(false);
    }
  };

  const cancelarEdicionAguinaldo = () => {
    setEditandoAguinaldo(null);
    setMontoAguinaldo("");
    setComprobanteAguinaldo("");
  };

  // Obtener años disponibles para aguinaldo
  const aniosAguinaldoDisponibles = () => {
    const anioActual = new Date().getFullYear();
    return [anioActual - 1, anioActual, anioActual + 1];
  };

  // Calcular valores
  const valorHoraConAntiguedad = tarifaActual 
    ? calcularValorHoraConAntiguedad(tarifaActual.valorHora, tarifaActual.antiguedad)
    : 0;

  const totalAPagar = tipoPagoActivo === 'trabajo'
    ? (tarifaActual 
        ? calcularTotalTrabajo(valorHoraConAntiguedad, horasTrabajadas, tarifaActual.valorViatico, asistio)
        : 0)
    : tipoPagoActivo === 'aporte' 
      ? montoAporte 
      : 0; // Aguinaldo tiene su propio cálculo

  const onSubmit = async (values: PagoFormValues) => {
    // El aguinaldo tiene su propio flujo, no usar este submit
    if (tipoPagoActivo === 'aguinaldo') {
      return;
    }

    if (!tarifaActual) {
      toast.error("El empleado no tiene tarifa configurada");
      return;
    }

    setSaving(true);
    let fechaPago: Date;
    let total: number;

    if (tipoPagoActivo === 'trabajo') {
      fechaPago = values.fecha;
      total = calcularTotalTrabajo(
        valorHoraConAntiguedad, 
        values.horasTrabajadas || 0, 
        tarifaActual.valorViatico, 
        values.asistio
      );
    } else {
      // Para aporte, usar el primer día del mes seleccionado
      const [mes, anio] = (values.mesAporte || "").split('-');
      if (!mes || !anio) {
        toast.error("Debe seleccionar un mes para el aporte");
        setSaving(false);
        return;
      }
      fechaPago = new Date(parseInt(anio), parseInt(mes) - 1, 1);
      total = values.montoAporte || 0;
    }

    const nuevoPago: Pago = {
      id: crypto.randomUUID(),
      empleadoId: values.empleadoId,
      fecha: fechaPago.toISOString(),
      valorHora: tarifaActual.valorHora,
      valorHoraConAntiguedad: valorHoraConAntiguedad,
      valorViatico: tarifaActual.valorViatico,
      antiguedad: tarifaActual.antiguedad,
      total: total,
      asistio: tipoPagoActivo === 'trabajo' ? values.asistio : true,
      comprobantePago: values.comprobantePago,
      tipoPago: tipoPagoActivo,
      esAporte: tipoPagoActivo === 'aporte',
      horasTrabajadas: tipoPagoActivo === 'trabajo' ? values.horasTrabajadas : undefined,
      montoAporte: tipoPagoActivo === 'aporte' ? values.montoAporte : undefined,
      mes: tipoPagoActivo === 'aporte' ? parseInt((values.mesAporte || "").split('-')[0]) : undefined,
      anio: tipoPagoActivo === 'aporte' ? parseInt((values.mesAporte || "").split('-')[1]) : undefined,
    };

    await savePagoAsync(nuevoPago);
    setSaving(false);
    toast.success("Pago registrado correctamente");
    
    // Reset form
    form.reset({
      empleadoId: "",
      fecha: new Date(),
      horasTrabajadas: 8,
      asistio: true,
      comprobantePago: "",
      tipoPago: 'trabajo',
      montoAporte: 0,
      mesAporte: "",
    });
    setTarifaActual(null);
    setMesesDisponibles([]);
  };

  const empleadoSeleccionado = empleados.find(e => e.id === empleadoId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Pago</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs 
            defaultValue="trabajo" 
            onValueChange={(v) => setTipoPagoActivo(v as 'trabajo' | 'aporte' | 'aguinaldo')}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="trabajo">Trabajo</TabsTrigger>
              <TabsTrigger value="aporte">Aporte Mensual</TabsTrigger>
              <TabsTrigger value="aguinaldo">
                <Gift className="h-4 w-4 mr-2" />
                Aguinaldo
              </TabsTrigger>
            </TabsList>

            {/* Selector de empleado (común para ambos tabs) */}
            <FormField
              control={form.control}
              name="empleadoId"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Empleado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empleado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {empleados.map((empleado) => (
                        <SelectItem key={empleado.id} value={empleado.id}>
                          {empleado.nombre} {empleado.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información de tarifa */}
            {empleadoSeleccionado && (
              <Card className="mb-4 bg-hogar-50">
                <CardContent className="pt-4">
                  {tarifaActual ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valor por hora:</span>
                        <p className="font-semibold">{formatCurrency(tarifaActual.valorHora)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bonus antigüedad:</span>
                        <p className="font-semibold">+{tarifaActual.antiguedad}% ({tarifaActual.antiguedad} años)</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor hora c/bonus:</span>
                        <p className="font-semibold text-hogar-600">{formatCurrency(valorHoraConAntiguedad)}</p>
                      </div>
                      {tipoPagoActivo === 'trabajo' && (
                        <div>
                          <span className="text-gray-500">Viático:</span>
                          <p className="font-semibold">{formatCurrency(tarifaActual.valorViatico)}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 font-medium">
                      ⚠️ Este empleado no tiene tarifa configurada
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <TabsContent value="trabajo" className="space-y-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asistio"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">¿Asistió?</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {asistio && (
                <FormField
                  control={form.control}
                  name="horasTrabajadas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Trabajadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.5"
                          placeholder="Ej: 8" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="comprobantePago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprobante de Pago (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Transferencia #12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="aporte" className="space-y-4">
              <FormField
                control={form.control}
                name="mesAporte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes/Año del Aporte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar mes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mesesDisponibles.length > 0 ? (
                          mesesDisponibles.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>
                              {mes.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay meses disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="montoAporte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto del Aporte ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="Ej: 500.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comprobantePago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprobante de Pago (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Transferencia #12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Tab: Aguinaldo */}
            <TabsContent value="aguinaldo" className="space-y-6">
              {/* Selector de año */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Año</label>
                  <Select value={anioAguinaldo} onValueChange={setAnioAguinaldo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aniosAguinaldoDisponibles().map((anio) => (
                        <SelectItem key={anio} value={anio.toString()}>
                          {anio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!empleadoId ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Seleccioná un empleado arriba para ver los aguinaldos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Aguinaldo Junio */}
                  <Card className={cn(
                    "border-2",
                    aguinaldoJunio?.aguinaldoExistente ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          {aguinaldoJunio?.label || `Aguinaldo Junio ${anioAguinaldo}`}
                        </CardTitle>
                        {aguinaldoJunio?.aguinaldoExistente ? (
                          <Badge className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Período: {aguinaldoJunio?.mesesRango}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editandoAguinaldo === 1 ? (
                        // Formulario de edición
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Fecha de Pago</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(fechaAguinaldo, "PPP", { locale: es })}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={fechaAguinaldo}
                                  onSelect={(d) => d && setFechaAguinaldo(d)}
                                  locale={es}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Monto ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={montoAguinaldo}
                              onChange={(e) => setMontoAguinaldo(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Calculado: {formatCurrency(aguinaldoJunio?.montoCalculado || 0)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Comprobante (opcional)</label>
                            <Input
                              placeholder="Ej: Transferencia #12345"
                              value={comprobanteAguinaldo}
                              onChange={(e) => setComprobanteAguinaldo(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelarEdicionAguinaldo}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={guardarAguinaldo}
                              disabled={savingAguinaldo}
                              className="flex-1 bg-hogar-600 hover:bg-hogar-700"
                            >
                              {savingAguinaldo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Registrar Pago
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Vista de información
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Mejor sueldo del semestre</p>
                              <p className="font-semibold">{formatCurrency(aguinaldoJunio?.mejorSueldo || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Aguinaldo (50%)</p>
                              <p className="font-semibold text-hogar-600">{formatCurrency(aguinaldoJunio?.montoCalculado || 0)}</p>
                            </div>
                          </div>
                          {aguinaldoJunio?.aguinaldoExistente ? (
                            <div className="bg-white p-3 rounded border">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Fecha de pago</p>
                                  <p className="font-medium">
                                    {format(new Date(aguinaldoJunio.aguinaldoExistente.fecha), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Monto pagado</p>
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(aguinaldoJunio.aguinaldoExistente.total)}
                                  </p>
                                </div>
                              </div>
                              {aguinaldoJunio.aguinaldoExistente.comprobantePago && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500">Comprobante</p>
                                  <p className="font-medium">{aguinaldoJunio.aguinaldoExistente.comprobantePago}</p>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => iniciarPagoAguinaldo(1)}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Modificar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => iniciarPagoAguinaldo(1)}
                              className="w-full bg-hogar-600 hover:bg-hogar-700"
                            >
                              Registrar Pago de Aguinaldo
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Aguinaldo Diciembre */}
                  <Card className={cn(
                    "border-2",
                    aguinaldoDiciembre?.aguinaldoExistente ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          {aguinaldoDiciembre?.label || `Aguinaldo Diciembre ${anioAguinaldo}`}
                        </CardTitle>
                        {aguinaldoDiciembre?.aguinaldoExistente ? (
                          <Badge className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Período: {aguinaldoDiciembre?.mesesRango}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editandoAguinaldo === 2 ? (
                        // Formulario de edición
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Fecha de Pago</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(fechaAguinaldo, "PPP", { locale: es })}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={fechaAguinaldo}
                                  onSelect={(d) => d && setFechaAguinaldo(d)}
                                  locale={es}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Monto ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={montoAguinaldo}
                              onChange={(e) => setMontoAguinaldo(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Calculado: {formatCurrency(aguinaldoDiciembre?.montoCalculado || 0)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Comprobante (opcional)</label>
                            <Input
                              placeholder="Ej: Transferencia #12345"
                              value={comprobanteAguinaldo}
                              onChange={(e) => setComprobanteAguinaldo(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelarEdicionAguinaldo}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={guardarAguinaldo}
                              disabled={savingAguinaldo}
                              className="flex-1 bg-hogar-600 hover:bg-hogar-700"
                            >
                              {savingAguinaldo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Registrar Pago
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Vista de información
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Mejor sueldo del semestre</p>
                              <p className="font-semibold">{formatCurrency(aguinaldoDiciembre?.mejorSueldo || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Aguinaldo (50%)</p>
                              <p className="font-semibold text-hogar-600">{formatCurrency(aguinaldoDiciembre?.montoCalculado || 0)}</p>
                            </div>
                          </div>
                          {aguinaldoDiciembre?.aguinaldoExistente ? (
                            <div className="bg-white p-3 rounded border">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Fecha de pago</p>
                                  <p className="font-medium">
                                    {format(new Date(aguinaldoDiciembre.aguinaldoExistente.fecha), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Monto pagado</p>
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(aguinaldoDiciembre.aguinaldoExistente.total)}
                                  </p>
                                </div>
                              </div>
                              {aguinaldoDiciembre.aguinaldoExistente.comprobantePago && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500">Comprobante</p>
                                  <p className="font-medium">{aguinaldoDiciembre.aguinaldoExistente.comprobantePago}</p>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => iniciarPagoAguinaldo(2)}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Modificar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => iniciarPagoAguinaldo(2)}
                              className="w-full bg-hogar-600 hover:bg-hogar-700"
                            >
                              Registrar Pago de Aguinaldo
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Total a pagar - Solo para trabajo y aporte */}
          {tipoPagoActivo !== 'aguinaldo' && (
            <>
              <Separator className="my-6" />

              <Card className="mb-6 bg-hogar-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total a Pagar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(totalAPagar)}</p>
                  {tipoPagoActivo === 'trabajo' && asistio && tarifaActual && (
                    <p className="text-hogar-200 text-sm mt-2">
                      ({horasTrabajadas}h × {formatCurrency(valorHoraConAntiguedad)}) + {formatCurrency(tarifaActual.valorViatico)} viático
                    </p>
                  )}
                  {tipoPagoActivo === 'trabajo' && !asistio && (
                    <p className="text-hogar-200 text-sm mt-2">No asistió - Sin pago</p>
                  )}
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-hogar-600 hover:bg-hogar-700"
                disabled={!tarifaActual || !empleadoId || saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Pago
              </Button>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
