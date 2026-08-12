import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import BroadcastBanner from './components/common/BroadcastBanner';
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
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
              <Navbar />
              <BroadcastBanner />
              
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />

                  {/* Protected Routes for Authenticated Users */}
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
              </main>

              <footer className="py-6 border-t border-slate-800/80 bg-slate-950/80 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p>© {new Date().getFullYear()} SafeSphere. Universal Personal Safety & Emergency Assistance Platform.</p>
                  <p className="font-semibold text-slate-400">Major Academic Project Implementation</p>
                </div>
              </footer>
            </div>
          </Router>
        </SocketProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
