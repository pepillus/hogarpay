import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { saveEmpleadoAsync, getEmpleadoByIdAsync } from "@/lib/storage-async";
import { Empleado } from "@/types";

const currentYear = new Date().getFullYear();

const empleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  telefono: z.string().length(10, "El teléfono debe tener exactamente 10 dígitos"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  notas: z.string().optional(),
  anioAlta: z.coerce.number().min(1990, "Año inválido").max(currentYear, "El año no puede ser futuro"),
});

type EmpleadoFormValues = z.infer<typeof empleadoSchema>;

export function EmpleadoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: "",
      notas: "",
      anioAlta: currentYear,
    },
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getEmpleadoByIdAsync(id).then((empleado) => {
        if (empleado) {
          form.reset({
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            telefono: empleado.telefono,
            direccion: empleado.direccion,
            notas: empleado.notas || "",
            anioAlta: empleado.anioAlta || currentYear,
          });
        }
        setLoading(false);
      });
    }
  }, [id, form]);

  const onSubmit = async (values: EmpleadoFormValues) => {
    setSaving(true);
    const empleado: Empleado = {
      id: id || crypto.randomUUID(),
      ...values,
    };
    
    await saveEmpleadoAsync(empleado);
    toast.success(isEditing ? "Empleado actualizado correctamente" : "Empleado registrado correctamente");
    navigate("/empleados");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-hogar-600" />
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  // Generar años desde 1990 hasta el año actual
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: María" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: González" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (10 dígitos)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1155667788" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Av. Corrientes 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anioAlta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año de Alta</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar año" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Año en que el empleado comenzó a trabajar (para calcular antigüedad)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/empleados")}
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-hogar-600 hover:bg-hogar-700" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Actualizar" : "Guardar"} Empleado
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
