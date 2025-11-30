import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Upload, AlertTriangle, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BackupData, Empleado } from "@/types";
import { savePago } from "@/lib/storage";
import { exportBackup, importBackup as importBackupAsync, getEmpleadosAsync } from "@/lib/storage-async";

export function BackupManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [csvReplace, setCsvReplace] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  useEffect(() => {
    getEmpleadosAsync().then(setEmpleados);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hogarpay-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    setExporting(false);
    toast.success("Backup exportado correctamente");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as BackupData;
        
        // Validar estructura
        if (!data.empleados || !data.tarifas || !data.pagos) {
          toast.error("El archivo no tiene el formato correcto");
          return;
        }

        setPendingBackup(data);
        setShowConfirmDialog(true);
      } catch {
        toast.error("Error al leer el archivo");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (pendingBackup) {
      await importBackupAsync(pendingBackup);
      toast.success("Datos importados correctamente");
      setShowConfirmDialog(false);
      setPendingBackup(null);
      // Recargar la página para reflejar los cambios
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleCSVImportClick = () => {
    csvInputRef.current?.click();
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        procesarCSV(csvContent);
      } catch {
        toast.error("Error al leer el archivo CSV");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const procesarCSV = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      toast.error("El archivo CSV está vacío o no tiene datos");
      return;
    }

    const pagosImportados: number[] = [];
    let errores = 0;

    // Saltear header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [empleadoId, fecha, valorHora, antiguedad, valorViatico, horasTrabajadas, asistioStr, comprobantePago] = 
        line.split(',').map(s => s.trim());

      // Validar que el empleado exista
      const empleadoExiste = empleados.find(e => e.id === empleadoId);
      if (!empleadoExiste) {
        errores++;
        continue;
      }

      const valorHoraNum = parseFloat(valorHora) || 0;
      const antiguedadNum = parseFloat(antiguedad) || 0;
      const valorViaticoNum = parseFloat(valorViatico) || 0;
      const horasNum = parseFloat(horasTrabajadas) || 0;
      const asistio = asistioStr?.toLowerCase() === 'si';

      const valorHoraConAntiguedad = valorHoraNum * (1 + antiguedadNum * 0.01);
      const total = asistio 
        ? (valorHoraConAntiguedad * horasNum) + valorViaticoNum
        : 0;

      const pago = {
        id: crypto.randomUUID(),
        empleadoId,
        fecha: new Date(fecha).toISOString(),
        valorHora: valorHoraNum,
        valorHoraConAntiguedad,
        valorViatico: valorViaticoNum,
        antiguedad: antiguedadNum,
        total,
        asistio,
        comprobantePago: comprobantePago || undefined,
        tipoPago: 'trabajo' as const,
        esAporte: false,
        horasTrabajadas: asistio ? horasNum : undefined
      };

      savePago(pago);
      pagosImportados.push(i);
    }

    if (pagosImportados.length > 0) {
      toast.success(`${pagosImportados.length} pagos importados correctamente`);
      if (errores > 0) {
        toast.warning(`${errores} registros no pudieron ser importados`);
      }
    } else {
      toast.error("No se pudo importar ningún registro");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Respaldo de Datos</h2>

      <Tabs defaultValue="json">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="json">
            <FileJson className="h-4 w-4 mr-2" />
            Respaldo JSON
          </TabsTrigger>
          <TabsTrigger value="csv">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Exportar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-hogar-600" />
                  Exportar Datos
                </CardTitle>
                <CardDescription>
                  Descarga un archivo JSON con todos tus datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  El archivo incluirá:
                </p>
                <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                  <li>Todos los empleados</li>
                  <li>Todas las tarifas configuradas</li>
                  <li>Historial completo de pagos</li>
                </ul>
                <Button onClick={handleExport} className="w-full bg-hogar-600 hover:bg-hogar-700" disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Exportar Backup
                </Button>
              </CardContent>
            </Card>

            {/* Importar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-hogar-600" />
                  Importar Datos
                </CardTitle>
                <CardDescription>
                  Restaura datos desde un archivo de backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>
                    Importar un backup reemplazará TODOS los datos actuales
                  </AlertDescription>
                </Alert>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                
                <Button onClick={handleImportClick} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivo JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-hogar-600" />
                Importar Pagos desde CSV
              </CardTitle>
              <CardDescription>
                Importa pagos de trabajo desde un archivo CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">Formato esperado del CSV:</p>
                <code className="text-xs bg-gray-200 p-2 rounded block overflow-x-auto">
                  empleadoId,fecha,valorHora,antiguedad,valorViatico,horasTrabajadas,asistio,comprobantePago
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Ejemplo: uuid-del-empleado,2024-01-15,150,2,50,8,si,Transferencia
                </p>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="csvReplace"
                  checked={csvReplace}
                  onCheckedChange={(checked) => setCsvReplace(!!checked)}
                />
                <Label htmlFor="csvReplace">
                  Reemplazar pagos existentes (si no, se agregarán a los actuales)
                </Label>
              </div>

              <input
                type="file"
                ref={csvInputRef}
                onChange={handleCSVFileChange}
                accept=".csv"
                className="hidden"
              />
              
              <Button onClick={handleCSVImportClick} className="w-full bg-hogar-600 hover:bg-hogar-700">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Archivo CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reemplazar datos existentes?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reemplazará TODOS los datos actuales con los del archivo de backup.
              {pendingBackup && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p><strong>Empleados:</strong> {pendingBackup.empleados.length}</p>
                  <p><strong>Tarifas:</strong> {pendingBackup.tarifas.length}</p>
                  <p><strong>Pagos:</strong> {pendingBackup.pagos.length}</p>
                  {pendingBackup.fechaBackup && (
                    <p><strong>Fecha del backup:</strong> {format(new Date(pendingBackup.fechaBackup), 'dd/MM/yyyy HH:mm')}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} className="bg-hogar-600 hover:bg-hogar-700">
              Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
