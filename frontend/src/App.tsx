import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { NewAssignmentPage } from './pages/NewAssignmentPage';
import { PatientReportPage } from './pages/PatientReportPage';
import { AssignedDashboardPage } from './pages/AssignedDashboardPage';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { ProgressPage } from './pages/ProgressPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'doctor' | 'user' }> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/assigned'} replace />;
  }
  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isSessionScreen = location.pathname.startsWith('/session');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-teal-100 selection:text-teal-900">
      {!isSessionScreen && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Doctor Protected Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/assign"
            element={
              <ProtectedRoute requiredRole="doctor">
                <NewAssignmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/report/:identifier"
            element={
              <ProtectedRoute requiredRole="doctor">
                <PatientReportPage />
              </ProtectedRoute>
            }
          />

          {/* Patient / Normal User Routes */}
          <Route
            path="/assigned"
            element={
              <ProtectedRoute>
                <AssignedDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:poseId"
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isSessionScreen && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
