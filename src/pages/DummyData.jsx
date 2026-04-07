import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/db";
import { ref, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const NAMA_PEMASUKAN = ["Gaji bulanan", "Bonus proyek", "Freelance desain", "Dividen saham", "Transfer dari ortu", "Komisi penjualan"];
const NAMA_PENGELUARAN = {
  Makanan: ["Makan siang kantor", "Kopi Starbucks", "Groceries Indomaret", "GoFood dinner", "Makan malam keluarga", "Sarapan warteg"],
  Transport: ["Grab ke kantor", "Bensin motor", "Parkir mall", "Tol JORR", "Ojek online"],
  Belanja: ["Baju kerja", "Sepatu baru", "Skincare", "Peralatan dapur", "Buku self-improvement"],
  Hiburan: ["Netflix", "Spotify premium", "Nonton bioskop", "Karaoke bareng teman", "Game online"],
  Kesehatan: ["Vitamin C", "Konsultasi dokter", "Gym membership", "Masker KF94", "Obat flu"],
  Tagihan: ["Listrik PLN", "BPJS Kesehatan", "Internet Fiber", "Cicilan HP", "Iuran RT"],
};
const KATEGORI_OUT = Object.keys(NAMA_PENGELUARAN);

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function DummyData() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const generate = async () => {
    setLoading(true);
    setLog([]);
    const uid = currentUser.uid;
    const now = new Date();

    // ── 1. CATATAN: 3 bulan terakhir ─────────────────────────────
    addLog("📝 Membuat catatan transaksi...");
    for (let m = 2; m >= 0; m--) {
      const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year = month.getFullYear();
      const mo = month.getMonth();
      const daysInMonth = new Date(year, mo + 1, 0).getDate();

      // 1 pemasukan gaji per bulan
      const gajiDate = new Date(year, mo, 25);
      await set(push(ref(db, "catatan")), {
        userId: uid, tipe: "pemasukan", kategori: "Gaji",
        keterangan: "Gaji bulanan", jumlah: rand(5000000, 8000000),
        createdAt: gajiDate.getTime(),
      });

      // 1-2 pemasukan tambahan
      for (let i = 0; i < rand(1, 2); i++) {
        const d = new Date(year, mo, rand(1, daysInMonth));
        await set(push(ref(db, "catatan")), {
          userId: uid, tipe: "pemasukan",
          kategori: pick(["Bisnis", "Hadiah", "Investasi"]),
          keterangan: pick(NAMA_PEMASUKAN.slice(1)),
          jumlah: rand(200000, 2000000),
          createdAt: d.getTime(),
        });
      }

      // 15-20 pengeluaran per bulan
      for (let i = 0; i < rand(15, 20); i++) {
        const kat = pick(KATEGORI_OUT);
        const d = new Date(year, mo, rand(1, daysInMonth));
        await set(push(ref(db, "catatan")), {
          userId: uid, tipe: "pengeluaran", kategori: kat,
          keterangan: pick(NAMA_PENGELUARAN[kat]),
          jumlah: rand(15000, 500000),
          createdAt: d.getTime(),
        });
      }
    }
    addLog("✅ Catatan transaksi selesai");

    // ── 2. TARGET ─────────────────────────────────────────────────
    addLog("🎯 Membuat target tabungan...");
    const targetData = [
      { nama: "Dana Darurat", nominal: 20000000 },
      { nama: "DP Rumah", nominal: 50000000 },
      { nama: "Liburan Bali", nominal: 5000000 },
    ];
    const targetIds = [];
    for (const t of targetData) {
      const newRef = push(ref(db, `targets/${uid}`));
      await set(newRef, { ...t, createdAt: Date.now() });
      targetIds.push({ id: newRef.key, ...t });
    }
    addLog("✅ Target tabungan selesai");

    // ── 3. TABUNGAN: setor ke masing-masing target ───────────────
    addLog("🏦 Membuat riwayat tabungan...");
    const setoran = [
      [rand(1000000, 2000000), rand(500000, 1000000), rand(200000, 500000)],
      [rand(2000000, 4000000), rand(1000000, 2000000), rand(500000, 1000000)],
      [rand(300000, 800000), rand(200000, 500000), rand(100000, 300000)],
    ];
    for (let m = 2; m >= 0; m--) {
      const month = new Date(now.getFullYear(), now.getMonth() - m, rand(1, 28));
      for (let ti = 0; ti < targetIds.length; ti++) {
        await set(push(ref(db, `tabungan/${uid}`)), {
          targetId: targetIds[ti].id,
          tipe: "setor",
          jumlah: setoran[ti][2 - m],
          catatan: `Setor ${["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][month.getMonth()]}`,
          createdAt: month.getTime(),
          tanggal: month.getTime(),
        });
      }
    }
    // 1 tarik untuk dana darurat
    await set(push(ref(db, `tabungan/${uid}`)), {
      targetId: targetIds[0].id,
      tipe: "tarik", jumlah: 500000,
      catatan: "Bayar dokter darurat",
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10).getTime(),
      tanggal: Date.now(),
    });
    addLog("✅ Riwayat tabungan selesai");

    // ── 4. BUDGET: bulan ini & bulan lalu ────────────────────────
    addLog("📊 Membuat data budget...");
    const budgetKat = { Makanan: 1500000, Transport: 600000, Belanja: 800000, Hiburan: 400000, Kesehatan: 300000, Tagihan: 700000 };
    for (let m = 0; m <= 1; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      for (const [kat, nominal] of Object.entries(budgetKat)) {
        await set(ref(db, `budget/${uid}/${key}/${kat}`), nominal + rand(-100000, 100000));
      }
    }
    addLog("✅ Budget selesai");

    setDone(true);
    setLoading(false);
    addLog("🎉 Semua dummy data berhasil dibuat!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>🧪 Generate Dummy Data</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
            Akan dibuat data realistis untuk akun kamu:<br />
            • ~50 transaksi (3 bulan terakhir)<br />
            • 3 target tabungan<br />
            • Riwayat setor & tarik tabungan<br />
            • Budget per kategori (2 bulan)
          </p>

          {log.length > 0 && (
            <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", marginBottom: "20px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "2" }}>
              {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}

          {!done ? (
            <button className="btn-primary" onClick={generate} disabled={loading}>
              {loading ? "Sedang membuat data..." : "🚀 Buat Dummy Data"}
            </button>
          ) : (
            <div>
              <div className="alert-success" style={{ marginBottom: "16px" }}>
                ✅ Dummy data berhasil! Sekarang coba lihat Dashboard, Laporan, dan halaman lainnya.
              </div>
              <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                Ke Dashboard →
              </button>
            </div>
          )}

          {!done && (
            <button onClick={() => navigate("/dashboard")} style={{ width: "100%", marginTop: "10px", background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "13px" }}>
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
