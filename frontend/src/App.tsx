import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
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
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutRunnerPage } from './pages/WorkoutRunnerPage';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'user';
  allowGuest?: boolean;
}> = ({ children, requiredRole, allowGuest }) => {
  const { user } = useAuth();
  if (!user && !allowGuest) {
    return <Navigate to="/login" replace />;
  }
  if (user && requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/assigned'} replace />;
  }
  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isSessionScreen =
    location.pathname.startsWith('/session') || location.pathname === '/workout';

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0b0e14] text-slate-850 dark:text-slate-100 selection:bg-teal-500 selection:text-white transition-colors">
      {!isSessionScreen && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* User Personalized Schedule Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Automated Hands-Free Sequential Workout Runner */}
          <Route path="/workout" element={<WorkoutRunnerPage />} />

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
              <ProtectedRoute allowGuest>
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
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
