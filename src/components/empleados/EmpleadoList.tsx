import { Link } from "react-router-dom";
import { UserPlus, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEmpleados } from "@/lib/hooks";
import { deleteEmpleadoAsync } from "@/lib/storage-async";

export function EmpleadoList() {
  const { empleados, loading, reload } = useEmpleados();

  const handleDelete = async (id: string, nombre: string) => {
    await deleteEmpleadoAsync(id);
    toast.success(`Empleado ${nombre} eliminado`);
    reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando empleados...</span>
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No hay empleados registrados
        </h2>
        <p className="text-gray-500 mb-6">
          Comienza registrando tu primer empleado
        </p>
        <Button asChild className="bg-hogar-600 hover:bg-hogar-700">
          <Link to="/empleados/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Registrar Primer Empleado
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Empleados</h2>
        <Button asChild className="bg-hogar-600 hover:bg-hogar-700">
          <Link to="/empleados/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Año Alta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell className="font-medium">{empleado.nombre}</TableCell>
                <TableCell>{empleado.apellido}</TableCell>
                <TableCell>{empleado.telefono}</TableCell>
                <TableCell>{empleado.anioAlta || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/empleados/${empleado.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará a {empleado.nombre} {empleado.apellido} permanentemente.
                            También se eliminarán sus tarifas y pagos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(empleado.id, empleado.nombre)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
