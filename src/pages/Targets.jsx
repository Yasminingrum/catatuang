import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTargetsRealtime, addTarget, deleteTarget, getTabunganRealtime } from "../firebase/db";
import Navbar from "../components/Navbar";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtInput = (v) => v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Targets() {
  const { currentUser } = useAuth();
  const [targets, setTargets] = useState([]);
  const [tabungan, setTabungan] = useState([]);
  const [form, setForm] = useState({ nama: "", nominal: "" });
  const [nominalDisplay, setNominalDisplay] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const u1 = getTargetsRealtime(currentUser.uid, setTargets);
    const u2 = getTabunganRealtime(currentUser.uid, setTabungan);
    return () => { u1(); u2(); };
  }, [currentUser]);

  // Hitung total tabungan per target
  const getTotalTabungan = (targetId) =>
    tabungan
      .filter(t => t.targetId === targetId)
      .reduce((a, b) => a + (b.tipe === "setor" ? Number(b.jumlah) : -Number(b.jumlah)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.nominal) return;
    setLoading(true);
    await addTarget(currentUser.uid, { nama: form.nama, nominal: Number(form.nominal) });
    setForm({ nama: "", nominal: "" });
    setNominalDisplay("");
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>🎯 Target Tabungan</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ Target Baru</button>
        </div>

        {/* Form tambah target */}
        {showForm && (
          <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "14px" }}>Target Baru</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Nama Target</label>
                <input className="input" type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required placeholder="Contoh: Dana Darurat" />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="label">Nominal Target (Rp)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                  <input className="input" style={{ paddingLeft: "38px" }} type="text" inputMode="numeric" value={nominalDisplay}
                    onChange={e => { const raw = e.target.value.replace(/\./g, "").replace(/\D/g, ""); setNominalDisplay(fmtInput(raw)); setForm({ ...form, nominal: raw }); }}
                    required placeholder="0" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? "Menyimpan..." : "Simpan Target"}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "14px" }}>Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* List target */}
        {targets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎯</div>
            <p>Belum ada target. Buat target pertamamu!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {targets.map(t => {
              const terkumpul = Math.max(0, getTotalTabungan(t.id));
              const pct = Math.min(100, Math.round((terkumpul / t.nominal) * 100));
              return (
                <div key={t.id} className="card" style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>{t.nama}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Target: {fmt(t.nominal)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "700", color: pct >= 100 ? "var(--income)" : "var(--accent)" }}>{pct}%</span>
                      <button onClick={() => deleteTarget(currentUser.uid, t.id)} style={{ fontSize: "11px", color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>Hapus</button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "10px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--income)" : "var(--accent)", borderRadius: "99px", transition: "width 0.5s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Terkumpul: <strong style={{ color: "var(--income)" }}>{fmt(terkumpul)}</strong></span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sisa: <strong style={{ color: "var(--expense)" }}>{fmt(Math.max(0, t.nominal - terkumpul))}</strong></span>
                  </div>
                  {pct >= 100 && <p style={{ fontSize: "12px", color: "var(--income)", marginTop: "6px", fontWeight: "600" }}>🎉 Target tercapai!</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
