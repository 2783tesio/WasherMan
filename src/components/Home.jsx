import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";

const categoryIcons = { Tops: "👕", Bottoms: "👖", Traditional: "🥻", Accessories: "🧣", Footwear: "👟", HomeLinen: "🛏️" };
const glass = "bg-white/55 backdrop-blur-xl border border-white/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)]";

const Home = ({ clothesdetail }) => {
  const [authUser, setAuthUser] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [washDate, setWashDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { setWashDate(new Date().toISOString().split("T")[0]); loadClothes(); }, []);

  const loadClothes = async () => {
    setLoading(true); setError("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;
      setAuthUser(user);
      const { data: washerUser, error: userError } = await supabase.from("users").select("id").eq("auth_user_id", user.id).single();
      if (userError) throw userError;
      const { data, error: clothesError } = await supabase.from("clothes").select("id, name, type, category, cloth_count, created_at").eq("user_id", washerUser.id).order("created_at", { ascending: false });
      if (clothesError) throw clothesError;
      setClothes(data || []); setSelectedClothes([]); setSelectedCategory("");
    } catch (err) { console.error(err); setError(err.message || "Unable to load your clothes."); }
    finally { setLoading(false); }
  };

  const handleCheckboxChange = id => setSelectedClothes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddToWash = async () => {
    if (!authUser) return alert("Please log in first.");
    if (!selectedClothes.length) return alert("Please select at least one cloth to wash.");
    if (!washDate) return alert("Please select a wash date.");
    setError("");
    try {
      const { data: washerUser, error: userError } = await supabase.from("users").select("id").eq("auth_user_id", authUser.id).single();
      if (userError) throw userError;
      const selectedClothData = clothes.filter(cloth => selectedClothes.includes(cloth.id));
      const { data: batch, error: batchError } = await supabase.from("wash_batches").insert({ user_id: washerUser.id, wash_date: washDate }).select("id").single();
      if (batchError) throw batchError;
      const items = selectedClothData.map(cloth => ({ wash_batch_id: batch.id, cloth_id: cloth.id, quantity: cloth.cloth_count || 1 }));
      const { error: itemsError } = await supabase.from("wash_items").insert(items);
      if (itemsError) { await supabase.from("wash_batches").delete().eq("id", batch.id); throw itemsError; }
      setSelectedClothes([]); setOpen(true);
    } catch (err) { console.error(err); setError(err.message || "Unable to add clothes to wash."); }
  };

  const changeCount = (id, count, delta) => setClothes(prev => prev.map(cloth => cloth.id === id ? { ...cloth, cloth_count: Math.max(1, count + delta) } : cloth));
  const categories = Object.keys(clothesdetail || {});
  const totalItems = clothes.reduce((sum, cloth) => sum + (cloth.cloth_count || 0), 0);
  const username = authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";

  return (
    <div className="relative min-h-full overflow-hidden pb-32 md:pb-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-indigo-300/15 blur-3xl" />

      <div className="relative space-y-5 sm:space-y-6">
        <section className={`${glass} rounded-[2rem] p-5 sm:p-7 lg:p-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-700"><span className="h-2 w-2 rounded-full bg-cyan-500" /> WASHERMAN DASHBOARD</div><h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Ready for a fresh wardrobe?</h2><p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">Select the clothes you want to wash, choose a date, and keep your laundry organized.</p></div>
            <div className="shrink-0 rounded-2xl bg-white/45 backdrop-blur-lg border border-white/70 p-3 min-w-48 shadow-sm"><p className="text-xs text-slate-400">Signed in as</p><p className="mt-1 text-base font-bold text-slate-800">👤 {username}</p></div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">{[['User', username], ['Clothing types', clothes.length], ['Total pieces', totalItems], ['Selected', selectedClothes.length]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/45 backdrop-blur-lg border border-white/70 px-4 py-3 shadow-sm"><p className="text-[11px] font-medium text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-800 truncate">{value}</p></div>)}</div>
        </section>

        {error && <div className="rounded-2xl bg-red-50/80 backdrop-blur border border-red-200 px-4 py-3 text-sm text-red-600 shadow-sm">{error}</div>}

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{categories.map(category => <button key={category} onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)} className={`rounded-2xl p-4 text-left transition duration-200 backdrop-blur-xl border ${selectedCategory === category ? "bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10" : "bg-white/45 border-white/70 shadow-sm hover:bg-white/65 hover:-translate-y-0.5 hover:shadow-lg"}`}><span className="text-2xl">{categoryIcons[category] || "👚"}</span><p className="mt-3 text-sm font-semibold text-slate-800">{category}</p><p className="text-xs text-slate-400">{clothes.filter(c => c.category === category).length} items</p></button>)}</section>

        <section className={`${glass} rounded-[2rem] overflow-visible`}>
          <div className="p-5 sm:p-6 border-b border-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/20"><div><h3 className="text-xl font-bold text-slate-900">Choose clothes for wash</h3><p className="text-sm text-slate-500 mt-1">Select items and adjust their quantity for {username}.</p></div><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-xl border border-white/80 bg-white/55 backdrop-blur px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-200"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>

          {loading ? <div className="p-10 text-center text-slate-500">Loading your clothes...</div> : clothes.length > 0 ? <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{clothes.filter(c => !selectedCategory || c.category === selectedCategory).map(cloth => { const selected = selectedClothes.includes(cloth.id); return <div key={cloth.id} className={`rounded-2xl border p-4 backdrop-blur-lg transition ${selected ? "border-cyan-400 bg-cyan-400/10 shadow-md" : "border-white/70 bg-white/35 hover:bg-white/55 hover:shadow-md"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={selected} onChange={() => handleCheckboxChange(cloth.id)} className="mt-1 h-5 w-5 accent-cyan-600" /><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800 truncate">{cloth.name}</p><p className="text-sm text-slate-500">{cloth.type}</p></div><span className="text-lg">{categoryIcons[cloth.category] || "👕"}</span></div><div className="mt-4 flex items-center justify-between rounded-xl bg-white/45 border border-white/70 p-2"><span className="text-xs font-medium text-slate-500">Quantity</span><div className="flex items-center gap-3"><button onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, -1)} className="h-8 w-8 rounded-lg bg-white/65 border border-white/80 text-slate-600 hover:bg-white">−</button><span className="w-5 text-center font-semibold text-slate-800">{cloth.cloth_count || 1}</span><button onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, 1)} className="h-8 w-8 rounded-lg bg-cyan-500/90 text-white hover:bg-cyan-600">+</button></div></div></div>; })}</div> : <div className="p-10 text-center"><div className="text-4xl">👕</div><p className="mt-3 font-semibold text-slate-700">No clothes added yet</p><p className="text-sm text-slate-500 mt-1">Add clothing items from My Clothes.</p><button onClick={() => navigate("/user-manager")} className="mt-4 rounded-xl bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Go to My Clothes</button></div>}
        </section>
      </div>

      {/* Mobile-only floating action bar. It is fixed to the viewport, independent of the content cards. */}
      <div className="fixed left-3 right-3 bottom-3 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-md rounded-2xl border border-white/80 bg-white/90 backdrop-blur-2xl px-3 py-2.5 shadow-[0_14px_45px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1"><p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Wash date</p><input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="mt-0.5 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-0" /></div>
            <button onClick={handleAddToWash} disabled={!authUser || !selectedClothes.length} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45">🧺 Add</button>
          </div>
        </div>
      </div>

      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} onClose={() => setOpen(false)} message="Clothes added to wash successfully!" autoHideDuration={2000} />
    </div>
  );
};

export default Home;
