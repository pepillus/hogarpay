import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, GraduationCap, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Empleado, Pago } from "@/types";
import { formatCurrency } from "@/lib/storage";
import { getEmpleadosAsync, getPagosAsync } from "@/lib/storage-async";

// CUIT del colegio para gastos de educación
const CUIT_COLEGIO = "30529042759";

export function ArcaDeducciones() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>("");
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>("");
  const [copiadoCuit, setCopiadoCuit] = useState(false);
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
              <CardTitle>Gastos de Educación</CardTitle>
              <CardDescription>
                Datos para declarar gastos de educación en ARCA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">CUIT del Colegio</p>
                    <p className="text-2xl font-mono font-bold text-gray-800">{CUIT_COLEGIO}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={copiarCuit}
                    className="ml-4"
                  >
                    {copiadoCuit ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar CUIT
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Próximamente: Carga de cuotas mensuales del colegio
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
