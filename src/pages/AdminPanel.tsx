import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  lastSeen: string | null;
  createdAt: string;
};

function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 2 * 60 * 1000;
}

function timeAgo(date: string | null): string {
  if (!date) return "Nunca";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)  return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

export default function AdminPanel() {
  const nav = useNavigate();
  const [users, setUsers]         = useState<UserRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
      setLastUpdate(new Date());
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial + polling cada 30 segundos
  useEffect(() => {
    fetchUsers();
    const id = setInterval(fetchUsers, 30_000);
    return () => clearInterval(id);
  }, [fetchUsers]);

  const onlineUsers  = users.filter(u => isOnline(u.lastSeen));
  const offlineUsers = users.filter(u => !isOnline(u.lastSeen));

  return (
    <div className="wrap">
      <header className="topbar">
        <h1>👥 Panel de Administración</h1>
        <div className="spacer" />
        {lastUpdate && (
          <span className="muted" style={{ fontSize: 12, marginRight: 12 }}>
            Actualizado: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
        <button className="btn" onClick={fetchUsers}>🔄 Actualizar</button>
        <button className="btn" style={{ marginLeft: 8 }} onClick={() => nav("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main>
        {error && <div className="alert">{error}</div>}

        {/* ── Tarjetas de resumen ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Total usuarios" value={users.length} color="#1f6feb" />
          <StatCard label="En línea ahora" value={onlineUsers.length} color="#16a34a" />
          <StatCard label="Fuera de línea"  value={offlineUsers.length} color="#6b7280" />
          <StatCard label="Admins" value={users.filter(u => u.role === "ADMIN").length} color="#9333ea" />
        </div>

        {loading ? (
          <p>Cargando usuarios…</p>
        ) : (
          <>
            {/* ── Usuarios en línea ── */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ marginBottom: 12 }}>
                🟢 En línea ({onlineUsers.length})
              </h2>
              {onlineUsers.length === 0 ? (
                <p className="empty">Ningún usuario en línea ahora mismo</p>
              ) : (
                <UserTable users={onlineUsers} />
              )}
            </section>

            {/* ── Todos los usuarios ── */}
            <section>
              <h2 style={{ marginBottom: 12 }}>
                👤 Todos los usuarios ({users.length})
              </h2>
              <UserTable users={users} showAll />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Subcomponentes ── */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "var(--surface, #1e1e2e)",
      border: `1px solid ${color}44`,
      borderRadius: 12,
      padding: "16px 24px",
      minWidth: 130,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function UserTable({ users, showAll = false }: { users: UserRow[]; showAll?: boolean }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #333" }}>
            <th style={th}>Estado</th>
            <th style={th}>Nombre</th>
            <th style={th}>Email</th>
            <th style={th}>Rol</th>
            {showAll && <th style={th}>Último acceso</th>}
            {showAll && <th style={th}>Registrado</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} style={{ borderBottom: "1px solid #222" }}>
              <td style={td}>
                <span style={{
                  display: "inline-block",
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: isOnline(u.lastSeen) ? "#16a34a" : "#4b5563",
                  marginRight: 6,
                }} />
                {isOnline(u.lastSeen) ? "Online" : "Offline"}
              </td>
              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <span style={{
                  padding: "2px 10px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  background: u.role === "ADMIN" ? "#7c3aed22" : "#1f6feb22",
                  color:      u.role === "ADMIN" ? "#a78bfa"   : "#60a5fa",
                  border: `1px solid ${u.role === "ADMIN" ? "#7c3aed" : "#1f6feb"}`,
                }}>
                  {u.role}
                </span>
              </td>
              {showAll && <td style={td}>{timeAgo(u.lastSeen)}</td>}
              {showAll && <td style={{ ...td, color: "#6b7280" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left", padding: "8px 12px",
  color: "#9ca3af", fontWeight: 600,
};
const td: React.CSSProperties = {
  padding: "10px 12px",
};