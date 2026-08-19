import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import { supabase } from "../lib/supabase";

const categoryIcons = { Tops: "👕", Bottoms: "👖", Traditional: "🥻", Accessories: "🧣", Footwear: "👟", HomeLinen: "🛏️" };
const glass = "bg-white/55 backdrop-blur-xl border border-white/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)]";

const Home = ({ clothesdetail }) => {
  const [authUser, setAuthUser] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [washDate, setWashDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [photo, setPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setWashDate(new Date().toISOString().split("T")[0]);
    loadClothes();
  }, []);

  const loadClothes = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;
      setAuthUser(user);
      const { data: washerUser, error: userError } = await supabase.from("users").select("id").eq("auth_user_id", user.id).single();
      if (userError) throw userError;
      const { data, error: clothesError } = await supabase.from("clothes").select("id, name, type, category, cloth_count, created_at").eq("user_id", washerUser.id).order("created_at", { ascending: false });
      if (clothesError) throw clothesError;
      setClothes(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load your clothes.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image.");
    if (file.size > 5 * 1024 * 1024) return setError("Photo must be smaller than 5 MB.");
    setError("");
    setPhoto(file);
    e.target.value = "";
  };

  const handleAddToWash = async () => {
    if (!authUser) return alert("Please log in first.");

    const hasClothes = selectedClothes.length > 0;
    const hasPhoto = Boolean(photo);

    // Clothes and photo are both optional. At least one is required.
    if (!hasClothes && !hasPhoto) {
      return alert("Please select clothes or add a photo.");
    }
    if (!washDate) return alert("Please select a wash date.");

    setSaving(true);
    setError("");
    let uploadedPath = null;
    let batchId = null;

    try {
      const { data: washerUser, error: userError } = await supabase.from("users").select("id").eq("auth_user_id", authUser.id).single();
      if (userError) throw userError;

      const { data: batch, error: batchError } = await supabase.from("wash_batches").insert({ user_id: washerUser.id, wash_date: washDate }).select("id").single();
      if (batchError) throw batchError;
      batchId = batch.id;

      // Photo is independent of clothes selection.
      if (hasPhoto) {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        uploadedPath = `${authUser.id}/${batch.id}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("laundry-photos").upload(uploadedPath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
        const { error: photoError } = await supabase.from("wash_batches").update({ photo_path: uploadedPath }).eq("id", batch.id);
        if (photoError) throw photoError;
      }

      // Only create wash_items when clothes were selected.
      if (hasClothes) {
        const selectedClothData = clothes.filter(cloth => selectedClothes.includes(cloth.id));
        const items = selectedClothData.map(cloth => ({ wash_batch_id: batch.id, cloth_id: cloth.id, quantity: cloth.cloth_count || 1 }));
        const { error: itemsError } = await supabase.from("wash_items").insert(items);
        if (itemsError) throw itemsError;
      }

      setSelectedClothes([]);
      setPhoto(null);
      setOpen(true);
    } catch (err) {
      console.error(err);
      if (uploadedPath) await supabase.storage.from("laundry-photos").remove([uploadedPath]);
      if (batchId) await supabase.from("wash_batches").delete().eq("id", batchId);
      setError(err.message || "Unable to add laundry.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCloth = (id) => setSelectedClothes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const changeCount = (id, count, delta) => setClothes(prev => prev.map(c => c.id === id ? { ...c, cloth_count: Math.max(1, count + delta) } : c));
  const categories = Object.keys(clothesdetail || {});
  const totalItems = clothes.reduce((sum, cloth) => sum + (cloth.cloth_count || 0), 0);
  const username = authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";
  const canAdd = Boolean(authUser && (selectedClothes.length || photo) && !saving);

  return (
    <div className="relative min-h-full overflow-hidden pb-32 md:pb-8">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="relative space-y-5 sm:space-y-6">
        <section className={`${glass} rounded-[2rem] p-5 sm:p-7 lg:p-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div><div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-700"><span className="h-2 w-2 rounded-full bg-cyan-500" /> WASHERMAN DASHBOARD</div><h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Ready for a fresh wardrobe?</h2><p className="mt-2 text-sm sm:text-base text-slate-500">Select clothes, add a photo, or use both to record your laundry.</p></div>
            <div className="rounded-2xl bg-white/45 backdrop-blur-lg border border-white/70 p-3 min-w-48 shadow-sm"><p className="text-xs text-slate-400">Signed in as</p><p className="mt-1 text-base font-bold text-slate-800">👤 {username}</p></div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">{[["User", username],["Clothing types", clothes.length],["Total pieces", totalItems],["Selected", `${selectedClothes.length} selected`]].map(([label,value]) => <div key={label} className="rounded-2xl bg-white/45 backdrop-blur-lg border border-white/70 px-4 py-3"><p className="text-[11px] text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-800 truncate">{value}</p></div>)}</div>
        </section>

        {error && <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <button type="button" onClick={() => setSelectedCategory("")} className="rounded-2xl border border-white/70 bg-white/45 p-4 sm:p-5 text-left backdrop-blur-xl hover:bg-white/65 transition"><span className="text-3xl">👕</span><p className="mt-3 font-bold text-slate-800">Select clothes</p><p className="mt-1 text-xs sm:text-sm text-slate-500">Choose items from your wardrobe</p></button>
          <label className={`cursor-pointer rounded-2xl border p-4 sm:p-5 text-left backdrop-blur-xl transition ${photo ? "border-cyan-400 bg-cyan-500/10" : "border-white/70 bg-white/45 hover:bg-white/65"}`}><span className="text-3xl">📷</span><p className="mt-3 font-bold text-slate-800">Take a photo</p><p className="mt-1 text-xs sm:text-sm text-slate-500">Quickly record laundry with a photo</p><input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" /></label>
        </section>

        {photo && <section className={`${glass} rounded-2xl p-4`}><div className="flex items-center justify-between gap-3 mb-3"><div><p className="font-semibold text-slate-800">Laundry photo ready</p><p className="text-xs text-slate-500">Photo can be added alone or with selected clothes.</p></div><button type="button" onClick={() => setPhoto(null)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Remove</button></div><img src={URL.createObjectURL(photo)} alt="Laundry preview" className="w-full max-h-72 object-cover rounded-xl border border-white/70" /></section>}

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{categories.map(category => <button type="button" key={category} onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)} className={`rounded-2xl p-4 text-left border backdrop-blur-xl ${selectedCategory === category ? "bg-cyan-500/15 border-cyan-400" : "bg-white/45 border-white/70"}`}><span className="text-2xl">{categoryIcons[category] || "👚"}</span><p className="mt-3 text-sm font-semibold text-slate-800">{category}</p><p className="text-xs text-slate-400">{clothes.filter(c => c.category === category).length} items</p></button>)}</section>

        <section className={`${glass} rounded-[2rem] overflow-visible`}>
          <div className="p-5 sm:p-6 border-b border-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-xl font-bold text-slate-900">Choose clothes for wash</h3><p className="text-sm text-slate-500 mt-1">Selecting clothes is optional when using a photo.</p></div><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-xl border border-white/80 bg-white/55 px-3 py-2 text-sm text-slate-700"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          {loading ? <div className="p-10 text-center text-slate-500">Loading your clothes...</div> : clothes.length ? <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{clothes.filter(c => !selectedCategory || c.category === selectedCategory).map(cloth => { const selected = selectedClothes.includes(cloth.id); return <div key={cloth.id} className={`rounded-2xl border p-4 ${selected ? "border-cyan-400 bg-cyan-400/10" : "border-white/70 bg-white/35"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={selected} onChange={() => toggleCloth(cloth.id)} className="mt-1 h-5 w-5 accent-cyan-600" /><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800 truncate">{cloth.name}</p><p className="text-sm text-slate-500">{cloth.type}</p></div><span>{categoryIcons[cloth.category] || "👕"}</span></div><div className="mt-4 flex items-center justify-between rounded-xl bg-white/45 border border-white/70 p-2"><span className="text-xs text-slate-500">Quantity</span><div className="flex items-center gap-3"><button type="button" onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, -1)} className="h-8 w-8 rounded-lg bg-white/65 border">−</button><span>{cloth.cloth_count || 1}</span><button type="button" onClick={() => changeCount(cloth.id, cloth.cloth_count || 1, 1)} className="h-8 w-8 rounded-lg bg-cyan-500 text-white">+</button></div></div></div>; })}</div> : <div className="p-10 text-center"><div className="text-4xl">👕</div><p className="mt-3 font-semibold text-slate-700">No clothes added yet</p><p className="text-sm text-slate-500 mt-1">You can still add laundry using a photo.</p><button type="button" onClick={() => navigate("/user-manager")} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Go to My Clothes</button></div>}
        </section>

        <section className="hidden md:flex items-center justify-between gap-6 rounded-2xl border border-white/70 bg-white/55 backdrop-blur-xl px-5 py-4"><div><p className="text-sm font-semibold text-slate-800">Schedule your wash</p><p className="text-xs text-slate-500">{selectedClothes.length ? `${selectedClothes.length} item${selectedClothes.length > 1 ? "s" : ""} selected` : photo ? "Photo selected" : "Select clothes or add a photo"}</p></div><div className="flex items-center gap-3"><label className="cursor-pointer rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-700">📷 {photo ? "Change photo" : "Add photo"}<input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" /></label><input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-800" /><button type="button" onClick={handleAddToWash} disabled={!canAdd} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Saving..." : "🧺 Add to wash"}</button></div></section>
      </div>

      <div className="fixed left-3 right-3 bottom-3 z-50 md:hidden pb-[env(safe-area-inset-bottom)]"><div className="mx-auto max-w-md rounded-2xl border border-white/80 bg-white/90 backdrop-blur-2xl px-3 py-2.5 shadow-[0_14px_45px_rgba(15,23,42,0.22)]"><div className="flex items-center gap-2"><input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-800" /><label className="shrink-0 cursor-pointer rounded-xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm">📷<input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" /></label><button type="button" onClick={handleAddToWash} disabled={!canAdd} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-45">{saving ? "..." : "🧺 Add"}</button></div>{photo && <div className="mt-2 flex items-center gap-2"><span className="text-xs text-slate-500 truncate">📷 {photo.name}</span><button type="button" onClick={() => setPhoto(null)} className="text-xs text-red-500">Remove</button></div>}</div></div>

      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} onClose={() => setOpen(false)} message="Laundry added successfully!" autoHideDuration={2000} />
    </div>
  );
};

export default Home;
