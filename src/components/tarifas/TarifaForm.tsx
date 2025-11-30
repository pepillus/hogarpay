import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empleado, Tarifa } from "@/types";
import { getEmpleadosAsync, getEmpleadoByIdAsync, getTarifaByEmpleadoIdAsync, saveTarifaAsync } from "@/lib/storage-async";

const tarifaSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  valorHora: z.coerce.number().min(0.01, "El valor por hora debe ser mayor a 0"),
  valorViatico: z.coerce.number().min(0, "El viático no puede ser negativo"),
  antiguedad: z.coerce.number().min(0, "La antigüedad no puede ser negativa"),
});

type TarifaFormValues = z.infer<typeof tarifaSchema>;

interface TarifaFormProps {
  empleadoId?: string;
}

export function TarifaForm({ empleadoId }: TarifaFormProps) {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tarifaExistente, setTarifaExistente] = useState<Tarifa | null>(null);
  const [empleadoSeleccionadoInfo, setEmpleadoSeleccionadoInfo] = useState<Empleado | null>(null);
  const [antiguedadCalculada, setAntiguedadCalculada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: {
      empleadoId: empleadoId || "",
      valorHora: 0,
      valorViatico: 0,
      antiguedad: 0,
    },
  });

  // Calcular antigüedad basada en año de alta
  const calcularAntiguedad = (anioAlta: number): number => {
    const anioActual = new Date().getFullYear();
    return Math.max(0, anioActual - anioAlta);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allEmpleados = await getEmpleadosAsync();
      setEmpleados(allEmpleados);
      
      if (empleadoId) {
        const empleado = await getEmpleadoByIdAsync(empleadoId);
        const antiguedadAuto = empleado ? calcularAntiguedad(empleado.anioAlta) : 0;
        
        if (empleado) {
          setEmpleadoSeleccionadoInfo(empleado);
          setAntiguedadCalculada(antiguedadAuto);
        }

        const tarifa = await getTarifaByEmpleadoIdAsync(empleadoId);
        if (tarifa) {
          setTarifaExistente(tarifa);
          form.reset({
            empleadoId: tarifa.empleadoId,
            valorHora: tarifa.valorHora,
            valorViatico: tarifa.valorViatico,
            antiguedad: antiguedadAuto, // Siempre usar la antigüedad calculada
          });
        } else {
          form.setValue("empleadoId", empleadoId);
          form.setValue("antiguedad", antiguedadAuto);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [empleadoId, form]);

  // Actualizar antigüedad cuando cambia el empleado seleccionado
  const handleEmpleadoChange = async (newEmpleadoId: string) => {
    form.setValue("empleadoId", newEmpleadoId);
    const empleado = await getEmpleadoByIdAsync(newEmpleadoId);
    if (empleado) {
      setEmpleadoSeleccionadoInfo(empleado);
      const antiguedadAuto = calcularAntiguedad(empleado.anioAlta);
      setAntiguedadCalculada(antiguedadAuto);
      
      // Siempre aplicar la antigüedad calculada automáticamente
      const tarifaExist = await getTarifaByEmpleadoIdAsync(newEmpleadoId);
      if (tarifaExist) {
        setTarifaExistente(tarifaExist);
        form.reset({
          empleadoId: newEmpleadoId,
          valorHora: tarifaExist.valorHora,
          valorViatico: tarifaExist.valorViatico,
          antiguedad: antiguedadAuto, // Siempre usar la antigüedad calculada
        });
      } else {
        form.setValue("antiguedad", antiguedadAuto);
      }
    }
  };

  const onSubmit = async (values: TarifaFormValues) => {
    setSaving(true);
    const tarifa: Tarifa = {
      id: tarifaExistente?.id || crypto.randomUUID(),
      empleadoId: values.empleadoId,
      valorHora: values.valorHora,
      valorViatico: values.valorViatico,
      antiguedad: values.antiguedad,
    };
    
    await saveTarifaAsync(tarifa);
    toast.success(tarifaExistente ? "Tarifa actualizada correctamente" : "Tarifa registrada correctamente");
    navigate("/tarifas");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  const empleadoSeleccionado = empleados.find(e => e.id === form.watch("empleadoId"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tarifaExistente ? "Editar Tarifa" : "Nueva Tarifa"}
          {empleadoSeleccionado && (
            <span className="text-hogar-600 ml-2">
              - {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empleadoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <Select
                    onValueChange={handleEmpleadoChange}
                    value={field.value}
                    disabled={!!empleadoId}
                  >
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

            <FormField
              control={form.control}
              name="valorHora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por Hora ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Ej: 150.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorViatico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viático ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Ej: 50.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="antiguedad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antigüedad (años)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Ej: 2" 
                      {...field}
                      readOnly
                      className="bg-gray-50"
                    />
                  </FormControl>
                  {empleadoSeleccionadoInfo && (
                    <FormDescription>
                      <Info className="inline h-3 w-3 mr-1" />
                      Según el año de alta ({empleadoSeleccionadoInfo.anioAlta}), la antigüedad calculada es de {antiguedadCalculada} años
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/tarifas")}
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-hogar-600 hover:bg-hogar-700"
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {tarifaExistente ? "Actualizar" : "Guardar"} Tarifa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
