import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCatatanRealtime, getTabunganRealtime, getBudgetRealtime, getTargetsRealtime } from "../firebase/db";
import Navbar from "../components/Navbar";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
const BULAN_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function Laporan() {
  const { currentUser } = useAuth();
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth());
  const [tahun, setTahun] = useState(now.getFullYear());
  const [catatan, setCatatan] = useState([]);
  const [tabungan, setTabungan] = useState([]);
  const [budget, setBudget] = useState({});
  const [targets, setTargets] = useState([]);

  const bulanKey = `${tahun}-${String(bulan + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!currentUser) return;
    const u1 = getCatatanRealtime(currentUser.uid, setCatatan);
    const u2 = getTabunganRealtime(currentUser.uid, setTabungan);
    const u3 = getTargetsRealtime(currentUser.uid, setTargets);
    return () => { u1(); u2(); u3(); };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    return getBudgetRealtime(currentUser.uid, bulanKey, setBudget);
  }, [currentUser, bulanKey]);

  // Filter catatan bulan ini
  const catatanBulan = catatan.filter(c => {
    const d = new Date(c.createdAt);
    return d.getMonth() === bulan && d.getFullYear() === tahun;
  });

  const totalIn  = catatanBulan.filter(c => c.tipe === "pemasukan").reduce((a, b) => a + Number(b.jumlah), 0);
  const totalOut = catatanBulan.filter(c => c.tipe === "pengeluaran").reduce((a, b) => a + Number(b.jumlah), 0);
  const totalTabunganBulan = tabungan.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() === bulan && d.getFullYear() === tahun && t.tipe === "setor";
  }).reduce((a, b) => a + Number(b.jumlah), 0);

  // Pengeluaran per kategori bulan ini
  const perKategori = {};
  catatanBulan.filter(c => c.tipe === "pengeluaran").forEach(c => {
    perKategori[c.kategori] = (perKategori[c.kategori] || 0) + Number(c.jumlah);
  });

  // Progress tabungan per target
  const getTabunganTotal = (targetId) =>
    tabungan.filter(t => t.targetId === targetId)
      .reduce((a, b) => a + (b.tipe === "setor" ? Number(b.jumlah) : -Number(b.jumlah)), 0);

  // Bar chart data: 6 bulan terakhir
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(tahun, bulan - 5 + i);
    const m = d.getMonth(); const y = d.getFullYear();
    const items = catatan.filter(c => { const cd = new Date(c.createdAt); return cd.getMonth() === m && cd.getFullYear() === y; });
    return {
      label: BULAN[m],
      pemasukan: items.filter(c => c.tipe === "pemasukan").reduce((a, b) => a + Number(b.jumlah), 0),
      pengeluaran: items.filter(c => c.tipe === "pengeluaran").reduce((a, b) => a + Number(b.jumlah), 0),
    };
  });

  const maxBar = Math.max(...last6.map(d => Math.max(d.pemasukan, d.pengeluaran)), 1);

  // Budget usage
  const totalBudget = Object.values(budget).reduce((a, b) => a + Number(b), 0);
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((totalOut / totalBudget) * 100)) : 0;

  const sectionTitle = (title) => (
    <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>{title}</h3>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>

        {/* Pilih bulan */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => { const d = new Date(tahun, bulan - 1); setBulan(d.getMonth()); setTahun(d.getFullYear()); }} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>{BULAN_FULL[bulan]} {tahun}</span>
          <button onClick={() => { const d = new Date(tahun, bulan + 1); setBulan(d.getMonth()); setTahun(d.getFullYear()); }} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>›</button>
        </div>

        {/* Ringkasan */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "💚 Pemasukan", value: fmt(totalIn), color: "var(--income)" },
            { label: "🔴 Pengeluaran", value: fmt(totalOut), color: "var(--expense)" },
            { label: "🏦 Setor Tabungan", value: fmt(totalTabunganBulan), color: "var(--accent)" },
            { label: "💰 Sisa", value: fmt(totalIn - totalOut), color: totalIn - totalOut >= 0 ? "var(--income)" : "var(--expense)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: "14px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
              <p style={{ fontSize: "16px", fontWeight: "700", color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Grafik 6 bulan */}
        <div className="card" style={{ padding: "18px", marginBottom: "16px" }}>
          {sectionTitle("📊 Grafik 6 Bulan Terakhir")}
          <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "120px" }}>
            {last6.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px" }}>
                  <div title={fmt(d.pemasukan)} style={{ width: "100%", height: `${(d.pemasukan / maxBar) * 90}px`, background: "var(--income)", borderRadius: "4px 4px 0 0", minHeight: d.pemasukan > 0 ? "4px" : "0", opacity: 0.85 }} />
                  <div title={fmt(d.pengeluaran)} style={{ width: "100%", height: `${(d.pengeluaran / maxBar) * 90}px`, background: "var(--expense)", borderRadius: "4px 4px 0 0", minHeight: d.pengeluaran > 0 ? "4px" : "0", opacity: 0.85 }} />
                </div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{d.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--income)" }} /><span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pemasukan</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--expense)" }} /><span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pengeluaran</span></div>
          </div>
        </div>

        {/* Budget progress */}
        {totalBudget > 0 && (
          <div className="card" style={{ padding: "18px", marginBottom: "16px" }}>
            {sectionTitle("📋 Budget Bulan Ini")}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Terpakai {fmt(totalOut)} dari {fmt(totalBudget)}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: budgetPct > 100 ? "var(--expense)" : "var(--accent)" }}>{budgetPct}%</span>
            </div>
            <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "12px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetPct > 100 ? "var(--expense)" : budgetPct > 80 ? "#f59e0b" : "var(--accent)", borderRadius: "99px", transition: "width 0.5s" }} />
            </div>
            {Object.entries(budget).map(([kat, nominal]) => {
              const terpakai = catatanBulan.filter(c => c.tipe === "pengeluaran" && c.kategori === kat).reduce((a, b) => a + Number(b.jumlah), 0);
              const p = Math.min(100, Math.round((terpakai / nominal) * 100));
              return (
                <div key={kat} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{kat}</span>
                    <span style={{ fontSize: "12px", color: p > 100 ? "var(--expense)" : "var(--text-muted)" }}>{fmt(terpakai)} / {fmt(nominal)}</span>
                  </div>
                  <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "6px" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: p > 100 ? "var(--expense)" : p > 80 ? "#f59e0b" : "var(--income)", borderRadius: "99px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pengeluaran per kategori */}
        {Object.keys(perKategori).length > 0 && (
          <div className="card" style={{ padding: "18px", marginBottom: "16px" }}>
            {sectionTitle("🏷️ Pengeluaran per Kategori")}
            {Object.entries(perKategori).sort((a, b) => b[1] - a[1]).map(([kat, jml]) => {
              const pct = Math.round((jml / totalOut) * 100);
              return (
                <div key={kat} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{kat}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{fmt(jml)} ({pct}%)</span>
                  </div>
                  <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "6px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--expense)", borderRadius: "99px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress target */}
        {targets.length > 0 && (
          <div className="card" style={{ padding: "18px" }}>
            {sectionTitle("🎯 Progress Target Tabungan")}
            {targets.map(t => {
              const terkumpul = Math.max(0, getTabunganTotal(t.id));
              const pct = Math.min(100, Math.round((terkumpul / t.nominal) * 100));
              return (
                <div key={t.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{t.nama}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: pct >= 100 ? "var(--income)" : "var(--accent)" }}>{pct}%</span>
                  </div>
                  <div style={{ background: "var(--bg-hover)", borderRadius: "99px", height: "8px", overflow: "hidden", marginBottom: "4px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--income)" : "var(--accent)", borderRadius: "99px", transition: "width 0.5s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Terkumpul: {fmt(terkumpul)}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: {fmt(t.nominal)}</span>
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
