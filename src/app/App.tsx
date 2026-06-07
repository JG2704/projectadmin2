import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DonacionProvider } from './context/DonacionContext';
import { PaginaPublica } from './components/PaginaPublica';
import { Login } from './components/Login';
import { Registro } from './components/Registro';
import { Dashboard } from './components/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <DonacionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PaginaPublica />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </DonacionProvider>
    </AuthProvider>
  );
}

export default App;