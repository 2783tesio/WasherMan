import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";

const categoryIcons = { Tops: "👕", Bottoms: "👖", Traditional: "🥻", Accessories: "🧣", Footwear: "👟", HomeLinen: "🛏️" };

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

  useEffect(() => {
    setWashDate(new Date().toISOString().split("T")[0]);
    loadClothes();
  }, []);

  const loadClothes = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;
      setAuthUser(user);

      const { data: washerUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      if (userError) throw userError;

      const { data, error: clothesError } = await supabase
        .from("clothes")
        .select("id, name, type, category, cloth_count, created_at")
        .eq("user_id", washerUser.id)
        .order("created_at", { ascending: false });
      if (clothesError) throw clothesError;

      setClothes(data || []);
      setSelectedClothes([]);
      setSelectedCategory("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load your clothes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = id => setSelectedClothes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddToWash = async () => {
    if (!authUser) return alert("Please log in first.");
    if (!selectedClothes.length) return alert("Please select at least one cloth to wash.");
    if (!washDate) return alert("Please select a wash date.");

    setError("");
    try {
      const { data: washerUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", authUser.id)
        .single();
      if (userError) throw userError;

      const selectedClothData = clothes.filter(cloth => selectedClothes.includes(cloth.id));

      const { data: batch, error: batchError } = await supabase
        .from("wash_batches")
        .insert({ user_id: washerUser.id, wash_date: washDate })
        .select("id")
        .single();
      if (batchError) throw batchError;

      const items = selectedClothData.map(cloth => ({
        wash_batch_id: batch.id,
        cloth_id: cloth.id,
        quantity: cloth.cloth_count || 1
      }));

      const { error: itemsError } = await supabase.from("wash_items").insert(items);
      if (itemsError) {
        await supabase.from("wash_batches").delete().eq("id", batch.id);
        throw itemsError;
      }

      setSelectedClothes([]);
      setOpen(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to add clothes to wash.");
    }
  };

  const changeCount = (id, count, delta) => {
    setClothes(prev => prev.map(cloth => cloth.id === id ? { ...cloth, cloth_count: Math.max(1, count + delta) } : cloth));
  };

  const categories = Object.keys(clothesdetail || {});
  const totalItems = clothes.reduce((sum, cloth) => sum + (cloth.cloth_count || 0), 0);
  const username = authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-7 pb-24 md:pb-0">
      <section className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-cyan-900/10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="max-w-3xl"><p className="text-sm font-medium text-cyan-100">WELCOME TO WASHERMAN</p><h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Ready for a fresh wardrobe?</h2><p className="mt-3 text-cyan-50 max-w-xl">Select the clothes you want to wash, choose a date, and keep your laundry organized in one place.</p></div>
          <div className="w-full lg:w-56 rounded-2xl bg-white/15 p-3 backdrop-blur"><p className="text-xs text-cyan-100 mb-1">Signed in as</p><div className="rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">👤 {username}</div></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">User</p><p className="text-lg font-bold">{username}</p></div><div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Clothing types</p><p className="text-2xl font-bold">{clothes.length}</p></div><div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Total pieces</p><p className="text-2xl font-bold">{totalItems}</p></div><div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Selected</p><p className="text-2xl font-bold">{selectedClothes.length}</p></div></div>
      </section>

      {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{categories.map(category => <button key={category} onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedCategory === category ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white"}`}><span className="text-2xl">{categoryIcons[category] || "👚"}</span><p className="mt-3 text-sm font-semibold text-slate-800">{category}</p><p className="text-xs text-slate-400">{clothes.filter(c => c.category === category).length} items</p></button>)}</section>

      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-xl font-bold text-slate-900">Choose clothes for wash</h3><p className="text-sm text-slate-500 mt-1">Select items and adjust their quantity for {username}.</p></div><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-200"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>

        {loading ? <div className="p-10 text-center text-slate-500">Loading your clothes...</div> : clothes.length > 0 ? <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{clothes.filter(c => !selectedCategory || c.category === selectedCategory).map(cloth => { const selected = selectedClothes.includes(cloth.id); return <div key={cloth.id} className={`rounded-2xl border p-4 transition ${selected ? "border-cyan-400 bg-cyan-50/60" : "border-slate-200 bg-white hover:border-slate-300"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={selected} onChange={() => handleCheckboxChange(cloth.id)} className="mt-1 h-5 w-5 accent-cyan-600" /><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800 truncate">{cloth.name}</p><p className="text-sm text-slate-500">{cloth.type}</p></div><span className="text-lg">{categoryIcons[cloth.category] || "👕"}</span></div><div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2"><span className="text-xs font-medium text-slate-500">Quantity</span><div className="flex items-center gap-3"><button onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, -1)} className="h-8 w-8 rounded-lg bg-white border text-slate-600 hover:bg-slate-100">−</button><span className="w-5 text-center font-semibold">{cloth.cloth_count || 1}</span><button onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, 1)} className="h-8 w-8 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">+</button></div></div></div>; })}</div> : <div className="p-10 text-center"><div className="text-4xl">👕</div><p className="mt-3 font-semibold text-slate-700">No clothes added yet</p><p className="text-sm text-slate-500 mt-1">Add clothing items from My Clothes.</p><button onClick={() => navigate("/user-manager")} className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Go to My Clothes</button></div>}

        <div className="fixed left-3 right-3 bottom-3 z-40 md:static md:mx-0 md:mt-0 md:border-t md:border-slate-100 md:bg-slate-50"><div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.14)] md:max-w-none md:rounded-none md:border-0 md:bg-slate-50 md:px-5 md:py-5 md:shadow-none"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">Wash date</p><input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="mt-1 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none focus:ring-0" /></div><button onClick={handleAddToWash} disabled={!authUser || !selectedClothes.length} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45">🧺 Add</button></div></div></div>
      </section>
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} onClose={() => setOpen(false)} message="Clothes added to wash successfully!" autoHideDuration={2000} />
    </div>
  );
};

export default Home;
