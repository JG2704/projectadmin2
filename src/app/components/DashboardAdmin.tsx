import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDonaciones, Donacion, EstadoDonacion, EstadoArticulo } from '../context/DonacionContext';
import { Heart } from 'lucide-react';
import { TrazabilidadDonacion } from './TrazabilidadDonacion';
import { DashboardLayout } from './DashboardLayout';

export const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const { donaciones, actualizarEstadoDonacion, clasificarDonacion } = useDonaciones();
  const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null);
  const [mostrarModalClasificar, setMostrarModalClasificar] = useState(false);
  const [searchId, setSearchId] = useState('');

  const donacionesBuscadas = searchId
    ? donaciones.filter(d =>
        d.id.toLowerCase().includes(searchId.toLowerCase()) ||
        d.nombreObjeto.toLowerCase().includes(searchId.toLowerCase())
      )
    : donaciones;

  const getEstadoEtiqueta = (estado: EstadoDonacion): string => {
    if (estado === 'recibido') return 'Recibido';
    if (estado === 'clasificado') return 'Clasificado';
    if (estado === 'en_transito') return 'En tránsito';
    return 'Entregado';
  };

  const getProximoEstado = (estadoActual: EstadoDonacion): EstadoDonacion | null => {
    if (estadoActual === 'recibido') return 'clasificado';
    if (estadoActual === 'clasificado') return 'en_transito';
    if (estadoActual === 'en_transito') return 'entregado';
    return null;
  };

  const getBotonTexto = (estadoActual: EstadoDonacion): string => {
    if (estadoActual === 'recibido') return 'Calificar';
    if (estadoActual === 'clasificado') return 'Poner en Tránsito';
    if (estadoActual === 'en_transito') return 'Marcar Entregado';
    return '';
  };

  return (
    <DashboardLayout rolLabel="Administrador">
        <div className="bg-gradient-to-r from-purple-400 via-purple-500 to-orange-400 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="relative h-64 flex flex-col justify-center items-center text-center px-8 pt-12 pb-8">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C40 15 35 25 35 35C35 50 45 60 50 70C55 60 65 50 65 35C65 25 60 15 50 10Z" fill="currentColor" className="text-white" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-black flex items-center justify-center gap-3 mb-6">
              <Heart size={40} fill="currentColor" className="text-blue-600" />
              Administración de donaciones
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
                donacionesBuscadas.map((donacion) => {
                  const proximoEstado = getProximoEstado(donacion.estadoActual);
                  const esMonetaria = donacion.categoria === 'fondos';
                  const puedeCalificar = donacion.estadoActual === 'recibido' && !esMonetaria;

                  return (
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

                        {puedeCalificar && (
                          <button
                            onClick={() => {
                              setDonacionSeleccionada(donacion);
                              setMostrarModalClasificar(true);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                          >
                            Calificar
                          </button>
                        )}

                        {proximoEstado && !esMonetaria && !puedeCalificar && (
                          <button
                            onClick={() => {
                              actualizarEstadoDonacion(
                                donacion.id,
                                proximoEstado,
                                `Cambiado a estado: ${proximoEstado}`,
                                user?.nombreCompleto || 'Admin'
                              );
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                          >
                            {getBotonTexto(donacion.estadoActual)}
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
                  );
                })
              )}
            </div>
          </div>
        </div>

      {donacionSeleccionada && !mostrarModalClasificar && (
        <ModalDetalle
          donacion={donacionSeleccionada}
          onCerrar={() => setDonacionSeleccionada(null)}
        />
      )}

      {mostrarModalClasificar && donacionSeleccionada && (
        <ModalClasificar
          donacion={donacionSeleccionada}
          onCerrar={() => {
            setMostrarModalClasificar(false);
            setDonacionSeleccionada(null);
          }}
          onClasificar={clasificarDonacion}
          nombreUsuario={user?.nombreCompleto || 'Admin'}
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

const ModalClasificar: React.FC<{
  donacion: Donacion;
  onCerrar: () => void;
  onClasificar: (id: string, estadoArticulo: EstadoArticulo, responsable: string) => void;
  nombreUsuario: string;
}> = ({ donacion, onCerrar, onClasificar, nombreUsuario }) => {
  const [estadoArticulo, setEstadoArticulo] = useState<EstadoArticulo>('bueno');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClasificar(donacion.id, estadoArticulo, nombreUsuario);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-lg max-w-md w-full pointer-events-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl">Clasificar Donación</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Donación: {donacion.id}</p>
            <p className="text-sm text-gray-600">Objeto: {donacion.nombreObjeto}</p>
          </div>

          <div>
            <label className="block mb-2">Estado del Artículo</label>
            <select
              value={estadoArticulo}
              onChange={(e) => setEstadoArticulo(e.target.value as EstadoArticulo)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="excelente">Excelente estado</option>
              <option value="bueno">Buen estado</option>
              <option value="normal">Normal estado</option>
              <option value="malo">Mal estado</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Una vez clasificado, estará listo para que un transportista asuma la entrega
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Clasificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
