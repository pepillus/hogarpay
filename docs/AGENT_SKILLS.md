# Perfil de Habilidades para Agentes (Agent Skills)

Para escalar este proyecto, realizar refactorizaciones mayores o agregar módulos complejos, el agente de IA debe poseer las siguientes capacidades y conocimientos técnicos.

## 1. Dominio Técnico (Tech Stack Mastery)

### React & Ecosistema Moderno
*   **Hooks Avanzados:** Capacidad para manejar lógica compleja de sincronización y efectos secundarios con `useEffect`, `useCallback` y Custom Hooks.
*   **Context API:** Entendimiento profundo de cómo gestionar el estado global (como la sesión de usuario en `AuthContext`) sin prop-drilling.
*   **Performance:** Habilidad para identificar renderizados innecesarios y optimizar con `useMemo` o `React.memo` si la lista de pagos crece significativamente.

### TypeScript & Zod
*   **Tipado Estricto:** Capacidad para definir tipos genéricos, uniones discriminadas y utilidades de tipos (`Pick`, `Omit`, `Partial`) para manipular datos de forma segura.
*   **Validación en Tiempo de Ejecución:** Dominio de `Zod` para validar esquemas de formularios y datos provenientes de APIs o LocalStorage, asegurando que no corrompan la aplicación.

### Arquitectura Offline-First
*   **Estrategias de Sincronización:** Conocimiento sobre cómo implementar colas de sincronización (Sync Queues) y resolución de conflictos (Last-Write-Wins) para mejorar la experiencia híbrida en el futuro.
*   **Service Workers:** Conocimiento básico de PWA para mejorar las capacidades offline (caching de assets).

## 2. Conocimiento de Dominio (Business Logic)

### Legislación Laboral Argentina (Régimen Casas Particulares)
*   **Conceptos Clave:**
    *   SAC (Sueldo Anual Complementario).
    *   Vacaciones no gozadas (cálculo proporcional).
    *   Indemnización por antigüedad.
    *   Zona desfavorable (adicional por zona geográfica).
*   **Escalas Salariales:** Capacidad para interpretar e implementar actualizaciones de escalas salariales oficiales si se decidiera automatizar esa parte.

### Normativa Fiscal (ARCA/AFIP)
*   **Facturación Electrónica:** Entendimiento de los tipos de comprobantes (A, B, C) y sus validaciones.
*   **Deducciones de Ganancias:** Conocimiento sobre los topes y requisitos para deducir personal doméstico y gastos educativos.

## 3. Habilidades de Base de Datos y Backend

### SQL & PostgreSQL (Supabase)
*   **RLS (Row Level Security):** Capacidad para escribir políticas de seguridad en Supabase para asegurar que cada usuario solo vea sus propios datos (Multi-tenancy).
*   **Funciones y Triggers:** Habilidad para escribir lógica en PL/pgSQL si se requiere mover cálculos complejos del frontend al backend.

### Migraciones de Datos
*   Capacidad para escribir scripts que transformen estructuras de datos antiguas a nuevas versiones sin perder información del usuario (especialmente crítico en `localStorage`).

## 4. UX/UI Design System
*   **Component Composition:** Habilidad para crear interfaces complejas combinando componentes atómicos de Shadcn UI (Dialogs dentro de Dropdowns, Tablas con acciones, etc.).
*   **Responsive Design:** Asegurar que todas las nuevas pantallas sean perfectamente funcionales en dispositivos móviles.
