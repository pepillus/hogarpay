# Reglas para Agentes de Desarrollo (AI Guidelines)

Este documento establece las reglas y directrices que debe seguir cualquier agente de Inteligencia Artificial (o desarrollador humano) que continúe el desarrollo o mantenimiento de **HogarPay Manager**.

## 1. Integridad de la Arquitectura de Datos (CRÍTICO)

### Regla 1.1: Prohibido el Acceso Directo
**NUNCA** importes ni utilices funciones directamente desde `lib/storage.ts` (LocalStorage) o `@supabase/supabase-js` dentro de los componentes de UI (`src/components/*` o `src/pages/*`).

### Regla 1.2: Uso del Adaptador Asíncrono
**SIEMPRE** debes utilizar las funciones exportadas en `src/lib/storage-async.ts`.
*   ✅ `getEmpleadosAsync()`
*   ✅ `savePagoAsync()`
*   ❌ `getEmpleados()` (síncrono)
*   ❌ `supabase.from('empleados').select('*')`

**Por qué:** Este adaptador garantiza que la aplicación funcione indistintamente en modo Local o Nube. Romper esta regla fragmentará la aplicación y hará que deje de funcionar para usuarios offline u online.

## 2. Lógica de Negocio Inmutable

### Regla 2.1: Cálculo de Antigüedad
No modifiques la fórmula de cálculo de antigüedad a menos que se especifique explícitamente un cambio en la legislación.
*   **Fórmula actual:** 1% de incremento sobre el valor hora base por cada año de antigüedad.

### Regla 2.2: Cálculo de Aguinaldo
El algoritmo de "Mejor Sueldo del Semestre" es crítico.
*   Semestre 1: Diciembre (año anterior) a Mayo.
*   Semestre 2: Junio a Noviembre.
*   Base de cálculo: Solo horas trabajadas (excluye viáticos y aportes).

### Regla 2.3: Paridad SQL vs Local
Si agregas una nueva funcionalidad que requiere persistencia:
1.  Debes implementarla en `lib/storage.ts` para LocalStorage.
2.  Debes crear la migración SQL correspondiente en `supabase/migrations` para Supabase.
3.  Debes actualizar `lib/storage-async.ts` para manejar ambas fuentes.

## 3. Estándares de UI/UX

### Regla 3.1: Sistema de Diseño
Utiliza exclusivamente **Tailwind CSS** y los componentes de **Shadcn UI** existentes en `src/components/ui`.
*   No introduzcas nuevas librerías de estilos (Bootstrap, Material UI, Styled Components).
*   Mantén la consistencia visual (colores `hogar-*`, espaciados, bordes redondeados).

### Regla 3.2: Feedback al Usuario
*   Usa `sonner` (`toast`) para notificaciones de éxito o error.
*   Usa iconos de `lucide-react`.
*   Implementa estados de carga (`loading`) visibles en botones y tablas durante operaciones asíncronas.

## 4. Calidad de Código y Tipado

### Regla 4.1: TypeScript Strict
*   No uses `any`. Define interfaces claras en `src/types/index.ts`.
*   Si modificas una entidad, actualiza su definición de tipo globalmente.

### Regla 4.2: Gestión de Estado
*   Prefiere `React Hook Form` + `Zod` para formularios complejos.
*   Mantén los componentes pequeños y enfocados (Principio de Responsabilidad Única).

## 5. Flujo de Trabajo Recomendado
1.  **Analizar:** Antes de codificar, lee `types/index.ts` y `lib/storage-async.ts`.
2.  **Implementar Lógica:** Agrega las funciones de datos en `storage.ts` y `storage-async.ts`.
3.  **Implementar UI:** Crea los componentes visuales.
4.  **Verificar:** Asegúrate de que funcione sin errores de compilación y que respete el modo dual (local/nube).
