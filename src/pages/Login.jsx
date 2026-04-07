import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle, resendVerificationEmail, forgotPassword } from "../firebase/auth";
import { useTheme } from "../context/ThemeContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.4-7.6l-6.6 5.1C9.4 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.2 5.2C36.8 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default function Login() {
  const [mode, setMode] = useState("login"); // login | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const reset = () => { setError(""); setInfo(""); setShowResend(false); };

  const handleLogin = async (e) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.user.emailVerified) {
        setError("Email belum diverifikasi. Cek inbox atau folder spam.");
        setShowResend(true);
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      const code = err.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") setError("Email atau password salah.");
      else if (code === "auth/user-not-found") setError("Akun tidak ditemukan.");
      else if (code === "auth/too-many-requests") setError("Terlalu banyak percobaan. Coba lagi nanti.");
      else setError("Gagal masuk. Coba lagi.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    reset();
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setError("Gagal login dengan Google.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    reset();
    setLoading(true);
    try {
      await resendVerificationEmail(email, password);
      setInfo("✅ Email verifikasi dikirim ulang! Cek inbox & spam. Setelah klik link, kembali ke halaman ini untuk login.");
      setShowResend(false);
    } catch {
      setError("Gagal kirim ulang. Pastikan email & password benar.");
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    reset();
    if (!email) { setError("Masukkan email kamu dulu."); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("✅ Link reset password sudah dikirim ke " + email + ". Cek inbox & spam. Setelah reset, kembali ke sini untuk login.");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("Email tidak terdaftar.");
      else setError("Gagal mengirim email reset. Coba lagi.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)",
    color: "var(--text-primary)", borderRadius: "10px", padding: "10px 16px",
    fontSize: "14px", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️ Terang" : "🌙 Gelap"}</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "14px", boxShadow: "0 8px 24px var(--accent-light)" }}>💰</div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>CatatUang</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Catat keuangan pribadimu dengan mudah</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          {/* Mode: Login */}
          {mode === "login" && (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", color: "var(--text-primary)" }}>Masuk ke Akun</h2>

              {error && (
                <div className="alert-error">
                  {error}
                  {showResend && (
                    <button onClick={handleResend} disabled={loading} style={{ display: "block", marginTop: "8px", background: "none", border: "none", color: "var(--danger)", textDecoration: "underline", cursor: "pointer", fontSize: "13px", padding: 0 }}>
                      → Kirim ulang email verifikasi
                    </button>
                  )}
                </div>
              )}
              {info && <div className="alert-success">{info}</div>}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <label className="label">Email</label>
                  <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kamu@email.com" />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label className="label">Password</label>
                  <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <button type="button" onClick={() => { setMode("forgot"); reset(); }} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                    Lupa password?
                  </button>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Masuk..." : "Masuk"}</button>
              </form>

              <div className="divider"><span>atau</span></div>
              <button className="btn-google" onClick={handleGoogle} disabled={loading}>
                <GoogleIcon /> Masuk dengan Google
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "20px" }}>
                Belum punya akun?{" "}
                <Link to="/register" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>Daftar sekarang</Link>
              </p>
            </>
          )}

          {/* Mode: Forgot Password */}
          {mode === "forgot" && (
            <>
              <button onClick={() => { setMode("login"); reset(); }} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "4px" }}>← Kembali ke Login</button>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Reset Password</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>Masukkan email kamu dan kami akan kirimkan link untuk reset password.</p>

              {error && <div className="alert-error">{error}</div>}
              {info && <div className="alert-success">{info}</div>}

              {!info && (
                <form onSubmit={handleForgot}>
                  <div style={{ marginBottom: "20px" }}>
                    <label className="label">Email</label>
                    <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kamu@email.com" />
                  </div>
                  <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Mengirim..." : "Kirim Link Reset"}</button>
                </form>
              )}

              {info && (
                <button className="btn-primary" onClick={() => { setMode("login"); reset(); }} style={{ marginTop: "8px" }}>
                  Kembali ke Login
                </button>
              )}
            </>
          )}
        </div>

        {/* Tips */}
        <div style={{ marginTop: "16px", padding: "14px 18px", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.7" }}>
            💡 <strong style={{ color: "var(--text-secondary)" }}>Tips:</strong> Email verifikasi & reset sering masuk ke <strong>Spam/Junk</strong>. Setelah klik link di email, kamu akan diarahkan kembali ke halaman login otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
