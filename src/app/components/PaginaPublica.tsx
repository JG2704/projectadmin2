import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDonaciones, CategoriaDonacion } from '../context/DonacionContext';
import { Search, Heart, Package, DollarSign, Shirt, Menu, ChevronRight } from 'lucide-react';
import { TrazabilidadDonacion } from './TrazabilidadDonacion';
import { subirImagen } from '../lib/storage';

export const PaginaPublica: React.FC = () => {
  const [vista, setVista] = useState<'inicio' | 'buscar' | 'donar' | 'confirmacion'>('inicio');
  const [idBusqueda, setIdBusqueda] = useState('');
  const [donacionEncontrada, setDonacionEncontrada] = useState<any>(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [donacionConfirmacion, setDonacionConfirmacion] = useState<any>(null);
  const { buscarDonacion, crearDonacion, donaciones } = useDonaciones();
  const navigate = useNavigate();

  const handleBuscar = () => {
    setErrorBusqueda('');
    if (!idBusqueda.trim()) {
      setErrorBusqueda('Por favor ingrese el número de donación (ej: DON-001) para continuar con la búsqueda');
      return;
    }

    const donacion = buscarDonacion(idBusqueda);
    if (donacion) {
      setDonacionEncontrada(donacion);
    } else {
      setErrorBusqueda(`No encontramos una donación con el número "${idBusqueda}". Verifique que ingresó el número correcto (ej: DON-001). Si tiene dudas, intente nuevamente.`);
      setDonacionEncontrada(null);
    }
  };

  const calcularEstadisticas = () => {
    return {
      medicamentos: donaciones.filter(d => d.categoria === 'medicamentos').length,
      fondos: donaciones
        .filter(d => d.categoria === 'fondos')
        .reduce((sum, d) => sum + parseFloat(d.cantidad || '0'), 0),
      ropa: donaciones.filter(d => d.categoria === 'ropa').length,
    };
  };

  const stats = calcularEstadisticas();

  if (vista === 'confirmacion' && donacionConfirmacion) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4 relative flex items-center justify-between">
            <div className="w-10">
              <Menu size={24} />
            </div>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold whitespace-nowrap">
              SISTRA-TEC
            </h1>
            <div className="flex gap-4 ml-auto">
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:underline font-semibold"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate('/registro')}
                className="text-white hover:underline font-semibold"
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Heart className="text-green-600" size={40} fill="currentColor" />
              </div>
              <h2 className="text-5xl font-bold text-green-700 mb-3">¡Donación Realizada!</h2>
              <p className="text-gray-600 text-lg">
                Tu donación ha sido registrada exitosamente en nuestro sistema
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-8 mb-8 text-center">
              <p className="text-sm text-gray-700 mb-4 font-semibold">Número de Donación:</p>
              <p className="text-6xl font-bold text-green-700 mb-4">{donacionConfirmacion.id}</p>
              <p className="text-sm text-gray-600">
                ✓ Guarda este número para rastrear tu donación en cualquier momento
              </p>
            </div>

            <button
              onClick={() => {
                setVista('inicio');
                setDonacionConfirmacion(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-semibold text-lg"
            >
              Ir a la Página Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (vista === 'donar') {
    return <FormularioDonacion onVolver={() => setVista('inicio')} onDonacionCreada={(donacion) => {
      setDonacionConfirmacion(donacion);
      setVista('confirmacion');
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 relative flex items-center justify-between">
          <div className="w-10">
            <Menu size={24} />
          </div>
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold whitespace-nowrap">
            SISTRA-TEC
          </h1>
          <div className="flex gap-4 ml-auto">
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline font-semibold"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/registro')}
              className="text-white hover:underline font-semibold"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="relative h-60 flex flex-col justify-center items-center text-center px-8 pt-8 pb-8 bg-gradient-to-b from-blue-400/30 to-blue-900/50">
            <div className="mb-4">
              <Heart size={50} fill="white" className="text-white mx-auto" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-8">Buscar donación</h2>
            <input
              type="text"
              value={idBusqueda}
              onChange={(e) => setIdBusqueda(e.target.value)}
              placeholder="Ingrese ID de la donación"
              className="w-full max-w-md px-6 py-3 rounded-full text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md"
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </div>
        </div>

        {donacionEncontrada ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <button
              onClick={() => setDonacionEncontrada(null)}
              className="text-blue-600 hover:underline mb-4 font-semibold"
            >
              ← Volver
            </button>
            <TrazabilidadDonacion donacion={donacionEncontrada} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-8 flex justify-between items-center border-b">
              <h3 className="text-3xl font-bold text-black">Categorías</h3>
              <button
                onClick={() => setVista('donar')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Realizar Donación
              </button>
            </div>

            <div className="p-8 space-y-3">
              <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-4">
                  <Heart size={28} fill="white" />
                  <span className="font-semibold text-lg">Medicamentos</span>
                </div>
                <span className="text-white font-semibold">{stats.medicamentos} donaciones</span>
              </div>

              <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-4">
                  <DollarSign size={28} fill="white" />
                  <span className="font-semibold text-lg">Fondos</span>
                </div>
                <span className="text-white font-semibold">₡{stats.fondos.toLocaleString('es-CR')} en donaciones</span>
              </div>

              <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-4">
                  <Shirt size={28} fill="white" />
                  <span className="font-semibold text-lg">Ropa</span>
                </div>
                <span className="text-white font-semibold">{stats.ropa} donaciones</span>
              </div>
            </div>
          </div>
        )}

        {errorBusqueda && !donacionEncontrada && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorBusqueda}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormularioDonacion: React.FC<{ onVolver: () => void; onDonacionCreada: (donacion: any) => void }> = ({ onVolver, onDonacionCreada }) => {
  const [formData, setFormData] = useState({
    categoria: 'medicamentos' as CategoriaDonacion,
    organizacion: '',
    nombreObjeto: '',
    cantidad: '',
    descripcion: '',
    estadoArticulo: 'bueno' as any,
    nombreDonante: '',
    cedulaDonante: '',
    emailDonante: '',
    telefonoDonante: '',
  });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});
  const { crearDonacion } = useDonaciones();

  // Para validar espacios que no pueden tener letras
  const handleChangeLetras = (e: any) => {
    const { name, value } = e.target;
    
    // Filtramos para que solo queden letras y espacios
    const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    
    // Validamos el límite de 75 caracteres antes de guardar en el estado
    if (soloLetras.length <= 75) {
      setFormData({
        ...formData,
        [name]: soloLetras
      });
    }
  };

  // Para validar que SOLO acepte números (ideal para la cantidad)
  const handleChangeNumeros = (e: any) => {
    const { name, value } = e.target;
    
    // La expresión \D significa "cualquier cosa que NO sea un número"
    // Lo reemplazamos por vacío, dejando solo números
    const soloNumeros = value.replace(/\D/g, '');
    
    setFormData({
      ...formData,
      [name]: soloNumeros
    });
  };

  // Para autocompletar y forzar el formato de la cédula: 1-1234-5678
  const handleChangeCedula = (e: any) => {
    let valor = e.target.value;
    
    // 1. Primero, eliminamos cualquier cosa que no sea número
    const soloNumeros = valor.replace(/\D/g, '');

    // 2. Aplicamos la lógica para ir poniendo los guiones automáticamente
    let cedulaFormateada = soloNumeros;
    
    if (soloNumeros.length > 5) {
      // Si tiene más de 5 números: 1-1234-5678
      cedulaFormateada = `${soloNumeros.slice(0, 1)}-${soloNumeros.slice(1, 5)}-${soloNumeros.slice(5, 9)}`;
    } else if (soloNumeros.length > 1) {
      // Si tiene entre 2 y 5 números: 1-1234
      cedulaFormateada = `${soloNumeros.slice(0, 1)}-${soloNumeros.slice(1, 5)}`;
    }

    // 3. Guardamos el resultado ya formateado en el estado
    setFormData({
      ...formData,
      cedulaDonante: cedulaFormateada
    });
  };

  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    if (formData.categoria !== 'fondos' && !formData.nombreObjeto.trim()) {
      errores.nombreObjeto = 'El nombre del objeto es obligatorio';
    }

    if (formData.organizacion !== 'fondos' && !formData.organizacion.trim()) {
      errores.organizacion = 'El nombre de la organización es obligatorio';
    }

    if (!formData.cantidad.trim()) {
      errores.cantidad = 'La cantidad es obligatoria';
    } else if (formData.categoria === 'fondos') {
      const cantidad = parseFloat(formData.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        errores.cantidad = 'La cantidad debe ser un número mayor a 0';
      }
    } else {
      const cantidad = parseInt(formData.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        errores.cantidad = 'La cantidad debe ser un número entero mayor a 0';
      }
    }

    if (!formData.descripcion.trim()) {
      errores.descripcion = 'La descripción es obligatoria';
    }

    if (formData.categoria !== 'fondos' && !formData.estadoArticulo) {
      errores.estadoArticulo = 'El estado del artículo es obligatorio';
    }

    if (!formData.nombreDonante.trim()) {
      errores.nombreDonante = 'El nombre es obligatorio';
    }

    if (!formData.cedulaDonante.trim()) {
      errores.cedulaDonante = 'La cédula es obligatoria';
    } else if (!/^\d-\d{4}-\d{4}$/.test(formData.cedulaDonante)) {
      errores.cedulaDonante = 'Formato inválido. Use: 1-1234-5678';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEnvio('');

    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);
    try {
      const urlImagen = imagenFile ? await subirImagen(imagenFile, 'objetos') : undefined;

      const nuevaDonacion = await crearDonacion({
        categoria: formData.categoria,
        organizacion: formData.organizacion,
        nombreObjeto: formData.categoria === 'fondos' ? 'Donación monetaria' : formData.nombreObjeto,
        cantidad: formData.cantidad,
        descripcion: formData.descripcion,
        estadoArticulo: formData.categoria !== 'fondos' ? formData.estadoArticulo : undefined,
        imagenObjeto: urlImagen,
        donante: {
          nombre: formData.nombreDonante,
          cedula: formData.cedulaDonante,
          email: formData.emailDonante || undefined,
          telefono: formData.telefonoDonante || undefined,
        },
      });

      onDonacionCreada({ id: nuevaDonacion.id, donacion: nuevaDonacion });
    } catch (error) {
      setErrorEnvio('No se pudo registrar la donación. Intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const getCategoriaLabel = () => {
    if (formData.categoria === 'medicamentos') return 'Medicamentos';
    if (formData.categoria === 'fondos') return 'Fondos monetarios';
    return 'Ropa';
  };

  const getCantidadLabel = () => {
    if (formData.categoria === 'fondos') return 'Monto (₡)';
    if (formData.categoria === 'ropa') return 'Cantidad de prendas';
    return 'Cantidad de unidades';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Menu size={24} />
          <h1 className="text-3xl font-bold">Registrar Donación</h1>
          <button
            onClick={onVolver}
            className="text-white hover:underline font-semibold flex items-center gap-2"
          >
            Regresar
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-100 rounded-3xl p-8 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-black">Agregue la información del bien</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {erroresValidacion.nombreDonante && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    Complete los campos requeridos
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-2 text-black">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaDonacion })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="medicamentos">Medicamentos</option>
                    <option value="fondos">Fondos monetarios</option>
                    <option value="ropa">Ropa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-black">Nombre de la organización*</label>
                  <input
                    type="text"
                    required
                    value={formData.organizacion}
                    name="organizacion"
                    onChange={handleChangeLetras}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      erroresValidacion.organizacion
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                    placeholder="ejem. Bill Gates Fundantion"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-black">Nombre de donante *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombreDonante}
                    name="nombreDonante"
                    onChange={handleChangeLetras}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      erroresValidacion.nombreDonante
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                    placeholder="Juan Pérez García"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-black">Cédula *</label>
                  <input
                    type="text"
                    required
                    value={formData.cedulaDonante}
                    name="cedulaDonante"
                    onChange={handleChangeCedula}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      erroresValidacion.cedulaDonante
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                    placeholder="1-1234-5678"
                  />
                </div>

                {formData.categoria !== 'fondos' && (
                  <div>
                    <label className="block font-semibold mb-2 text-black">Nombre del objeto *</label>
                    <input
                      type="text"
                      required
                      value={formData.nombreObjeto}
                      name="nombreObjeto"
                      onChange={handleChangeLetras}
                      className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                        erroresValidacion.nombreObjeto
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-600'
                      }`}
                      placeholder={formData.categoria === 'ropa' ? 'Ej: Ropa de abrigo' : 'Ej: Analgésicos'}
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-2 text-black">Descripción *</label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 h-20 ${
                      erroresValidacion.descripcion
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                    placeholder="Describa la donación..."
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-black">{getCantidadLabel()} *</label>
                  <input
                    type="text"
                    required
                    value={formData.cantidad}
                    name="cantidad"
                    onChange={handleChangeNumeros}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      erroresValidacion.cantidad
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                    placeholder={formData.categoria === 'fondos' ? '50000' : '10'}
                  />
                </div>

                {formData.categoria !== 'fondos' && (
                  <div>
                    <label className="block font-semibold mb-2 text-black">Estado del Artículo *</label>
                    <select
                      required
                      value={formData.estadoArticulo}
                      onChange={(e) => setFormData({ ...formData, estadoArticulo: e.target.value as any })}
                      className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                        erroresValidacion.estadoArticulo
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-600'
                      }`}
                    >
                      <option value="excelente">Excelente</option>
                      <option value="bueno">Buen estado</option>
                      <option value="normal">Normal</option>
                      <option value="malo">Mal estado</option>
                    </select>
                  </div>
                )}

                {errorEnvio && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {errorEnvio}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg transition-colors font-semibold text-lg"
                >
                  {enviando ? 'Enviando…' : 'Enviar'}
                </button>
              </form>
            </div>

            <div className="md:col-span-1">
              <label className="block font-semibold mb-2 text-black">Imagen del bien</label>
              <div className="bg-white rounded-lg p-6 border-2 border-gray-300 flex items-center justify-center h-64 cursor-pointer hover:border-blue-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="hidden"
                  id="imagen-input"
                />
                <label htmlFor="imagen-input" className="cursor-pointer w-full h-full flex items-center justify-center">
                  {imagenPreview ? (
                    <img src={imagenPreview} alt="Vista previa" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Package size={48} className="mx-auto mb-2" />
                      <p className="text-sm">Haga clic para subir imagen</p>
                    </div>
                  )}
                </label>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('imagen-input')?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold mt-4"
              >
                Subir imagen
              </button>
            </div>

            <div className="md:col-span-1 bg-blue-600 text-white rounded-2xl p-6 flex flex-col justify-center">
              <p className="text-sm font-semibold mb-4">
                "Tu solidaridad llega a su destino." Al registrar tus donaciones en SISTRA-TEC, nos ayudas a garantizar que cada recurso sea entregado con total transparencia a quienes más lo necesitan tras esta emergencia. Completa los siguientes datos para generar tu código de seguimiento y acompañar tu ayuda en cada paso del camino.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
