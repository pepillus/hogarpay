import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  tipoPago: z.enum(['trabajo', 'aporte']).default('trabajo'),
  montoAporte: z.coerce.number().optional(),
  mesAporte: z.string().optional(),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

interface MesDisponible {
  value: string;
  label: string;
}

export function PagoForm() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tarifaActual, setTarifaActual] = useState<Tarifa | null>(null);
  const [mesesDisponibles, setMesesDisponibles] = useState<MesDisponible[]>([]);
  const [tipoPagoActivo, setTipoPagoActivo] = useState<'trabajo' | 'aporte'>('trabajo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const montoAporte = form.watch("montoAporte") || 0;

  useEffect(() => {
    getEmpleadosAsync().then((data) => {
      setEmpleados(data);
      setLoading(false);
    });
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

  // Calcular valores
  const valorHoraConAntiguedad = tarifaActual 
    ? calcularValorHoraConAntiguedad(tarifaActual.valorHora, tarifaActual.antiguedad)
    : 0;

  const totalAPagar = tipoPagoActivo === 'trabajo'
    ? (tarifaActual 
        ? calcularTotalTrabajo(valorHoraConAntiguedad, horasTrabajadas, tarifaActual.valorViatico, asistio)
        : 0)
    : montoAporte;

  const onSubmit = async (values: PagoFormValues) => {
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
            onValueChange={(v) => setTipoPagoActivo(v as 'trabajo' | 'aporte')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="trabajo">Trabajo</TabsTrigger>
              <TabsTrigger value="aporte">Aporte Mensual</TabsTrigger>
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
          </Tabs>

          <Separator className="my-6" />

          {/* Total a pagar */}
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
        </form>
      </Form>
    </div>
  );
}
