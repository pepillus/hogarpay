import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, Download, FileChartLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Empleado, Pago } from "@/types";
import { formatCurrency } from "@/lib/storage";
import { getEmpleadosAsync, getPagosAsync } from "@/lib/storage-async";

export function GeneradorReportes() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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

  // Obtener años únicos
  const aniosUnicos = [...new Set(pagos.map(p => {
    if (p.anio) return p.anio;
    return new Date(p.fecha).getFullYear();
  }))].sort((a, b) => b - a);

  if (aniosUnicos.length === 0) {
    aniosUnicos.push(new Date().getFullYear());
  }

  // Filtrar pagos del mes/año seleccionado
  const pagosMes = pagos.filter(p => {
    const fechaPago = new Date(p.fecha);
    const mesPago = p.mes || fechaPago.getMonth() + 1;
    const anioPago = p.anio || fechaPago.getFullYear();
    return mesPago === mesSeleccionado && anioPago === anioSeleccionado;
  });

  // Cálculos
  const pagosTrabajo = pagosMes.filter(p => p.tipoPago === 'trabajo');
  const pagosAporte = pagosMes.filter(p => p.tipoPago === 'aporte');

  const totalSueldos = pagosTrabajo.reduce((sum, p) => {
    return sum + (p.total - (p.asistio ? (p.valorViatico || 0) : 0));
  }, 0);

  const totalViaticos = pagosTrabajo.reduce((sum, p) => {
    return sum + (p.asistio ? (p.valorViatico || 0) : 0);
  }, 0);

  const totalTransferido = totalSueldos + totalViaticos;
  const totalAportes = pagosAporte.reduce((sum, p) => sum + p.total, 0);

  // Desglose por empleado
  const desglosePorEmpleado = empleados.map(emp => {
    const pagosEmpleado = pagosMes.filter(p => p.empleadoId === emp.id);
    const trabajoEmpleado = pagosEmpleado.filter(p => p.tipoPago === 'trabajo');
    const aportesEmpleado = pagosEmpleado.filter(p => p.tipoPago === 'aporte');
    
    const diasTrabajados = trabajoEmpleado.filter(p => p.asistio).length;
    const totalTrabajo = trabajoEmpleado.reduce((sum, p) => sum + p.total, 0);
    const totalAporte = aportesEmpleado.reduce((sum, p) => sum + p.total, 0);
    
    return {
      empleado: `${emp.nombre} ${emp.apellido}`,
      diasTrabajados,
      totalTrabajo,
      totalAporte,
      totalGeneral: totalTrabajo + totalAporte
    };
  }).filter(d => d.totalGeneral > 0);

  const handlePrint = () => {
    window.print();
  };

  const exportarCSV = () => {
    const nombreMes = format(new Date(anioSeleccionado, mesSeleccionado - 1, 1), "MMMM yyyy", { locale: es });
    const headers = ["Empleado", "Días Trabajados", "Total Trabajo", "Aportes", "Total General"];
    const rows = desglosePorEmpleado.map(d => [
      d.empleado,
      d.diasTrabajados.toString(),
      d.totalTrabajo.toFixed(2),
      d.totalAporte.toFixed(2),
      d.totalGeneral.toFixed(2)
    ]);

    // Agregar totales
    rows.push([]);
    rows.push(["TOTALES", "", totalTransferido.toFixed(2), totalAportes.toFixed(2), (totalTransferido + totalAportes).toFixed(2)]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-${nombreMes.replace(' ', '-')}.csv`;
    link.click();
    toast.success("Reporte exportado correctamente");
  };

  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const nombreMesActual = format(
    new Date(anioSeleccionado, mesSeleccionado - 1, 1), 
    "MMMM yyyy", 
    { locale: es }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando reportes...</span>
      </div>
    );
  }

  if (pagos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileChartLine className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No hay pagos para generar reportes
        </h2>
        <p className="text-gray-500">
          Registra pagos para poder generar reportes mensuales
        </p>
      </div>
    );
  }

  return (
    <div className="print-friendly">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800">Reporte Mensual</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg no-print">
        <div>
          <Label className="mb-2 block">Mes</Label>
          <Select 
            value={mesSeleccionado.toString()} 
            onValueChange={(v) => setMesSeleccionado(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value.toString()}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Año</Label>
          <Select 
            value={anioSeleccionado.toString()} 
            onValueChange={(v) => setAnioSeleccionado(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aniosUnicos.map((anio) => (
                <SelectItem key={anio} value={anio.toString()}>
                  {anio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Título del reporte (visible al imprimir) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center">HogarPay Manager</h1>
        <h2 className="text-xl text-center text-gray-600">
          Reporte de {nombreMesActual.charAt(0).toUpperCase() + nombreMesActual.slice(1)}
        </h2>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-hogar-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Transferido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-hogar-200">
                <span>Subtotal Sueldos:</span>
                <span>{formatCurrency(totalSueldos)}</span>
              </div>
              <div className="flex justify-between text-hogar-200">
                <span>Subtotal Viáticos:</span>
                <span>{formatCurrency(totalViaticos)}</span>
              </div>
              <div className="border-t border-hogar-500 pt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold">{formatCurrency(totalTransferido)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Aportes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-hogar-600">{formatCurrency(totalAportes)}</p>
            <p className="text-sm text-gray-500 mt-2">
              {pagosAporte.length} aporte(s) registrado(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de desglose */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          {desglosePorEmpleado.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-center">Días Trabajados</TableHead>
                  <TableHead className="text-right">Total Trabajo</TableHead>
                  <TableHead className="text-right">Aportes</TableHead>
                  <TableHead className="text-right">Total General</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desglosePorEmpleado.map((d, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{d.empleado}</TableCell>
                    <TableCell className="text-center">{d.diasTrabajados}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.totalTrabajo)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.totalAporte)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(d.totalGeneral)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell>TOTALES</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{formatCurrency(totalTransferido)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalAportes)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalTransferido + totalAportes)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay pagos registrados para este período
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
