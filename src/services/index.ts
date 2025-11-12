import { api as realApi } from "./api";
import { mockApi } from "./mockApi";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const api = useMock ? mockApi : realApi;
export default api;
