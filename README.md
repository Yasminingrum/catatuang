# 💰 CatatUang

Aplikasi pencatatan keuangan pribadi berbasis web yang dibangun dengan React + Firebase. Dirancang sederhana, ringan, dan siap pakai di semua perangkat.

---

## ✨ Fitur Utama

### 🔐 Autentikasi
- Register & Login dengan Email + Password
- Login dengan Google (tanpa perlu verifikasi email)
- Verifikasi email otomatis setelah register
- Lupa password dengan link reset via email
- Data setiap user terisolasi — tidak bisa diakses pengguna lain

### 💳 Transaksi
- Catat pemasukan dan pengeluaran
- Format nominal otomatis (Rp 1.000.000)
- Kategori dipisah antara pemasukan dan pengeluaran
- Tambah kategori kustom sendiri (tersimpan per akun)
- Filter transaksi: Semua / Pemasukan / Pengeluaran
- Ringkasan saldo, total pemasukan, total pengeluaran

### 🎯 Target Tabungan
- Buat target tabungan dengan nama dan nominal
- Progress bar persentase ketercapaian
- Info sisa yang perlu ditabung
- Notifikasi otomatis saat target tercapai 🎉

### 🏦 Tabungan
- Setor dan tarik tabungan per target
- Riwayat lengkap setiap transaksi tabungan
- Summary mini progress semua target
- Filter riwayat per target

### 📊 Budget
- Set budget per kategori pengeluaran
- Navigasi per bulan
- Progress bar pemakaian budget per kategori
- Warning merah otomatis jika melebihi budget
- Edit dan hapus budget kategori

### 📈 Laporan Bulanan
- Grafik batang perbandingan 6 bulan terakhir
- Ringkasan pemasukan, pengeluaran, setor tabungan, sisa
- Progress pemakaian budget keseluruhan
- Breakdown pengeluaran per kategori (%)
- Progress semua target tabungan

### 🌗 Dual Theme
- **Dark mode** — Slate + Emerald (maskulin)
- **Light mode** — Rose + Pink (feminin)
- Pilihan tema tersimpan otomatis di browser

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 + CSS Variables |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Email | Firebase Email Verification |
| Hosting | Netlify |

---

## 📁 Struktur Folder

```
catatuang/
├── public/
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Bottom tab navigation
│   ├── context/
│   │   ├── AuthContext.jsx     # Global state login
│   │   └── ThemeContext.jsx    # Global state tema
│   ├── firebase/
│   │   ├── config.js           # Inisialisasi Firebase
│   │   ├── auth.js             # Fungsi autentikasi
│   │   └── db.js               # Fungsi CRUD database
│   ├── pages/
│   │   ├── Login.jsx           # Halaman login + forgot password
│   │   ├── Register.jsx        # Halaman register
│   │   ├── Dashboard.jsx       # Daftar transaksi
│   │   ├── AddEdit.jsx         # Form tambah/edit transaksi
│   │   ├── Targets.jsx         # Target tabungan
│   │   ├── Tabungan.jsx        # Riwayat setor/tarik tabungan
│   │   ├── Budget.jsx          # Budget per kategori
│   │   ├── Laporan.jsx         # Laporan & grafik bulanan
│   │   └── DummyData.jsx       # Generator data dummy (dev only)
│   ├── App.jsx                 # Routing utama
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles + CSS variables
├── .env                        # Firebase config (jangan di-commit!)
├── .gitignore
├── netlify.toml                # Konfigurasi deploy Netlify
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js versi 18 ke atas
- Akun Firebase (gratis)
- Akun Netlify (gratis, untuk deploy)

### 1. Clone atau download proyek
```bash
cd catatuang
```

### 2. Install dependencies
```bash
npm install
```

### 3. Buat file `.env` di root folder
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app
```

### 4. Jalankan development server
```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

---

## 🔥 Setup Firebase

### Authentication
1. Firebase Console → Authentication → Get Started
2. Sign-in method → aktifkan **Email/Password**
3. Sign-in method → aktifkan **Google**
4. Settings → Authorized domains → tambahkan domain Netlify kamu

### Realtime Database
1. Firebase Console → Realtime Database → Create Database
2. Pilih region: **asia-southeast1 (Singapore)**
3. Start in **test mode**
4. Rules → ganti dengan:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## 🌐 Deploy ke Netlify

### Build
```bash
npm run build
```

### Deploy (Drag & Drop)
1. Buka [netlify.com](https://netlify.com)
2. Drag folder `dist/` ke dashboard Netlify
3. Dapat URL otomatis

### Environment Variables di Netlify
Site configuration → Environment variables → tambahkan semua isi `.env`

### Redeploy setelah ubah env
Build ulang → drag `dist/` lagi ke halaman Deploys Netlify

---

## 📱 Halaman & Navigasi

| URL | Halaman | Keterangan |
|---|---|---|
| `/` | Login | Masuk atau reset password |
| `/register` | Register | Daftar akun baru |
| `/dashboard` | Transaksi | Daftar & ringkasan transaksi |
| `/add` | Tambah | Form tambah transaksi |
| `/edit/:id` | Edit | Form edit transaksi |
| `/targets` | Target | Kelola target tabungan |
| `/tabungan` | Tabungan | Setor & tarik tabungan |
| `/budget` | Budget | Budget per kategori |
| `/laporan` | Laporan | Grafik & laporan bulanan |
| `/dummy` | Dev Only | Generator data dummy |

---

## 🔒 Keamanan Data

- Setiap user hanya bisa melihat dan mengelola datanya sendiri
- Autentikasi wajib untuk semua halaman (kecuali Login & Register)
- Email perlu diverifikasi sebelum bisa login (kecuali Google login)
- API key Firebase aman disimpan di environment variables

---

## 👩‍💻 Dikembangkan dengan

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Firebase](https://firebase.google.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Netlify](https://netlify.com)

---

> Dibuat untuk tugas cloud computing — April 2026
