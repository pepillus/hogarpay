# Prompt para Replicar HogarPay Manager

## Descripción General

Necesito que crees una aplicación web completa llamada **"HogarPay Manager"** para gestionar empleados domésticos, sus tarifas de pago y el registro de pagos (tanto por trabajo realizado como aportes mensuales). La aplicación debe ser **IDÉNTICA** en funcionalidad, diseño y comportamiento a la especificación que sigue.

## Stack Tecnológico OBLIGATORIO

Debes usar exactamente estas versiones y tecnologías:

- **React**: 18.3.1
- **TypeScript**: Configuración estricta
- **Vite**: Como bundler
- **Tailwind CSS**: Para estilos
- **shadcn/ui**: Para componentes de UI
- **React Router DOM**: 6.26.2 para navegación
- **React Hook Form**: 7.53.0 para manejo de formularios
- **Zod**: 3.23.8 para validación de schemas
- **@hookform/resolvers**: 3.9.0 para integración de Zod con React Hook Form
- **Sonner**: 1.5.0 para notificaciones toast
- **Lucide React**: 0.462.0 para iconos
- **date-fns**: 3.6.0 para manejo de fechas
- **localStorage**: Para persistencia de datos
- **uuid**: 11.1.0 para generación de IDs únicos
- **React Query**: 5.56.2 (aunque no se usa activamente en el estado actual)

## Paleta de Colores y Diseño

### 1. `tailwind.config.ts`

Debes configurar el theme con esta paleta de colores personalizada llamada `hogar`:

