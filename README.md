# HogarPay Manager

Aplicación para gestionar pagos de empleados domésticos.

## 🌐 Opciones de Uso

### Opción 1: Con Supabase (Recomendado - Acceso desde cualquier dispositivo)

La app puede conectarse a Supabase para guardar los datos en la nube y acceder desde PC o celular.

#### Configuración Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a **SQL Editor** y ejecutar:
   ```sql
   create table empleados (
     id uuid primary key default uuid_generate_v4(),
     nombre text not null,
     apellido text not null,
     telefono text not null,
     direccion text not null,
     notas text,
     anio_alta integer not null
   );

   create table tarifas (
     id uuid primary key default uuid_generate_v4(),
     empleado_id uuid references empleados(id) on delete cascade,
     valor_hora numeric not null,
     valor_viatico numeric not null,
     antiguedad integer not null,
     unique(empleado_id)
   );

   create table pagos (
     id uuid primary key default uuid_generate_v4(),
     empleado_id uuid references empleados(id) on delete cascade,
     fecha timestamp with time zone not null,
     valor_hora numeric not null,
     valor_hora_con_antiguedad numeric not null,
     valor_viatico numeric not null,
     antiguedad integer not null,
     total numeric not null,
     asistio boolean not null default true,
     comprobante_pago text,
     tipo_pago text not null default 'trabajo',
     es_aporte boolean default false,
     horas_trabajadas numeric,
     monto_aporte numeric,
     mes integer,
     anio integer
   );
   ```
4. Ir a **Settings > API** y copiar:
   - Project URL
   - anon/public key
5. Crear archivo `.env` con:
   ```
   VITE_SUPABASE_URL=tu-url-de-proyecto
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

### Opción 2: Solo Local (sin internet)

Si no configurás Supabase, la app funciona igual usando localStorage del navegador.

## 🚀 Cómo usar en otra máquina

### Requisitos
- **Node.js** versión 18 o superior ([Descargar aquí](https://nodejs.org/))

### Instalación (solo la primera vez)

1. Copiar toda la carpeta `Hogar-Pay-App` a la otra máquina
2. Abrir una terminal en la carpeta
3. Ejecutar:
   ```
   npm install
   npm run build
   ```

### Uso diario

**Opción A: Doble clic (Recomendado)**
- Hacer doble clic en `Iniciar-HogarPay.bat`
- Se abrirá automáticamente en el navegador

**Opción B: Por terminal**
```
npm start
```

### 📁 Archivos importantes para llevar a otra PC

Solo necesitás copiar estos archivos/carpetas:
- 📁 `dist/` (la app compilada)
- 📁 `node_modules/` (o ejecutar `npm install`)
- 📄 `server.cjs`
- 📄 `Iniciar-HogarPay.bat`
- 📄 `package.json`
- 📄 `.env` (si usás Supabase)

### 💾 Backup de datos

**Con Supabase:** Los datos están en la nube, accesibles desde cualquier dispositivo.

**Sin Supabase:** Los datos se guardan en el navegador (localStorage):
1. Ir a la sección "Respaldo" en la app
2. Exportar un backup JSON
3. En la nueva máquina, importar ese backup

### 🛠️ Desarrollo

Si querés modificar la app:
```
npm run dev
```
Esto inicia el servidor de desarrollo con hot-reload en `http://localhost:3000`

Después de hacer cambios, recompilar:
```
npm run build
```

## 📝 Funcionalidades

- ✅ Gestión de empleados
- ✅ Configuración de tarifas por empleado
- ✅ Registro de pagos (trabajo y aportes)
- ✅ Historial de pagos con filtros
- ✅ Reportes mensuales
- ✅ Sección ARCA para deducciones
- ✅ Backup/Restore de datos
