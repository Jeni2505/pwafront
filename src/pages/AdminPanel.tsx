import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  online: boolean;
  lastSeen: string | null;
  createdAt: string;
};

export default function AdminPanel() {
  const nav = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
      setLastRefresh(new Date());
      setError("");
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("Acceso denegado. No tienes permisos de administrador.");
      } else {
        setError("Error al cargar usuarios.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // Refresca la lista cada 30 segundos para ver quién está online
    const interval = setInterval(fetchUsers, 30_000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const onlineCount = users.filter((u) => u.online).length;
  const totalCount = users.length;

  function formatLastSeen(lastSeen: string | null) {
    if (!lastSeen) return "Nunca";
    const diff = Date.now() - new Date(lastSeen).getTime();
    if (diff < 60_000) return "Hace menos de 1 min";
    if (diff < 3600_000) return `Hace ${Math.floor(diff / 60_000)} min`;
    return new Date(lastSeen).toLocaleString("es-MX");
  }

  return (
    <div className="wrap">
      {/* Header */}
      <header className="topbar">
        <h1>Panel de Administración</h1>
        <div className="spacer" />
        <div className="stats">
          <span>Total: {totalCount}</span>
          <span style={{ color: "#4ade80" }}>🟢 Online: {onlineCount}</span>
          <span style={{ color: "#f87171" }}>🔴 Offline: {totalCount - onlineCount}</span>
        </div>
        <button
          className="btn"
          style={{ background: "#374151", marginRight: 8 }}
          onClick={() => nav("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main>
        {/* Info de último refresco */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#9ca3af" }}>
            Usuarios registrados
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Actualizado: {lastRefresh.toLocaleTimeString("es-MX")}
            </span>
            <button
              className="btn"
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              onClick={fetchUsers}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fca5a5",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p style={{ color: "#9ca3af" }}>Cargando usuarios…</p>
        ) : users.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No hay usuarios registrados.</p>
        ) : (
          <div className="list" style={{ gap: 10 }}>
            {users.map((u) => (
              <div
                key={u.id}
                className="item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderLeft: `4px solid ${u.online ? "#4ade80" : "#374151"}`,
                }}
              >
                {/* Avatar inicial */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: u.role === "ADMIN" ? "#1d4ed8" : "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{u.name}</span>
                    {u.role === "ADMIN" && (
                      <span
                        style={{
                          background: "#1d4ed8",
                          color: "#bfdbfe",
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.82rem",
                      color: "#9ca3af",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.email}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                    Última actividad: {formatLastSeen(u.lastSeen)}
                  </p>
                </div>

                {/* Estado online */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: u.online ? "#14532d" : "#1f2937",
                      color: u.online ? "#4ade80" : "#9ca3af",
                      border: `1px solid ${u.online ? "#16a34a" : "#374151"}`,
                      padding: "3px 12px",
                      borderRadius: 999,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {u.online ? "🟢 Online" : "⚫ Offline"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#4b5563" }}>
                    Registrado: {new Date(u.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
