import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDonaciones, Donacion, EstadoDonacion, CategoriaDonacion, EstadoArticulo } from '../context/DonacionContext';
import { Upload, Heart } from 'lucide-react';
import { TrazabilidadDonacion } from './TrazabilidadDonacion';
import { DashboardLayout } from './DashboardLayout';
import { subirImagen } from '../lib/storage';

export const DashboardTransportista: React.FC = () => {
  const { user } = useAuth();
  const { donaciones, actualizarEstadoDonacion } = useDonaciones();
  const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null);
  const [mostrarModalEntregar, setMostrarModalEntregar] = useState(false);
  const [searchId, setSearchId] = useState('');

  const donacionesReparto = donaciones.filter(d => d.categoria !== 'fondos');

  const donacionesBuscadas = searchId
    ? donacionesReparto.filter(d =>
        d.id.toLowerCase().includes(searchId.toLowerCase()) ||
        d.nombreObjeto.toLowerCase().includes(searchId.toLowerCase())
      )
    : donacionesReparto;

  const getEstadoEtiqueta = (estado: EstadoDonacion): string => {
    if (estado === 'recibido') return 'Recibido';
    if (estado === 'clasificado') return 'Clasificado';
    if (estado === 'en_transito') return 'En tránsito';
    return 'Entregado';
  };

  return (
    <DashboardLayout rolLabel="Repartidor">
        <div className="bg-gradient-to-r from-purple-400 via-purple-500 to-orange-400 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="relative h-64 flex flex-col justify-center items-center text-center px-8 pt-12 pb-8">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C40 15 35 25 35 35C35 50 45 60 50 70C55 60 65 50 65 35C65 25 60 15 50 10Z" fill="currentColor" className="text-white" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-black flex items-center justify-center gap-3 mb-6">
              <Heart size={40} fill="currentColor" className="text-blue-600" />
              Reparto de donaciones
            </h2>
            <input
              type="text"
              placeholder="Ingrese ID de la donación o nombre"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full max-w-md px-6 py-3 rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h3 className="text-3xl font-bold text-black mb-6">Donaciones</h3>

            <div className="space-y-3">
              {donacionesBuscadas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay donaciones que coincidan con tu búsqueda
                </div>
              ) : (
                donacionesBuscadas.map((donacion) => (
                  <div
                    key={donacion.id}
                    className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between hover:bg-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Heart size={28} fill="currentColor" />
                      <div>
                        <p className="font-semibold text-lg">{donacion.nombreObjeto}</p>
                        <p className="text-sm opacity-90">{donacion.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm opacity-90">
                        {getEstadoEtiqueta(donacion.estadoActual)}
                      </span>

                      {donacion.estadoActual === 'en_transito' && (
                        <button
                          onClick={() => {
                            setDonacionSeleccionada(donacion);
                            setMostrarModalEntregar(true);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Entregar
                        </button>
                      )}

                      <button
                        onClick={() => setDonacionSeleccionada(donacion)}
                        className="text-white hover:opacity-75 transition-opacity ml-2"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      {donacionSeleccionada && !mostrarModalEntregar && (
        <ModalDetalle
          donacion={donacionSeleccionada}
          onCerrar={() => setDonacionSeleccionada(null)}
        />
      )}

      {mostrarModalEntregar && donacionSeleccionada && (
        <ModalEntregar
          donacion={donacionSeleccionada}
          onCerrar={() => {
            setMostrarModalEntregar(false);
            setDonacionSeleccionada(null);
          }}
          onEntregar={actualizarEstadoDonacion}
          nombreUsuario={user?.nombreCompleto || 'Repartidor'}
        />
      )}
    </DashboardLayout>
  );
};

const ModalDetalle: React.FC<{ donacion: Donacion; onCerrar: () => void }> = ({
  donacion,
  onCerrar,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl">Detalle de Donación</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>
        <div className="p-6">
          <TrazabilidadDonacion donacion={donacion} />
        </div>
      </div>
    </div>
  );
};

const getCategoriaLabel = (categoria: CategoriaDonacion): string => {
  if (categoria === 'medicamentos') return 'Medicamentos';
  if (categoria === 'fondos') return 'Fondos monetarios';
  return 'Ropa y Textiles';
};

const getEstadoArticuloLabel = (estado?: EstadoArticulo): string => {
  if (estado === 'excelente') return 'Excelente estado';
  if (estado === 'bueno') return 'Buen estado';
  if (estado === 'normal') return 'Normal estado';
  if (estado === 'malo') return 'Mal estado';
  return 'Sin clasificar';
};

const getCantidadLabel = (donacion: Donacion): string => {
  if (donacion.categoria === 'fondos') return `₡${Number(donacion.cantidad).toLocaleString('es-CR')}`;
  if (donacion.categoria === 'ropa') return `${donacion.cantidad} ${Number(donacion.cantidad) === 1 ? 'unidad' : 'unidades'}`;
  return `${donacion.cantidad} unidades`;
};

const ModalEntregar: React.FC<{
  donacion: Donacion;
  onCerrar: () => void;
  onEntregar: (id: string, estado: EstadoDonacion, descripcion: string, responsable: string, imagen?: string) => void;
  nombreUsuario: string;
}> = ({ donacion, onCerrar, onEntregar, nombreUsuario }) => {
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputId = `imagen-entrega-${donacion.id}`;

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleEntregar = async () => {
    if (!imagenFile) {
      alert('Debe subir una imagen de comprobación de entrega');
      return;
    }
    setSubiendo(true);
    try {
      const urlImagen = await subirImagen(imagenFile, 'entregas');
      await onEntregar(
        donacion.id,
        'entregado',
        `Entrega confirmada de ${donacion.nombreObjeto}`,
        nombreUsuario,
        urlImagen
      );
      onCerrar();
    } catch (error) {
      alert('No se pudo subir la imagen de entrega. Intente nuevamente.');
    } finally {
      setSubiendo(false);
    }
  };

  const imagenReferencia = imagenPreview || donacion.imagenObjeto;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0c1f3d] text-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-4 right-4 text-white hover:opacity-80 text-2xl z-10"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold text-center pt-8 pb-6">Entregar Donación</h3>

        <div className="px-8 pb-8 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Información de la donación</h4>
            <div className="space-y-0 text-sm">
              <InfoRow label="Categoría" value={getCategoriaLabel(donacion.categoria)} />
              <InfoRow label="Artículo" value={donacion.nombreObjeto} />
              <InfoRow label="Descripción" value={donacion.descripcion} />
              <InfoRow label="Cantidad" value={getCantidadLabel(donacion)} />
              {donacion.categoria !== 'fondos' && (
                <InfoRow label="Condición" value={getEstadoArticuloLabel(donacion.estadoArticulo)} />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-white/10 rounded-xl overflow-hidden mb-4 min-h-[220px] flex items-center justify-center">
              {imagenReferencia ? (
                <img
                  src={imagenReferencia}
                  alt="Comprobante de entrega"
                  className="w-full h-full max-h-[280px] object-cover"
                />
              ) : (
                <div className="text-center text-white/60 px-6 py-12">
                  <Upload size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Vista previa de la imagen de entrega</p>
                </div>
              )}
            </div>

            <p className="text-sm text-white/90 mb-4 leading-relaxed">
              Para verificar la entrega del artículo debes subir una imagen del artículo recién entregado.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="hidden"
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className="inline-block w-fit bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-2.5 rounded-lg cursor-pointer transition-colors mb-6"
            >
              Subir imagen
            </label>
          </div>
        </div>

        <div className="flex justify-center pb-8 px-8">
          <button
            type="button"
            onClick={handleEntregar}
            disabled={subiendo}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold text-lg px-16 py-3 rounded-xl transition-colors"
          >
            {subiendo ? 'Entregando…' : 'Entregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="py-3 border-b border-white/25">
    <p className="text-white/70 text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className="text-white font-medium">{value}</p>
  </div>
);
