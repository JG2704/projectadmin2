import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  id: string;
  categoria: CategoriaDonacion;
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
  crearDonacion: (donacion: Omit<Donacion, 'id' | 'fechaCreacion' | 'estadoActual' | 'trazabilidad'>) => Donacion;
  buscarDonacion: (id: string) => Donacion | undefined;
  actualizarEstadoDonacion: (id: string, nuevoEstado: EstadoDonacion, descripcion: string, responsable: string, imagenEntrega?: string) => void;
  clasificarDonacion: (id: string, estadoArticulo: EstadoArticulo, responsable: string) => void;
}

const STORAGE_KEY = 'sistra-donaciones';
const SYNC_EVENT = 'sistra-donaciones-updated';

const DonacionContext = createContext<DonacionContextType | undefined>(undefined);

const loadDonacionesFromStorage = (): Donacion[] | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as Donacion[];
  } catch {
    return null;
  }
};

const generarNuevoId = (donaciones: Donacion[]): string => {
  const maxNum = donaciones.reduce((max, d) => {
    const match = d.id.match(/DON-(\d+)/i);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `DON-${String(maxNum + 1).padStart(3, '0')}`;
};

export const DonacionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);

  const persistDonaciones = (nuevasDonaciones: Donacion[]) => {
    setDonaciones(nuevasDonaciones);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasDonaciones));
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: nuevasDonaciones })
    );
  };

  useEffect(() => {
    const savedDonaciones = loadDonacionesFromStorage();
    if (savedDonaciones) {
      setDonaciones(savedDonaciones);
    } else {
      // Datos de ejemplo
      const ejemploDonaciones: Donacion[] = [
        {
          id: 'DON-001',
          categoria: 'medicamentos',
          nombreObjeto: 'Medicamentos varios',
          cantidad: '50',
          descripcion: 'Analgésicos y antibióticos',
          estadoArticulo: 'excelente',
          donante: {
            nombre: 'María Rodríguez',
            cedula: '1-1234-5678',
            email: 'maria@example.com',
            telefono: '8888-8888',
          },
          fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          estadoActual: 'entregado',
          trazabilidad: [
            {
              id: '1',
              fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              estado: 'recibido',
              descripcion: 'Donación recibida en centro de acopio',
              ubicacion: 'San José Centro',
              responsable: 'Sistema',
            },
            {
              id: '2',
              fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              estado: 'clasificado',
              descripcion: 'Su objeto donado ha sido clasificado, está listo para que un mensajero asuma la entrega. Puede seguir consultado para estar informado de su donación',
              ubicacion: 'San José Centro',
              responsable: 'Admin Principal',
            },
            {
              id: '3',
              fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              estado: 'en_transito',
              descripcion: 'En camino a zona afectada',
              ubicacion: 'Ruta 32',
              responsable: 'Carlos Transportista',
            },
            {
              id: '4',
              fecha: new Date().toISOString(),
              estado: 'entregado',
              descripcion: 'Entregado a beneficiarios en Limón',
              ubicacion: 'Limón',
              responsable: 'Carlos Transportista',
            },
          ],
        },
        {
          id: 'DON-002',
          categoria: 'ropa',
          nombreObjeto: 'Ropa de abrigo',
          cantidad: '100',
          descripcion: 'Ropa de abrigo y calzado',
          estadoArticulo: 'bueno',
          donante: {
            nombre: 'Juan Pérez',
            cedula: '2-2345-6789',
            telefono: '7777-7777',
          },
          fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          estadoActual: 'en_transito',
          trazabilidad: [
            {
              id: '1',
              fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              estado: 'recibido',
              descripcion: 'Donación recibida en centro de acopio',
              ubicacion: 'Cartago',
              responsable: 'Sistema',
            },
            {
              id: '2',
              fecha: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              estado: 'clasificado',
              descripcion: 'Su objeto donado ha sido clasificado, está listo para que un mensajero asuma la entrega. Puede seguir consultado para estar informado de su donación',
              ubicacion: 'Cartago',
              responsable: 'Admin Principal',
            },
            {
              id: '3',
              fecha: new Date().toISOString(),
              estado: 'en_transito',
              descripcion: 'En ruta hacia Guanacaste',
              ubicacion: 'Autopista General Cañas',
              responsable: 'Ana Transportista',
            },
          ],
        },
        {
          id: 'DON-003',
          categoria: 'fondos',
          nombreObjeto: 'Donación monetaria',
          cantidad: '50000',
          descripcion: 'Aporte para compra de alimentos',
          donante: {
            nombre: 'Carlos Jiménez',
            cedula: '3-3456-7890',
            email: 'carlos@example.com',
          },
          fechaCreacion: new Date().toISOString(),
          estadoActual: 'recibido',
          trazabilidad: [
            {
              id: '1',
              fecha: new Date().toISOString(),
              estado: 'recibido',
              descripcion: 'Donación monetaria recibida',
              responsable: 'Sistema',
            },
          ],
        },
      ];
      persistDonaciones(ejemploDonaciones);
    }

    const syncFromStorage = () => {
      const stored = loadDonacionesFromStorage();
      if (stored) setDonaciones(stored);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFromStorage();
    };

    const onCustomSync = (e: Event) => {
      const custom = e as CustomEvent<Donacion[]>;
      if (custom.detail) setDonaciones(custom.detail);
      else syncFromStorage();
    };

    const onFocus = () => syncFromStorage();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncFromStorage();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(SYNC_EVENT, onCustomSync);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SYNC_EVENT, onCustomSync);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const crearDonacion = (donacion: Omit<Donacion, 'id' | 'fechaCreacion' | 'estadoActual' | 'trazabilidad'>): Donacion => {
    const stored = loadDonacionesFromStorage() ?? donaciones;
    const nuevoId = generarNuevoId(stored);
    const fechaCreacion = new Date().toISOString();

    const nuevaDonacion: Donacion = {
      ...donacion,
      id: nuevoId,
      fechaCreacion,
      estadoActual: 'recibido',
      trazabilidad: [
        {
          id: '1',
          fecha: fechaCreacion,
          estado: 'recibido',
          descripcion: 'Donación registrada en el sistema',
          ubicacion: 'Centro de Acopio Principal',
          responsable: 'Sistema',
        },
      ],
    };

    const nuevasDonaciones = [...stored, nuevaDonacion];
    persistDonaciones(nuevasDonaciones);

    return nuevaDonacion;
  };

  const buscarDonacion = (id: string): Donacion | undefined => {
    const actuales = loadDonacionesFromStorage() ?? donaciones;
    return actuales.find(d => d.id.toLowerCase() === id.toLowerCase());
  };

  const actualizarEstadoDonacion = (
    id: string,
    nuevoEstado: EstadoDonacion,
    descripcion: string,
    responsable: string,
    imagenEntrega?: string
  ) => {
    const actuales = loadDonacionesFromStorage() ?? donaciones;
    const donacionIndex = actuales.findIndex(d => d.id === id);
    if (donacionIndex === -1) return;

    const donacionActualizada = { ...actuales[donacionIndex] };
    donacionActualizada.estadoActual = nuevoEstado;

    const nuevoEvento: EventoTrazabilidad = {
      id: String(donacionActualizada.trazabilidad.length + 1),
      fecha: new Date().toISOString(),
      estado: nuevoEstado,
      descripcion,
      responsable,
      imagenEntrega,
    };

    donacionActualizada.trazabilidad.push(nuevoEvento);

    const nuevasDonaciones = [...actuales];
    nuevasDonaciones[donacionIndex] = donacionActualizada;

    persistDonaciones(nuevasDonaciones);
  };

  const clasificarDonacion = (id: string, estadoArticulo: EstadoArticulo, responsable: string) => {
    const actuales = loadDonacionesFromStorage() ?? donaciones;
    const donacionIndex = actuales.findIndex(d => d.id === id);
    if (donacionIndex === -1) return;

    const donacionActualizada = { ...actuales[donacionIndex] };
    donacionActualizada.estadoArticulo = estadoArticulo;
    donacionActualizada.estadoActual = 'clasificado';

    const nuevoEvento: EventoTrazabilidad = {
      id: String(donacionActualizada.trazabilidad.length + 1),
      fecha: new Date().toISOString(),
      estado: 'clasificado',
      descripcion: 'Su objeto donado ha sido clasificado, está listo para que un mensajero asuma la entrega. Puede seguir consultado para estar informado de su donación',
      responsable,
    };

    donacionActualizada.trazabilidad.push(nuevoEvento);

    const nuevasDonaciones = [...actuales];
    nuevasDonaciones[donacionIndex] = donacionActualizada;

    persistDonaciones(nuevasDonaciones);
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
