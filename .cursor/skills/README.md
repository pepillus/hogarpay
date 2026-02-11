# Estructura de Skills para HogarPay

Esta carpeta contiene "habilidades" o procedimientos estandarizados que el agente debe seguir para tareas complejas.

## Estructura de Carpetas

La estructura ideal para organizar los skills es por **tipo de tarea**:

```text
.cursor/
└── skills/
    ├── feature-implementation/   # Cómo crear nuevas funcionalidades end-to-end
    │   └── SKILL.md
    ├── database-migration/       # Cómo alterar datos (Local + SQL)
    │   └── SKILL.md
    ├── ui-component/             # Cómo crear componentes visuales consistentes
    │   └── SKILL.md
    └── business-logic/           # Reglas de cálculo de sueldos/aguinaldos
        └── SKILL.md
```

## Formato de un Skill (SKILL.md)

Cada archivo `SKILL.md` debe tener:
1.  **Descripción:** Qué hace el skill.
2.  **Pasos:** Lista secuencial de acciones.
3.  **Ejemplos:** Snippets de código correctos.

---

### Ejemplo: Skill para Migración de Datos (`database-migration/SKILL.md`)

**Descripción:**
Usar cuando se necesite agregar un nuevo campo a una entidad (ej: Empleado, Pago).

**Pasos:**
1.  **Actualizar Tipo:** Editar `src/types/index.ts` agregando el campo opcional.
2.  **Actualizar LocalStorage:** Editar `src/lib/storage.ts`. Si es necesario, crear una función de migración que recorra los datos viejos y agregue el campo.
3.  **Actualizar Supabase:** Crear un archivo `.sql` en `supabase/migrations/` con el `ALTER TABLE`.
4.  **Actualizar Adaptador:** Verificar que `src/lib/storage-async.ts` mapee correctamente el nuevo campo.
5.  **Actualizar UI:** Modificar los formularios (`zod` schema) y las tablas donde se muestra el dato.
