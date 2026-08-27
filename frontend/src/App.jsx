import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import ConfirmActionModal from './components/common/ConfirmActionModal';
import NotificationToast from './components/common/NotificationToast';

import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import AIAgentPage from './pages/AIAgentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AuditLogsPage from './pages/AuditLogsPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
          {/* Main Navigation Bar */}
          <Navbar />

          {/* Page Routing Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              <Route path="/analyze" element={<RiskAnalysisPage />} />
              <Route path="/agent" element={<AIAgentPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/model-performance" element={<ModelPerformancePage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <footer className="border-t border-slate-800 bg-[#0A0E17] py-6 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">RiskGuard AI</span>
                <span>— Intelligent Payment Risk Management Platform</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                AI / Payment Risk Hackathon 2026 • Scikit-Learn + FastAPI + Express + React
              </div>
            </div>
          </footer>

          {/* Controlled Action Modal (Triggerable globally) */}
          <ConfirmActionModal />

          {/* Global Toast Notifications */}
          <NotificationToast />
        </div>
      </Router>
    </AppProvider>
  );
}
