import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Optional: if running against a real API for a demo, allow injecting
// a demo API key via Vite env (VITE_DEMO_API_KEY). This keeps the UI
// authenticated for recordings without needing to register/login.
// NOTE: This will only run if VITE_AUTO_INJECT_DEMO_KEY is explicitly set to 'true'.
try {
  const useMock = import.meta.env.VITE_USE_MOCK === "true";
  const autoInject = import.meta.env.VITE_AUTO_INJECT_DEMO_KEY === "true";
  const demoKey = import.meta.env.VITE_DEMO_API_KEY;
  const storageKey = "cognitude_api_key";
  if (!useMock && autoInject && demoKey && !localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, demoKey as string);
  }
} catch (e) {
  // In some test environments import.meta may not be available; ignore.
  // This should be a no-op in those cases.
  console.debug("Demo API key injection skipped", e);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
