import { Link } from "react-router-dom";
import { Calculator, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/storage";
import { useEmpleados, useTarifas } from "@/lib/hooks";

export function TarifaList() {
  const { empleados, loading: loadingEmpleados } = useEmpleados();
  const { tarifas, loading: loadingTarifas } = useTarifas();

  const loading = loadingEmpleados || loadingTarifas;

  const getTarifaForEmpleado = (empleadoId: string) => {
    return tarifas.find((t) => t.empleadoId === empleadoId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando tarifas...</span>
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="text-center py-12">
        <Calculator className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No hay empleados registrados
        </h2>
        <p className="text-gray-500 mb-6">
          Primero debes registrar empleados para poder configurar sus tarifas
        </p>
        <Button asChild className="bg-hogar-600 hover:bg-hogar-700">
          <Link to="/empleados/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Registrar Empleado
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tarifas por Empleado</h2>
        <Button asChild className="bg-hogar-600 hover:bg-hogar-700">
          <Link to="/tarifas/nuevo">
            <Calculator className="h-4 w-4 mr-2" />
            Nueva Tarifa
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Valor Hora</TableHead>
              <TableHead>Viático</TableHead>
              <TableHead>Antigüedad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map((empleado) => {
              const tarifa = getTarifaForEmpleado(empleado.id);
              return (
                <TableRow key={empleado.id}>
                  <TableCell className="font-medium">
                    {empleado.nombre} {empleado.apellido}
                  </TableCell>
                  <TableCell>
                    {tarifa ? formatCurrency(tarifa.valorHora) : "-"}
                  </TableCell>
                  <TableCell>
                    {tarifa ? formatCurrency(tarifa.valorViatico) : "-"}
                  </TableCell>
                  <TableCell>
                    {tarifa ? `${tarifa.antiguedad} años` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/tarifas/${empleado.id}/editar`}>
                        {tarifa ? "Editar" : "Configurar"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
