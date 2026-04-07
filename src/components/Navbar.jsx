import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { logoutUser } from "../firebase/auth";

const NAV = [
  { to: "/dashboard", label: "💳 Transaksi" },
  { to: "/tabungan",  label: "🏦 Tabungan" },
  { to: "/targets",   label: "🎯 Target" },
  { to: "/budget",    label: "📊 Budget" },
  { to: "/laporan",   label: "📈 Laporan" },
];

export default function Navbar() {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => { await logoutUser(); navigate("/"); };

  return (
    <>
      <nav style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>💰</span>
            <span style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-primary)" }}>CatatUang</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.email}</span>
            <button onClick={handleLogout} style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontSize: "12px" }}>Keluar</button>
          </div>
        </div>
      </nav>
      <nav style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, display: "flex" }}>
        {NAV.map(({ to, label }) => {
          const active = pathname === to;
          const [icon, ...words] = label.split(" ");
          return (
            <Link key={to} to={to} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 4px 12px", textDecoration: "none", fontSize: "10px",
              fontWeight: active ? "700" : "500",
              color: active ? "var(--accent)" : "var(--text-muted)",
              borderTop: active ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "18px", marginBottom: "2px" }}>{icon}</span>
              <span>{words.join(" ")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
