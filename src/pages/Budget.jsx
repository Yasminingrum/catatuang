import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBudgetRealtime, setBudgetKategori, deleteBudgetKategori, getCatatanRealtime } from "../firebase/db";
import Navbar from "../components/Navbar";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtInput = (v) => v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function Budget() {
  const { currentUser } = useAuth();
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth());
  const [tahun, setTahun] = useState(now.getFullYear());
  const [budget, setBudget] = useState({});
  const [catatan, setCatatan] = useState([]);
  const [newKat, setNewKat] = useState("");
  const [newNominal, setNewNominal] = useState("");
  const [newNominalDisplay, setNewNominalDisplay] = useState("");
  const [editKat, setEditKat] = useState(null);
  const [editNominal, setEditNominal] = useState("");
  const [editNominalDisplay, setEditNominalDisplay] = useState("");
  const [showForm, setShowForm] = useState(false);

  const bulanKey = `${tahun}-${String(bulan + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!currentUser) return;
    const u1 = getBudgetRealtime(currentUser.uid, bulanKey, setBudget);
    const u2 = getCatatanRealtime(currentUser.uid, setCatatan);
    return () => { u1(); u2(); };
  }, [currentUser, bulanKey]);

  // Hitung pengeluaran per kategori untuk bulan ini
  const getPengeluaran = (kat) =>
    catatan.filter(c => c.tipe === "pengeluaran" && c.kategori === kat && (() => {
      const d = new Date(c.createdAt);
      return d.getMonth() === bulan && d.getFullYear() === tahun;
    })()).reduce((a, b) => a + Number(b.jumlah), 0);

  const handleAdd = async () => {
    if (!newKat.trim() || !newNominal) return;
    await setBudgetKategori(currentUser.uid, bulanKey, newKat.trim(), Number(newNominal));
    setNewKat(""); setNewNominal(""); setNewNominalDisplay(""); setShowForm(false);
  };

  const handleEdit = async (kat) => {
    if (!editNominal) return;
    await setBudgetKategori(currentUser.uid, bulanKey, kat, Number(editNominal));
    setEditKat(null); setEditNominal(""); setEditNominalDisplay("");
  };

  const totalBudget = Object.values(budget).reduce((a, b) => a + Number(b), 0);
  const totalPengeluaran = Object.keys(budget).reduce((a, kat) => a + getPengeluaran(kat), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>

        {/* Pilih bulan */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => { const d = new Date(tahun, bulan - 1); setBulan(d.getMonth()); setTahun(d.getFullYear()); }} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>{BULAN[bulan]} {tahun}</span>
          <button onClick={() => { const d = new Date(tahun, bulan + 1); setBulan(d.getMonth()); setTahun(d.getFullYear()); }} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>›</button>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div className="card" style={{ padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Budget</p>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>{fmt(totalBudget)}</p>
          </div>
          <div className="card" style={{ padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Terpakai</p>
            <p style={{ fontSize: "16px", fontWeight: "700", color: totalPengeluaran > totalBudget ? "var(--expense)" : "var(--income)" }}>{fmt(totalPengeluaran)}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>📊 Budget per Kategori</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ Tambah</button>
        </div>

        {/* Form tambah */}
        {showForm && (
          <div className="card" style={{ padding: "16px", marginBottom: "14px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input className="input" type="text" value={newKat} onChange={e => setNewKat(e.target.value)} placeholder="Nama kategori" style={{ flex: 1 }} />
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                <input className="input" style={{ paddingLeft: "34px" }} type="text" inputMode="numeric" value={newNominalDisplay}
                  onChange={e => { const r = e.target.value.replace(/\./g, "").replace(/\D/g, ""); setNewNominalDisplay(fmtInput(r)); setNewNominal(r); }}
                  placeholder="0" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAdd} className="btn-primary" style={{ flex: 1, padding: "8px" }}>Simpan</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "10px", padding: "8px", cursor: "pointer", fontSize: "13px" }}>Batal</button>
            </div>
          </div>
        )}

        {/* List budget */}
        {Object.keys(budget).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>📊</div>
            <p>Belum ada budget untuk bulan ini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(budget).map(([kat, nominal]) => {
              const terpakai = getPengeluaran(kat);
              const pct = Math.min(100, Math.round((terpakai / nominal) * 100));
              const over = terpakai > nominal;
              return (
                <div key={kat} className="card" style={{ padding: "16px" }}>
                  {editKat === kat ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)", flex: 1 }}>{kat}</span>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                        <input className="input" style={{ paddingLeft: "30px", width: "140px" }} type="text" inputMode="numeric" value={editNominalDisplay}
                          onChange={e => { const r = e.target.value.replace(/\./g, "").replace(/\D/g, ""); setEditNominalDisplay(fmtInput(r)); setEditNominal(r); }}
                          placeholder="0" autoFocus />
                      </div>
                      <button onClick={() => handleEdit(kat)} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>OK</button>
                      <button onClick={() => setEditKat(null)} style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px" }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>{kat}</span>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: over ? "var(--expense)" : "var(--text-secondary)" }}>{pct}%</span>
                          <button onClick={() => { setEditKat(kat); setEditNominal(String(nominal)); setEditNominalDisplay(fmtInput(String(nominal))); }} style={{ fontSize: "11px", color: "var(--accent)", background: "var(--accent-light)", border: "none", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => deleteBudgetKategori(currentUser.uid, bulanKey, kat)} style={{ fontSize: "11px", color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </div>
                      <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "8px", overflow: "hidden", marginBottom: "6px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--expense)" : pct > 80 ? "#f59e0b" : "var(--accent)", borderRadius: "99px", transition: "width 0.4s" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Terpakai: <strong style={{ color: over ? "var(--expense)" : "var(--text-secondary)" }}>{fmt(terpakai)}</strong></span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Budget: <strong>{fmt(nominal)}</strong></span>
                      </div>
                      {over && <p style={{ fontSize: "11px", color: "var(--expense)", marginTop: "4px", fontWeight: "600" }}>⚠️ Melebihi budget {fmt(terpakai - nominal)}</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
