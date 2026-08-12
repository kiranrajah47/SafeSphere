import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import JourneyPage from './pages/JourneyPage';
import IncidentsPage from './pages/IncidentsPage';
import ResourcesPage from './pages/ResourcesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Standalone Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Main Application Routes (Inside Professional Dashboard Layout) */}
              <Route
                path="*"
                element={
                  <DashboardLayout>
                    <Routes>
                      {/* Public Dashboard Pages */}
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/resources" element={<ResourcesPage />} />

                      {/* Protected Routes for Logged In Users */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/journey" element={<JourneyPage />} />
                        <Route path="/incidents" element={<IncidentsPage />} />
                        <Route path="/ai-assistant" element={<AIAssistantPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>

                      {/* Admin Protected Routes */}
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminPage />} />
                      </Route>

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </DashboardLayout>
                }
              />
            </Routes>
          </Router>
        </SocketProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
