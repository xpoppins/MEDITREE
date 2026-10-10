/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomTabs } from './components/BottomTabs';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AddReading } from './pages/AddReading';
import { History } from './pages/History';
import { Home } from './pages/Home';
import { Insights } from './pages/Insights';
import { JoinFamily } from './pages/JoinFamily';
import { Login } from './pages/Login';
import { ManageFamily } from './pages/ManageFamily';
import { MemberProfile } from './pages/MemberProfile';
import { ReadingResult } from './pages/ReadingResult';
import { RegisterManager } from './pages/RegisterManager';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  const hideBottomNavPaths = [
    '/welcome',
    '/login',
    '/register',
    '/join',
    '/add-reading',
    '/result',
  ];

  const shouldShowBottomNav = user && !hideBottomNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen w-full bg-[#FFF9F0] dark:bg-[#08101A] flex flex-col selection:bg-[#0F5C5C] selection:text-white transition-colors overflow-x-hidden">
      <div className={`flex-1 w-full ${shouldShowBottomNav ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </div>
      {shouldShowBottomNav && <BottomTabs />}
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <HashRouter>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterManager />} />
              <Route path="/join" element={<JoinFamily />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-reading"
                element={
                  <ProtectedRoute>
                    <AddReading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <ProtectedRoute>
                    <ReadingResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/me"
                element={
                  <ProtectedRoute>
                    <MemberProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family"
                element={
                  <ProtectedRoute managerOnly>
                    <ManageFamily />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </HashRouter>
      </AuthProvider>
    </PreferencesProvider>
  );
}
