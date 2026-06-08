# SISTRA-TEC — Sistema de Trazabilidad de Donaciones

Aplicación web para registrar y **rastrear donaciones en tiempo real** (medicamentos, fondos y ropa) durante esfuerzos de ayuda ante desastres naturales, garantizando transparencia desde la recepción hasta la entrega.

Proyecto del curso **Administración de Proyectos II** (TEC). Frontend en React + Vite conectado a **Supabase** (Postgres + Auth + Storage + Realtime).

---

## Funcionalidades implementadas

- **Página pública** (sin sesión): registrar una donación y **rastrearla por código** (`DON-001`) con su línea de tiempo de trazabilidad.
- **Autenticación** con Supabase Auth y **3 roles**:
  - **Donante** — panel con sus propias donaciones y su seguimiento.
  - **Administrador** — ve todas las donaciones, las clasifica y avanza su estado.
  - **Repartidor** — entrega las donaciones físicas (con foto de comprobante obligatoria).
- **Máquina de estados** de la donación: `Recibido → Clasificado → En Tránsito → Entregado` (los fondos monetarios no pasan por reparto físico).
- **Trazabilidad** completa: cada cambio de estado guarda un evento (fecha, responsable, notas, imagen).
- **Imágenes** (del bien y del comprobante de entrega) almacenadas en **Supabase Storage**.
- **Tiempo real**: los cambios de estado se reflejan sin recargar (Supabase Realtime).
- **Perfil de usuario** editable (nombre, teléfono, correo y contraseña).

---

## Stack

React 18 · TypeScript · Vite 6 · React Router 7 · Tailwind CSS v4 · shadcn/ui · lucide-react · **@supabase/supabase-js**.

---

## Puesta en marcha

### 1. Instalar dependencias
```bash
npm i
```

### 2. Variables de entorno
Copia `.env.example` a `.env` y completa con los datos de tu proyecto Supabase:
```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```
> Solo las variables con prefijo `VITE_` se exponen al frontend. **Nunca** pongas la `service_role` key ni el `JWT_SECRET` en el código del cliente.

### 3. Configurar la base de datos (Supabase)
En **Supabase → SQL Editor**, ejecuta en orden:
1. `db/migracion_bloque_a.sql` — tablas/columnas, enums, triggers, políticas RLS y GRANTs.
2. `db/migracion_bloque_b5_storage.sql` — bucket público `donaciones` y sus políticas.

Luego, en el panel de Supabase:
- **Authentication → Providers → Email**: desactiva *"Confirm email"* (para desarrollo).
- **Database → Replication**: habilita Realtime para `donaciones` e `historial_donaciones` (o por SQL: `alter publication supabase_realtime add table public.donaciones, public.historial_donaciones;`).

### 4. Ejecutar
```bash
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción → dist/
```

---

## Cuentas de prueba

Usuarios de prueba ya creados (contraseña: `12345678`):

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Donante | `donante@gmail.com` | `12345678` |
| Administrador | `administrador@gmail.com` | `12345678` |
| Repartidor | `repartidor@gmail.com` | `12345678` |

> Son credenciales de prueba para desarrollo. No usar en producción.

---

## Estructura del proyecto

```
src/
├── main.tsx                     # punto de entrada
├── app/
│   ├── App.tsx                  # providers + rutas
│   ├── context/
│   │   ├── AuthContext.tsx      # Supabase Auth + roles
│   │   └── DonacionContext.tsx  # donaciones + trazabilidad + Realtime
│   ├── lib/
│   │   ├── supabaseClient.ts    # cliente de Supabase
│   │   ├── mappers.ts           # traducción BD ↔ frontend
│   │   └── storage.ts           # subida de imágenes a Storage
│   └── components/              # páginas, paneles por rol y UI (shadcn/ui)
└── styles/                      # Tailwind + tema
db/                              # migraciones SQL para Supabase
```

---