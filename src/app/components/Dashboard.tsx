import React from 'react';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { DashboardAdmin } from './DashboardAdmin';
import { DashboardTransportista } from './DashboardTransportista';
import { DashboardDonante } from './DashboardDonante';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const rol = normalizeRole(user?.rol);

  if (rol === 'admin') {
    return <DashboardAdmin />;
  }

  if (rol === 'transportista') {
    return <DashboardTransportista />;
  }

  if (rol === 'donante') {
    return <DashboardDonante />;
  }

  return null;
};
