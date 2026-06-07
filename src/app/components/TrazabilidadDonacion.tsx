import React from 'react';
import { Donacion } from '../context/DonacionContext';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface Props {
  donacion: Donacion;
}

export const TrazabilidadDonacion: React.FC<Props> = ({ donacion }) => {
  const estadoConfig = {
    recibido: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      iconBg: 'bg-blue-100',
      icon: Package,
      label: 'Recibido'
    },
    clasificado: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-700',
      iconBg: 'bg-purple-100',
      icon: CheckCircle,
      label: 'Clasificado'
    },
    en_transito: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      iconBg: 'bg-orange-100',
      icon: Truck,
      label: 'En Tránsito'
    },
    entregado: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
      iconBg: 'bg-green-100',
      icon: CheckCircle,
      label: 'Entregado'
    },
  };

  const config = estadoConfig[donacion.estadoActual];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={config.textColor} size={32} />
          <div>
            <h3 className="text-xl">Estado Actual: {config.label}</h3>
            <p className="text-sm text-gray-600">ID: {donacion.id}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Categoría:</span>
            <span className="ml-2 capitalize">{donacion.categoria}</span>
          </div>
          <div>
            <span className="text-gray-600">Objeto:</span>
            <span className="ml-2">{donacion.nombreObjeto}</span>
          </div>
          <div>
            <span className="text-gray-600">Cantidad:</span>
            <span className="ml-2">{donacion.cantidad}</span>
          </div>
          {donacion.estadoArticulo && (
            <div>
              <span className="text-gray-600">Estado del artículo:</span>
              <span className="ml-2 capitalize">{donacion.estadoArticulo}</span>
            </div>
          )}
          <div className="md:col-span-2">
            <span className="text-gray-600">Descripción:</span>
            <span className="ml-2">{donacion.descripcion}</span>
          </div>
        </div>
        {donacion.imagenObjeto && (
          <div className="mt-4">
            <img
              src={donacion.imagenObjeto}
              alt="Imagen del objeto donado"
              className="max-w-md rounded-lg border"
            />
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-4">Historial de Trazabilidad</h4>
        <div className="space-y-4">
          {donacion.trazabilidad.map((evento, index) => {
            const eventoConfig = estadoConfig[evento.estado];
            const EventoIcon = eventoConfig.icon;
            const isUltimo = index === donacion.trazabilidad.length - 1;

            return (
              <div key={evento.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${eventoConfig.iconBg} flex items-center justify-center`}>
                    <EventoIcon className={eventoConfig.textColor} size={20} />
                  </div>
                  {!isUltimo && <div className="w-0.5 flex-1 bg-gray-300 my-1" />}
                </div>

                <div className={`flex-1 pb-4 ${!isUltimo ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${eventoConfig.badgeBg} ${eventoConfig.badgeText}`}>
                      {eventoConfig.label}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(evento.fecha).toLocaleString('es-CR')}
                    </span>
                  </div>
                  <p className="text-gray-800">{evento.descripcion}</p>
                  {evento.ubicacion && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {evento.ubicacion}
                    </p>
                  )}
                  {evento.responsable && (
                    <p className="text-sm text-gray-600">
                      👤 {evento.responsable}
                    </p>
                  )}
                  {evento.imagenEntrega && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Comprobante de entrega:</p>
                      <img
                        src={evento.imagenEntrega}
                        alt="Comprobante de entrega"
                        className="max-w-md rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="mb-2">Información del Donante</h4>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-gray-600">Nombre:</span> {donacion.donante.nombre}
          </p>
          <p>
            <span className="text-gray-600">Cédula:</span> {donacion.donante.cedula}
          </p>
          {donacion.donante.email && (
            <p>
              <span className="text-gray-600">Email:</span> {donacion.donante.email}
            </p>
          )}
          {donacion.donante.telefono && (
            <p>
              <span className="text-gray-600">Teléfono:</span> {donacion.donante.telefono}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
