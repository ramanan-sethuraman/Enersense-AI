import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/authContext.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { MeterScannerPage } from './pages/MeterScannerPage.js';
import { BillsPage } from './pages/BillsPage.js';
import { ApplianceAnalysisPage } from './pages/ApplianceAnalysisPage.js';
import { AiAdvisorPage } from './pages/AiAdvisorPage.js';
import { PredictionPage } from './pages/PredictionPage.js';
import { UsageHistoryPage } from './pages/UsageHistoryPage.js';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { IotPage } from './pages/IotPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="meter-scanner" element={<MeterScannerPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="appliances" element={<ApplianceAnalysisPage />} />
            <Route path="ai-advisor" element={<AiAdvisorPage />} />
            <Route path="prediction" element={<PredictionPage />} />
            <Route path="history" element={<UsageHistoryPage />} />
            <Route path="goals" element={<SavingsGoalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="iot" element={<IotPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
