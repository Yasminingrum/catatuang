import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTargetsRealtime, getTabunganRealtime, addTabungan, deleteTabungan } from "../firebase/db";
import Navbar from "../components/Navbar";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtInput = (v) => v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Tabungan() {
  const { currentUser } = useAuth();
  const [targets, setTargets] = useState([]);
  const [tabungan, setTabungan] = useState([]);
  const [form, setForm] = useState({ targetId: "", tipe: "setor", jumlah: "", catatan: "" });
  const [jumlahDisplay, setJumlahDisplay] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterTarget, setFilterTarget] = useState("semua");

  useEffect(() => {
    if (!currentUser) return;
    const u1 = getTargetsRealtime(currentUser.uid, (data) => {
      setTargets(data);
      if (data.length > 0) setForm(f => ({ ...f, targetId: data[0].id }));
    });
    const u2 = getTabunganRealtime(currentUser.uid, setTabungan);
    return () => { u1(); u2(); };
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.targetId || !form.jumlah) return;
    setLoading(true);
    await addTabungan(currentUser.uid, { targetId: form.targetId, tipe: form.tipe, jumlah: Number(form.jumlah), catatan: form.catatan, tanggal: Date.now() });
    setForm(f => ({ ...f, jumlah: "", catatan: "" }));
    setJumlahDisplay("");
    setShowForm(false);
    setLoading(false);
  };

  const getTotalTarget = (targetId) =>
    tabungan.filter(t => t.targetId === targetId)
      .reduce((a, b) => a + (b.tipe === "setor" ? Number(b.jumlah) : -Number(b.jumlah)), 0);

  const filtered = filterTarget === "semua" ? tabungan : tabungan.filter(t => t.targetId === filterTarget);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>

        {/* Summary per target */}
        {targets.length > 0 && (
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px", paddingBottom: "4px" }}>
            {targets.map(t => {
              const total = Math.max(0, getTotalTarget(t.id));
              const pct = Math.min(100, Math.round((total / t.nominal) * 100));
              return (
                <div key={t.id} className="card" style={{ padding: "14px 16px", minWidth: "160px", flexShrink: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>{t.nama}</p>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)", marginBottom: "6px" }}>{fmt(total)}</p>
                  <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "6px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--income)" : "var(--accent)", borderRadius: "99px" }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{pct}% dari {fmt(t.nominal)}</p>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>🏦 Riwayat Tabungan</h2>
          <button onClick={() => setShowForm(!showForm)} disabled={targets.length === 0}
            style={{ background: targets.length === 0 ? "var(--bg-hover)" : "var(--accent)", color: targets.length === 0 ? "var(--text-muted)" : "white", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: targets.length === 0 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600" }}>
            + Setor / Tarik
          </button>
        </div>

        {targets.length === 0 && (
          <div className="card" style={{ padding: "16px", marginBottom: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Buat target dulu di menu 🎯 Target sebelum mencatat tabungan.</p>
          </div>
        )}

        {/* Form */}
        {showForm && targets.length > 0 && (
          <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Target Tabungan</label>
                <select className="input" value={form.targetId} onChange={e => setForm({ ...form, targetId: e.target.value })}>
                  {targets.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Tipe</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[["setor", "💰 Setor"], ["tarik", "💸 Tarik"]].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setForm({ ...form, tipe: val })} style={{
                      padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "2px solid", transition: "all 0.2s",
                      borderColor: form.tipe === val ? (val === "setor" ? "var(--income)" : "var(--expense)") : "var(--border)",
                      background: form.tipe === val ? (val === "setor" ? "var(--income-light)" : "var(--expense-light)") : "var(--bg-input)",
                      color: form.tipe === val ? (val === "setor" ? "var(--income)" : "var(--expense)") : "var(--text-muted)",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Jumlah (Rp)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                  <input className="input" style={{ paddingLeft: "38px" }} type="text" inputMode="numeric" value={jumlahDisplay}
                    onChange={e => { const raw = e.target.value.replace(/\./g, "").replace(/\D/g, ""); setJumlahDisplay(fmtInput(raw)); setForm({ ...form, jumlah: raw }); }}
                    required placeholder="0" />
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="label">Catatan (opsional)</label>
                <input className="input" type="text" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Misal: gaji bulan ini" />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? "Menyimpan..." : "Simpan"}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "14px" }}>Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter by target */}
        {targets.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", overflowX: "auto" }}>
            <button onClick={() => setFilterTarget("semua")} style={{ padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1.5px solid", whiteSpace: "nowrap", background: filterTarget === "semua" ? "var(--accent)" : "transparent", borderColor: filterTarget === "semua" ? "var(--accent)" : "var(--border)", color: filterTarget === "semua" ? "white" : "var(--text-muted)" }}>Semua</button>
            {targets.map(t => (
              <button key={t.id} onClick={() => setFilterTarget(t.id)} style={{ padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1.5px solid", whiteSpace: "nowrap", background: filterTarget === t.id ? "var(--accent)" : "transparent", borderColor: filterTarget === t.id ? "var(--accent)" : "var(--border)", color: filterTarget === t.id ? "white" : "var(--text-muted)" }}>{t.nama}</button>
            ))}
          </div>
        )}

        {/* Riwayat */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏦</div>
            <p>Belum ada riwayat tabungan.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map(item => {
              const target = targets.find(t => t.id === item.targetId);
              return (
                <div key={item.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: item.tipe === "setor" ? "var(--income-light)" : "var(--expense-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                      {item.tipe === "setor" ? "💰" : "💸"}
                    </div>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>{item.catatan || (item.tipe === "setor" ? "Setor tabungan" : "Tarik tabungan")}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{target?.nama || "-"} · {item.tipe}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: item.tipe === "setor" ? "var(--income)" : "var(--expense)" }}>
                      {item.tipe === "setor" ? "+" : "-"}{fmt(item.jumlah)}
                    </span>
                    <button onClick={() => deleteTabungan(currentUser.uid, item.id)} style={{ fontSize: "11px", color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>Hapus</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