```typescript
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Color personalizado "hogar"
        hogar: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 2. `src/index.css`

Define los tokens semánticos en formato HSL para modo claro y oscuro:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**CRÍTICO**: Todos los colores deben estar en formato HSL. No uses RGB en `index.css`.

## Estructura de Datos (localStorage)

### Interface `Empleado`

```typescript
interface Empleado {
  id: string; // UUID generado con crypto.randomUUID()
  nombre: string; // Mínimo 2 caracteres, requerido
  apellido: string; // Mínimo 2 caracteres, requerido
  telefono: string; // Exactamente 10 dígitos, requerido
  direccion: string; // Mínimo 5 caracteres, requerido
  notas?: string; // Opcional
}
```

**localStorage key**: `'empleados'`

### Interface `Tarifa`

```typescript
interface Tarifa {
  id: string; // UUID
  empleadoId: string; // FK al empleado
  valorHora: number; // Requerido, mínimo 0.01
  valorViatico: number; // Requerido, mínimo 0
  antiguedad: number; // Años de antigüedad, mínimo 0, requerido
}
```

**localStorage key**: `'tarifas'`

**IMPORTANTE**: Solo puede existir UNA tarifa por empleado. Al crear o editar una tarifa, se debe verificar que no exista otra para el mismo `empleadoId`. Si existe, se reemplaza.

### Interface `Pago`

```typescript
interface Pago {
  id: string; // UUID
  empleadoId: string; // FK al empleado
  fecha: string; // ISO string de Date
  valorHora: number; // Valor hora base (sin antigüedad)
  valorHoraConAntiguedad: number; // Valor hora calculado con antigüedad
  valorViatico: number; // Valor del viático
  antiguedad: number; // Años de antigüedad al momento del pago
  total: number; // Total calculado del pago
  asistio: boolean; // Si asistió (para tipo 'trabajo')
  comprobantePago?: string; // Opcional, texto libre
  tipoPago: 'trabajo' | 'aporte'; // Tipo de pago
  esAporte: boolean; // true si es aporte, false si es trabajo
  horasTrabajadas?: number; // Solo para tipo 'trabajo'
  montoAporte?: number; // Solo para tipo 'aporte'
  mes?: number; // Solo para tipo 'aporte' (1-12)
  anio?: number; // Solo para tipo 'aporte'
}
```

**localStorage key**: `'pagos'`

## Estructura de Rutas (App.tsx)

```typescript
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EmpleadosPage from "./pages/EmpleadosPage";
import NuevoEmpleadoPage from "./pages/NuevoEmpleadoPage";
import TarifasPage from "./pages/TarifasPage";
import TarifaFormPage from "./pages/TarifaFormPage";
import PagosPage from "./pages/PagosPage";
import HistorialPage from "./pages/HistorialPage";
import ReportesPage from "./pages/ReportesPage";
import BackupPage from "./pages/BackupPage";
import ImportarCSVPage from "./pages/ImportarCSVPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/empleados" element={<EmpleadosPage />} />
          <Route path="/empleados/nuevo" element={<NuevoEmpleadoPage />} />
          <Route path="/tarifas" element={<TarifasPage />} />
          <Route path="/tarifas/nuevo" element={<TarifaFormPage />} />
          <Route path="/tarifas/:empleadoId" element={<TarifaFormPage />} />
          <Route path="/pagos" element={<PagosPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/importar-csv" element={<ImportarCSVPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

## Layout Principal (AppLayout)

**Archivo**: `src/components/layout/AppLayout.tsx`

### Estructura del Header

- **Fondo**: `bg-hogar-700` (color personalizado)
- **Texto**: Blanco
- **Título**: "HogarPay Manager" (text-2xl, font-bold)
- **Navegación**: Horizontal, responsive (flex-wrap en mobile)

### Items de Navegación

Cada `NavItem` tiene:
- Un icono de Lucide React
- Un texto descriptivo
- Estado activo visual: `bg-hogar-600 text-white rounded-md`
- Estado hover: `hover:bg-hogar-100 text-gray-700 hover:text-hogar-700`

**Items de navegación (en orden)**:

1. **Empleados** - Icono: `<UserRound />` - Ruta: `/empleados`
2. **Tarifas** - Icono: `<Calculator />` - Ruta: `/tarifas`
3. **Registrar Pago** - Icono: `<Calendar />` - Ruta: `/pagos`
4. **Historial** - Icono: `<History />` - Ruta: `/historial`
5. **Reportes** - Icono: `<FileChartLine />` - Ruta: `/reportes`
6. **Respaldo** - Icono: `<Download />` - Ruta: `/backup`

### Contenedor Principal

- Fondo: `bg-gray-50`
- Contenedor: `container mx-auto px-4 py-6`
- Contenido: Dentro de un `Card` de shadcn/ui con `bg-white p-6 rounded-lg shadow`

## Páginas Principales

### 1. Index (`src/pages/Index.tsx`)

**Descripción**: Página de inicio con cards de navegación rápida.

**Estructura**:
- Hero section con título "Bienvenido a HogarPay Manager"
- Grid de 5 cards (responsive: 1 columna en mobile, 2 en tablet, 5 en desktop)
- Cada card tiene:
  - Icono específico (color `text-hogar-600`)
  - Título
  - Descripción breve
  - Botón "Ver [Sección]" con `variant="outline"` que navega a la ruta correspondiente

**Cards**:
1. **Empleados** - "Gestiona la información de tus empleados domésticos" → `/empleados`
2. **Tarifas** - "Configura tarifas de pago para cada empleado" → `/tarifas`
3. **Registrar Pago** - "Registra pagos por trabajo o aportes mensuales" → `/pagos`
4. **Historial** - "Consulta el historial completo de pagos realizados" → `/historial`
5. **Respaldo** - "Exporta e importa datos para mantener respaldos seguros" → `/backup`

**Sección adicional**: Instrucciones rápidas de uso en una card con lista ordenada.

### 2. EmpleadosPage (`src/pages/EmpleadosPage.tsx`)

**Componente**: Usa `<AppLayout>` como wrapper.

**Contenido**: Renderiza `<EmpleadoList />` component.

#### EmpleadoList (`src/components/empleados/EmpleadoList.tsx`)

**Funcionalidad**:
- Carga empleados desde localStorage en `useEffect`
- Si no hay empleados: Muestra mensaje vacío con botón "Registrar Primer Empleado" → navega a `/empleados/nuevo`
- Si hay empleados: Muestra tabla con:
  - Columnas: Nombre, Apellido, Teléfono, Dirección, Acciones
  - Botón "Nuevo Empleado" arriba de la tabla (color `hogar-600`) → `/empleados/nuevo`
  - Cada fila tiene botón "Editar" → navega a `/tarifas/:id` (para configurar su tarifa)

**Estilos**: Tabla con bordes, hover effects, responsive.

### 3. NuevoEmpleadoPage (`src/pages/NuevoEmpleadoPage.tsx`)

**Componente**: Usa `<AppLayout>` como wrapper.

**Contenido**: Renderiza `<EmpleadoForm />`.

#### EmpleadoForm (`src/components/empleados/EmpleadoForm.tsx`)

**Schema de validación (Zod)**:

```typescript
const empleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  telefono: z.string().length(10, "El teléfono debe tener exactamente 10 dígitos"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  notas: z.string().optional(),
});
```

**Campos del formulario**:
1. **Nombre** - Input de texto, requerido
2. **Apellido** - Input de texto, requerido
3. **Teléfono** - Input de texto (10 dígitos), requerido
4. **Dirección** - Input de texto, requerido
5. **Notas** - Textarea, opcional

**Comportamiento al submit**:
1. Valida el formulario con Zod
2. Genera un `id` único con `crypto.randomUUID()`
3. Guarda en localStorage bajo key `'empleados'`
4. Muestra toast de éxito: "Empleado registrado correctamente"
5. Resetea el formulario

**UI**: Card con título "Registrar Nuevo Empleado", formulario vertical, botón "Guardar Empleado".

### 4. TarifasPage (`src/pages/TarifasPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Renderiza `<TarifaList />`.

#### TarifaList (`src/components/tarifas/TarifaList.tsx`)

**Funcionalidad**:
- Carga empleados y tarifas desde localStorage
- Une datos para mostrar: Nombre completo, Valor Hora, Viático, Antigüedad
- Si no hay empleados: Mensaje vacío + botón "Registrar Empleado" → `/empleados/nuevo`
- Si hay empleados: Tabla con columnas:
  - Empleado (Nombre completo)
  - Valor Hora (formato: $X.XX)
  - Viático (formato: $X.XX)
  - Antigüedad (X años)
  - Acciones (botón "Configurar" o "Editar" → `/tarifas/:empleadoId`)

**Botón superior**: "Nueva Tarifa" → `/tarifas/nuevo` (solo si hay empleados)

### 5. TarifaFormPage (`src/pages/TarifaFormPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Renderiza `<TarifaForm />`, pasándole el `empleadoId` del parámetro de ruta (si existe).

#### TarifaForm (`src/components/tarifas/TarifaForm.tsx`)

**Props**: `empleadoId?: string` (opcional, para edición)

**Schema de validación (Zod)**:

```typescript
const tarifaSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  valorHora: z.coerce.number().min(0.01, "El valor por hora debe ser mayor a 0"),
  valorViatico: z.coerce.number().min(0, "El viático no puede ser negativo"),
  antiguedad: z.coerce.number().min(0, "La antigüedad no puede ser negativa"),
});
```

**Campos del formulario**:
1. **Empleado** - Select con lista de empleados (nombre completo)
   - Si `empleadoId` está presente: Pre-seleccionado y disabled
   - Si no: Puede elegir cualquier empleado
2. **Valor por Hora** - Input numérico, requerido, placeholder: "Ej: 150.00"
3. **Viático** - Input numérico, requerido, placeholder: "Ej: 50.00"
4. **Antigüedad** - Input numérico (años), requerido, placeholder: "Ej: 2"

**Comportamiento**:
- **Modo creación**: Si no hay `empleadoId` o no existe tarifa previa
- **Modo edición**: Si `empleadoId` existe y ya tiene tarifa, se cargan los valores previos

**Al submit**:
1. Valida con Zod
2. Verifica que solo exista UNA tarifa por empleado (elimina la anterior si existe)
3. Guarda en localStorage bajo key `'tarifas'`
4. Muestra toast de éxito
5. Navega a `/tarifas`

### 6. PagosPage (`src/pages/PagosPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Renderiza `<PagoForm />`.

#### PagoForm (`src/components/pagos/PagoForm.tsx`) - COMPONENTE CRÍTICO

**Schema de validación (Zod)**:

```typescript
const pagoSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  horasTrabajadas: z.coerce.number().optional(),
  asistio: z.boolean().default(true),
  comprobantePago: z.string().optional(),
  tipoPago: z.enum(['trabajo', 'aporte']).default('trabajo'),
  montoAporte: z.coerce.number().optional(),
  mesAporte: z.string().optional(), // Formato: "MM-YYYY"
});
```

**Estados importantes**:
- `empleados`: Array de empleados cargados
- `tarifas`: Array de tarifas
- `tarifaEmpleadoActual`: Tarifa del empleado seleccionado
- `totalAPagar`: Total calculado dinámicamente
- `valorHoraConAntiguedad`: Valor hora + bonus por antigüedad
- `tipoPagoActivo`: 'trabajo' o 'aporte'
- `mesesDisponibles`: Array de meses SIN aportes registrados para el empleado seleccionado

**Estructura UI - TABS**:

El formulario tiene dos tabs:
1. **"Trabajo"** - Para registrar pagos por jornadas de trabajo
2. **"Aporte Mensual"** - Para registrar contribuciones mensuales

**Tab "Trabajo" - Campos**:
1. **Empleado** - Select (requerido)
2. **Fecha** - DatePicker con Popover (requerido)
3. **¿Asistió?** - Switch (default: true)
4. **Horas Trabajadas** - Input numérico (solo si `asistio` es true, default: 8)
5. **Comprobante de Pago** - Input de texto opcional

**Tab "Aporte Mensual" - Campos**:
1. **Empleado** - Select (requerido)
2. **Mes/Año** - Select con meses disponibles (formato: "Enero 2024", etc.)
   - **CRÍTICO**: Solo muestra meses que NO tienen aporte registrado para ese empleado
   - Se calcula con función `obtenerMesesDisponiblesParaAporte(empleadoId)`
3. **Monto del Aporte** - Input numérico requerido
4. **Comprobante de Pago** - Input de texto opcional

**Cálculo de Total** (en tiempo real):

Para **tipo 'trabajo'**:
```typescript
if (asistio) {
  total = (valorHoraConAntiguedad * horasTrabajadas) + valorViatico
} else {
  total = 0
}
```

Para **tipo 'aporte'**:
```typescript
total = montoAporte
```

**valorHoraConAntiguedad**:
```typescript
const antiguedad = tarifa.antiguedad || 0;
const porcentajeAdicional = antiguedad * 0.01; // 1% por año
const valorHoraConAntiguedad = tarifa.valorHora * (1 + porcentajeAdicional);
```

**función `obtenerMesesDisponiblesParaAporte`**:

```typescript
const obtenerMesesDisponiblesParaAporte = (empleadoId: string): { value: string; label: string }[] => {
  const pagosGuardados = localStorage.getItem('pagos');
  const pagos: Pago[] = pagosGuardados ? JSON.parse(pagosGuardados) : [];
  
  // Filtrar aportes del empleado
  const aportesEmpleado = pagos.filter(
    p => p.empleadoId === empleadoId && p.tipoPago === 'aporte'
  );
  
  // Crear Set de meses ocupados (formato "MM-YYYY")
  const mesesOcupados = new Set(
    aportesEmpleado.map(a => `${String(a.mes).padStart(2, '0')}-${a.anio}`)
  );
  
  // Generar lista de meses desde enero del año pasado hasta diciembre del año que viene
  const mesesDisponibles: { value: string; label: string }[] = [];
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  
  for (let anio = anioActual - 1; anio <= anioActual + 1; anio++) {
    for (let mes = 1; mes <= 12; mes++) {
      const mesStr = String(mes).padStart(2, '0');
      const valor = `${mesStr}-${anio}`;
      
      if (!mesesOcupados.has(valor)) {
        const nombreMes = format(new Date(anio, mes - 1, 1), "MMMM yyyy", { locale: es });
        mesesDisponibles.push({
          value: valor,
          label: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
        });
      }
    }
  }
  
  return mesesDisponibles;
};
```

**Display de información**:

Debe mostrar en cards o texto formateado:
- Empleado seleccionado (nombre completo)
- Valor por hora: $XXX.XX
- Bonus por antigüedad: +X% (X años)
- Viático: $XXX.XX (solo para tipo trabajo)
- **Total a pagar: $XXX.XX** (destacado, actualizado en tiempo real)

**Comportamiento al submit**:

1. Valida el formulario
2. Verifica que el empleado tenga tarifa configurada (si no, muestra error y no continúa)
3. Calcula el total según el tipo de pago
4. Crea objeto `Pago` con todos los campos:
   ```typescript
   const nuevoPago: Pago = {
     id: crypto.randomUUID(),
     empleadoId: values.empleadoId,
     fecha: fechaPago.toISOString(), // Para trabajo: values.fecha, para aporte: 1er día del mes
     valorHora: tarifa.valorHora,
     valorHoraConAntiguedad: valorHoraCalculado,
     valorViatico: tarifa.valorViatico,
     antiguedad: tarifa.antiguedad,
     total: total,
     asistio: values.tipoPago === 'trabajo' ? values.asistio : true,
     comprobantePago: values.comprobantePago,
     tipoPago: values.tipoPago,
     esAporte: values.tipoPago === 'aporte',
     horasTrabajadas: values.tipoPago === 'trabajo' ? values.horasTrabajadas : undefined,
     montoAporte: values.tipoPago === 'aporte' ? values.montoAporte : undefined,
     mes: values.tipoPago === 'aporte' ? parseInt(values.mesAporte.split('-')[0]) : undefined,
     anio: values.tipoPago === 'aporte' ? parseInt(values.mesAporte.split('-')[1]) : undefined
   };
   ```
5. Guarda en localStorage bajo key `'pagos'`
6. Muestra toast de éxito: "Pago registrado correctamente"
7. **RESETEA TODO**: form.reset(), y limpia todos los estados (tarifaEmpleadoActual, totalAPagar, etc.)

**Validación del botón de submit**:
- Deshabilitado si:
  - Formulario inválido
  - No hay tarifa para el empleado seleccionado
  - Para tipo 'trabajo': no hay horasTrabajadas si asistió
  - Para tipo 'aporte': no hay mesAporte o montoAporte

### 7. HistorialPage (`src/pages/HistorialPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Renderiza `<HistorialPagos />`.

#### HistorialPagos (`src/components/historial/HistorialPagos.tsx`) - COMPONENTE COMPLEJO

**Funcionalidad**:
- Muestra TODOS los pagos registrados (trabajo + aportes)
- Filtros avanzados
- Edición y eliminación de pagos
- Exportación a CSV

**Estados**:
- `pagos`: Array de todos los pagos
- `empleados`: Array de empleados
- `filtroEmpleado`: ID del empleado seleccionado para filtrar (o 'todos')
- `filtroMes`: Mes seleccionado (1-12, o 'todos')
- `filtroAnio`: Año seleccionado (o 'todos')
- `soloMesesSinAporte`: Boolean para mostrar solo meses sin aportes
- `pagoEditando`: Pago actual en edición (para el dialog)
- `dialogAbierto`: Boolean para controlar el dialog de edición

**Filtros UI**:
1. **Empleado** - Select con opción "Todos" + lista de empleados
2. **Mes** - Select con "Todos" + meses (Enero a Diciembre)
3. **Año** - Select con "Todos" + años de los pagos existentes
4. **Checkbox**: "Mostrar solo meses sin aporte" 
   - Cuando está activado: Solo muestra pagos tipo 'trabajo' de meses donde NO hay un aporte registrado para ese empleado

**Lógica de filtrado**:

```typescript
const pagosFiltrados = pagos
  .filter(pago => {
    // Filtro por empleado
    if (filtroEmpleado !== 'todos' && pago.empleadoId !== filtroEmpleado) return false;
    
    // Filtro por mes
    const fechaPago = new Date(pago.fecha);
    const mesPago = fechaPago.getMonth() + 1;
    if (filtroMes !== 'todos' && mesPago !== parseInt(filtroMes)) return false;
    
    // Filtro por año
    const anioPago = fechaPago.getFullYear();
    if (filtroAnio !== 'todos' && anioPago !== parseInt(filtroAnio)) return false;
    
    // Filtro "solo meses sin aporte"
    if (soloMesesSinAporte && pago.tipoPago === 'trabajo') {
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
  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Más recientes primero
```

**Tabla de pagos**:

Columnas:
1. **Fecha** - Formato: "DD/MM/YYYY"
2. **Empleado** - Nombre completo
3. **Tipo** - Badge: "Trabajo" (azul) o "Aporte Mensual" (verde)
4. **Detalle**:
   - Para trabajo: "X horas - $XXX.XX/h" o "No asistió"
   - Para aporte: "Mes YYYY" (ej: "Enero 2024")
5. **Total** - Formato: "$XXX.XX" (bold)
6. **Acciones**:
   - Botón "Editar" (icono `<Edit />`) → Abre dialog de edición
   - Botón "Eliminar" (icono `<Trash2 />`, variant destructive) → Muestra AlertDialog de confirmación

**Botones superiores**:
- "Exportar a CSV" (icono `<Download />`) → Descarga CSV con todos los pagos filtrados
- "Limpiar Filtros" (icono `<X />`, variant outline) → Resetea todos los filtros

**Dialog de Edición** (componente `<EditPagoDialog />`):

**Props**:
```typescript
interface EditPagoDialogProps {
  pago: Pago | null;
  empleados: Empleado[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pagoActualizado: Pago) => void;
}
```

**Funcionalidad**:
- Permite editar todos los campos del pago (excepto ID)
- Recalcula el total automáticamente al cambiar valores
- Usa el mismo schema de validación que `PagoForm`
- Al guardar: llama a `onSave` con el pago actualizado
- Muestra toast de éxito o error

**AlertDialog de Confirmación de Eliminación**:
- Título: "¿Estás seguro?"
- Descripción: "Esta acción no se puede deshacer. El pago será eliminado permanentemente."
- Botones: "Cancelar" y "Eliminar" (destructive)
- Al confirmar: Elimina del localStorage, actualiza el estado, muestra toast

**Exportación CSV**:

Formato:
```
Fecha,Empleado,Tipo,Horas,Valor Hora,Viático,Total
DD/MM/YYYY,Nombre Apellido,Trabajo,8,150.00,50.00,1250.00
DD/MM/YYYY,Nombre Apellido,Aporte Mensual,,,500.00
```

Descarga con nombre: `historial-pagos-${fecha}.csv`

### 8. ReportesPage (`src/pages/ReportesPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Renderiza `<GeneradorReportes />`.

#### GeneradorReportes (`src/components/reportes/GeneradorReportes.tsx`)

**Funcionalidad**:
- Genera reporte mensual de pagos
- Filtra por mes y año
- Muestra totales separados por tipo de pago
- Permite imprimir y exportar a CSV

**Estados**:
- `mesSeleccionado`: Mes actual (1-12)
- `anioSeleccionado`: Año actual
- `empleados`: Array de empleados
- `pagos`: Array de pagos

**Filtros**:
1. **Mes** - Select con meses (Enero - Diciembre), default: mes actual
2. **Año** - Select con años disponibles en pagos, default: año actual

**Cálculos**:

```typescript
const pagosMes = pagos.filter(p => {
  const fechaPago = new Date(p.fecha);
  return (
    (p.mes ? p.mes === mesSeleccionado : fechaPago.getMonth() + 1 === mesSeleccionado) &&
    (p.anio ? p.anio === anioSeleccionado : fechaPago.getFullYear() === anioSeleccionado)
  );
});

const totalSueldos = pagosMes
  .filter(p => p.tipoPago === 'trabajo')
  .reduce((sum, p) => sum + (p.total - (p.valorViatico || 0)), 0);

const totalViaticos = pagosMes
  .filter(p => p.tipoPago === 'trabajo')
  .reduce((sum, p) => sum + (p.valorViatico || 0), 0);

const totalTransferido = totalSueldos + totalViaticos;

const totalAportes = pagosMes
  .filter(p => p.tipoPago === 'aporte')
  .reduce((sum, p) => sum + p.total, 0);
```

**UI - Resumen (Cards)**:

1. **Total Transferido** (Card destacada, color primary)
   - Subtotal Sueldos: $XXX.XX
   - Subtotal Viáticos: $XXX.XX
   - Total: $XXX.XX (texto grande)

2. **Total Aportes** (Card secundaria)
   - Total: $XXX.XX

**Tabla de Desglose**:

Por empleado, muestra:
- Nombre completo
- Días trabajados (cantidad de pagos tipo 'trabajo' donde asistió)
- Total pagado (trabajo)
- Aportes realizados
- Total general (suma)

**Botones de acción**:
1. **Imprimir Reporte** (icono `<Printer />`) → window.print() con estilos específicos @media print
2. **Exportar a CSV** (icono `<Download />`) → Descarga CSV del reporte

**Estilos de impresión** (en el componente):

```css
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
  }
  
  .print-friendly {
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
```

### 9. BackupPage (`src/pages/BackupPage.tsx`)

**Componente**: Usa `<AppLayout>`.

**Contenido**: Tabs con dos secciones:

#### Tab 1: "Respaldo JSON"

**Funcionalidad**:
- Exporta todos los datos (empleados, tarifas, pagos) en un archivo JSON
- Importa datos desde un archivo JSON

**Botones**:
1. **Exportar Datos** (icono `<Download />`)
   - Crea objeto con todas las keys de localStorage
   - Descarga como `hogarpay-backup-${fecha}.json`
   - Muestra toast de éxito

2. **Importar Datos** (icono `<Upload />`)
   - Abre input type="file" (accept=".json")
   - Lee el archivo
   - Valida que tenga las keys correctas
   - Muestra AlertDialog de confirmación: "¿Reemplazar datos existentes?"
   - Al confirmar: Escribe en localStorage y recarga la página
   - Muestra toast de éxito o error

**Advertencias**:
- Card con alert de advertencia sobre la importación de datos

#### Tab 2: "Importar CSV"

**Contenido**: Renderiza `<ImportarCSV onImportComplete={() => { mostrar toast y recargar}} />`.

#### ImportarCSV (`src/components/importar/ImportarCSV.tsx`)

**Funcionalidad**:
- Importa pagos desde archivo CSV
- Opción de reemplazar o agregar datos

**Props**:
```typescript
interface ImportarCSVProps {
  onImportComplete: () => void;
}
```

**UI**:
- Zona de drag & drop para archivo CSV
- Input file (accept=".csv")
- Checkbox: "Reemplazar datos existentes" (default: false)
- Botón "Importar Datos" (disabled hasta que se seleccione un archivo)

**Formato CSV esperado**:

```
empleadoId,fecha,valorHora,antiguedad,valorViatico,horasTrabajadas,asistio,comprobantePago
uuid-del-empleado,2024-01-15,150,2,50,8,si,Transferencia
uuid-del-empleado,2024-01-16,150,2,50,0,no,
```

**Procesamiento**:
1. Lee el archivo CSV
2. Parsea línea por línea (ignorando header)
3. Para cada línea:
   ```typescript
   const valorHoraConAntiguedad = parseFloat(valorHora) * (1 + parseFloat(antiguedad) * 0.01);
   const asistio = asistioStr.toLowerCase() === 'si';
   const total = asistio 
     ? (valorHoraConAntiguedad * parseFloat(horasTrabajadas)) + parseFloat(valorViatico)
     : 0;
   
   const pago: Pago = {
     id: crypto.randomUUID(),
     empleadoId,
     fecha: new Date(fecha).toISOString(),
     valorHora: parseFloat(valorHora),
     valorHoraConAntiguedad,
     valorViatico: parseFloat(valorViatico),
     antiguedad: parseFloat(antiguedad),
     total,
     asistio,
     comprobantePago,
     tipoPago: 'trabajo',
     esAporte: false,
     horasTrabajadas: asistio ? parseFloat(horasTrabajadas) : undefined
   };
   ```
4. Guarda en localStorage (reemplazando o agregando según checkbox)
5. Llama a `onImportComplete()`
6. Muestra toast con cantidad de registros importados

**Manejo de errores**:
- Valida formato del CSV
- Valida que los empleadoId existan
- Muestra toast descriptivo si hay error

### 10. NotFound (`src/pages/NotFound.tsx`)

Página 404 simple con:
- Título "404 - Página no encontrada"
- Mensaje descriptivo
- Botón "Volver al inicio" → navega a `/`

## Componentes de shadcn/ui Requeridos

Debes instalar y usar los siguientes componentes de shadcn/ui:

- `button`
- `card`
- `form`
- `input`
- `label`
- `select`
- `textarea`
- `table`
- `dialog`
- `alert-dialog`
- `tabs`
- `badge`
- `switch`
- `calendar`
- `popover`
- `toast` y `sonner`
- `separator`
- `alert`
- `checkbox`

## Validación y Schemas Zod

### Schema `empleadoSchema`:

```typescript
const empleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  telefono: z.string().length(10, "El teléfono debe tener exactamente 10 dígitos"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  notas: z.string().optional(),
});
```

### Schema `tarifaSchema`:

```typescript
const tarifaSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  valorHora: z.coerce.number().min(0.01, "El valor por hora debe ser mayor a 0"),
  valorViatico: z.coerce.number().min(0, "El viático no puede ser negativo"),
  antiguedad: z.coerce.number().min(0, "La antigüedad no puede ser negativa"),
});
```

### Schema `pagoSchema`:

```typescript
const pagoSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  horasTrabajadas: z.coerce.number().optional(),
  asistio: z.boolean().default(true),
  comprobantePago: z.string().optional(),
  tipoPago: z.enum(['trabajo', 'aporte']).default('trabajo'),
  montoAporte: z.coerce.number().optional(),
  mesAporte: z.string().optional(),
});
```

## Lógica de Negocio Crítica

### 1. Cálculo de Valor Hora con Antigüedad

```typescript
const antiguedad = tarifa.antiguedad || 0;
const porcentajeAdicional = antiguedad * 0.01; // 1% por año
const valorHoraConAntiguedad = tarifa.valorHora * (1 + porcentajeAdicional);
```

### 2. Cálculo de Total de Pago

**Para tipo 'trabajo'**:
```typescript
if (asistio) {
  total = (valorHoraConAntiguedad * horasTrabajadas) + valorViatico;
} else {
  total = 0;
}
```

**Para tipo 'aporte'**:
```typescript
total = montoAporte;
```

### 3. Meses Disponibles para Aportes

Solo se pueden registrar aportes en meses donde NO exista un aporte previo para ese empleado.

Algoritmo:
1. Obtener todos los pagos tipo 'aporte' del empleado
2. Crear Set con formato "MM-YYYY" de meses ocupados
3. Generar lista de meses desde año anterior hasta año siguiente
4. Filtrar meses que NO están en el Set

### 4. Filtro "Solo meses sin aporte" en Historial

Cuando está activo:
- Muestra pagos tipo 'trabajo'
- Excluye los que tienen un aporte registrado en el mismo mes/año y empleado

### 5. Cálculos en Reportes Mensuales

**Total Transferido**:
```typescript
const totalSueldos = pagosTrabajo.reduce((sum, p) => 
  sum + (p.total - (p.valorViatico || 0)), 0
);
const totalViaticos = pagosTrabajo.reduce((sum, p) => 
  sum + (p.valorViatico || 0), 0
);
const totalTransferido = totalSueldos + totalViaticos;
```

**Total Aportes**:
```typescript
const totalAportes = pagosAporte.reduce((sum, p) => sum + p.total, 0);
```

## Detalles de UX/UI

### Toasts (Sonner)

Usar para:
- Confirmación de guardado
- Confirmación de eliminación
- Errores de validación
- Éxito en importación/exportación

Estilo:
```typescript
toast.success("Mensaje de éxito");
toast.error("Mensaje de error");
```

### Estados de Carga

Aunque no hay llamadas async a APIs, simular estados de carga en:
- Importación de CSV
- Exportación de datos

### Estados Vacíos

Cada lista debe tener un estado vacío con:
- Icono relevante
- Mensaje descriptivo
- Botón de acción principal

### Formato de Números

- Moneda: `$XXX.XX` (siempre 2 decimales)
- Usar `toFixed(2)` para consistencia
- Separador de miles: Opcional (usar `toLocaleString('es-MX')` si se desea)

### Formato de Fechas

Usar `date-fns` con locale español:
```typescript
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

format(fecha, "dd/MM/yyyy", { locale: es });
format(fecha, "MMMM yyyy", { locale: es }); // Para nombres de meses
```

### Responsive Design

- Mobile-first approach
- Breakpoints de Tailwind: sm, md, lg, xl
- Navegación: Horizontal en desktop, wrap en mobile
- Tablas: Scroll horizontal en mobile
- Formularios: Una columna en mobile, puede ser dos en desktop

### Estilos de Impresión

Para ReportesPage:
```css
@media print {
  .no-print { display: none !important; }
  body { background: white; }
  * { box-shadow: none !important; }
}
```

## Configuración de Archivos

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### `tsconfig.json`

Asegurar que incluya:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Flujo de Usuario Típico

1. **Primer uso**:
   - Usuario accede a `/`
   - Ve página de inicio
   - Hace clic en "Empleados"
   - Ve lista vacía → clic en "Registrar Primer Empleado"
   - Completa formulario de empleado → guarda
   - Navega a "Tarifas" → clic en "Configurar" para el empleado creado
   - Completa formulario de tarifa → guarda
   - Navega a "Registrar Pago"
   - Selecciona empleado, tipo de pago, completa datos → registra pago
   - Ve confirmación en toast

2. **Uso continuo**:
   - Navega a "Registrar Pago" directamente desde header
   - Alterna entre tabs "Trabajo" y "Aporte Mensual"
   - Registra pagos según necesidad
   - Consulta "Historial" para ver pagos anteriores
   - Usa filtros para encontrar pagos específicos
   - Genera "Reportes" mensuales
   - Exporta respaldos periódicamente desde "Respaldo"

3. **Edición de datos**:
   - En "Historial" → clic en "Editar" de un pago
   - Modifica valores en dialog
   - Guarda cambios
   - Ve confirmación

4. **Eliminación**:
   - En "Historial" → clic en "Eliminar"
   - Confirma en AlertDialog
   - Ve toast de confirmación

## Testing Manual Recomendado

1. Crear 3 empleados
2. Asignar tarifas a cada uno (con diferentes antigüedades: 0, 2, 5 años)
3. Registrar 5 pagos tipo "trabajo" (algunos con asistencia, otros sin)
4. Registrar 3 aportes mensuales para diferentes meses
5. Verificar cálculos:
   - Valor hora con antigüedad se aplica correctamente
   - Total incluye viático solo cuando asistió
   - Total es 0 cuando no asistió
6. Verificar filtros en Historial
7. Verificar que no se puede registrar aporte duplicado en mismo mes
8. Generar reporte mensual y verificar totales
9. Exportar backup JSON
10. Limpiar datos
11. Importar backup y verificar integridad
12. Probar responsive en mobile

## Criterios de Éxito

La aplicación estará correctamente replicada si:

1. ✅ Todos los empleados, tarifas y pagos se persisten en localStorage
2. ✅ Los cálculos de antigüedad y totales son exactos (±0.01)
3. ✅ No se pueden registrar aportes duplicados en el mismo mes/empleado
4. ✅ Los filtros en Historial funcionan correctamente (incluyendo "solo meses sin aporte")
5. ✅ El tab "Aporte Mensual" solo muestra meses disponibles
6. ✅ Los reportes mensuales muestran totales correctos separados por tipo
7. ✅ La exportación/importación JSON conserva todos los datos
8. ✅ La importación CSV parsea correctamente y calcula totales
9. ✅ La UI es responsive en mobile, tablet y desktop
10. ✅ Todos los formularios validan con Zod y muestran errores descriptivos
11. ✅ Los toasts aparecen en todas las acciones importantes
12. ✅ La navegación funciona correctamente en todas las rutas
13. ✅ El diseño usa la paleta de colores "hogar" consistentemente
14. ✅ Los estados vacíos se muestran cuando no hay datos

## Notas Finales

- **Prioriza la funcionalidad sobre la estética**, pero mantén consistencia visual
- **No agregues funcionalidades no especificadas** (ej: autenticación, roles, etc.)
- **Respeta los nombres de las variables y funciones** para mantener consistencia
- **Los mensajes de toast deben ser en español**
- **Usa `crypto.randomUUID()` para generar IDs** (no `uuid` de npm)
- **Usa `date-fns` con locale `es` para fechas en español**
- **Prueba exhaustivamente los cálculos matemáticos**
- **Verifica que el filtro "solo meses sin aporte" funcione correctamente**

Si tienes dudas sobre algún comportamiento específico, prioriza:
1. Simplicidad
2. Consistencia con el resto de la app
3. Buena UX (mensajes claros, validaciones útiles)

---

**Versión del prompt**: 1.0  
**Fecha**: 2025  
**Aplicación**: HogarPay Manager
