import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, X, Edit, Trash2, History, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Empleado, Pago } from "@/types";
import { 
  formatCurrency,
  formatDate 
} from "@/lib/storage";
import { 
  getEmpleadosAsync, 
  getPagosAsync, 
  deletePagoAsync 
} from "@/lib/storage-async";
import { EditPagoDialog } from "./EditPagoDialog";
import { DetallePagoDialog } from "./DetallePagoDialog";

export function HistorialPagos() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [filtroEmpleado, setFiltroEmpleado] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAnio, setFiltroAnio] = useState<string>("todos");
  const [soloMesesSinAporte, setSoloMesesSinAporte] = useState(false);
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [pagoAEliminar, setPagoAEliminar] = useState<Pago | null>(null);
  const [pagoDetalle, setPagoDetalle] = useState<Pago | null>(null);
  const [dialogDetalleAbierto, setDialogDetalleAbierto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const [emps, pags] = await Promise.all([
      getEmpleadosAsync(),
      getPagosAsync()
    ]);
    setEmpleados(emps);
    setPagos(pags);
    setLoading(false);
  };

  const getEmpleadoNombre = (empleadoId: string) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : "Desconocido";
  };

  // Helper para parsear fecha sin problemas de timezone
  const parseFechaLocal = (fechaStr: string): Date => {
    // Si es formato ISO con T, extraer solo la parte de fecha
    const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [year, month, day] = soloFecha.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Obtener años únicos de los pagos
  const aniosUnicos = [...new Set(pagos.map(p => {
    const fecha = parseFechaLocal(p.fecha);
    return fecha.getFullYear();
  }))].sort((a, b) => b - a);

  // Filtrar pagos
  const pagosFiltrados = pagos
    .filter(pago => {
      // Filtro por empleado
      if (filtroEmpleado !== 'todos' && pago.empleadoId !== filtroEmpleado) return false;
      
      // Filtro por mes - usar mes/anio guardados para aportes, fecha para trabajo
      let mesPago: number;
      let anioPago: number;
      
      if (pago.tipoPago === 'aporte' && pago.mes && pago.anio) {
        // Para aportes, usar el mes/anio guardados explícitamente
        mesPago = pago.mes;
        anioPago = pago.anio;
      } else {
        // Para trabajo, usar la fecha
        const fechaPago = parseFechaLocal(pago.fecha);
        mesPago = fechaPago.getMonth() + 1;
        anioPago = fechaPago.getFullYear();
      }
      
      if (filtroMes !== 'todos' && mesPago !== parseInt(filtroMes)) return false;
      if (filtroAnio !== 'todos' && anioPago !== parseInt(filtroAnio)) return false;
      
      // Filtro "solo meses sin aporte"
      if (soloMesesSinAporte) {
        // Solo mostrar pagos de trabajo, nunca aportes
        if (pago.tipoPago === 'aporte') return false;
        
        // Verificar si el mes tiene aporte
        const tieneAporte = pagos.some(p => 
          p.empleadoId === pago.empleadoId &&
          p.tipoPago === 'aporte' &&
          p.mes === mesPago &&
          p.anio === anioPago
        );
        if (tieneAporte) return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const limpiarFiltros = () => {
    setFiltroEmpleado("todos");
    setFiltroMes("todos");
    setFiltroAnio("todos");
    setSoloMesesSinAporte(false);
  };

  const handleEliminarPago = async () => {
    if (pagoAEliminar) {
      await deletePagoAsync(pagoAEliminar.id);
      toast.success("Pago eliminado correctamente");
      cargarDatos();
      setPagoAEliminar(null);
    }
  };

  const handleGuardarEdicion = () => {
    cargarDatos();
    setDialogEditarAbierto(false);
    setPagoEditando(null);
  };

  const exportarCSV = () => {
    const headers = ["Fecha", "Empleado", "Tipo", "Horas", "Valor Hora", "Viático", "Total"];
    const rows = pagosFiltrados.map(pago => [
      formatDate(pago.fecha),
      getEmpleadoNombre(pago.empleadoId),
      pago.tipoPago === 'trabajo' ? 'Trabajo' : 'Aporte Mensual',
      pago.horasTrabajadas?.toString() || '',
      pago.valorHora.toFixed(2),
      pago.valorViatico.toFixed(2),
      pago.total.toFixed(2)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial-pagos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success("Archivo CSV exportado");
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando historial...</span>
      </div>
    );
  }

  if (pagos.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No hay pagos registrados
        </h2>
        <p className="text-gray-500">
          Los pagos que registres aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Pagos</h2>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={limpiarFiltros} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label className="mb-2 block">Empleado</Label>
          <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
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
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
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
          <Select value={filtroAnio} onValueChange={setFiltroAnio}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {aniosUnicos.map((anio) => (
                <SelectItem key={anio} value={anio.toString()}>
                  {anio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sinAporte"
              checked={soloMesesSinAporte}
              onCheckedChange={(checked) => setSoloMesesSinAporte(!!checked)}
            />
            <Label htmlFor="sinAporte" className="text-sm">
              Solo meses sin aporte
            </Label>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagosFiltrados.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{formatDate(pago.fecha)}</TableCell>
                <TableCell>{getEmpleadoNombre(pago.empleadoId)}</TableCell>
                <TableCell>
                  <Badge variant={pago.tipoPago === 'trabajo' ? 'default' : 'secondary'}>
                    {pago.tipoPago === 'trabajo' ? 'Trabajo' : 'Aporte Mensual'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pago.tipoPago === 'trabajo' ? (
                    pago.asistio ? (
                      `${pago.horasTrabajadas}h - ${formatCurrency(pago.valorHoraConAntiguedad)}/h`
                    ) : (
                      <span className="text-gray-500">No asistió</span>
                    )
                  ) : (
                    // Para aportes, usar mes/anio guardados en lugar de parsear la fecha
                    pago.mes && pago.anio 
                      ? format(new Date(pago.anio, pago.mes - 1, 1), "MMMM yyyy", { locale: es })
                      : format(parseFechaLocal(pago.fecha), "MMMM yyyy", { locale: es })
                  )}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(pago.total)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Ver detalle"
                      onClick={() => {
                        setPagoDetalle(pago);
                        setDialogDetalleAbierto(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Editar"
                      onClick={() => {
                        setPagoEditando(pago);
                        setDialogEditarAbierto(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Eliminar"
                      onClick={() => setPagoAEliminar(pago)}
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

      {pagosFiltrados.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron pagos con los filtros seleccionados
        </div>
      )}

      {/* Dialog de edición */}
      <EditPagoDialog
        pago={pagoEditando}
        empleados={empleados}
        open={dialogEditarAbierto}
        onOpenChange={setDialogEditarAbierto}
        onSave={handleGuardarEdicion}
      />

      {/* Alert Dialog de confirmación de eliminación */}
      <AlertDialog open={!!pagoAEliminar} onOpenChange={() => setPagoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pago será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarPago} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de detalle del pago */}
      <DetallePagoDialog
        pago={pagoDetalle}
        empleado={empleados.find(e => e.id === pagoDetalle?.empleadoId)}
        open={dialogDetalleAbierto}
        onOpenChange={setDialogDetalleAbierto}
      />
    </div>
  );
}
