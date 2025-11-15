import { api as realApi } from "./api";
import { mockApi } from "./mockApi";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const api = useMock ? mockApi : realApi;
export default api;

// Dev helper: only expose the API client in development.
if (import.meta.env.DEV) {
  try {
    console.info(
      `Frontend API mode: ${useMock ? "MOCK" : "REAL"} (VITE_USE_MOCK=${
        import.meta.env.VITE_USE_MOCK
      })`
    );
    // @ts-expect-error - attach for debugging in browser env
    window.__COGNITUDE_API__ = api;
  } catch {
    // ignore in non-browser environments where `window` is not available
  }
}
