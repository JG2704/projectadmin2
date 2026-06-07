import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Heart } from 'lucide-react';

export const PerfilUsuario: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoElectronico: '',
    telefono: '',
    contraseña: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombreCompleto: user.nombreCompleto,
        correoElectronico: user.correoElectronico,
        telefono: user.telefono,
        contraseña: '',
      });
    }
  }, [user]);

  const getRolLabel = () => {
    if (!user) return '';
    return user.rol === 'admin' ? 'Administrador' : 'Repartidor';
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!formData.nombreCompleto.trim() || !formData.correoElectronico.trim() || !formData.telefono.trim()) {
      setError('Complete los campos obligatorios');
      return;
    }

    setGuardando(true);
    const ok = await updateProfile({
      nombreCompleto: formData.nombreCompleto.trim(),
      correoElectronico: formData.correoElectronico.trim(),
      telefono: formData.telefono.trim(),
      ...(formData.contraseña ? { contraseña: formData.contraseña } : {}),
    });
    setGuardando(false);

    if (ok) {
      setMensaje('Perfil actualizado correctamente');
      setFormData(prev => ({ ...prev, contraseña: '' }));
    } else {
      setError('No se pudo actualizar. El correo podría estar en uso.');
    }
  };

  const handleSalir = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="text-center mb-8 flex flex-col items-center">
        <Heart size={56} fill="currentColor" className="text-blue-600 mb-2" />
        <h2 className="text-4xl font-bold text-blue-600">SISTRA-TEC</h2>
      </div>

      <div className="w-full max-w-lg bg-blue-50 border-2 border-blue-300 rounded-3xl shadow-lg p-8">
        <h3 className="text-3xl font-bold text-center text-black mb-8">Perfil</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-5 text-center">
          <div className="py-3 border-b border-blue-200">
            <p className="font-bold text-black mb-2">Nombre completo:</p>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="py-3 border-b border-blue-200">
            <p className="font-bold text-black mb-2">Correo Electrónico:</p>
            <input
              type="email"
              value={formData.correoElectronico}
              onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="py-3 border-b border-blue-200">
            <p className="font-bold text-black mb-2">Teléfono:</p>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="py-3 border-b border-blue-200">
            <p className="font-bold text-black mb-2">Contraseña:</p>
            <input
              type="password"
              value={formData.contraseña}
              onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
              placeholder="Dejar vacío para no cambiar"
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="py-3 border-b border-blue-200">
            <p className="font-bold text-black mb-1">Rol:</p>
            <p className="text-gray-800">{getRolLabel()}</p>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleSalir}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Salir
        </button>
      </div>
    </div>
  );
};
