import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCatatanRealtime, deleteCatatan } from "../firebase/db";
import Navbar from "../components/Navbar";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [catatan, setCatatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");

  useEffect(() => {
    if (!currentUser) return;
    return getCatatanRealtime(currentUser.uid, (data) => { setCatatan(data); setLoading(false); });
  }, [currentUser]);

  const handleDelete = async (id) => { if (window.confirm("Hapus catatan ini?")) await deleteCatatan(id); };

  const filtered = filter === "semua" ? catatan : catatan.filter(c => c.tipe === filter);
  const totalIn  = catatan.filter(c => c.tipe === "pemasukan").reduce((a, b) => a + Number(b.jumlah), 0);
  const totalOut = catatan.filter(c => c.tipe === "pengeluaran").reduce((a, b) => a + Number(b.jumlah), 0);
  const saldo    = totalIn - totalOut;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Saldo", value: fmt(saldo), color: saldo >= 0 ? "var(--income)" : "var(--expense)" },
            { label: "Pemasukan", value: fmt(totalIn), color: "var(--income)" },
            { label: "Pengeluaran", value: fmt(totalOut), color: "var(--expense)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{label}</p>
              <p style={{ fontSize: "15px", fontWeight: "700", color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Catatan Keuangan</h2>
          <Link to="/add" style={{ background: "var(--accent)", color: "white", borderRadius: "10px", padding: "8px 18px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>+ Tambah</Link>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {["semua", "pemasukan", "pengeluaran"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600",
              cursor: "pointer", border: "1.5px solid", transition: "all 0.2s", textTransform: "capitalize",
              background: filter === f ? "var(--accent)" : "transparent",
              borderColor: filter === f ? "var(--accent)" : "var(--border)",
              color: filter === f ? "white" : "var(--text-muted)",
            }}>{f}</button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>Memuat data...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>📭</div>
            <p>Belum ada catatan.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map(item => (
              <div key={item.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: item.tipe === "pemasukan" ? "var(--income-light)" : "var(--expense-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {item.tipe === "pemasukan" ? "📈" : "📉"}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>{item.keterangan}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>{item.kategori} · {item.tipe}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: item.tipe === "pemasukan" ? "var(--income)" : "var(--expense)" }}>
                    {item.tipe === "pemasukan" ? "+" : "-"}{fmt(item.jumlah)}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <Link to={`/edit/${item.id}`} style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 8px", textDecoration: "none" }}>Edit</Link>
                    <button onClick={() => handleDelete(item.id)} style={{ fontSize: "11px", color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
