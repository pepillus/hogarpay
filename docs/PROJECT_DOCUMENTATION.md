# HogarPay Manager - Documentación Técnica y Funcional

**Versión:** 1.0.0
**Fecha:** 9 de Febrero, 2026
**Autor:** AI Assistant (Rol: Senior Full Stack Developer)

## 1. Propósito del Proyecto

**HogarPay Manager** es una aplicación web progresiva (PWA) diseñada para la gestión integral de empleados domésticos. Su objetivo principal es simplificar y automatizar las tareas administrativas del empleador, incluyendo el cálculo de sueldos, registro de pagos, cumplimiento de obligaciones fiscales (ARCA/AFIP) y generación de reportes.

La aplicación está construida con una filosofía de **flexibilidad total**, permitiendo su uso en dos modalidades:
1.  **Modo Local (Offline):** Funciona completamente en el navegador del usuario sin necesidad de internet, ideal para privacidad y rapidez.
2.  **Modo Nube (Conectado):** Se integra con Supabase para permitir el acceso desde múltiples dispositivos (PC, móvil) y respaldo en la nube.

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico
*   **Frontend:** React 18 + Vite
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS + Shadcn UI (Componentes Radix UI)
*   **Routing:** React Router DOM v6
*   **Gestión de Formularios:** React Hook Form + Zod
*   **Persistencia:**
    *   Local: `localStorage`
    *   Remota (Opcional): Supabase (PostgreSQL)

### 2.2 Patrón de Diseño: "Dual-Mode Persistence"
La característica técnica más distintiva es su capa de abstracción de datos. La aplicación no accede directamente a la base de datos ni al storage local desde los componentes de UI.

*   **`src/lib/storage.ts`**: Maneja todas las operaciones sincrónicas contra `localStorage`.
*   **`src/lib/supabase.ts`**: Maneja la conexión y operaciones con Supabase.
*   **`src/lib/storage-async.ts` (El Adaptador)**: Es la única interfaz que consumen los componentes. Detecta si Supabase está configurado en las variables de entorno (`VITE_SUPABASE_URL`).
    *   Si hay credenciales -> Usa Supabase.
    *   Si no hay credenciales -> Usa `storage.ts` (Local).

Este diseño permite cambiar de estrategia de almacenamiento sin tocar una sola línea de código en la interfaz de usuario.

### 2.3 Estructura de Directorios Clave
*   `/src/components`: Componentes de UI divididos por dominio (pagos, empleados, arca, ui).
*   `/src/lib`: Lógica de negocio, utilidades y adaptadores de almacenamiento.
*   `/src/pages`: Vistas principales de la aplicación.
*   `/src/types`: Definiciones de tipos TypeScript compartidas (Modelo de Dominio).
*   `/supabase/migrations`: Scripts SQL para replicar la estructura de base de datos.

---

## 3. Características Funcionales

### 3.1 Gestión de Empleados y Tarifas
*   **Perfil del Empleado:** Gestión de datos personales (Nombre, Teléfono, Dirección) y fecha de alta para cálculo de antigüedad.
*   **Configuración de Tarifas:**
    *   Permite definir un valor hora base y un valor de viático por día.
    *   **Cálculo Automático de Antigüedad:** El sistema calcula automáticamente un incremento del **1% por año** de antigüedad sobre el valor hora base.

### 3.2 Motor de Pagos
El sistema soporta tres tipos de transacciones financieras:

1.  **Pago por Trabajo (Sueldo):**
    *   Input: Fecha, Horas trabajadas, Asistencia (Sí/No).
    *   Lógica: `(Horas * ValorHoraConAntiguedad) + Viático`.
    *   Si el empleado no asiste, el costo es 0 pero queda el registro.

2.  **Aporte Mensual (Contribuciones):**
    *   Registro manual del pago del VEP (Volante Electrónico de Pago) a la seguridad social.
    *   Se asocia a un mes y año específico para control fiscal.

3.  **Aguinaldo (SAC - Sueldo Anual Complementario):**
    *   **Detección de Semestre:** Automáticamente determina si se está liquidando Junio (Semestre 1) o Diciembre (Semestre 2).
    *   **Algoritmo de Cálculo:**
        1.  Busca todos los pagos de tipo 'trabajo' en el semestre correspondiente.
        2.  Calcula el sueldo mensual (sin viáticos) para cada mes.
        3.  Identifica el **"Mejor Sueldo"** del semestre.
        4.  Calcula el 50% de ese valor como monto sugerido a pagar.
    *   Estado: Controla si el aguinaldo ya fue pagado o está pendiente.

### 3.3 Módulo ARCA (Ex AFIP)
Herramienta de ayuda para la deducción de ganancias del empleador.
*   **Deducción Personal Doméstico:** Agrupa automáticamente los montos pagados en concepto de sueldos y contribuciones por mes, listos para cargar en el formulario web de ARCA.
*   **Gastos de Educación:**
    *   Permite registrar facturas de colegios privados.
    *   Valida formato de comprobantes (Punto de Venta - Número).
    *   Valida CUIT del colegio (Configurado por defecto).

### 3.4 Utilidades de Sistema
*   **Backup & Restore:** Permite descargar toda la base de datos local en un archivo `.json` y restaurarla en otro dispositivo. Fundamental para la portabilidad en modo offline.
*   **Historial y Reportes:** Tablas con filtros por fecha y tipo de pago para auditoría.

---

## 4. Modelo de Datos (Entidades)

### Empleado
```typescript
interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  notas: string;
  anioAlta: number;
}
```

### Tarifa
```typescript
interface Tarifa {
  id: string;
  empleadoId: string;
  valorHora: number;
  valorViatico: number;
  antiguedad: number; // Porcentaje calculado (ej: 5 para 5%)
}
```

### Pago
```typescript
interface Pago {
  id: string;
  empleadoId: string;
  fecha: string; // ISO Date
  tipoPago: 'trabajo' | 'aporte' | 'aguinaldo';
  total: number;
  // Campos específicos según tipoPago...
  horasTrabajadas?: number;
  valorHoraConAntiguedad: number;
  semestreAguinaldo?: 1 | 2;
  montoCalculado?: number; // Para aguinaldo
}
```

### ComprobanteEducacion
```typescript
interface ComprobanteEducacion {
  id: string;
  fecha: string;
  tipoFactura: 'A' | 'B' | 'C';
  numeroComprobante: string; // Formato 0000-00000000
  monto: number;
}
```
