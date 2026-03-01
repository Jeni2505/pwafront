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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    const isAdminRoute = url.includes("/admin/");
    const isProfileRoute = url.includes("/auth/profile");

    // 🔥 Si es 401 y NO es ruta admin ni profile → cerrar sesión
    if (status === 401 && !isAdminRoute && !isProfileRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setAuth(null);

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);