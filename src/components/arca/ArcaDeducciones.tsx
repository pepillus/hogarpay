import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, GraduationCap, Copy, Check, Loader2, Plus, Edit, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Empleado, Pago, ComprobanteEducacion } from "@/types";
import { formatCurrency, formatDate } from "@/lib/storage";
import { 
  getEmpleadosAsync, 
  getPagosAsync,
  getComprobantesEducacion,
  saveComprobanteEducacion,
  deleteComprobanteEducacion
} from "@/lib/storage-async";
import { cn } from "@/lib/utils";

// CUIT del colegio para gastos de educación
const CUIT_COLEGIO = "30529042759";

export function ArcaDeducciones() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [comprobantesEducacion, setComprobantesEducacion] = useState<ComprobanteEducacion[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>("");
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>("");
  const [copiadoCuit, setCopiadoCuit] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para el dialog de comprobante
  const [dialogComprobanteAbierto, setDialogComprobanteAbierto] = useState(false);
  const [comprobanteEditando, setComprobanteEditando] = useState<ComprobanteEducacion | null>(null);
  const [comprobanteAEliminar, setComprobanteAEliminar] = useState<ComprobanteEducacion | null>(null);
  const [fechaComprobante, setFechaComprobante] = useState<Date | undefined>(new Date());
  const [tipoFactura, setTipoFactura] = useState<'A' | 'B' | 'C'>('C');
  const [puntoVenta, setPuntoVenta] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [montoComprobante, setMontoComprobante] = useState("");
  const [guardandoComprobante, setGuardandoComprobante] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [emps, pags, comps] = await Promise.all([
        getEmpleadosAsync(),
        getPagosAsync(),
        getComprobantesEducacion()
      ]);
      setEmpleados(emps);
      setPagos(pags);
      setComprobantesEducacion(comps);
      // Setear año actual por defecto
      setAnioSeleccionado(new Date().getFullYear().toString());
      setLoading(false);
    };
    loadData();
  }, []);

  // Obtener años únicos de los pagos
  const aniosDisponibles = [...new Set(pagos.map(p => new Date(p.fecha).getFullYear()))]
    .sort((a, b) => b - a);

  // Si no hay años en pagos, usar el año actual
  if (aniosDisponibles.length === 0) {
    aniosDisponibles.push(new Date().getFullYear());
  }

  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Calcular datos para el período seleccionado
  const calcularDatosPeriodo = () => {
    if (!empleadoSeleccionado || !mesSeleccionado || !anioSeleccionado) {
      return null;
    }

    const mes = parseInt(mesSeleccionado);
    const anio = parseInt(anioSeleccionado);

    // Filtrar pagos del empleado en el mes/año seleccionado
    const pagosFiltrados = pagos.filter(p => {
      const fechaPago = new Date(p.fecha);
      return (
        p.empleadoId === empleadoSeleccionado &&
        fechaPago.getMonth() + 1 === mes &&
        fechaPago.getFullYear() === anio
      );
    });

    // Separar aportes y pagos de trabajo
    const aportes = pagosFiltrados.filter(p => p.tipoPago === 'aporte');
    const trabajos = pagosFiltrados.filter(p => p.tipoPago === 'trabajo' && p.asistio);

    // Calcular contribución (suma de aportes del mes)
    const contribucion = aportes.reduce((sum, p) => sum + p.total, 0);

    // Calcular monto transferido (suma de pagos de trabajo)
    const montoTransferido = trabajos.reduce((sum, p) => sum + p.total, 0);

    // Obtener nombre del empleado
    const empleado = empleados.find(e => e.id === empleadoSeleccionado);

    return {
      empleadoNombre: empleado ? `${empleado.nombre} ${empleado.apellido}` : "Desconocido",
      periodo: format(new Date(anio, mes - 1, 1), "MMMM yyyy", { locale: es }),
      contribucion,
      montoTransferido,
      cantidadPagosTrabajo: trabajos.length,
      tieneAporte: aportes.length > 0,
    };
  };

  const datos = calcularDatosPeriodo();

  const copiarCuit = async () => {
    try {
      await navigator.clipboard.writeText(CUIT_COLEGIO);
      setCopiadoCuit(true);
      toast.success("CUIT copiado al portapapeles");
      setTimeout(() => setCopiadoCuit(false), 2000);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const copiarValor = async (valor: string, descripcion: string) => {
    try {
      await navigator.clipboard.writeText(valor);
      toast.success(`${descripcion} copiado al portapapeles`);
    } catch {
      toast.error("Error al copiar");
    }
  };

  // Funciones para comprobantes de educación
  const abrirDialogNuevoComprobante = () => {
    setComprobanteEditando(null);
    setFechaComprobante(new Date());
    setTipoFactura('C');
    setPuntoVenta("");
    setNumeroFactura("");
    setMontoComprobante("");
    setDialogComprobanteAbierto(true);
  };

  const abrirDialogEditarComprobante = (comprobante: ComprobanteEducacion) => {
    setComprobanteEditando(comprobante);
    
    // Parsear fecha
    const [year, month, day] = comprobante.fecha.split('-').map(Number);
    setFechaComprobante(new Date(year, month - 1, day));
    
    setTipoFactura(comprobante.tipoFactura);
    
    // Parsear número de comprobante (0005-00171315)
    const [pv, nf] = comprobante.numeroComprobante.split('-');
    setPuntoVenta(pv || "");
    setNumeroFactura(nf || "");
    setMontoComprobante(comprobante.monto.toString());
    
    setDialogComprobanteAbierto(true);
  };

  const guardarComprobante = async () => {
    // Validaciones
    if (!fechaComprobante) {
      toast.error("Debe seleccionar una fecha");
      return;
    }
    if (!puntoVenta || puntoVenta.length !== 4) {
      toast.error("El punto de venta debe tener 4 dígitos");
      return;
    }
    if (!numeroFactura || numeroFactura.length !== 8) {
      toast.error("El número de factura debe tener 8 dígitos");
      return;
    }
    if (!montoComprobante || parseFloat(montoComprobante) <= 0) {
      toast.error("Debe ingresar un monto válido");
      return;
    }

    setGuardandoComprobante(true);

    const comprobante: ComprobanteEducacion = {
      id: comprobanteEditando?.id || crypto.randomUUID(),
      fecha: format(fechaComprobante, 'yyyy-MM-dd'),
      tipoFactura,
      numeroComprobante: `${puntoVenta}-${numeroFactura}`,
      monto: parseFloat(montoComprobante),
    };

    try {
      await saveComprobanteEducacion(comprobante);
      const comps = await getComprobantesEducacion();
      setComprobantesEducacion(comps);
      setDialogComprobanteAbierto(false);
      toast.success(comprobanteEditando ? "Comprobante actualizado" : "Comprobante agregado");
    } catch (error) {
      toast.error("Error al guardar el comprobante");
    } finally {
      setGuardandoComprobante(false);
    }
  };

  const eliminarComprobante = async () => {
    if (!comprobanteAEliminar) return;
    
    try {
      await deleteComprobanteEducacion(comprobanteAEliminar.id);
      const comps = await getComprobantesEducacion();
      setComprobantesEducacion(comps);
      setComprobanteAEliminar(null);
      toast.success("Comprobante eliminado");
    } catch (error) {
      toast.error("Error al eliminar el comprobante");
    }
  };

  // Calcular total de educación por año
  const totalEducacionAnio = comprobantesEducacion
    .filter(c => c.fecha.startsWith(anioSeleccionado))
    .reduce((sum, c) => sum + c.monto, 0);

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ARCA - Deducciones</h2>

      <Tabs defaultValue="domestico">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="domestico">
            <Building2 className="h-4 w-4 mr-2" />
            Deducción Personal Doméstico
          </TabsTrigger>
          <TabsTrigger value="educacion">
            <GraduationCap className="h-4 w-4 mr-2" />
            Gastos de Educación
          </TabsTrigger>
        </TabsList>

        {/* Tab: Deducción Personal Doméstico */}
        <TabsContent value="domestico">
          <Card>
            <CardHeader>
              <CardTitle>Deducción por Personal Doméstico</CardTitle>
              <CardDescription>
                Seleccioná el empleado y el período para ver los montos a declarar en ARCA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selectores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label className="mb-2 block">Empleado</Label>
                  <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {empleados.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Mes</Label>
                  <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes) => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Año</Label>
                  <Select value={anioSeleccionado} onValueChange={setAnioSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {aniosDisponibles.map((anio) => (
                        <SelectItem key={anio} value={anio.toString()}>
                          {anio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Resultados */}
              {datos ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Empleado</p>
                    <p className="text-lg font-semibold">{datos.empleadoNombre}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Período</p>
                    <p className="text-lg font-semibold capitalize">{datos.periodo}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contribución (Aporte) */}
                    <div className="bg-hogar-50 border border-hogar-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-hogar-600 mb-1">Contribución (Aporte)</p>
                          <p className="text-2xl font-bold text-hogar-700">
                            {formatCurrency(datos.contribucion)}
                          </p>
                          {!datos.tieneAporte && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ No hay aporte registrado este mes
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarValor(datos.contribucion.toFixed(2), "Contribución")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Monto Transferido */}
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-green-600 mb-1">Monto Transferido (Sueldo + Viático)</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(datos.montoTransferido)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {datos.cantidadPagosTrabajo} pago(s) de trabajo
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarValor(datos.montoTransferido.toFixed(2), "Monto transferido")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Seleccioná un empleado, mes y año para ver los datos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gastos de Educación */}
        <TabsContent value="educacion">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Gastos de Educación</CardTitle>
                  <CardDescription>
                    Registro de facturas del colegio para declarar en ARCA
                  </CardDescription>
                </div>
                <Button onClick={abrirDialogNuevoComprobante}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Factura
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* CUIT del colegio */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">CUIT del Colegio</p>
                    <p className="text-xl font-mono font-bold text-gray-800">{CUIT_COLEGIO}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarCuit}
                  >
                    {copiadoCuit ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Total del año */}
              {comprobantesEducacion.length > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600 mb-1">Total Gastos Educación {anioSeleccionado}</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(totalEducacionAnio)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copiarValor(totalEducacionAnio.toFixed(2), "Total educación")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Tabla de comprobantes */}
              {comprobantesEducacion.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>N° Comprobante</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comprobantesEducacion
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell>{formatDate(comp.fecha)}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded font-mono text-sm">
                                {comp.tipoFactura}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono">{comp.numeroComprobante}</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(comp.monto)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Editar"
                                  onClick={() => abrirDialogEditarComprobante(comp)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  title="Eliminar"
                                  onClick={() => setComprobanteAEliminar(comp)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay facturas registradas</p>
                  <p className="text-sm">Hacé clic en "Agregar Factura" para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para agregar/editar comprobante */}
      <Dialog open={dialogComprobanteAbierto} onOpenChange={setDialogComprobanteAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {comprobanteEditando ? "Editar Factura" : "Agregar Factura"}
            </DialogTitle>
            <DialogDescription>
              Ingresá los datos de la factura del colegio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaComprobante && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaComprobante ? format(fechaComprobante, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaComprobante}
                    onSelect={setFechaComprobante}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tipo de factura */}
            <div className="space-y-2">
              <Label>Tipo de Factura</Label>
              <Select value={tipoFactura} onValueChange={(v) => setTipoFactura(v as 'A' | 'B' | 'C')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Factura A</SelectItem>
                  <SelectItem value="B">Factura B</SelectItem>
                  <SelectItem value="C">Factura C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de comprobante */}
            <div className="space-y-2">
              <Label>Número de Comprobante</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0005"
                  value={puntoVenta}
                  onChange={(e) => setPuntoVenta(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-24 text-center font-mono"
                  maxLength={4}
                />
                <span className="text-xl font-bold text-gray-400">-</span>
                <Input
                  placeholder="00171315"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 font-mono"
                  maxLength={8}
                />
              </div>
              <p className="text-xs text-gray-500">Formato: 4 dígitos - 8 dígitos</p>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label>Monto</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={montoComprobante}
                  onChange={(e) => setMontoComprobante(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogComprobanteAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarComprobante} disabled={guardandoComprobante}>
              {guardandoComprobante ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                comprobanteEditando ? "Guardar Cambios" : "Agregar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de confirmación de eliminación */}
      <AlertDialog open={!!comprobanteAEliminar} onOpenChange={() => setComprobanteAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La factura será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminarComprobante} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
