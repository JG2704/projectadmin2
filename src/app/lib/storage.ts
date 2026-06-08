import { supabase } from './supabaseClient';

// Bucket público donde se guardan las imágenes de las donaciones
const BUCKET = 'donaciones';

/**
 * Sube una imagen al Storage de Supabase y devuelve su URL pública.
 * @param file   archivo seleccionado por el usuario
 * @param carpeta subcarpeta lógica dentro del bucket (ej. 'objetos', 'entregas')
 */
export const subirImagen = async (file: File, carpeta: string): Promise<string> => {
  const extension = file.name.split('.').pop() ?? 'jpg';
  const ruta = `${carpeta}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Error al subir imagen:', error.message);
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
};
