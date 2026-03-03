import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;   // ← nuevo prop opcional
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("userRole");

   // 🔍 DEBUG TEMPORAL
  console.log("ProtectedRoute - token:", token);
  console.log("ProtectedRoute - role:", role);
  console.log("ProtectedRoute - adminOnly:", adminOnly);
  console.log("ProtectedRoute - ruta:", window.location.pathname);


  // Sin token → al login
  if (!token) return <Navigate to="/" replace />;

  // Ruta de admin pero el usuario no es ADMIN → al dashboard
  if (adminOnly && role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}