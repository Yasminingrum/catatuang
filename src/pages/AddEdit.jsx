import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { addCatatan, getCatatanById, updateCatatan } from "../firebase/db";
import { db } from "../firebase/db";
import { ref, onValue, set, push } from "firebase/database";

const KATEGORI_DEFAULT = {
  pemasukan: ["Gaji", "Bisnis", "Investasi", "Hadiah", "Lainnya"],
  pengeluaran: ["Makanan", "Transport", "Belanja", "Hiburan", "Kesehatan", "Tagihan", "Lainnya"],
};

// Format angka ke 000.000.000
const formatDisplay = (val) => {
  const num = val.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Ambil angka murni dari format
const parseNumber = (val) => val.replace(/\./g, "");

export default function AddEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({ keterangan: "", jumlah: "", tipe: "pengeluaran", kategori: "" });
  const [jumlahDisplay, setJumlahDisplay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kategori custom per user
  const [kategoriList, setKategoriList] = useState({ pemasukan: [], pengeluaran: [] });
  const [newKategori, setNewKategori] = useState("");
  const [showAddKat, setShowAddKat] = useState(false);

  // Load kategori custom dari Firebase
  useEffect(() => {
    if (!currentUser) return;
    const katRef = ref(db, `kategori/${currentUser.uid}`);
    const unsub = onValue(katRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setKategoriList({
          pemasukan: data.pemasukan || [],
          pengeluaran: data.pengeluaran || [],
        });
      } else {
        setKategoriList({ pemasukan: [], pengeluaran: [] });
      }
    });
    return unsub;
  }, [currentUser]);

  // Load data saat edit
  useEffect(() => {
    if (isEdit) {
      getCatatanById(id).then((data) => {
        if (data) {
          setForm(data);
          setJumlahDisplay(formatDisplay(String(data.jumlah)));
        }
      });
    }
  }, [id]);

  // Set kategori default saat tipe berubah
  useEffect(() => {
    if (!isEdit) {
      const allKat = [...KATEGORI_DEFAULT[form.tipe], ...kategoriList[form.tipe]];
      setForm((f) => ({ ...f, kategori: allKat[0] || "" }));
    }
  }, [form.tipe, kategoriList]);

  // Handle input jumlah dengan format otomatis
  const handleJumlah = (e) => {
    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
    setJumlahDisplay(formatDisplay(raw));
    setForm((f) => ({ ...f, jumlah: raw }));
  };

  // Tambah kategori baru ke Firebase
  const handleAddKategori = async () => {
    const trimmed = newKategori.trim();
    if (!trimmed) return;
    const tipe = form.tipe;
    const existing = [...KATEGORI_DEFAULT[tipe], ...kategoriList[tipe]];
    if (existing.map(k => k.toLowerCase()).includes(trimmed.toLowerCase())) {
      setError("Kategori sudah ada.");
      return;
    }
    const updated = [...kategoriList[tipe], trimmed];
    await set(ref(db, `kategori/${currentUser.uid}/${tipe}`), updated);
    setForm((f) => ({ ...f, kategori: trimmed }));
    setNewKategori("");
    setShowAddKat(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.keterangan || !form.jumlah) { setError("Semua field wajib diisi."); return; }
    if (Number(form.jumlah) <= 0) { setError("Jumlah harus lebih dari 0."); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateCatatan(id, {
          keterangan: form.keterangan,
          jumlah: Number(form.jumlah),
          tipe: form.tipe,
          kategori: form.kategori,
        });
      } else {
        await addCatatan(currentUser.uid, {
          ...form,
          jumlah: Number(form.jumlah),
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Gagal menyimpan. Coba lagi.");
      console.error(err);
    }
    setLoading(false);
  };

  const allKategori = [...KATEGORI_DEFAULT[form.tipe], ...kategoriList[form.tipe]];

  const inputStyle = {
    width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)",
    color: "var(--text-primary)", borderRadius: "10px", padding: "10px 16px",
    fontSize: "14px", outline: "none", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "24px 16px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>← Kembali</button>
            <h1 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>{isEdit ? "Edit Catatan" : "Tambah Catatan"}</h1>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>

        <div className="card" style={{ padding: "28px" }}>
          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Tipe */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label">Tipe Transaksi</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[["pemasukan", "📈 Pemasukan"], ["pengeluaran", "📉 Pengeluaran"]].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setForm({ ...form, tipe: val })} style={{
                    padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "600",
                    cursor: "pointer", border: "2px solid", transition: "all 0.2s",
                    borderColor: form.tipe === val ? (val === "pemasukan" ? "var(--income)" : "var(--expense)") : "var(--border)",
                    background: form.tipe === val ? (val === "pemasukan" ? "var(--income-light)" : "var(--expense-light)") : "var(--bg-input)",
                    color: form.tipe === val ? (val === "pemasukan" ? "var(--income)" : "var(--expense)") : "var(--text-muted)",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Keterangan */}
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Keterangan</label>
              <input
                style={inputStyle} type="text" value={form.keterangan}
                onChange={e => setForm({ ...form, keterangan: e.target.value })}
                required placeholder="Contoh: Makan siang"
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Jumlah dengan format otomatis */}
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Jumlah</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                <input
                  style={{ ...inputStyle, paddingLeft: "38px" }}
                  type="text" inputMode="numeric"
                  value={jumlahDisplay}
                  onChange={handleJumlah}
                  required placeholder="0"
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
              {jumlahDisplay && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>
                  = Rp {jumlahDisplay}
                </p>
              )}
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="label" style={{ margin: 0 }}>
                  Kategori {form.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                </label>
                <button type="button" onClick={() => setShowAddKat(!showAddKat)} style={{
                  fontSize: "12px", color: "var(--accent)", background: "var(--accent-light)",
                  border: "none", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600"
                }}>+ Tambah Kategori</button>
              </div>

              {/* Tambah kategori baru */}
              {showAddKat && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="text" value={newKategori}
                    onChange={e => setNewKategori(e.target.value)}
                    placeholder={`Nama kategori baru...`}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddKategori())}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                  <button type="button" onClick={handleAddKategori} style={{
                    background: "var(--accent)", color: "white", border: "none",
                    borderRadius: "10px", padding: "0 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px"
                  }}>Simpan</button>
                </div>
              )}

              {/* Grid pilih kategori */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {allKategori.map(k => (
                  <button key={k} type="button" onClick={() => setForm({ ...form, kategori: k })} style={{
                    padding: "6px 14px", borderRadius: "50px", fontSize: "13px", fontWeight: "500",
                    cursor: "pointer", border: "1.5px solid", transition: "all 0.15s",
                    borderColor: form.kategori === k ? "var(--accent)" : "var(--border)",
                    background: form.kategori === k ? "var(--accent-light)" : "transparent",
                    color: form.kategori === k ? "var(--accent)" : "var(--text-secondary)",
                  }}>{k}</button>
                ))}
              </div>

              {/* Info kategori custom */}
              {kategoriList[form.tipe].length > 0 && (
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                  ✦ Kategori kustom kamu: {kategoriList[form.tipe].join(", ")}
                </p>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Catatan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
