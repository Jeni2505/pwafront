import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../api";
import logo from '../assets/logo.png';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      // 🔥 Guardar token
      localStorage.setItem("token", data.token);

      // 🔥 Guardar role EXACTO que viene del backend
      localStorage.setItem("userRole", data.user.role);

      // 🔥 Configurar axios con el token
      setAuth(data.token);

      // Redirigir
      nav("/dashboard");

    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <div className="brand">
          <img src={logo} alt="To-Do PWA" className="logo-img" />
          <h2>To-Do PWA</h2>
          <p className="muted">Bienvenido, inicia sesión para continuar</p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="tucorreo@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <div className="pass">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="ghost"
              onClick={() => setShow((s) => !s)}
              aria-label="Mostrar/ocultar contraseña"
            >
              {show ? "Ocultar" : "Ver"}
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          <button className="btn primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="footer-links">
          <span className="muted">¿No tienes cuenta?</span>
          <Link to="/register" className="link">Crear una cuenta</Link>
        </div>
      </div>
    </div>
  );
}