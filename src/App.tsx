import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { RequestTripPage } from './pages/RequestTripPage';
import { DriverDashboard } from './pages/DriverDashboard';
import { TripDetailPage } from './pages/TripDetailPage';
import { HistoryPage } from './pages/HistoryPage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/passenger"
            element={
              <ProtectedRoute role="PASSENGER">
                <Layout>
                  <PassengerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/request-trip"
            element={
              <ProtectedRoute role="PASSENGER">
                <Layout>
                  <RequestTripPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute role="DRIVER">
                <Layout>
                  <DriverDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TripDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <HistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
