import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../firebase/auth";
import { useTheme } from "../context/ThemeContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.4-7.6l-6.6 5.1C9.4 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.2 5.2C36.8 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Password tidak cocok."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);
    try {
      await registerUser(email, password);
      setSuccess("Registrasi berhasil! Cek email kamu untuk verifikasi.");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Email sudah terdaftar.");
      else setError("Gagal mendaftar. Coba lagi.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setError("Gagal daftar dengan Google.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Terang" : "🌙 Gelap"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "14px", boxShadow: "0 8px 24px var(--accent-light)" }}>💰</div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>CatatUang</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Buat akun gratis sekarang</p>
        </div>
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", color: "var(--text-primary)" }}>Daftar Akun</h2>
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kamu@email.com" />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimal 6 karakter" />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="label">Konfirmasi Password</label>
              <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Ulangi password" />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Mendaftar..." : "Daftar"}</button>
          </form>
          <div className="divider"><span>atau</span></div>
          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <GoogleIcon /> Daftar dengan Google
          </button>
          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "20px" }}>
            Sudah punya akun?{" "}
            <Link to="/" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
