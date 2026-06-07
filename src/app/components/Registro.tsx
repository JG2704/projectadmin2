import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Heart } from 'lucide-react';

export const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoElectronico: '',
    telefono: '',
    contraseña: '',
    confirmarContraseña: '',
    rol: 'admin' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombreCompleto || !formData.correoElectronico || !formData.telefono || !formData.contraseña || !formData.confirmarContraseña) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const success = await register({
      nombreCompleto: formData.nombreCompleto,
      correoElectronico: formData.correoElectronico,
      telefono: formData.telefono,
      contraseña: formData.contraseña,
      rol: formData.rol,
    });

    if (success) {
      navigate('/dashboard');
    } else {
      setError('El correo electrónico ya está registrado');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <Heart size={60} fill="currentColor" className="text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-blue-600">SISTRA-TEC</h1>
        </div>

        <div className="bg-white rounded-3xl border-4 border-blue-200 shadow-lg p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-black">Crear Usuario</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Nombre completo</label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => handleChange('nombreCompleto', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Juan Pérez García"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Correo Electrónico</label>
              <input
                type="email"
                value={formData.correoElectronico}
                onChange={(e) => handleChange('correoElectronico', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="8888-8888"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.contraseña}
                  onChange={(e) => handleChange('contraseña', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarContraseña}
                  onChange={(e) => handleChange('confirmarContraseña', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">¿Eres administrador o repartidor?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rol"
                    value="admin"
                    checked={formData.rol === 'admin'}
                    onChange={(e) => handleChange('rol', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-800">Administrador</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rol"
                    value="transportista"
                    checked={formData.rol === 'transportista'}
                    onChange={(e) => handleChange('rol', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-800">Repartidor</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">Código de verificación</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Código"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-semibold text-lg mt-8"
            >
              Registrarse
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-3">¿Ya tienes cuenta?</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
            >
              Iniciar sesión aquí
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
          >
            ← Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
};
