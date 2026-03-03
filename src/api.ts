import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

/**
 * Configura o elimina el header Authorization
 */
export function setAuth(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

/**
 * Inicializar auth al cargar la app
 */
const token = localStorage.getItem("token");
if (token) {
  setAuth(token);
}

/**
 * Interceptor global para manejar errores 401
 */
// REEMPLAZA el interceptor completo por este:
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    const isAdminRoute   = url.includes("/admin");  // ← sin slash final
    const isProfileRoute = url.includes("/auth/profile");

    // ✅ Solo cierra sesión si es 401 Y NO es ruta admin ni profile
    if (status === 401 && !isAdminRoute && !isProfileRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setAuth(null);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);