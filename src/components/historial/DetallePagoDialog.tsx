import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Empleado, Pago } from "@/types";
import { formatCurrency } from "@/lib/storage";

interface DetallePagoDialogProps {
  pago: Pago | null;
  empleado: Empleado | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetallePagoDialog({ pago, empleado, open, onOpenChange }: DetallePagoDialogProps) {
  if (!pago) return null;

  const fechaPago = new Date(pago.fecha);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-hogar-600" />
            Detalle del Pago
          </DialogTitle>
          <DialogDescription>
            {format(fechaPago, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Empleado */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Empleado</span>
            <span className="font-medium">
              {empleado ? `${empleado.nombre} ${empleado.apellido}` : "Desconocido"}
            </span>
          </div>

          <Separator />

          {/* Tipo de pago */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tipo de Pago</span>
            <Badge variant={pago.tipoPago === 'trabajo' ? 'default' : 'secondary'}>
              {pago.tipoPago === 'trabajo' ? 'Trabajo' : 'Aporte Mensual'}
            </Badge>
          </div>

          {pago.tipoPago === 'trabajo' && (
            <>
              <Separator />

              {/* Asistencia */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Asistencia</span>
                <Badge variant={pago.asistio ? 'default' : 'destructive'}>
                  {pago.asistio ? 'Asistió' : 'No asistió'}
                </Badge>
              </div>

              {pago.asistio && (
                <>
                  <Separator />

                  {/* Horas trabajadas */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Horas Trabajadas</span>
                    <span className="font-medium">{pago.horasTrabajadas} horas</span>
                  </div>

                  <Separator />

                  {/* Valor Hora Base */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Valor Hora (base)</span>
                    <span className="font-medium">{formatCurrency(pago.valorHora)}</span>
                  </div>

                  {/* Antigüedad */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Antigüedad</span>
                    <span className="font-medium">{pago.antiguedad} años (+{pago.antiguedad}%)</span>
                  </div>

                  {/* Valor Hora con Antigüedad */}
                  <div className="flex justify-between items-center bg-hogar-50 p-2 rounded">
                    <span className="text-sm text-hogar-700 font-medium">Valor Hora (con antigüedad)</span>
                    <span className="font-bold text-hogar-700">{formatCurrency(pago.valorHoraConAntiguedad)}</span>
                  </div>

                  <Separator />

                  {/* Subtotal Horas */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Subtotal ({pago.horasTrabajadas}h × {formatCurrency(pago.valorHoraConAntiguedad)})
                    </span>
                    <span className="font-medium">
                      {formatCurrency((pago.horasTrabajadas || 0) * pago.valorHoraConAntiguedad)}
                    </span>
                  </div>

                  {/* Viático */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Viático</span>
                    <span className="font-medium">{formatCurrency(pago.valorViatico)}</span>
                  </div>
                </>
              )}
            </>
          )}

          {pago.tipoPago === 'aporte' && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Mes del Aporte</span>
                <span className="font-medium">
                  {format(fechaPago, "MMMM yyyy", { locale: es })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Monto del Aporte</span>
                <span className="font-medium">{formatCurrency(pago.montoAporte || pago.total)}</span>
              </div>
            </>
          )}

          <Separator />

          {/* Comprobante */}
          {pago.comprobantePago && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Comprobante</span>
              <span className="font-medium">{pago.comprobantePago}</span>
            </div>
          )}

          {/* TOTAL */}
          <div className="flex justify-between items-center bg-hogar-600 text-white p-3 rounded-lg">
            <span className="text-lg font-medium">TOTAL</span>
            <span className="text-xl font-bold">{formatCurrency(pago.total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
