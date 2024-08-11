import { createApiClient } from "@accentor/api-client-js";

let url;
if (import.meta.env.VITE_API_URL !== undefined) {
  url = import.meta.env.VITE_API_URL;
} else if (import.meta.env.NODE_ENV === "production") {
  url = "/api";
} else {
  url = "http://localhost:3000/api";
}

export const baseURL = url;

const api = createApiClient(baseURL);

export default api;
