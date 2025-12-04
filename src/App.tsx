import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CallDetail } from '@/pages/CallDetail';
import { CallsList } from '@/pages/CallsList';
import { MissedCalls } from '@/pages/MissedCalls';
import { Callbacks } from '@/pages/Callbacks';
import { PromptHistory } from '@/pages/PromptHistory';
import { Login } from '@/pages/Login';

// Componente per proteggere le route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente per la route di login (redirect se già loggato)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route pubblica - Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Route protette */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <Layout>
              <CallsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CallDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/missed-calls"
        element={
          <ProtectedRoute>
            <Layout>
              <MissedCalls />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/callbacks"
        element={
          <ProtectedRoute>
            <Layout>
              <Callbacks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <PromptHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect per route non trovate */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;