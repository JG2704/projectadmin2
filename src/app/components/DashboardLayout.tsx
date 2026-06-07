import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu, ChevronRight, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PerfilUsuario } from './PerfilUsuario';

export type VistaDashboard = 'paquetes' | 'perfil';

interface DashboardLayoutProps {
  rolLabel: string;
  children: React.ReactNode;
  vista?: VistaDashboard;
  onVistaChange?: (vista: VistaDashboard) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  rolLabel,
  children,
  vista: vistaControlada,
  onVistaChange,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [vistaInterna, setVistaInterna] = useState<VistaDashboard>('paquetes');

  const vista = vistaControlada ?? vistaInterna;
  const setVista = (nueva: VistaDashboard) => {
    if (onVistaChange) onVistaChange(nueva);
    else setVistaInterna(nueva);
    setMenuAbierto(false);
  };

  const handleRegresar = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <header className="bg-blue-600 text-white shadow-lg relative z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-6">
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
            <span className="font-semibold hidden sm:inline">{rolLabel}</span>
          </button>
          <h1 className="text-2xl font-bold flex-1 text-center">SISTRA-TEC</h1>
          <button
            onClick={handleRegresar}
            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Regresar
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {menuAbierto && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-blue-600 text-white z-50 shadow-xl pt-20 px-4">
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setVista('paquetes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  vista === 'paquetes' ? 'bg-blue-700' : 'hover:bg-blue-700/70'
                }`}
              >
                <Package size={22} />
                <span className="font-medium">Ver los paquetes</span>
              </button>
              <button
                type="button"
                onClick={() => setVista('perfil')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  vista === 'perfil' ? 'bg-blue-700' : 'hover:bg-blue-700/70'
                }`}
              >
                <User size={22} />
                <span className="font-medium">Editar el perfil</span>
              </button>
            </nav>
            <p className="mt-8 px-4 text-sm text-blue-200">{rolLabel}</p>
          </aside>
        </>
      )}

      <div className="container mx-auto px-4 py-8">
        {vista === 'paquetes' ? children : <PerfilUsuario />}
      </div>
    </div>
  );
};
