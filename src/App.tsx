import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
   // 🔍 DEBUG TEMPORAL
  console.log("APP RENDER - token:", localStorage.getItem("token"));
  console.log("APP RENDER - userRole:", localStorage.getItem("userRole"));
  console.log("APP RENDER - ruta actual:", window.location.pathname);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas (cualquier usuario autenticado) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida de admin — el componente mismo verifica el rol */}
        <Route
        path="/admin"
        element={
        <ProtectedRoute adminOnly>   {/* ← agrega adminOnly */}
        <AdminPanel />
        </ProtectedRoute>
        }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

