import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { rolADB, rolDesdeDB, PerfilRow } from '../lib/mappers';

export type UserRole = 'admin' | 'transportista' | 'donante';

export const normalizeRole = (rol: string | undefined): UserRole | null => {
  if (!rol) return null;
  const normalized = rol.toLowerCase().trim();
  if (normalized === 'admin' || normalized === 'administrador' || normalized === 'administrador de centro') return 'admin';
  if (normalized === 'transportista' || normalized === 'repartidor') return 'transportista';
  if (normalized === 'donante') return 'donante';
  return null;
};

export interface User {
  id: string;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  rol: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña: string;
    rol: UserRole;
  }) => Promise<boolean>;
  updateProfile: (data: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña?: string;
  }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Construye el User del frontend a partir de la sesión de Auth + su perfil en la BD
  const cargarUsuario = async (sessionUser: SupabaseUser): Promise<User | null> => {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single<PerfilRow>();

    if (error || !perfil) return null;

    return {
      id: perfil.id,
      nombreCompleto: perfil.nombre_completo,
      correoElectronico: sessionUser.email ?? '',
      telefono: perfil.telefono ?? '',
      rol: rolDesdeDB(perfil.rol) ?? 'donante',
    };
  };

  // Carga la sesión inicial y se suscribe a los cambios de autenticación
  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!activo) return;
      setUser(session?.user ? await cargarUsuario(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ? await cargarUsuario(session.user) : null);
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  const register = async (userData: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña: string;
    rol: UserRole;
  }): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.correoElectronico,
      password: userData.contraseña,
      options: {
        // El trigger on_auth_user_created lee estos datos para crear el perfil
        data: {
          nombre_completo: userData.nombreCompleto,
          rol: rolADB(userData.rol),
          telefono: userData.telefono,
        },
      },
    });

    if (error || !data.user) {
      console.error('Error en registro:', error?.message);
      return false;
    }

    if (data.session?.user) {
      setUser(await cargarUsuario(data.session.user));
    }
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error en login:', error.message);
      return false;
    }
    return true;
  };

  const updateProfile = async (data: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    // 1) Correo / contraseña viven en Supabase Auth
    const authUpdate: { email?: string; password?: string } = {};
    if (data.correoElectronico && data.correoElectronico !== user.correoElectronico) {
      authUpdate.email = data.correoElectronico;
    }
    if (data.contraseña) {
      authUpdate.password = data.contraseña;
    }
    if (Object.keys(authUpdate).length > 0) {
      const { error } = await supabase.auth.updateUser(authUpdate);
      if (error) {
        console.error('Error al actualizar credenciales:', error.message);
        return false;
      }
    }

    // 2) Nombre / teléfono viven en la tabla perfiles
    const { error: perfilError } = await supabase
      .from('perfiles')
      .update({ nombre_completo: data.nombreCompleto, telefono: data.telefono })
      .eq('id', user.id);

    if (perfilError) {
      console.error('Error al actualizar perfil:', perfilError.message);
      return false;
    }

    setUser({
      ...user,
      nombreCompleto: data.nombreCompleto,
      correoElectronico: data.correoElectronico,
      telefono: data.telefono,
    });
    return true;
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
