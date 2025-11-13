import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPageEnhanced from "./pages/LoginPageEnhanced";
import DashboardPage from "./pages/DashboardPage";
import ProvidersPage from "./pages/ProvidersPage";
import CachePage from "./pages/CachePage";
import AlertsPage from "./pages/AlertsPage";
import RateLimitsPage from "./pages/RateLimitsPage";
import AutopilotPage from "./pages/AutopilotPage";
import SetupPage from "./pages/SetupPage";
import DocsPage from "./pages/DocsPage";
import CostDashboardEnhanced from "./pages/CostDashboardEnhanced";
import ResponseValidatorPage from "./pages/ResponseValidatorPage";
import SchemaEnforcementPage from "./pages/SchemaEnforcementPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          {/* Dev banner: shows whether app is using mock or real API and the configured API URL */}
          {import.meta.env.MODE !== "production" && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: 12,
                padding: "4px 8px",
                zIndex: 9999,
                textAlign: "center",
              }}
            >
              {`API MODE: ${
                import.meta.env.VITE_USE_MOCK === "true" ? "MOCK" : "REAL"
              } — URL: ${import.meta.env.VITE_API_URL}`}
            </div>
          )}
          <Routes>
            <Route path="/login" element={<LoginPageEnhanced />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/autopilot"
              element={
                <ProtectedRoute>
                  <AutopilotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers"
              element={
                <ProtectedRoute>
                  <ProvidersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost"
              element={
                <ProtectedRoute>
                  <CostDashboardEnhanced />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost-analytics"
              element={
                <ProtectedRoute>
                  <CostDashboardEnhanced />
                </ProtectedRoute>
              }
            />
            <Route
              path="/validator"
              element={
                <ProtectedRoute>
                  <ResponseValidatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schemas"
              element={
                <ProtectedRoute>
                  <SchemaEnforcementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cache"
              element={
                <ProtectedRoute>
                  <CachePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-limits"
              element={
                <ProtectedRoute>
                  <RateLimitsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/setup"
              element={
                <ProtectedRoute>
                  <SetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <DocsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
