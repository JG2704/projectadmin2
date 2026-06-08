import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { donacionDesdeDB, estadoADB, DonacionRow, HistorialRow } from '../lib/mappers';

export type CategoriaDonacion = 'medicamentos' | 'fondos' | 'ropa';

export type EstadoDonacion = 'recibido' | 'clasificado' | 'en_transito' | 'entregado';

export type EstadoArticulo = 'excelente' | 'bueno' | 'normal' | 'malo';

export interface EventoTrazabilidad {
  id: string;
  fecha: string;
  estado: EstadoDonacion;
  descripcion: string;
  ubicacion?: string;
  responsable?: string;
  imagenEntrega?: string;
}

export interface Donacion {
  id: string;            // código visible (DON-001)
  uuid?: string;         // PK interna de la BD (uuid); se llena al leer desde Supabase
  donanteId?: string;    // id de la cuenta que registró la donación (null si fue anónima)
  categoria: CategoriaDonacion;
  organizacion: string;
  nombreObjeto: string;
  cantidad: string;
  descripcion: string;
  estadoArticulo?: EstadoArticulo;
  imagenObjeto?: string;
  donante: {
    nombre: string;
    cedula: string;
    email?: string;
    telefono?: string;
  };
  fechaCreacion: string;
  estadoActual: EstadoDonacion;
  trazabilidad: EventoTrazabilidad[];
}

interface DonacionContextType {
  donaciones: Donacion[];
  crearDonacion: (donacion: Omit<Donacion, 'id' | 'uuid' | 'donanteId' | 'fechaCreacion' | 'estadoActual' | 'trazabilidad'>) => Promise<Donacion>;
  buscarDonacion: (id: string) => Donacion | undefined;
  actualizarEstadoDonacion: (id: string, nuevoEstado: EstadoDonacion, descripcion: string, responsable: string, imagenEntrega?: string) => Promise<void>;
  clasificarDonacion: (id: string, estadoArticulo: EstadoArticulo, responsable: string) => Promise<void>;
}

// Donación con su trazabilidad embebida (PostgREST devuelve la relación anidada)
type DonacionConHistorial = DonacionRow & { historial_donaciones: HistorialRow[] | null };

const DonacionContext = createContext<DonacionContextType | undefined>(undefined);

export const DonacionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);

  // Trae todas las donaciones con su historial embebido y las traduce al modelo del frontend
  const obtenerDonaciones = async (): Promise<Donacion[]> => {
    const { data, error } = await supabase
      .from('donaciones')
      .select('*, historial_donaciones(*)')
      .order('creado_en', { ascending: true });

    if (error || !data) {
      console.error('Error al cargar donaciones:', error?.message);
      return [];
    }

    return (data as DonacionConHistorial[]).map((row) =>
      donacionDesdeDB(row, row.historial_donaciones ?? [])
    );
  };

  const recargar = async () => {
    setDonaciones(await obtenerDonaciones());
  };

  // Carga inicial + suscripción Realtime a los cambios en ambas tablas
  useEffect(() => {
    recargar();

    const canal = supabase
      .channel('donaciones-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donaciones' }, () => {
        recargar();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historial_donaciones' }, () => {
        recargar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const crearDonacion = async (
    donacion: Omit<Donacion, 'id' | 'uuid' | 'donanteId' | 'fechaCreacion' | 'estadoActual' | 'trazabilidad'>
  ): Promise<Donacion> => {
    // Si hay sesión activa, la donación queda vinculada a esa cuenta (donante)
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('donaciones')
      .insert({
        descripcion_bienes: donacion.descripcion,
        categoria: donacion.categoria,
        organizacion: donacion.organizacion,
        nombre_objeto: donacion.nombreObjeto,
        cantidad: donacion.cantidad,
        estado_articulo: donacion.estadoArticulo ?? null,
        imagen_objeto: donacion.imagenObjeto ?? null,
        donante_nombre: donacion.donante.nombre,
        donante_cedula: donacion.donante.cedula,
        donante_email: donacion.donante.email ?? null,
        donante_telefono: donacion.donante.telefono ?? null,
        donante_id: user?.id ?? null,
      })
      .select('*, historial_donaciones(*)')
      .single();

    if (error || !data) {
      console.error('Error al crear donación:', error?.message);
      throw new Error(error?.message ?? 'No se pudo registrar la donación');
    }

    const fila = data as DonacionConHistorial;
    const nueva = donacionDesdeDB(fila, fila.historial_donaciones ?? []);
    await recargar();
    return nueva;
  };

  // Búsqueda por código (DON-001) sobre lo ya cargado en memoria
  const buscarDonacion = (id: string): Donacion | undefined => {
    return donaciones.find((d) => d.id.toLowerCase() === id.toLowerCase());
  };

  const actualizarEstadoDonacion = async (
    id: string,
    nuevoEstado: EstadoDonacion,
    descripcion: string,
    responsable: string,
    imagenEntrega?: string
  ): Promise<void> => {
    const donacion = donaciones.find((d) => d.id === id);
    if (!donacion?.uuid) return;

    const estadoAnterior = estadoADB(donacion.estadoActual);
    const estadoNuevo = estadoADB(nuevoEstado);

    const { error: errUpdate } = await supabase
      .from('donaciones')
      .update({ estado: estadoNuevo, actualizado_en: new Date().toISOString() })
      .eq('id', donacion.uuid);

    if (errUpdate) {
      console.error('Error al actualizar estado:', errUpdate.message);
      return;
    }

    const { error: errHist } = await supabase.from('historial_donaciones').insert({
      donacion_id: donacion.uuid,
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      notas_trazabilidad: descripcion,
      responsable,
      imagen_entrega: imagenEntrega ?? null,
    });

    if (errHist) console.error('Error al registrar trazabilidad:', errHist.message);

    await recargar();
  };

  const clasificarDonacion = async (
    id: string,
    estadoArticulo: EstadoArticulo,
    responsable: string
  ): Promise<void> => {
    const donacion = donaciones.find((d) => d.id === id);
    if (!donacion?.uuid) return;

    const estadoAnterior = estadoADB(donacion.estadoActual);

    const { error: errUpdate } = await supabase
      .from('donaciones')
      .update({
        estado: 'Clasificado',
        estado_articulo: estadoArticulo,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', donacion.uuid);

    if (errUpdate) {
      console.error('Error al clasificar:', errUpdate.message);
      return;
    }

    const { error: errHist } = await supabase.from('historial_donaciones').insert({
      donacion_id: donacion.uuid,
      estado_anterior: estadoAnterior,
      estado_nuevo: 'Clasificado',
      notas_trazabilidad:
        'Su objeto donado ha sido clasificado, está listo para que un mensajero asuma la entrega. Puede seguir consultado para estar informado de su donación',
      responsable,
    });

    if (errHist) console.error('Error al registrar trazabilidad:', errHist.message);

    await recargar();
  };

  return (
    <DonacionContext.Provider
      value={{
        donaciones,
        crearDonacion,
        buscarDonacion,
        actualizarEstadoDonacion,
        clasificarDonacion,
      }}
    >
      {children}
    </DonacionContext.Provider>
  );
};

export const useDonaciones = () => {
  const context = useContext(DonacionContext);
  if (context === undefined) {
    throw new Error('useDonaciones debe usarse dentro de DonacionProvider');
  }
  return context;
};
