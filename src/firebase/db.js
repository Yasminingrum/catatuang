import {
  getDatabase, ref, push, set, get, update, remove, query,
  orderByChild, equalTo, onValue,
} from "firebase/database";
import app from "./config";

export const db = getDatabase(app);

// ─── CATATAN (pemasukan & pengeluaran) ───────────────────────────────────────
export const addCatatan = (userId, data) =>
  set(push(ref(db, "catatan")), { ...data, userId, createdAt: Date.now() });

export const getCatatanRealtime = (userId, callback) => {
  const q = query(ref(db, "catatan"), orderByChild("userId"), equalTo(userId));
  return onValue(q, (snap) => {
    const data = [];
    snap.forEach((c) => data.push({ id: c.key, ...c.val() }));
    data.sort((a, b) => b.createdAt - a.createdAt);
    callback(data);
  });
};

export const getCatatanById = async (id) => {
  const snap = await get(ref(db, `catatan/${id}`));
  return snap.exists() ? { id: snap.key, ...snap.val() } : null;
};

export const updateCatatan = (id, data) =>
  update(ref(db, `catatan/${id}`), { ...data, updatedAt: Date.now() });

export const deleteCatatan = (id) => remove(ref(db, `catatan/${id}`));

// ─── TARGET TABUNGAN ─────────────────────────────────────────────────────────
export const addTarget = (userId, data) =>
  set(push(ref(db, `targets/${userId}`)), { ...data, createdAt: Date.now() });

export const getTargetsRealtime = (userId, callback) =>
  onValue(ref(db, `targets/${userId}`), (snap) => {
    const data = [];
    snap.forEach((c) => data.push({ id: c.key, ...c.val() }));
    callback(data);
  });

export const updateTarget = (userId, id, data) =>
  update(ref(db, `targets/${userId}/${id}`), data);

export const deleteTarget = (userId, id) =>
  remove(ref(db, `targets/${userId}/${id}`));

// ─── TABUNGAN (setor / tarik) ────────────────────────────────────────────────
export const addTabungan = (userId, data) =>
  set(push(ref(db, `tabungan/${userId}`)), { ...data, createdAt: Date.now() });

export const getTabunganRealtime = (userId, callback) =>
  onValue(ref(db, `tabungan/${userId}`), (snap) => {
    const data = [];
    snap.forEach((c) => data.push({ id: c.key, ...c.val() }));
    data.sort((a, b) => b.createdAt - a.createdAt);
    callback(data);
  });

export const deleteTabungan = (userId, id) =>
  remove(ref(db, `tabungan/${userId}/${id}`));

// ─── BUDGET ──────────────────────────────────────────────────────────────────
// key format: "2025-04"
export const setBudgetKategori = (userId, bulanKey, kategori, nominal) =>
  set(ref(db, `budget/${userId}/${bulanKey}/${kategori}`), nominal);

export const getBudgetRealtime = (userId, bulanKey, callback) =>
  onValue(ref(db, `budget/${userId}/${bulanKey}`), (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });

export const deleteBudgetKategori = (userId, bulanKey, kategori) =>
  remove(ref(db, `budget/${userId}/${bulanKey}/${kategori}`));