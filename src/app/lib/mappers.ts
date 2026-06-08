import {
  Donacion,
  EventoTrazabilidad,
  EstadoDonacion,
  CategoriaDonacion,
  EstadoArticulo,
} from '../context/DonacionContext';
import { UserRole } from '../context/AuthContext';

// ============================================================
// Capa de traducción entre la base de datos (Supabase) y los
// tipos que ya usa el frontend. Solo "estado" y "rol" tienen
// valores distintos; "categoria" y "estado_articulo" coinciden.
// ============================================================

// ---- Valores EXACTOS de los enums en la BD ----
export type EstadoDonacionDB = 'Recibido' | 'Clasificado' | 'En Tránsito' | 'Entregado';
export type TipoRolDB = 'Administrador de Centro' | 'Transportista' | 'Donante';

// ---- Filas tal como vienen de la base de datos ----
export interface DonacionRow {
  id: string;                 // uuid (PK interna)
  codigo: string;             // DON-001 (id visible para el usuario)
  descripcion_bienes: string;
  estado: EstadoDonacionDB;
  categoria: CategoriaDonacion | null;
  organizacion: string | null;
  nombre_objeto: string | null;
  cantidad: string | null;
  estado_articulo: EstadoArticulo | null;
  imagen_objeto: string | null;
  donante_nombre: string | null;
  donante_cedula: string | null;
  donante_email: string | null;
  donante_telefono: string | null;
  donante_id: string | null;
  centro_acopio_id: string | null;
  transportista_id: string | null;
  actualizado_en: string;
  creado_en: string;
}

export interface HistorialRow {
  id: string;
  donacion_id: string;
  estado_anterior: EstadoDonacionDB | null;
  estado_nuevo: EstadoDonacionDB;
  notas_trazabilidad: string | null;
  ubicacion: string | null;
  responsable: string | null;
  imagen_entrega: string | null;
  creado_en: string;
}

export interface PerfilRow {
  id: string;
  nombre_completo: string;
  rol: TipoRolDB;
  telefono: string | null;
  creado_en: string;
}

// ---- Estado: frontend <-> BD ----
const ESTADO_A_DB: Record<EstadoDonacion, EstadoDonacionDB> = {
  recibido: 'Recibido',
  clasificado: 'Clasificado',
  en_transito: 'En Tránsito',
  entregado: 'Entregado',
};
const ESTADO_DESDE_DB: Record<EstadoDonacionDB, EstadoDonacion> = {
  Recibido: 'recibido',
  Clasificado: 'clasificado',
  'En Tránsito': 'en_transito',
  Entregado: 'entregado',
};
export const estadoADB = (e: EstadoDonacion): EstadoDonacionDB => ESTADO_A_DB[e];
export const estadoDesdeDB = (e: EstadoDonacionDB): EstadoDonacion => ESTADO_DESDE_DB[e];

// ---- Rol: frontend <-> BD ----
const ROL_A_DB: Record<UserRole, TipoRolDB> = {
  admin: 'Administrador de Centro',
  transportista: 'Transportista',
  donante: 'Donante',
};
export const rolADB = (r: UserRole): TipoRolDB => ROL_A_DB[r];
export const rolDesdeDB = (r: TipoRolDB): UserRole | null => {
  if (r === 'Administrador de Centro') return 'admin';
  if (r === 'Transportista') return 'transportista';
  if (r === 'Donante') return 'donante';
  return null;
};

// ---- Trazabilidad: fila de historial -> evento del frontend ----
export const eventoDesdeDB = (h: HistorialRow): EventoTrazabilidad => ({
  id: h.id,
  fecha: h.creado_en,
  estado: estadoDesdeDB(h.estado_nuevo),
  descripcion: h.notas_trazabilidad ?? '',
  ubicacion: h.ubicacion ?? undefined,
  responsable: h.responsable ?? undefined,
  imagenEntrega: h.imagen_entrega ?? undefined,
});

// ---- Donación: fila(s) de BD -> objeto del frontend ----
export const donacionDesdeDB = (d: DonacionRow, historial: HistorialRow[] = []): Donacion => ({
  id: d.codigo,
  uuid: d.id,
  donanteId: d.donante_id ?? undefined,
  categoria: (d.categoria ?? 'medicamentos') as CategoriaDonacion,
  organizacion: d.organizacion ?? '',
  nombreObjeto: d.nombre_objeto ?? d.descripcion_bienes,
  cantidad: d.cantidad ?? '',
  descripcion: d.descripcion_bienes,
  estadoArticulo: d.estado_articulo ?? undefined,
  imagenObjeto: d.imagen_objeto ?? undefined,
  donante: {
    nombre: d.donante_nombre ?? '',
    cedula: d.donante_cedula ?? '',
    email: d.donante_email ?? undefined,
    telefono: d.donante_telefono ?? undefined,
  },
  fechaCreacion: d.creado_en,
  estadoActual: estadoDesdeDB(d.estado),
  trazabilidad: historial
    .slice()
    .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime())
    .map(eventoDesdeDB),
});
