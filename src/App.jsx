import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import IdeaValidator from './pages/IdeaValidator';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import BusinessPlanGen from './pages/BusinessPlanGen';
import PitchDeckGen from './pages/PitchDeckGen';
import RevenueForecaster from './pages/RevenueForecaster';
import MentorChat from './pages/MentorChat';
import SWOTGenerator from './pages/SWOTGenerator';
import InvestorReadiness from './pages/InvestorReadiness';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Unprotected Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Workspace Shell */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="idea-validator" element={<IdeaValidator />} />
                <Route path="competitor-analysis" element={<CompetitorAnalysis />} />
                <Route path="business-plan" element={<BusinessPlanGen />} />
                <Route path="pitch-deck" element={<PitchDeckGen />} />
                <Route path="revenue-forecaster" element={<RevenueForecaster />} />
                <Route path="mentor-chat" element={<MentorChat />} />
                <Route path="swot-generator" element={<SWOTGenerator />} />
                <Route path="investor-readiness" element={<InvestorReadiness />} />
              </Route>

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
