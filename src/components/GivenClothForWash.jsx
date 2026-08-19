import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GivenClothForWash = () => {
  const [authUser, setAuthUser] = useState(null), [washRecords, setWashRecords] = useState([]), [photoUrls, setPhotoUrls] = useState({}), [loading, setLoading] = useState(true), [error, setError] = useState("");

  useEffect(() => { loadHistory(); const { data: listener } = supabase.auth.onAuthStateChange(() => loadHistory()); return () => listener.subscription.unsubscribe(); }, []);

  const getCurrentWasherUser = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError) throw authError; if (!user) return null; setAuthUser(user);
    const { data, error } = await supabase.from("users").select("id, user_name").eq("auth_user_id", user.id).single(); if (error) throw error; return data;
  };

  const loadHistory = async () => {
    setLoading(true); setError("");
    try {
      const washerUser = await getCurrentWasherUser(); if (!washerUser) { setWashRecords([]); return; }
      const { data, error: batchError } = await supabase.from("wash_batches").select(`id, wash_date, created_at, photo_path, wash_items (id, quantity, cloth_id, clothes (id, name, type, category))`).eq("user_id", washerUser.id).order("wash_date", { ascending: false }).order("created_at", { ascending: false }); if (batchError) throw batchError;
      const records = (data || []).map(batch => ({ id: batch.id, date: batch.wash_date, photoPath: batch.photo_path, clothes: (batch.wash_items || []).map(item => ({ id: item.id, clothId: item.cloth_id, name: item.clothes?.name || "Clothing item", type: item.clothes?.type || "", category: item.clothes?.category || "", quantity: item.quantity || 1 })) }));
      setWashRecords(records);
      const urls = {};
      await Promise.all(records.filter(r => r.photoPath).map(async record => { const { data: signed, error } = await supabase.storage.from("laundry-photos").createSignedUrl(record.photoPath, 3600); if (!error && signed?.signedUrl) urls[record.id] = signed.signedUrl; }));
      setPhotoUrls(urls);
    } catch (err) { console.error(err); setError(err.message || "Unable to load laundry history."); } finally { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this laundry batch?")) return; setError("");
    try {
      const record = washRecords.find(x => x.id === id); if (record?.photoPath) await supabase.storage.from("laundry-photos").remove([record.photoPath]);
      const { error: deleteError } = await supabase.from("wash_batches").delete().eq("id", id); if (deleteError) throw deleteError;
      setWashRecords(prev => prev.filter(record => record.id !== id)); setPhotoUrls(prev => { const next = { ...prev }; delete next[id]; return next; });
    } catch (err) { console.error(err); setError(err.message || "Unable to delete the laundry batch."); }
  };

  const totalPieces = washRecords.reduce((sum, record) => sum + record.clothes.reduce((s, cloth) => s + (cloth.quantity || 0), 0), 0), username = authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";
  if (loading) return <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-10 text-center text-slate-500 dark:text-slate-400">Loading your laundry history...</div>;

  return <div className="space-y-5 sm:space-y-6">
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">MY LAUNDRY</p><h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Laundry History</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your laundry batches, stored separately from other users.</p></div><div className="flex gap-3"><div className="rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 px-5 py-3 text-center"><p className="text-xs text-cyan-600">Batches</p><p className="text-xl font-bold text-cyan-800 dark:text-cyan-300">{washRecords.length}</p></div><div className="rounded-2xl bg-slate-100 dark:bg-white/5 px-5 py-3 text-center"><p className="text-xs text-slate-500">Pieces</p><p className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalPieces}</p></div></div></div><div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-3"><div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">{username.charAt(0).toUpperCase()}</div><div><p className="text-xs text-slate-400">Signed in as</p><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{username}</p></div></div></section>
    {error && <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
    {washRecords.length > 0 ? <div className="space-y-4">{washRecords.map(record => <article key={record.id} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden"><div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10"><div><p className="text-xs uppercase tracking-wider text-slate-400">Wash date</p><h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">📅 {record.date}</h3></div><div className="flex items-center gap-2"><span className="w-fit rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-semibold">Scheduled</span>{photoUrls[record.id] && <span className="w-fit rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-3 py-1 text-xs font-semibold">📷 Photo</span>}</div></div>
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">{photoUrls[record.id] ? <img src={photoUrls[record.id]} alt="Laundry batch" className="w-full h-48 lg:h-40 rounded-2xl object-cover border border-slate-200 dark:border-white/10" /> : <div className="w-full h-32 lg:h-40 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400"><span className="text-3xl">🧺</span><span className="mt-1 text-xs">No photo</span></div>}<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{record.clothes.map(cloth => <div key={cloth.id} className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{cloth.name}</p><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cloth.type} · {cloth.category}</p></div><span className="shrink-0 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2.5 py-1 text-sm font-semibold text-slate-700 dark:text-slate-200">× {cloth.quantity}</span></div></div>)}</div></div>
      <div className="px-5 sm:px-6 pb-5 flex justify-end"><button onClick={() => handleDelete(record.id)} className="rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">Delete batch</button></div></article>)}</div> : <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-12 text-center shadow-sm"><div className="text-5xl">🧺</div><h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">No laundry scheduled</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your completed or scheduled laundry batches will appear here.</p></section>}
  </div>;
};
export default GivenClothForWash;
