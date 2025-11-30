import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Empleado, Pago } from "@/types";
import { 
  calcularTotalTrabajo,
  formatCurrency 
} from "@/lib/storage";
import { updatePagoAsync } from "@/lib/storage-async";

const editPagoSchema = z.object({
  horasTrabajadas: z.coerce.number().optional(),
  asistio: z.boolean(),
  comprobantePago: z.string().optional(),
  montoAporte: z.coerce.number().optional(),
});

type EditPagoFormValues = z.infer<typeof editPagoSchema>;

interface EditPagoDialogProps {
  pago: Pago | null;
  empleados: Empleado[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditPagoDialog({ pago, empleados, open, onOpenChange, onSave }: EditPagoDialogProps) {
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [saving, setSaving] = useState(false);

  const form = useForm<EditPagoFormValues>({
    resolver: zodResolver(editPagoSchema),
    defaultValues: {
      horasTrabajadas: 8,
      asistio: true,
      comprobantePago: "",
      montoAporte: 0,
    },
  });

  useEffect(() => {
    if (pago) {
      form.reset({
        horasTrabajadas: pago.horasTrabajadas || 8,
        asistio: pago.asistio,
        comprobantePago: pago.comprobantePago || "",
        montoAporte: pago.montoAporte || 0,
      });
      setTotalCalculado(pago.total);
    }
  }, [pago, form]);

  const asistio = form.watch("asistio");
  const horasTrabajadas = form.watch("horasTrabajadas") || 0;
  const montoAporte = form.watch("montoAporte") || 0;

  useEffect(() => {
    if (!pago) return;

    if (pago.tipoPago === 'trabajo') {
      const total = calcularTotalTrabajo(
        pago.valorHoraConAntiguedad,
        horasTrabajadas,
        pago.valorViatico,
        asistio
      );
      setTotalCalculado(total);
    } else {
      setTotalCalculado(montoAporte);
    }
  }, [pago, asistio, horasTrabajadas, montoAporte]);

  const getEmpleadoNombre = (empleadoId: string) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : "Desconocido";
  };

  const onSubmit = async (values: EditPagoFormValues) => {
    if (!pago) return;

    setSaving(true);
    const pagoActualizado: Pago = {
      ...pago,
      horasTrabajadas: pago.tipoPago === 'trabajo' ? values.horasTrabajadas : undefined,
      asistio: pago.tipoPago === 'trabajo' ? values.asistio : true,
      comprobantePago: values.comprobantePago,
      montoAporte: pago.tipoPago === 'aporte' ? values.montoAporte : undefined,
      total: totalCalculado,
    };

    await updatePagoAsync(pagoActualizado);
    setSaving(false);
    toast.success("Pago actualizado correctamente");
    onSave();
  };

  if (!pago) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pago</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Empleado:</strong> {getEmpleadoNombre(pago.empleadoId)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tipo:</strong> {pago.tipoPago === 'trabajo' ? 'Trabajo' : 'Aporte Mensual'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {pago.tipoPago === 'trabajo' ? (
              <>
                <FormField
                  control={form.control}
                  name="asistio"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel>¿Asistió?</FormLabel>
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
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            ) : (
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
                  <FormLabel>Comprobante de Pago</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 bg-hogar-50 rounded-lg">
              <p className="text-sm text-gray-600">Total calculado:</p>
              <p className="text-2xl font-bold text-hogar-700">{formatCurrency(totalCalculado)}</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-hogar-600 hover:bg-hogar-700" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
