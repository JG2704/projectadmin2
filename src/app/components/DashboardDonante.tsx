import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useDonaciones, Donacion, EstadoDonacion } from '../context/DonacionContext';
import { Heart, Plus } from 'lucide-react';
import { TrazabilidadDonacion } from './TrazabilidadDonacion';
import { DashboardLayout } from './DashboardLayout';

const getEstadoEtiqueta = (estado: EstadoDonacion): string => {
  if (estado === 'recibido') return 'Recibido';
  if (estado === 'clasificado') return 'Clasificado';
  if (estado === 'en_transito') return 'En tránsito';
  return 'Entregado';
};

export const DashboardDonante: React.FC = () => {
  const { user } = useAuth();
  const { donaciones } = useDonaciones();
  const navigate = useNavigate();
  const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null);
  const [searchId, setSearchId] = useState('');

  const misDonaciones = donaciones.filter((d) => d.donanteId && d.donanteId === user?.id);

  const donacionesBuscadas = searchId
    ? misDonaciones.filter(
        (d) =>
          d.id.toLowerCase().includes(searchId.toLowerCase()) ||
          d.nombreObjeto.toLowerCase().includes(searchId.toLowerCase())
      )
    : misDonaciones;

  return (
    <DashboardLayout rolLabel="Donante">
      <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 rounded-3xl overflow-hidden shadow-xl mb-8">
        <div className="relative h-64 flex flex-col justify-center items-center text-center px-8 pt-12 pb-8">
          <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-6">
            <Heart size={40} fill="currentColor" className="text-white" />
            Mis donaciones
          </h2>
          <input
            type="text"
            placeholder="Buscar por ID o nombre"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full max-w-md px-6 py-3 rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b">
          <h3 className="text-3xl font-bold text-black">Donaciones</h3>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Realizar Donación
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-3">
            {donacionesBuscadas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {misDonaciones.length === 0
                  ? 'Aún no has registrado donaciones. Usa "Realizar Donación" para empezar.'
                  : 'No hay donaciones que coincidan con tu búsqueda'}
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
                    <span className="text-sm opacity-90">{getEstadoEtiqueta(donacion.estadoActual)}</span>
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

      {donacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl">Detalle de Donación</h3>
              <button
                onClick={() => setDonacionSeleccionada(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <TrazabilidadDonacion donacion={donacionSeleccionada} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
