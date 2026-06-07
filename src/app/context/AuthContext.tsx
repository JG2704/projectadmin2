import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'transportista';

export const normalizeRole = (rol: string | undefined): UserRole | null => {
  if (!rol) return null;
  const normalized = rol.toLowerCase().trim();
  if (normalized === 'admin' || normalized === 'administrador') return 'admin';
  if (normalized === 'transportista' || normalized === 'repartidor') return 'transportista';
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

  useEffect(() => {
    const savedUser = localStorage.getItem('sistra-user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const rol = normalizeRole(parsed.rol);
      if (rol) {
        const userWithRole = { ...parsed, rol };
        setUser(userWithRole);
        if (parsed.rol !== rol) {
          localStorage.setItem('sistra-user', JSON.stringify(userWithRole));
        }
      }
    }
  }, []);

  const register = async (userData: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña: string;
    rol: UserRole;
  }): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('sistra-users') || '[]');

      const existingUser = users.find(
        (u: any) => u.correoElectronico === userData.correoElectronico
      );

      if (existingUser) {
        return false;
      }

      const rolRegistro = normalizeRole(userData.rol) ?? userData.rol;
      const newUser = {
        id: Date.now().toString(),
        nombreCompleto: userData.nombreCompleto,
        correoElectronico: userData.correoElectronico,
        telefono: userData.telefono,
        rol: rolRegistro,
        contraseña: userData.contraseña,
      };

      users.push(newUser);
      localStorage.setItem('sistra-users', JSON.stringify(users));

      const { contraseña, ...userWithoutPassword } = newUser;
      const rol = normalizeRole(userWithoutPassword.rol) ?? userData.rol;
      const userToStore = { ...userWithoutPassword, rol };
      setUser(userToStore);
      localStorage.setItem('sistra-user', JSON.stringify(userToStore));

      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('sistra-users') || '[]');
      const foundUser = users.find(
        (u: any) => u.correoElectronico === email && u.contraseña === password
      );

      if (foundUser) {
        const rol = normalizeRole(foundUser.rol);
        if (!rol) return false;

        if (foundUser.rol !== rol) {
          foundUser.rol = rol;
          const userIndex = users.findIndex(
            (u: { correoElectronico: string }) => u.correoElectronico === email
          );
          if (userIndex !== -1) {
            users[userIndex] = foundUser;
            localStorage.setItem('sistra-users', JSON.stringify(users));
          }
        }

        const { contraseña, ...userWithoutPassword } = foundUser;
        const userToStore = { ...userWithoutPassword, rol };
        setUser(userToStore);
        localStorage.setItem('sistra-user', JSON.stringify(userToStore));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const updateProfile = async (data: {
    nombreCompleto: string;
    correoElectronico: string;
    telefono: string;
    contraseña?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const users = JSON.parse(localStorage.getItem('sistra-users') || '[]');
      const userIndex = users.findIndex(
        (u: { id: string }) => u.id === user.id
      );
      if (userIndex === -1) return false;

      const emailEnUso = users.some(
        (u: { id: string; correoElectronico: string }) =>
          u.id !== user.id &&
          u.correoElectronico.toLowerCase() === data.correoElectronico.toLowerCase()
      );
      if (emailEnUso) return false;

      const usuarioActual = users[userIndex];
      const usuarioActualizado = {
        ...usuarioActual,
        nombreCompleto: data.nombreCompleto,
        correoElectronico: data.correoElectronico,
        telefono: data.telefono,
        ...(data.contraseña ? { contraseña: data.contraseña } : {}),
      };

      users[userIndex] = usuarioActualizado;
      localStorage.setItem('sistra-users', JSON.stringify(users));

      const { contraseña, ...userWithoutPassword } = usuarioActualizado;
      const rol = normalizeRole(userWithoutPassword.rol) ?? user.rol;
      const userToStore = { ...userWithoutPassword, rol };
      setUser(userToStore);
      localStorage.setItem('sistra-user', JSON.stringify(userToStore));
      return true;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sistra-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
