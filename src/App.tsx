import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import { routesConfig } from "./routesConfig";
import LayoutPageLoader from "./components/PageLoader";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {routesConfig.map((route) => {
              if (route.redirectTo) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<Navigate to={route.redirectTo} replace />}
                  />
                );
              }

              if (!route.component) return null;

              const RouteComponent = route.component;
              const content = (
                <Suspense fallback={<LayoutPageLoader />}>
                  <RouteComponent />
                </Suspense>
              );

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.protected ? (
                      <ProtectedRoute>{content}</ProtectedRoute>
                    ) : (
                      content
                    )
                  }
                />
              );
            })}
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
